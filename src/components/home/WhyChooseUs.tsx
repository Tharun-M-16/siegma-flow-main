import { CheckCircle, Truck, Users, Award, Headphones } from "lucide-react";

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Truck,
      title: "Modern Fleet",
      description: "Well-maintained vehicles equipped with modern safety features and temperature control for sensitive cargo.",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Trained professionals dedicated to handling your shipments with utmost care and precision.",
    },
    {
      icon: Award,
      title: "Industry Leaders",
      description: "15+ years of excellence in logistics with numerous industry recognitions and certifications.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer support to assist you with your queries and concerns.",
    },
  ];

  const achievements = [
    "ISO 9001:2015 Certified",
    "Government Approved Transporter",
    "GST Compliant Operations",
    "Fully Licensed Fleet",
    "Comprehensive Insurance",
    "Digital Documentation",
  ];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-logistics">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Your Trusted Partner for{" "}
              <span className="text-accent">Seamless Logistics</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              At Siegma Logistics, we combine technology with experience to deliver 
              exceptional transportation services. Our commitment to quality and 
              customer satisfaction sets us apart in the industry.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {reasons.map((reason) => (
                <div key={reason.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <reason.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{reason.title}</h4>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Card */}
          <div className="bg-primary rounded-2xl p-8 md:p-10 text-primary-foreground">
            <h3 className="text-2xl font-bold mb-6">Our Credentials</h3>
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <div key={achievement} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-primary-foreground/90">{achievement}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-primary-foreground/20">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold text-accent">1M+</p>
                  <p className="text-sm text-primary-foreground/70">Shipments Delivered</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">99%</p>
                  <p className="text-sm text-primary-foreground/70">Customer Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
