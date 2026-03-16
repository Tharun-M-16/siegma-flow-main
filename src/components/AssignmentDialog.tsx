import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, User, Phone, FileText } from "lucide-react";
import { Request } from "@/lib/requestService";

interface AssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  request: Request | null;
  onAssign: (
    vehicleNumber: string,
    driverName: string,
    driverContact: string,
    driverProof: string,
    driverProofType: 'aadhar' | 'pan' | 'license',
    driverProofNumber: string
  ) => Promise<boolean>;
}

const AssignmentDialog = ({ open, onClose, request, onAssign }: AssignmentDialogProps) => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [driverProofType, setDriverProofType] = useState<'aadhar' | 'pan' | 'license'>('aadhar');
  const [driverProofNumber, setDriverProofNumber] = useState("");
  const [driverProof, setDriverProof] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    vehicleNumber: "",
    driverName: "",
    driverContact: "",
    driverProofType: "",
    driverProofNumber: "",
    driverProof: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!allowedMimeTypes.includes(file.type)) {
        setDriverProof("");
        setErrors(prev => ({ ...prev, driverProof: "Only JPG, PNG, or PDF files are allowed" }));
        e.target.value = "";
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setDriverProof("");
        setErrors(prev => ({ ...prev, driverProof: "File size must be less than 5MB" }));
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDriverProof(reader.result as string);
        setErrors(prev => ({ ...prev, driverProof: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {
      vehicleNumber: "",
      driverName: "",
      driverContact: "",
      driverProofType: "",
      driverProofNumber: "",
      driverProof: "",
    };

    if (!vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle number is required";
    }

    if (!driverName.trim()) {
      newErrors.driverName = "Driver name is required";
    }

    if (!driverContact.trim()) {
      newErrors.driverContact = "Driver contact is required";
    } else if (!/^[0-9]{10}$/.test(driverContact.replace(/[\s-]/g, ""))) {
      newErrors.driverContact = "Please enter a valid 10-digit phone number";
    }

    if (!driverProofNumber.trim()) {
      newErrors.driverProofNumber = "Proof number is required";
    } else {
      if (driverProofType === 'aadhar' && !/^[0-9]{12}$/.test(driverProofNumber)) {
        newErrors.driverProofNumber = "Aadhar number must be 12 digits";
      } else if (driverProofType === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(driverProofNumber)) {
        newErrors.driverProofNumber = "Invalid PAN format (e.g., ABCDE1234F)";
      } else if (driverProofType === 'license' && driverProofNumber.length < 5) {
        newErrors.driverProofNumber = "License number must be at least 5 characters";
      }
    }

    if (!driverProof) {
      newErrors.driverProof = "Driver proof document is required";
    }

    setErrors(newErrors);
    return !newErrors.vehicleNumber && !newErrors.driverName && !newErrors.driverContact && !newErrors.driverProofNumber && !newErrors.driverProof;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const success = await onAssign(
      vehicleNumber,
      driverName,
      driverContact,
      driverProof,
      driverProofType,
      driverProofNumber
    );

    if (success) {
      // Reset form only after successful assignment.
      setVehicleNumber("");
      setDriverName("");
      setDriverContact("");
      setDriverProofType('aadhar');
      setDriverProofNumber("");
      setDriverProof("");
      setErrors({ vehicleNumber: "", driverName: "", driverContact: "", driverProofType: "", driverProofNumber: "", driverProof: "" });
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setVehicleNumber("");
    setDriverName("");
    setDriverContact("");
    setDriverProofType('aadhar');
    setDriverProofNumber("");
    setDriverProof("");
    setErrors({ vehicleNumber: "", driverName: "", driverContact: "", driverProofType: "", driverProofNumber: "", driverProof: "" });
    onClose();
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Assign Vehicle & Driver</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Approve request <span className="font-semibold text-foreground">{request.id}</span> by assigning a vehicle and driver.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Request Summary */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Customer:</p>
                <p className="font-medium">{request.customer}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type:</p>
                <p className="font-medium">{request.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">From:</p>
                <p className="font-medium">{request.from}</p>
              </div>
              <div>
                <p className="text-muted-foreground">To:</p>
                <p className="font-medium">{request.to}</p>
              </div>
            </div>
          </div>

          {/* Assignment Form */}
          <div className="space-y-4">
            {/* Vehicle Number */}
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Vehicle Number
              </Label>
              <Input
                id="vehicleNumber"
                placeholder="e.g., TN 01 AB 1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className={errors.vehicleNumber ? "border-red-500" : ""}
              />
              {errors.vehicleNumber && (
                <p className="text-xs text-red-500">{errors.vehicleNumber}</p>
              )}
            </div>

            {/* Driver Name */}
            <div className="space-y-2">
              <Label htmlFor="driverName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Driver Name
              </Label>
              <Input
                id="driverName"
                placeholder="Enter driver's full name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className={errors.driverName ? "border-red-500" : ""}
              />
              {errors.driverName && (
                <p className="text-xs text-red-500">{errors.driverName}</p>
              )}
            </div>

            {/* Driver Contact */}
            <div className="space-y-2">
              <Label htmlFor="driverContact" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Driver Contact Number
              </Label>
              <Input
                id="driverContact"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={driverContact}
                onChange={(e) => setDriverContact(e.target.value)}
                maxLength={10}
                className={errors.driverContact ? "border-red-500" : ""}
              />
              {errors.driverContact && (
                <p className="text-xs text-red-500">{errors.driverContact}</p>
              )}
            </div>

            {/* Proof Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="proofType" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Proof Type
              </Label>
              <select
                id="proofType"
                value={driverProofType}
                onChange={(e) => {
                  setDriverProofType(e.target.value as 'aadhar' | 'pan' | 'license');
                  setDriverProofNumber('');
                  setErrors(prev => ({ ...prev, driverProofNumber: '' }));
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
                <option value="license">Driving License</option>
              </select>
            </div>

            {/* Proof Number Input */}
            <div className="space-y-2">
              <Label htmlFor="proofNumber" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {driverProofType === 'aadhar' && 'Aadhar Number'}
                {driverProofType === 'pan' && 'PAN Number'}
                {driverProofType === 'license' && 'License Number'}
              </Label>
              <Input
                id="proofNumber"
                type="text"
                value={driverProofNumber}
                onChange={(e) => setDriverProofNumber(e.target.value.toUpperCase())}
                placeholder={
                  driverProofType === 'aadhar' ? '123456789012' :
                  driverProofType === 'pan' ? 'ABCDE1234F' :
                  'Enter license number'
                }
                maxLength={driverProofType === 'aadhar' ? 12 : driverProofType === 'pan' ? 10 : 20}
                className={errors.driverProofNumber ? "border-red-500" : ""}
              />
              {errors.driverProofNumber && (
                <p className="text-xs text-red-500">{errors.driverProofNumber}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {driverProofType === 'aadhar' && 'Enter 12-digit Aadhar number'}
                {driverProofType === 'pan' && 'Enter 10-character PAN (e.g., ABCDE1234F)'}
                {driverProofType === 'license' && 'Enter driving license number'}
              </p>
            </div>

            {/* Driver Proof Document */}
            <div className="space-y-2">
              <Label htmlFor="driverProof" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Upload Proof Document
              </Label>
              <Input
                id="driverProof"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className={`cursor-pointer ${errors.driverProof ? "border-red-500" : ""}`}
              />
              {driverProof && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileText className="w-4 h-4" />
                  {driverProofType === 'aadhar' && 'Aadhar'}
                  {driverProofType === 'pan' && 'PAN'}
                  {driverProofType === 'license' && 'License'} document uploaded successfully
                </div>
              )}
              {errors.driverProof && (
                <p className="text-xs text-red-500">{errors.driverProof}</p>
              )}
              <p className="text-xs text-muted-foreground">Upload {driverProofType === 'aadhar' ? 'Aadhar card' : driverProofType === 'pan' ? 'PAN card' : 'driving license'} (Max 5MB, JPG/PNG/PDF)</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2" disabled={isSubmitting}>
            <Truck className="w-4 h-4" />
            {isSubmitting ? "Assigning..." : "Approve & Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;
