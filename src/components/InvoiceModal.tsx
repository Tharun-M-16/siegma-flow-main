import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Printer, X } from "lucide-react";
import { Request } from "@/lib/requestService";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  request: Request | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const waitForInvoiceAssets = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const handleDone = () => resolve();
          image.addEventListener("load", handleDone, { once: true });
          image.addEventListener("error", handleDone, { once: true });
        })
    )
  );
};

const generateInvoicePdfBlob = async (element: HTMLElement) => {
  await waitForInvoiceAssets(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    onclone: (_clonedDoc, clonedEl) => {
      clonedEl.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        if (img.getAttribute("src")?.startsWith("/")) {
          img.src = `${window.location.origin}${img.getAttribute("src")}`;
        }
      });
    },
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "FAST");
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight, undefined, "FAST");
    heightLeft -= pageHeight;
  }

  return pdf.output("blob");
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
};

const InvoiceModal = ({ open, onClose, request }: InvoiceModalProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!request) return null;

 const handlePrint = () => {
  const content = document.getElementById("invoice-content");
  if (!content) return;

  // Generate unique filename for download
  const invoiceNumber = request.invoiceNumber || request.id;
  const customerName = request.customer.replace(/[^a-zA-Z0-9\s]/g, ''); // Remove special characters but keep spaces
  const filename = `Invoice_${invoiceNumber}_${customerName.trim()}`;

  // Save original title and update it for the print dialog
  const originalTitle = document.title;
  document.title = filename;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  const baseUrl = window.location.origin;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${filename}</title>

        <!-- Fix assets like logo -->
        <base href="${baseUrl}/" />

        <!-- Tailwind -->
        <script src="https://cdn.tailwindcss.com"></script>

        <style>
          @page { size: A4; margin: 6mm; }

          body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont;
            background: white;
          }

          img {
            max-width: 100%;
            height: auto;
          }

          .no-print {
            display: none !important;
          }
        </style>
      </head>

      <body>
        <div id="print-root">
          ${content.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // 🔑 WAIT FOR EVERYTHING TO LOAD
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
        // Restore original title
        document.title = originalTitle;
      }, 800);
    }, 500); // <-- THIS IS CRITICAL
  };
};

const handleDownload = async () => {
  const invoiceNumber = request.invoiceNumber || `INV-${request.id}`;
  const invoiceContent = document.getElementById("invoice-content");

  if (!invoiceContent) {
    toast({ title: "Error", description: "Invoice content not found. Try printing instead.", variant: "destructive" });
    handlePrint();
    return;
  }

  setIsDownloading(true);
  let pdfBlob: Blob | null = null;

  // Step 1: Generate PDF from DOM
  try {
    pdfBlob = await generateInvoicePdfBlob(invoiceContent);
  } catch (genError) {
    console.error("[Invoice] PDF generation failed:", genError);
    toast({ title: "PDF Generation Failed", description: "Could not render invoice as PDF. Launching print dialog instead.", variant: "destructive" });
    setIsDownloading(false);
    handlePrint();
    return;
  }

  // Step 2: Upload to cloud bucket
  try {
    const token = localStorage.getItem("siegma_token");
    const formData = new FormData();
    formData.append("pdf", new File([pdfBlob], `Invoice_${invoiceNumber}.pdf`, { type: "application/pdf" }));
    formData.append("requestId", request.id);
    if (request.invoiceNumber) {
      formData.append("invoiceNumber", request.invoiceNumber);
    }

    console.log("[Invoice] Uploading PDF for invoiceNumber:", invoiceNumber);

    const uploadResponse = await fetch(`${API_BASE_URL}/api/invoices/upload-pdf`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errBody = await uploadResponse.json().catch(() => ({ error: `HTTP ${uploadResponse.status}` }));
      console.error("[Invoice] Upload failed:", uploadResponse.status, errBody);
      toast({
        title: "Cloud Save Failed",
        description: `Downloaded locally only. Server error: ${errBody.error || uploadResponse.statusText}`,
        variant: "destructive",
      });
    } else {
      console.log("[Invoice] Upload success");
      toast({ title: "Invoice Saved", description: "PDF saved to cloud storage and downloaded." });
    }
  } catch (uploadError) {
    console.error("[Invoice] Upload network error:", uploadError);
    toast({
      title: "Cloud Save Failed",
      description: "Downloaded locally only. Could not reach the server.",
      variant: "destructive",
    });
  }

  // Always download locally after successful generation
  downloadBlob(pdfBlob, `Invoice_${invoiceNumber}.pdf`);
  setIsDownloading(false);
};


  // Calculate invoice amounts with detailed breakdown
  const baseAmount = request.amount || 0;
  const fuelSurcharge = baseAmount * 0.05; // 5% fuel surcharge
  const subtotal = baseAmount + fuelSurcharge;
  const cgst = subtotal * 0.09; // 9% CGST
  const sgst = subtotal * 0.09; // 9% SGST
  const total = subtotal + cgst + sgst;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body > *:not(style):not(script) { display: none !important; }
          body > [data-radix-portal], body > div[data-radix-portal] { display: block !important; }
          [data-radix-overlay], [data-radix-dialog-overlay] { display: none !important; }
          
          [role="dialog"] {
            display: block !important;
            position: static !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          [role="dialog"] > div:first-child,
          [role="dialog"] button,
          [role="dialog"] > div:last-child:has(button) { display: none !important; }
          
          #invoice-content {
            display: block !important;
            width: 142.857% !important;
            background: white !important;
            padding: 10px !important;
            transform: scale(0.7) !important;
            transform-origin: 0 0 !important;
            margin: 0 !important;
          }
          
          #invoice-content * { display: revert !important; }
          #invoice-content .flex { display: flex !important; }
          #invoice-content .grid { display: grid !important; }
          #invoice-content table { display: table !important; }
          #invoice-content thead { display: table-header-group !important; }
          #invoice-content tbody { display: table-row-group !important; }
          #invoice-content tr { display: table-row !important; }
          #invoice-content th, #invoice-content td { display: table-cell !important; }
            /* ⛔ Prevent totals from breaking across pages */
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* ➡ Force next section to new page */
          .print-page-break {
            break-before: page !important;
            page-break-before: always !important;
          }

          /* Optional: prevent table rows from splitting */
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

        }
      `}</style>

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice - {request.id}</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed tax invoice for shipment with breakdown of charges, GST, and payment terms
            </DialogDescription>
          </DialogHeader>

          <div id="invoice-content" className="p-8 bg-white">
            {/* Invoice Header */}
            <div className="border-b-4 border-primary pb-6 mb-8 print-border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-primary mb-3" style={{ color: '#0f172a' }}>TAX INVOICE</h1>
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-lg text-foreground" style={{ color: '#1e293b' }}>Siegma Logistics Pvt Ltd</p>
                    <p className="text-muted-foreground" style={{ color: '#64748b' }}>3.54, Salem Attur NH - 636015</p>
                    <p className="text-muted-foreground" style={{ color: '#64748b' }}>Tamil Nadu, India</p>
                    <p className="font-semibold mt-2" style={{ color: '#1e293b' }}>GSTIN: 27AABCS1234F1Z5</p>
                    <p className="text-muted-foreground" style={{ color: '#64748b' }}>PAN: AABCS1234F</p>
                    <p className="text-muted-foreground mt-2" style={{ color: '#64748b' }}>Email: accounts@siegmalogistics.com</p>
                    <p className="text-muted-foreground" style={{ color: '#64748b' }}>Phone: +91 22 1234 5678</p>
                    <p className="text-muted-foreground" style={{ color: '#64748b' }}>Website: www.siegmalogistics.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-34 h-24 rounded-lg flex items-center justify-center mb-3 print-logo overflow-hidden" style={{ background: 'white' }}>
                    <img 
                      src="/logo.jpg" 
                      alt="Siegma Logistics" 
                      className="w-full h-full object-contain"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold" style={{ color: '#1e293b' }}>Invoice No:</p>
                    <p className="text-lg font-bold text-primary" style={{ color: '#0f172a' }}>{request.invoiceNumber || request.id}</p>
                    <p className="font-semibold mt-2" style={{ color: '#1e293b' }}>Invoice Date:</p>
                    <p style={{ color: '#64748b' }}>{new Date(request.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="font-semibold mt-2" style={{ color: '#1e293b' }}>Status:</p>
                    <p className="font-semibold" style={{ color: '#16a34a' }}>{request.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Shipment Details */}
            <div className="grid grid-cols-2 gap-6 mb-8 print-grid">
              <div className="bg-muted/30 p-5 rounded-lg border print-detail-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide" style={{ color: '#0f172a' }}>Bill To:</h3>
                <div className="space-y-1.5 text-sm">
                  <p className="font-bold text-foreground text-base" style={{ color: '#1e293b' }}>{request.customer}</p>
                  <p className="text-muted-foreground" style={{ color: '#64748b' }}>{request.customerEmail}</p>
                  <p className="text-muted-foreground" style={{ color: '#64748b' }}>Phone: {request.contactPhone || 'N/A'}</p>
                  <p className="text-muted-foreground mt-2" style={{ color: '#64748b' }}>Customer ID: CUST-{request.id.slice(-6)}</p>
                </div>
              </div>

              <div className="bg-muted/30 p-5 rounded-lg border print-detail-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide" style={{ color: '#0f172a' }}>Shipment Details:</h3>
                <div className="space-y-1.5 text-sm">
                  <p><strong style={{ color: '#1e293b' }}>Service Type:</strong> <span style={{ color: '#64748b' }}>{request.type}</span></p>
                  <p><strong style={{ color: '#1e293b' }}>Origin:</strong> <span style={{ color: '#64748b' }}>{request.from}</span></p>
                  <p><strong style={{ color: '#1e293b' }}>Destination:</strong> <span style={{ color: '#64748b' }}>{request.to}</span></p>
                  <p><strong style={{ color: '#1e293b' }}>Material Type:</strong> <span style={{ color: '#64748b' }}>{request.material}</span></p>
                  <p><strong style={{ color: '#1e293b' }}>Total Weight:</strong> <span style={{ color: '#64748b' }}>{request.weight}</span></p>
                  <p><strong style={{ color: '#1e293b' }}>Booking Date:</strong> <span style={{ color: '#64748b' }}>{new Date(request.createdAt || request.date).toLocaleDateString('en-IN')}</span></p>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide" style={{ color: '#0f172a' }}>Service Charges:</h3>
              <table className="w-full print-table" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: 'white' }}>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ padding: '12px 16px' }}>Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ padding: '12px 16px' }}>Details</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold" style={{ padding: '12px 16px' }}>Qty</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold" style={{ padding: '12px 16px' }}>Rate (₹)</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold" style={{ padding: '12px 16px' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td className="py-4 px-4" style={{ padding: '16px' }}>
                      <div>
                        <p className="font-semibold text-base" style={{ color: '#1e293b' }}>{request.type}</p>
                        <p className="text-xs text-muted-foreground mt-1" style={{ color: '#94a3b8' }}>Transportation Service</p>
                      </div>
                    </td>
                    <td className="py-4 px-4" style={{ padding: '16px', color: '#64748b' }}>
                      <p className="text-sm">{request.from} → {request.to}</p>
                      <p className="text-xs mt-1">{request.material} ({request.weight})</p>
                    </td>
                    <td className="py-4 px-4 text-center" style={{ padding: '16px', color: '#64748b' }}>1</td>
                    <td className="py-4 px-4 text-right font-medium" style={{ padding: '16px', color: '#1e293b' }}>
                      {baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold" style={{ padding: '16px', color: '#1e293b' }}>
                      ₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td className="py-3 px-4" style={{ padding: '12px 16px' }}>
                      <p className="font-medium text-sm" style={{ color: '#1e293b' }}>Fuel Surcharge</p>
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ padding: '12px 16px', color: '#64748b' }}>5% of base amount</td>
                    <td className="py-3 px-4 text-center" style={{ padding: '12px 16px', color: '#64748b' }}>-</td>
                    <td className="py-3 px-4 text-right" style={{ padding: '12px 16px', color: '#64748b' }}>5%</td>
                    <td className="py-3 px-4 text-right font-medium" style={{ padding: '12px 16px', color: '#1e293b' }}>
                      ₹{fuelSurcharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {request.description && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fefce8' }}>
                      <td colSpan={5} className="py-3 px-4 text-sm" style={{ padding: '12px 16px', color: '#854d0e' }}>
                        <strong>Additional Notes:</strong> {request.description}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8 print-avoid-break">
              <div className="w-96 print-totals-box">
                <div className="bg-muted/20 p-5 rounded-lg border" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 print-totals-row">
                      <span style={{ color: '#64748b' }}>Base Amount:</span>
                      <span className="font-semibold" style={{ color: '#1e293b' }}>
                        ₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 print-totals-row">
                      <span style={{ color: '#64748b' }}>Fuel Surcharge (5%):</span>
                      <span className="font-semibold" style={{ color: '#1e293b' }}>
                        ₹{fuelSurcharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="border-t pt-2 print-totals-divider" style={{ borderColor: '#e2e8f0' }}>
                      <div className="flex justify-between py-2 print-totals-row">
                        <span className="font-medium" style={{ color: '#1e293b' }}>Subtotal:</span>
                        <span className="font-semibold" style={{ color: '#1e293b' }}>
                          ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between py-2 print-totals-row">
                      <span style={{ color: '#64748b' }}>CGST (9%):</span>
                      <span className="font-semibold" style={{ color: '#1e293b' }}>
                        ₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 print-totals-row">
                      <span style={{ color: '#64748b' }}>SGST (9%):</span>
                      <span className="font-semibold" style={{ color: '#1e293b' }}>
                        ₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="border-t-2 pt-3 mt-2 print-totals-final" style={{ borderColor: '#0f172a' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold" style={{ color: '#0f172a' }}>Total Amount:</span>
                        <span className="text-2xl font-bold text-primary" style={{ color: '#0f172a' }}>
                          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2" style={{ color: '#94a3b8' }}>
                        Amount in words: {convertToWords(Math.round(total))} Rupees Only
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-muted/30 p-5 rounded-lg border mb-6 print-payment-terms print-page-break" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide" style={{ color: '#0f172a' }}>Payment Terms & Bank Details:</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-xs space-y-2">
                  <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>Bank Details:</p>
                  <p style={{ color: '#64748b' }}><strong style={{ color: '#1e293b' }}>Bank Name:</strong> HDFC Bank Ltd</p>
                  <p style={{ color: '#64748b' }}><strong style={{ color: '#1e293b' }}>Account Name:</strong> Siegma Logistics Pvt Ltd</p>
                  <p style={{ color: '#64748b' }}><strong style={{ color: '#1e293b' }}>Account Number:</strong> 12345678900</p>
                  <p style={{ color: '#64748b' }}><strong style={{ color: '#1e293b' }}>IFSC Code:</strong> HDFC0001234</p>
                  <p style={{ color: '#64748b' }}><strong style={{ color: '#1e293b' }}>Branch:</strong> Mumbai Main Branch</p>
                </div>
                <div className="text-xs space-y-2">
                  <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>Terms & Conditions:</p>
                  <ul className="space-y-1" style={{ color: '#64748b' }}>
                    <li>• Payment due within 30 days from invoice date</li>
                    <li>• Late payment will attract interest @ 18% per annum</li>
                    <li>• All disputes subject to Mumbai jurisdiction</li>
                    <li>• Goods once sold will not be taken back</li>
                    <li>• E. & O.E. (Errors and Omissions Excepted)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-xs" style={{ borderColor: '#e2e8f0', color: '#64748b' }}>
                <p className="font-semibold" style={{ color: '#1e293b' }}>For any queries, please contact:</p>
                <p className="mt-1">Email: accounts@siegmalogistics.com | Phone: +91 22 1234 5678</p>
              </div>
            </div>

            {/* Authorized Signature */}
            <div className="flex justify-between items-end mb-6 print-signature-section">
              <div className="text-xs" style={{ color: '#64748b' }}>
                <p className="font-semibold mb-2" style={{ color: '#1e293b' }}>Customer Signature</p>
                <div className="border-t pt-12 mt-2 w-48" style={{ borderColor: '#94a3b8' }}>
                  <p>Date: _________________</p>
                </div>
              </div>
              <div className="text-right text-xs" style={{ color: '#64748b' }}>
                <p className="font-semibold mb-2" style={{ color: '#1e293b' }}>For Siegma Logistics Pvt Ltd</p>
                <div className="border-t pt-12 mt-2 w-48 ml-auto" style={{ borderColor: '#94a3b8' }}>
                  <p>Authorized Signatory</p>
                </div>
              </div>
            </div>
            {/* Driver Details */}
            {request.assignedDriverName && (
              <div className="mt-6 border-2 rounded-lg p-4" style={{ borderColor: '#94a3b8' }}>
                <h3 className="font-semibold text-lg mb-3 text-center" style={{ color: '#1e293b' }}>Assigned Driver Details</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p style={{ color: '#64748b' }}>Driver Name:</p>
                    <p className="font-semibold" style={{ color: '#1e293b' }}>{request.assignedDriverName}</p>
                  </div>
                  <div>
                    <p style={{ color: '#64748b' }}>Contact Number:</p>
                    <p className="font-semibold" style={{ color: '#1e293b' }}>{request.assignedDriverContact}</p>
                  </div>
                  <div>
                    <p style={{ color: '#64748b' }}>Vehicle Number:</p>
                    <p className="font-semibold" style={{ color: '#1e293b' }}>{request.assignedVehicleNumber}</p>
                  </div>
                  {request.assignedDriverProofType && (
                    <>
                      <div>
                        <p style={{ color: '#64748b' }}>
                          {request.assignedDriverProofType === 'aadhar' && 'Aadhar Number:'}
                          {request.assignedDriverProofType === 'pan' && 'PAN Number:'}
                          {request.assignedDriverProofType === 'license' && 'License Number:'}
                        </p>
                        <p className="font-semibold font-mono" style={{ color: '#1e293b' }}>{request.assignedDriverProofNumber}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Footer */}
            <div className="text-center pt-6 border-t text-xs print-footer" style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
              <p className="font-semibold mb-2" style={{ color: '#1e293b' }}>This is a computer-generated invoice and does not require a physical signature.</p>
              <p className="mt-1">Thank you for choosing Siegma Logistics Pvt Ltd - Your Trusted Logistics Partner</p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                <span>📧 info@siegmalogistics.com</span>
                <span>📞 +91 22 1234 5678</span>
                <span>🌐 www.siegmalogistics.com</span>
              </div>
              <p className="mt-3 text-xs font-semibold" style={{ color: '#64748b' }}>
                Invoice generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t no-print">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
            <Button onClick={handleDownload} className="gap-2" disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper function to convert number to words (Indian numbering system)
function convertToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  function convertHundreds(n: number): string {
    let str = '';
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      str += teens[n - 10] + ' ';
      return str;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str;
  }

  let result = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  if (crore > 0) result += convertHundreds(crore) + 'Crore ';
  if (lakh > 0) result += convertHundreds(lakh) + 'Lakh ';
  if (thousand > 0) result += convertHundreds(thousand) + 'Thousand ';
  if (hundred > 0) result += convertHundreds(hundred);

  return result.trim();
}

export default InvoiceModal;
