import { supabase } from "../db.js";
import PDFDocument from "pdfkit";

const INVOICE_BUCKET = "invoices";

const isAdminRole = (role) => role === "admin" || role === "superadmin";

const parseDescriptionPayload = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const toMoney = (value) => Number(value || 0).toFixed(2);

const buildPublicUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const { data } = supabase.storage.from(INVOICE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
};

const generateInvoiceBuffer = ({ invoiceNumber, requestData }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const amount = Number(requestData?.amount || 0);
    const fuelSurcharge = amount * 0.05;
    const subtotal = amount + fuelSurcharge;
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const total = subtotal + cgst + sgst;

    // Header with Title
    doc.fontSize(20).font("Helvetica-Bold").text("TAX INVOICE", { align: "center" });
    doc.fontSize(11).font("Helvetica").text("Siegma Logistics Pvt Ltd", { align: "center" });
    doc.fontSize(9).text("CIN: aaaa-5008-5001", { align: "center" });
    doc.text("GST Reg No: 33AACCT7201R1Z5", { align: "center" });
    doc.moveDown(0.3);

    // Company and Invoice Info in columns
    doc.fontSize(10);
    const leftX = 40;
    const rightX = 350;
    const infoY = doc.y;

    // Left column - Company details
    doc.font("Helvetica-Bold").text("FROM:", leftX, infoY);
    doc.font("Helvetica").fontSize(9);
    doc.text("Siegma Logistics Pvt Ltd", leftX, infoY + 18);
    doc.text("123, Main Road, Mumbai, India", leftX);
    doc.text("Phone: +91-22-1234567", leftX);
    doc.text("Email: accounts@siegmalogistics.com", leftX);
    doc.text("Website: www.siegmalogistics.com", leftX);

    // Right column - Invoice details
    doc.fontSize(10).font("Helvetica-Bold").text("Invoice No:", rightX, infoY);
    doc.fontSize(9).font("Helvetica").text(invoiceNumber, rightX);
    doc.fontSize(10).font("Helvetica-Bold").text("Invoice Date:", rightX, infoY + 30);
    doc.fontSize(9).text(new Date().toISOString().split("T")[0], rightX);
    doc.fontSize(10).font("Helvetica-Bold").text("Status:", rightX, infoY + 60);
    doc.fontSize(9).text((requestData?.status || "Pending").toUpperCase(), rightX);

    doc.moveDown(4);

    // Bill To section
    doc.fontSize(10).font("Helvetica-Bold").text("BILL TO:");
    doc.fontSize(9).font("Helvetica");
    doc.text(`Customer: ${requestData?.customer || "Customer"}`);
    doc.text(`Email: ${requestData?.customerEmail || "N/A"}`);
    doc.text(`Contact: ${requestData?.customerPhone || "N/A"}`);
    if (requestData?.customerAddress) {
      doc.text(`Address: ${requestData.customerAddress}`);
    }
    doc.moveDown(0.5);

    // Shipment Details
    doc.fontSize(10).font("Helvetica-Bold").text("SHIPMENT DETAILS:");
    doc.fontSize(9).font("Helvetica");
    doc.text(`Service Type: ${requestData?.type || "General Parcel"}`);
    doc.text(`Origin: ${requestData?.from || "N/A"}`);
    doc.text(`Destination: ${requestData?.to || "N/A"}`);
    doc.text(`Material: ${requestData?.material || "N/A"}`);
    doc.text(`Weight: ${requestData?.weight || "N/A"}`);
    doc.moveDown(0.5);

    // Service Charges Table
    doc.fontSize(10).font("Helvetica-Bold").text("SERVICE CHARGES:");
    doc.moveDown(0.3);

    // Table header
    const tableTop = doc.y;
    const colWidths = [150, 80, 80, 100];
    const headers = ["Description", "Qty", "Rate (₹)", "Amount (₹)"];
    let colX = 40;

    doc.fontSize(9).font("Helvetica-Bold").fillColor("#000");
    headers.forEach((header, i) => {
      const width = colWidths[i];
      doc.rect(colX, tableTop, width, 25).fillAndStroke("#cccccc", "#000");
      doc.text(header, colX + 5, tableTop + 7, { width: width - 10 });
      colX += width;
    });

    // Table rows
    let rowY = tableTop + 25;
    const rows = [
      ["General Parcel", "1", amount.toFixed(2), amount.toFixed(2)],
      ["Fuel Surcharge", "—", (fuelSurcharge * 100 / amount).toFixed(0) + "%", fuelSurcharge.toFixed(2)],
    ];

    doc.font("Helvetica");
    rows.forEach((row, i) => {
      colX = 40;
      row.forEach((cell, j) => {
        const width = colWidths[j];
        const cellHeight = 20;
        doc.rect(colX, rowY, width, cellHeight).stroke("#999");
        doc.text(String(cell), colX + 5, rowY + 5, { width: width - 10 });
        colX += width;
      });
      rowY += 20;
    });

    // Additional text row
    colX = 40;
    doc.rect(colX, rowY, colWidths[0], 20).stroke("#999");
    doc.text("Additional Notes (if any)", colX + 5, rowY + 5, { width: colWidths[0] - 10 });
    colX += colWidths[0];
    doc.rect(colX, rowY, colWidths[1] + colWidths[2] + colWidths[3], 20).stroke("#999");
    doc.text("", colX + 5, rowY + 5);

    rowY += 25;
    doc.moveDown(2);

    // Amount Summary - Right aligned
    const summaryX = 350;
    doc.fontSize(9);
    doc.text(`Base Amount: ₹${amount.toFixed(2)}`, summaryX);
    doc.text(`Fuel Surcharge (5%): ₹${fuelSurcharge.toFixed(2)}`, summaryX);
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, summaryX);
    doc.text(`CGST (9%): ₹${cgst.toFixed(2)}`, summaryX);
    doc.text(`SGST (9%): ₹${sgst.toFixed(2)}`, summaryX);
    doc.font("Helvetica-Bold").fontSize(11).text(`Total Amount: ₹${total.toFixed(2)}`, summaryX, doc.y - 5);
    doc.font("Helvetica");

    doc.moveDown(1);

    // Payment Terms
    doc.fontSize(10).font("Helvetica-Bold").text("PAYMENT TERMS & BANK DETAILS:");
    doc.fontSize(8).font("Helvetica");
    doc.text("Bank Name: ICICI Bank");
    doc.text("Account Name: Siegma Logistics Pvt Ltd");
    doc.text("Account Number: 123456789");
    doc.text("IFSC Code: ICIC0000001");

    doc.moveDown(0.5);

    // Driver Section (if assigned)
    if (requestData?.assignedDriverName) {
      doc.fontSize(10).font("Helvetica-Bold").text("ASSIGNED DRIVER DETAILS:");
      doc.fontSize(9).font("Helvetica");
      doc.text(`Driver Name: ${requestData.assignedDriverName}`);
      doc.text(`Driver Contact: ${requestData.assignedDriverContact || "N/A"}`);
      doc.text(`Vehicle Number: ${requestData.assignedVehicleNumber || "N/A"}`);
      if (requestData.assignedDriverProofType) {
        doc.text(`Proof Type: ${requestData.assignedDriverProofType}`);
      }
      if (requestData.assignedDriverProofNumber) {
        doc.text(`Proof Number: ${requestData.assignedDriverProofNumber}`);
      }
    }

    doc.moveDown(2);

    // Footer
    doc.fontSize(8).fillColor("gray");
    doc.text("Authorized Signatory", 50);
    doc.text("For Siegma Logistics Pvt Ltd", 350);
    doc.moveDown(0.5);
    doc.text("Date: _________________", 50);
    doc.text("Signature: _________________", 350);

    doc.fontSize(7).text("Invoice generated on " + new Date().toLocaleString() + " | This is a computer-generated invoice and requires no physical signature.", {
      align: "center",
    });

    doc.end();
  });

export const createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, description, quantity, unitPrice, totalAmount, status } = req.body;
    const userId = req.user.id;

    if (!invoiceNumber) {
      return res.status(400).json({ error: "invoiceNumber is required" });
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          user_id: userId,
          invoice_number: invoiceNumber,
          description: description || "Logistics invoice",
          quantity: Number(quantity || 1),
          unit_price: Number(unitPrice || totalAmount || 0),
          total_amount: Number(totalAmount || unitPrice || 0),
          status: status || "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerInvoices = async (req, res) => {
  try {
    const userId = req.user.id;

    let query = supabase.from("invoices").select("*").order("created_at", { ascending: false });

    if (!isAdminRole(req.user.role)) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(
      (data || []).map((invoice) => ({
        ...invoice,
        pdf_public_url: buildPublicUrl(invoice.pdf_url),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let query = supabase.from("invoices").select("*").eq("id", id);
    if (!isAdminRole(req.user.role)) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Invoice not found" });

    res.json({
      ...data,
      pdf_public_url: buildPublicUrl(data.pdf_url),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadInvoicePDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { invoiceId, invoiceNumber, requestId } = req.body;
    if (!invoiceId && !invoiceNumber && !requestId) {
      return res.status(400).json({ error: "invoiceId, invoiceNumber, or requestId is required" });
    }

    let resolvedInvoiceNumber = invoiceNumber;

    if (!invoiceId && !resolvedInvoiceNumber && requestId) {
      const { data: requestRow, error: requestError } = await supabase
        .from("requests")
        .select("id, user_id, description")
        .eq("id", requestId)
        .single();

      if (requestError || !requestRow) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (!isAdminRole(req.user.role) && requestRow.user_id !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const payload = parseDescriptionPayload(requestRow.description);
      resolvedInvoiceNumber = payload.invoiceNumber;

      if (!resolvedInvoiceNumber) {
        return res.status(404).json({ error: "Invoice number not found for request" });
      }
    }

    let invoiceQuery = supabase.from("invoices").select("id, user_id, invoice_number");
    if (invoiceId) {
      invoiceQuery = invoiceQuery.eq("id", invoiceId);
    } else {
      invoiceQuery = invoiceQuery.eq("invoice_number", resolvedInvoiceNumber);
    }

    const { data: invoiceRow, error: invoiceError } = await invoiceQuery.single();

    if (invoiceError || !invoiceRow) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (!isAdminRole(req.user.role) && invoiceRow.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const safeNumber = String(invoiceRow.invoice_number || invoiceId).replace(/[^a-zA-Z0-9-_]/g, "_");
    const fileName = `${safeNumber}-${Date.now()}.pdf`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(INVOICE_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) throw error;

    // Update invoice with PDF URL
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ pdf_url: fileName })
      .eq("id", invoiceRow.id);

    if (updateError) throw updateError;

    res.json({
      message: "PDF uploaded successfully",
      invoiceId: invoiceRow.id,
      invoiceNumber: invoiceRow.invoice_number,
      fileName,
      url: buildPublicUrl(fileName),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateInvoicePDF = async (req, res) => {
  try {
    const { invoiceNumber, requestData } = req.body || {};

    if (!invoiceNumber) {
      return res.status(400).json({ error: "invoiceNumber is required" });
    }

    let query = supabase
      .from("invoices")
      .select("id, user_id, invoice_number")
      .eq("invoice_number", invoiceNumber);

    if (!isAdminRole(req.user.role)) {
      query = query.eq("user_id", req.user.id);
    }

    const { data: invoice, error: invoiceError } = await query.single();

    if (invoiceError || !invoice) {
      return res.status(404).json({ error: "Invoice not found for invoiceNumber" });
    }

    const fileName = `${String(invoice.invoice_number).replace(/[^a-zA-Z0-9-_]/g, "_")}-${Date.now()}.pdf`;
    const pdfBuffer = await generateInvoiceBuffer({ invoiceNumber, requestData: requestData || {} });

    const { error: uploadError } = await supabase.storage
      .from(INVOICE_BUCKET)
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase
      .from("invoices")
      .update({ pdf_url: fileName })
      .eq("id", invoice.id);

    if (updateError) throw updateError;

    res.json({
      message: "Invoice PDF generated and stored",
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      fileName,
      downloadUrl: buildPublicUrl(fileName),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    let query = supabase.from("invoices").select("pdf_url").eq("id", invoiceId);
    if (!isAdminRole(req.user.role)) {
      query = query.eq("user_id", userId);
    }

    const { data: invoice, error } = await query.single();

    if (error || !invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (!invoice.pdf_url) {
      return res.status(404).json({ error: "Invoice PDF not found" });
    }

    // Generate download URL
    const publicUrl = buildPublicUrl(invoice.pdf_url);

    res.json({ downloadUrl: publicUrl, filePath: invoice.pdf_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Auto-generate and store invoice PDF when driver is assigned
// NOTE: This function is kept for reference but NOT USED
// PDF generation is now handled exclusively by frontend (html2canvas + jsPDF)
// This ensures consistent formatting between preview and stored PDF
export const autoGenerateInvoiceOnAssignment = async (requestData) => {
  console.warn("⚠️  autoGenerateInvoiceOnAssignment is deprecated");
  console.warn("PDF generation should be handled by frontend (html2canvas + jsPDF)");
  return null;
};

// Bulk generate missing invoice PDFs - DO NOT AUTO-GENERATE
export const generateMissingInvoicePDFs = async (req, res) => {
  try {
    console.log("📢 Bulk invoice generation endpoint called");
    console.log("⚠️  NOTE: Invoices should be generated by frontend (html2canvas) for consistent formatting");
    console.log("✅ Recommend: Download invoices from frontend - they will be stored in matching format");
    
    res.json({ 
      message: "Invoice generation is handled by frontend",
      notes: [
        "Invoices are generated by the frontend using html2canvas + jsPDF for consistent formatting",
        "When users download an invoice, it's automatically stored with the correct preview format",
        "Do not use backend auto-generation as it produces different PDF format",
        "Instead: Ask users to download/print invoices from the dashboard"
      ],
      status: "no-action-needed"
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
