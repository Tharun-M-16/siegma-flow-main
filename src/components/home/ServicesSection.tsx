import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Truck, ArrowRight, Boxes, Clock, Shield, MapPin } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: Package,
      title: "General Parcel",
      description: "Reliable parcel delivery service for businesses and individuals. From small packages to bulk shipments, we handle it all with care.",
      features: ["Door-to-door delivery", "Insurance coverage", "Express options", "Safe handling"],
      path: "/services/general-parcel",
      requestPath: "/request/general-parcel",
    },
    {
      icon: Truck,
      title: "Full Truck Load (FTL)",
      description: "Dedicated truck services for large shipments. Get exclusive vehicle allocation for your cargo with maximum efficiency.",
      features: ["Dedicated vehicle", "Direct routes", "Bulk discounts", "Flexible scheduling"],
      path: "/services/full-truck-load",
      requestPath: "/request/full-truck-load",
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "Timely Delivery",
      description: "98.5% on-time delivery rate across all routes",
    },
    {
      icon: Shield,
      title: "Fully Insured",
      description: "Complete insurance coverage for your peace of mind",
    },
    {
      icon: MapPin,
      title: "Pan-India Network",
      description: "Serving 500+ cities with extensive logistics network",
    },
    {
      icon: Boxes,
      title: "Safe Handling",
      description: "Professional handling and secure packaging",
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-logistics">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Logistics Solutions
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose from our range of logistics services designed to meet your 
            specific transportation needs with reliability and efficiency.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service) => (
            <div
              key={service.title}
              className="card-logistics group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <service.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-3 mb-6">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={service.path} className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to={service.requestPath} className="flex-1">
                  <Button variant="hero" className="w-full gap-2">
                    Request Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
