import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "What areas do you cover?",
      answer: "We provide logistics services across 500+ cities in India, covering all major states and union territories. Our extensive network ensures reliable delivery to both metro cities and tier-2, tier-3 towns.",
    },

    {
      question: "What is the difference between General Parcel and Full Truck Load?",
      answer: "General Parcel is ideal for small to medium-sized packages (up to 100kg) and is shared with other shipments for cost efficiency. Full Truck Load (FTL) provides a dedicated truck for large shipments, offering faster delivery and exclusive vehicle allocation for your cargo.",
    },
    {
      question: "How is the shipping cost calculated?",
      answer: "Shipping costs depend on multiple factors including service type, weight/volume of cargo, pickup and delivery locations, and any special handling requirements. Use our 'Get Quote' calculator for an instant estimate, or contact us for a detailed quote.",
    },
    {
      question: "Is my shipment insured?",
      answer: "Yes, all our shipments come with basic insurance coverage. For high-value items, we offer additional comprehensive insurance options. The coverage amount and terms depend on the declared value of your goods.",
    },
    {
      question: "What items are prohibited for shipping?",
      answer: "We cannot ship hazardous materials, illegal substances, perishable food items (unless specially arranged), live animals, and explosives. For a complete list of prohibited items and special handling requirements, please contact our customer support.",
    },
    {
      question: "What are your delivery timelines?",
      answer: "Delivery timelines vary based on distance and service type. General Parcel typically takes 3-5 business days, while Full Truck Load services take 2-3 business days. Express delivery options are available for urgent shipments.",
    },
    {
      question: "How do I file a claim for damaged or lost shipment?",
      answer: "In the rare event of damage or loss, please contact our customer support within 24 hours of delivery. Provide your booking details, photos of damage (if applicable), and invoice. Our claims team will guide you through the process.",
    },
    {
      question: "Do you offer door-to-door service?",
      answer: "Yes, we offer complete door-to-door pickup and delivery services. Our team will collect the shipment from your specified address and deliver it directly to the recipient's location.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept multiple payment methods including online bank transfers, UPI, credit/debit cards, and for corporate clients, we offer credit facilities with NET 30/60 payment terms after proper verification.",
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-logistics">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about our logistics services
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-start gap-3 pr-4">
                    <HelpCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="font-semibold">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact CTA */}
          <div className="mt-12 text-center p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Our customer support team is here to help you 24/7
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="tel:+919876543210" className="text-accent hover:underline">
                📞 +91 98765 43210
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="mailto:info@siegmalogistics.com" className="text-accent hover:underline">
                ✉️ info@siegmalogistics.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
