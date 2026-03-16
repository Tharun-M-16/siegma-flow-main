import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Truck, Send, ArrowLeft, Calculator } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { addRequest } from "@/lib/requestService";
import { calculatePrice, getPricingBreakdown } from "@/lib/pricingService";
import { filterCities } from "@/lib/cities";

const vehicleOptions = [
  { value: "", label: "Select vehicle preference (optional)" },
  { value: "mini-truck", label: "Mini Truck (1-2 Tons)" },
  { value: "lcv", label: "LCV - Light Commercial (3-5 Tons)" },
  { value: "icv", label: "ICV - Intermediate (6-10 Tons)" },
  { value: "heavy-truck", label: "Heavy Truck (10-16 Tons)" },
  { value: "trailer", label: "Trailer (16-25 Tons)" },
  { value: "container-20ft", label: "Container 20ft" },
  { value: "container-40ft", label: "Container 40ft" },
];

const FullTruckLoadRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    fromLocation: "",
    toLocation: "",
    materialDescription: "",
    tonnage: "",
    vehiclePreference: "",
    invoiceValue: "",
    ewayBillNumber: "",
    expectedPickupDate: "",
    remarks: "",
  });

  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  // Auto-calculate price when relevant fields change
  useEffect(() => {
    if (formData.fromLocation && formData.toLocation && formData.tonnage && parseFloat(formData.tonnage) > 0) {
      const price = calculatePrice({
        type: "Full Truck Load",
        from: formData.fromLocation,
        to: formData.toLocation,
        weight: parseFloat(formData.tonnage),
      });
      setCalculatedAmount(price);
      setFormData(prev => ({ ...prev, invoiceValue: price.toString() }));
    } else {
      setCalculatedAmount(0);
      setFormData(prev => ({ ...prev, invoiceValue: "" }));
    }
  }, [formData.fromLocation, formData.toLocation, formData.tonnage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // City autocomplete for fromLocation
    if (name === "fromLocation") {
      if (value.length >= 2) {
        const filtered = filterCities(value, 8);
        setFromSuggestions(filtered);
        setShowFromSuggestions(filtered.length > 0);
      } else {
        setShowFromSuggestions(false);
      }
    }

    // City autocomplete for toLocation
    if (name === "toLocation") {
      if (value.length >= 2) {
        const filtered = filterCities(value, 8);
        setToSuggestions(filtered);
        setShowToSuggestions(filtered.length > 0);
      } else {
        setShowToSuggestions(false);
      }
    }
  };

  const selectCity = (city: string, field: "fromLocation" | "toLocation") => {
    setFormData({ ...formData, [field]: city });
    if (field === "fromLocation") {
      setShowFromSuggestions(false);
    } else {
      setShowToSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save request to localStorage
      const newRequest = await addRequest({
        customer: formData.customerName || user?.name || 'Customer',
        customerEmail: user?.email || formData.email,
        type: "Full Truck Load",
        from: formData.fromLocation,
        to: formData.toLocation,
        material: formData.materialDescription,
        weight: `${formData.tonnage} tons`,
        amount: parseFloat(formData.invoiceValue) || 0,
        pickupDate: formData.expectedPickupDate,
        description: `${formData.materialDescription} - Vehicle: ${formData.vehiclePreference}`,
        contactName: formData.customerName,
        contactPhone: formData.phone,
        specialInstructions: formData.remarks,
      });

      toast.success("FTL Request submitted successfully! Request ID: " + newRequest.id);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-muted/30 min-h-screen">
        <div className="container-logistics max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center">
                <Truck className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Request Full Truck Load
                </h1>
                <p className="text-muted-foreground">
                  Fill in the details below to request our FTL service
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card-logistics">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Customer Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-foreground mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="input-logistics"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="input-logistics"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                    className="input-logistics"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Shipment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Shipment Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label htmlFor="fromLocation" className="block text-sm font-medium text-foreground mb-2">
                      From Location (City) *
                    </label>
                    <input
                      type="text"
                      id="fromLocation"
                      name="fromLocation"
                      value={formData.fromLocation}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="input-logistics"
                      placeholder="Enter pickup city"
                      onFocus={() => formData.fromLocation.length > 1 && setShowFromSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                    />
                    {showFromSuggestions && fromSuggestions.length > 0 && (
                      <ul className="absolute z-50 w-full bg-card border border-border rounded-lg mt-1 shadow-xl max-h-48 overflow-auto">
                        {fromSuggestions.map((city) => (
                          <li
                            key={city}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectCity(city, "fromLocation");
                            }}
                            className="px-4 py-2 hover:bg-primary hover:text-primary-foreground cursor-pointer text-foreground transition-colors"
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="relative">
                    <label htmlFor="toLocation" className="block text-sm font-medium text-foreground mb-2">
                      To Location (City) *
                    </label>
                    <input
                      type="text"
                      id="toLocation"
                      name="toLocation"
                      value={formData.toLocation}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className="input-logistics"
                      placeholder="Enter destination city"
                      onFocus={() => formData.toLocation.length > 1 && setShowToSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                    />
                    {showToSuggestions && toSuggestions.length > 0 && (
                      <ul className="absolute z-50 w-full bg-card border border-border rounded-lg mt-1 shadow-xl max-h-48 overflow-auto">
                        {toSuggestions.map((city) => (
                          <li
                            key={city}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectCity(city, "toLocation");
                            }}
                            className="px-4 py-2 hover:bg-primary hover:text-primary-foreground cursor-pointer text-foreground transition-colors"
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="materialDescription" className="block text-sm font-medium text-foreground mb-2">
                    Material / Goods Description *
                  </label>
                  <textarea
                    id="materialDescription"
                    name="materialDescription"
                    value={formData.materialDescription}
                    onChange={handleChange}
                    required
                    rows={3}
                    autoComplete="off"
                    className="input-logistics resize-none"
                    placeholder="Describe the goods to be shipped"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tonnage" className="block text-sm font-medium text-foreground mb-2">
                      Weight / Tonnage (in Tons) *
                    </label>
                    <input
                      type="number"
                      id="tonnage"
                      name="tonnage"
                      value={formData.tonnage}
                      onChange={handleChange}
                      required
                      min="0.5"
                      step="0.5"
                      autoComplete="off"
                      className="input-logistics"
                      placeholder="Enter weight in tons"
                    />
                  </div>
                  <div>
                    <label htmlFor="vehiclePreference" className="block text-sm font-medium text-foreground mb-2">
                      Vehicle Preference
                    </label>
                    <select
                      id="vehiclePreference"
                      name="vehiclePreference"
                      value={formData.vehiclePreference}
                      onChange={handleChange}
                      className="input-logistics"
                    >
                      {vehicleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="invoiceValue" className="block text-sm font-medium text-foreground mb-2">
                      Estimated Amount (₹) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="invoiceValue"
                        name="invoiceValue"
                        value={calculatedAmount > 0 ? `₹${calculatedAmount.toLocaleString('en-IN')}` : ""}
                        readOnly
                        required
                        className="input-logistics bg-muted/50 cursor-not-allowed font-semibold text-primary"
                        placeholder="Auto-calculated based on tonnage & distance"
                      />
                      {calculatedAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-accent hover:text-accent/80 flex items-center gap-1"
                        >
                          <Calculator className="w-3 h-3" />
                          Breakdown
                        </button>
                      )}
                    </div>
                    {showPriceBreakdown && calculatedAmount > 0 && (
                      <div className="mt-2 p-3 bg-accent/5 border border-accent/20 rounded-lg text-sm space-y-1">
                        {(() => {
                          const breakdown = getPricingBreakdown({
                            type: "Full Truck Load",
                            from: formData.fromLocation,
                            to: formData.toLocation,
                            weight: parseFloat(formData.tonnage),
                          });
                          return (
                            <>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Base Cost:</span>
                                <span>₹{breakdown.baseCost.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Distance Charges:</span>
                                <span>₹{breakdown.distanceCost.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Fuel Surcharge:</span>
                                <span>₹{breakdown.additionalCharges.toLocaleString('en-IN')}</span>
                              </div>
                              {breakdown.discount > 0 && (
                                <div className="flex justify-between text-logistics-green">
                                  <span>Volume Discount:</span>
                                  <span>-₹{breakdown.discount.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold text-primary border-t border-border pt-1 mt-1">
                                <span>Total:</span>
                                <span>₹{breakdown.total.toLocaleString('en-IN')}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                * GST (18%) will be added to final invoice
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="ewayBillNumber" className="block text-sm font-medium text-foreground mb-2">
                      E-way Bill Number (if available)
                    </label>
                    <input
                      type="text"
                      id="ewayBillNumber"
                      name="ewayBillNumber"
                      value={formData.ewayBillNumber}
                      onChange={handleChange}
                      autoComplete="off"
                      className="input-logistics"
                      placeholder="Enter e-way bill number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="expectedPickupDate" className="block text-sm font-medium text-foreground mb-2">
                    Expected Pickup Date *
                  </label>
                  <input
                    type="date"
                    id="expectedPickupDate"
                    name="expectedPickupDate"
                    value={formData.expectedPickupDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="input-logistics"
                  />
                </div>

                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-foreground mb-2">
                    Remarks / Special Instructions
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={3}
                    autoComplete="off"
                    className="input-logistics resize-none"
                    placeholder="Any special handling instructions or remarks"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit FTL Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FullTruckLoadRequest;
