import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      company: "Mumbai Electronics Ltd",
      role: "Supply Chain Manager",
      rating: 5,
      text: "Siegma Logistics has been our trusted partner for over 3 years. Their reliability and professional service have helped us maintain our delivery commitments to customers across India.",
      avatar: "RK",
    },
    {
      name: "Priya Sharma",
      company: "Delhi Fashions",
      role: "Operations Head",
      rating: 5,
      text: "Excellent service! The delivery times are always on point and the reliability is outstanding. Their customer support team is also very responsive and helpful.",
      avatar: "PS",
    },
    {
      name: "Arun Patel",
      company: "Gujarat Manufacturing Co",
      role: "Logistics Coordinator",
      rating: 5,
      text: "We ship heavy machinery parts regularly, and Siegma's FTL service has been exceptional. The dedicated trucks and careful handling give us peace of mind.",
      avatar: "AP",
    },
    {
      name: "Meera Reddy",
      company: "Bangalore Tech Solutions",
      role: "CEO",
      rating: 5,
      text: "As a growing tech company, we needed a logistics partner who could scale with us. Siegma delivered on every promise. Highly recommended!",
      avatar: "MR",
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-muted/30 to-background">
      <div className="container-logistics">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it - hear from businesses who trust us with their logistics needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="card-logistics group hover:shadow-xl"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Quote className="w-6 h-6 text-accent" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-accent font-medium">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Join 50,000+ happy customers who trust Siegma Logistics
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full border-2 border-background"
                />
              ))}
            </div>
            <span className="text-muted-foreground">and many more...</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
