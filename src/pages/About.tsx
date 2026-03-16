import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Truck, 
  Users, 
  Award, 
  Target, 
  Eye, 
  Heart,
  MapPin,
  Calendar,
  Package,
  ArrowRight
} from "lucide-react";

const About = () => {
  const stats = [
    { icon: Calendar, value: "15+", label: "Years of Excellence" },
    { icon: MapPin, value: "500+", label: "Cities Served" },
    { icon: Package, value: "1M+", label: "Shipments Delivered" },
    { icon: Users, value: "50K+", label: "Happy Customers" },
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To provide reliable, efficient, and cost-effective logistics solutions that help businesses grow and succeed in their markets.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "To be India's most trusted logistics partner, known for innovation, sustainability, and unparalleled customer service.",
    },
    {
      icon: Heart,
      title: "Our Values",
      description: "Integrity, reliability, customer-centricity, and continuous improvement drive every decision we make.",
    },
  ];

  const team = [
    { name: "Rajesh Kumar", role: "Founder & CEO", experience: "25+ years in logistics" },
    { name: "Priya Sharma", role: "Operations Director", experience: "15+ years in supply chain" },
    { name: "Amit Patel", role: "Fleet Manager", experience: "12+ years in transport" },
    { name: "Sunita Rao", role: "Customer Relations", experience: "10+ years in service" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-logistics-navy-dark py-20 md:py-28">
        <div className="container-logistics">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-accent">Siegma Logistics</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">
              Building trust through reliable logistics solutions since 2010. 
              We are committed to delivering excellence in every shipment.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background -mt-8 relative z-10">
        <div className="container-logistics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="card-logistics text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-logistics">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                A Journey of Trust and Excellence
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Siegma Logistics Pvt Ltd was founded in 2010 with a simple vision: 
                  to make logistics accessible, reliable, and efficient for businesses 
                  of all sizes across India.
                </p>
                <p>
                  What started as a small fleet of trucks has grown into a 
                  comprehensive logistics network spanning 500+ cities with a 
                  modern fleet of vehicles equipped with the latest technology.
                </p>
                <p>
                  Today, we proudly serve over 50,000 customers, handling everything 
                  from small parcels to full truck loads with the same dedication 
                  and attention to detail that has defined our journey.
                </p>
              </div>
            </div>

            <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
                  <Truck className="w-8 h-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Siegma Logistics</h3>
                  <p className="text-primary-foreground/70">Pvt Ltd</p>
                </div>
              </div>
              <p className="text-primary-foreground/80 leading-relaxed">
                "Our commitment goes beyond just moving goods. We move your 
                business forward by providing logistics solutions that you can 
                rely on, day after day."
              </p>
              <p className="mt-4 font-semibold">— Rajesh Kumar, Founder & CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="section-padding bg-background">
        <div className="container-logistics">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Drives Us
            </h2>
            <p className="text-lg text-muted-foreground">
              Our mission, vision, and values guide everything we do at Siegma Logistics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="card-logistics text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-logistics">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              Leadership Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet the Experts
            </h2>
            <p className="text-lg text-muted-foreground">
              Our experienced leadership team brings decades of industry expertise.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="card-logistics text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h4 className="font-bold text-foreground">{member.name}</h4>
                <p className="text-accent font-medium text-sm">{member.role}</p>
                <p className="text-muted-foreground text-sm mt-2">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary">
        <div className="container-logistics text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Partner With Us?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Experience the Siegma difference. Let us handle your logistics while you focus on growing your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="hero" size="lg" className="gap-2">
                Contact Us
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/services/general-parcel">
              <Button variant="hero-outline" size="lg">
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
