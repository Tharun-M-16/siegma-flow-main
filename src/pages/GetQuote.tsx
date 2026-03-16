import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Package, Truck, MapPin, Weight, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GetQuote = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    serviceType: "",
    fromCity: "",
    toCity: "",
    weight: "",
    packageType: "",
  });
  const [quote, setQuote] = useState<any>(null);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const calculateQuote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceType || !formData.fromCity || !formData.toCity || !formData.weight) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Simulate quote calculation
    const weight = parseFloat(formData.weight);
    const baseRate = formData.serviceType === "ftl" ? 3000 : 100;
    const distanceFactor = 1.5; // Simplified
    const weightFactor = formData.serviceType === "ftl" ? 1 : weight;
    
    const subtotal = baseRate * distanceFactor * weightFactor;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    setQuote({
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
      estimatedDays: formData.serviceType === "ftl" ? "2-3" : "3-5",
    });

    toast({
      title: "Quote Generated!",
      description: "Your instant quote is ready below.",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Header Section */}
        <section className="bg-primary text-primary-foreground py-16 md:py-20">
          <div className="container-logistics">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30 mb-6">
                <Calculator className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Instant Quote</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Get Your Free Quote
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Calculate shipping costs instantly for your logistics needs
              </p>
            </div>
          </div>
        </section>

        {/* Quote Form */}
        <section className="section-padding -mt-8">
          <div className="container-logistics">
            <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
              {/* Form Card */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Quote Calculator</CardTitle>
                  <CardDescription>
                    Fill in the details to get an instant shipping estimate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={calculateQuote} className="space-y-6">
                    {/* Service Type */}
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <Select
                        value={formData.serviceType}
                        onValueChange={(value) => handleChange("serviceType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general-parcel">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              General Parcel
                            </div>
                          </SelectItem>
                          <SelectItem value="ftl">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Full Truck Load
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* From City */}
                    <div className="space-y-2">
                      <Label htmlFor="fromCity">From City *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fromCity"
                          placeholder="Enter pickup city"
                          value={formData.fromCity}
                          onChange={(e) => handleChange("fromCity", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* To City */}
                    <div className="space-y-2">
                      <Label htmlFor="toCity">To City *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="toCity"
                          placeholder="Enter delivery city"
                          value={formData.toCity}
                          onChange={(e) => handleChange("toCity", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                      <Label htmlFor="weight">
                        {formData.serviceType === "ftl" ? "Load Weight (in tons) *" : "Package Weight (in kg) *"}
                      </Label>
                      <div className="relative">
                        <Weight className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="weight"
                          type="number"
                          placeholder="Enter weight"
                          value={formData.weight}
                          onChange={(e) => handleChange("weight", e.target.value)}
                          className="pl-10"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>

                    {/* Package Type */}
                    {formData.serviceType === "general-parcel" && (
                      <div className="space-y-2">
                        <Label htmlFor="packageType">Package Type</Label>
                        <Select
                          value={formData.packageType}
                          onValueChange={(value) => handleChange("packageType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select package type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="fragile">Fragile Items</SelectItem>
                            <SelectItem value="general">General Cargo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button type="submit" className="w-full gap-2">
                      <Calculator className="w-4 h-4" />
                      Calculate Quote
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quote Result */}
              <div className="space-y-6">
                {quote ? (
                  <>
                    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-accent" />
                          Your Quote
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-semibold">₹{quote.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">GST (18%)</span>
                            <span className="font-semibold">₹{quote.gst}</span>
                          </div>
                          <div className="border-t pt-3 flex justify-between">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-2xl text-accent">₹{quote.total}</span>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                          <p className="font-semibold">{quote.estimatedDays} business days</p>
                        </div>

                        <Button className="w-full" onClick={() => window.location.href = "/contact"}>
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">What's Included</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {[
                            "Door-to-door pickup & delivery",
                            "Basic insurance coverage",
                            "Packaging materials (if required)",
                            "Fuel surcharge included",
                            "Professional handling",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-logistics-green rounded-full mt-1.5" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Calculator className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Fill out the form to get your instant quote
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GetQuote;
