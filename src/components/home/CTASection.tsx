import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-accent to-logistics-orange-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container-logistics relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent-foreground mb-6">
            Ready to Ship Your Goods?
          </h2>
          <p className="text-lg md:text-xl text-accent-foreground/90 mb-8">
            Get started with Siegma Logistics today and experience hassle-free 
            transportation services tailored to your needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/request/general-parcel">
              <Button 
                size="xl" 
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="tel:+919876543210">
              <Button 
                variant="hero-outline" 
                size="xl" 
                className="w-full sm:w-auto gap-2 border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10"
              >
                <Phone className="w-5 h-5" />
                Call Us Now
              </Button>
            </a>
          </div>

          <p className="mt-6 text-accent-foreground/70 text-sm">
            Or call us at{" "}
            <a href="tel:+919876543210" className="font-semibold text-accent-foreground hover:underline">
              +91 98765 43210
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
