import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Truck, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Shield, 
  MapPin,
  Package,
  Route,
  Zap,
  Factory
} from "lucide-react";

const FullTruckLoad = () => {
  const features = [
    {
      icon: Truck,
      title: "Dedicated Vehicle",
      description: "Get exclusive allocation of the entire truck for your cargo without any sharing.",
    },
    {
      icon: Route,
      title: "Direct Routes",
      description: "Point-to-point transportation with no intermediate stops for faster delivery.",
    },
    {
      icon: Zap,
      title: "Express Transit",
      description: "Priority handling and expedited delivery for time-critical shipments.",
    },
    {
      icon: Shield,
      title: "Maximum Security",
      description: "Sealed trucks with security seals ensure complete cargo safety.",
    },
  ];

  const vehicleTypes = [
    { name: "Mini Truck", capacity: "1-2 Tons", image: "🚛" },
    { name: "LCV (Light Commercial)", capacity: "3-5 Tons", image: "🚚" },
    { name: "ICV (Intermediate)", capacity: "6-10 Tons", image: "🚚" },
    { name: "Heavy Truck", capacity: "10-16 Tons", image: "🚛" },
    { name: "Trailer", capacity: "16-25 Tons", image: "🚛" },
    { name: "Container", capacity: "20-40 ft", image: "📦" },
  ];

  const benefits = [
    "No cargo mixing - exclusive vehicle",
    "Faster transit times",
    "Reduced handling risks",
    "Flexible scheduling",
    "Bulk shipping discounts",
    "Professional drivers",
    "Dedicated driver",
    "Priority support",
  ];

  const industries = [
    {
      icon: Factory,
      title: "Manufacturing",
      description: "Raw materials and finished goods transportation.",
    },
    {
      icon: Package,
      title: "E-commerce",
      description: "Bulk inventory movement to warehouses.",
    },
    {
      icon: Truck,
      title: "FMCG",
      description: "Fast-moving consumer goods distribution.",
    },
    {
      icon: Shield,
      title: "Pharmaceuticals",
      description: "Temperature-controlled medical supplies.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-logistics-navy-dark py-20 md:py-28">
        <div className="container-logistics">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-primary-foreground">
              <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30 mb-6">
                <Truck className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Full Truck Load Service</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Dedicated <span className="text-accent">Truck Services</span> for Large Shipments
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
                Get exclusive vehicle allocation for your cargo. Maximum capacity, 
                minimum hassle, and direct routes for efficient transportation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/request/full-truck-load">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                    Request FTL Service
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-accent/20 rounded-full flex items-center justify-center">
                  <Truck className="w-32 h-32 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card text-card-foreground p-4 rounded-xl shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    <span className="font-medium text-sm">Wide Coverage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-background">
        <div className="container-logistics">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              FTL Service Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Our full truck load service offers exclusive vehicle allocation for 
              maximum efficiency and cargo security.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card-logistics text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section className="section-padding bg-muted/30">
        <div className="container-logistics">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              Our Fleet
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Vehicle Options
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose from our wide range of vehicles to match your cargo requirements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicleTypes.map((vehicle) => (
              <div key={vehicle.name} className="card-logistics flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-3xl">
                  {vehicle.image}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{vehicle.name}</h4>
                  <p className="text-muted-foreground text-sm">Capacity: {vehicle.capacity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & Industries */}
      <section className="section-padding bg-background">
        <div className="container-logistics">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Benefits */}
            <div>
              <span className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
                Why Choose FTL
              </span>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Benefits of Full Truck Load
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
              <h3 className="text-2xl font-bold mb-6">Industries We Serve</h3>
              <div className="grid gap-6">
                {industries.map((industry) => (
                  <div key={industry.title} className="flex gap-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <industry.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{industry.title}</h4>
                      <p className="text-primary-foreground/70 text-sm">{industry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-accent">
        <div className="container-logistics text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
            Need a Full Truck for Your Cargo?
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Get dedicated vehicle allocation for your bulk shipments. Request a quote today!
          </p>
          <Link to="/request/full-truck-load">
            <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              Request Full Truck Load
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default FullTruckLoad;
