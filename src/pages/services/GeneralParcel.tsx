import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Package, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Shield, 
  MapPin,
  Truck,
  Box,
  Zap,
  Users
} from "lucide-react";

const GeneralParcel = () => {
  const features = [
    {
      icon: Box,
      title: "Flexible Package Sizes",
      description: "From small envelopes to large cartons, we handle parcels of all sizes with equal care.",
    },
    {
      icon: Clock,
      title: "Express Delivery",
      description: "Time-sensitive shipments? Our express service ensures delivery within 24-48 hours.",
    },
    {
      icon: MapPin,
      title: "Door-to-Door Service",
      description: "Complete pickup and delivery service right at your doorstep, anywhere in India.",
    },
    {
      icon: Shield,
      title: "Insured Shipments",
      description: "All parcels are fully insured, giving you peace of mind for valuable items.",
    },
  ];

  const benefits = [
    "Timely delivery updates",
    "SMS and email notifications",
    "Proof of delivery",
    "Flexible pickup scheduling",
    "Competitive pricing",
    "Dedicated customer support",
    "Secure packaging options",
    "Cash on delivery (COD)",
  ];

  const useCases = [
    {
      title: "E-commerce Businesses",
      description: "Reliable delivery partner for your online store orders.",
    },
    {
      title: "Documents & Files",
      description: "Secure handling of important documents and legal papers.",
    },
    {
      title: "Personal Parcels",
      description: "Send gifts, personal items to family and friends.",
    },
    {
      title: "B2B Shipments",
      description: "Regular shipments between business locations.",
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
                <Package className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">General Parcel Service</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Reliable <span className="text-accent">Parcel Delivery</span> Across India
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
                From small packages to bulk shipments, our general parcel service 
                ensures your goods reach their destination safely and on time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/request/general-parcel">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                    Request Service
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
                  <Package className="w-32 h-32 text-primary-foreground" />
                </div>
                <div className="absolute -top-4 -right-4 bg-card text-card-foreground p-4 rounded-xl shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-logistics-green" />
                    <span className="font-medium text-sm">Delivered</span>
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
              Service Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Our general parcel service is designed to meet all your shipping needs 
              with reliability and efficiency.
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

      {/* Benefits Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-logistics">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Benefits of Our Parcel Service
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Experience hassle-free shipping with our comprehensive parcel 
                delivery service that puts your needs first.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
              <h3 className="text-2xl font-bold mb-6">Perfect For</h3>
              <div className="space-y-6">
                {useCases.map((useCase) => (
                  <div key={useCase.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{useCase.title}</h4>
                      <p className="text-primary-foreground/70 text-sm">{useCase.description}</p>
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
            Ready to Ship Your Parcel?
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Get started with our general parcel service today. Quick, reliable, and affordable.
          </p>
          <Link to="/request/general-parcel">
            <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              Request General Parcel
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default GeneralParcel;
