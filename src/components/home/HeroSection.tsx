import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, Truck, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=90",
    caption: "Full Truck Load Services",
    position: "center center",
  },
  {
    url: "https://eleks.com/wp-content/uploads/3840x1300_How-Custom-Logistics-and-Supply-Chain-Software-Can-Improve-Efficiency-and-Reduce-Costs.jpg",
    caption: "Parcel & Package Delivery",
    position: "center center",
  },
  {
    url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=90",
    caption: "Container Shipping",
    position: "center center",
  },
  {
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=90",
    caption: "Warehouse & Logistics",
    position: "center center",
  },
  {
    url: "https://static.vecteezy.com/system/resources/previews/003/340/097/non_2x/courier-with-the-parcel-on-the-background-of-the-delivery-service-van-vector.jpg",
    caption: "Pan-India Road Freight",
    position: "center center",
  },
  {
    url: "https://twawarehousing.co.uk/wp-content/uploads/2023/03/liverpool-logistics-warehousing.webp",
    caption: "Logistics Warehousing",
    position: "center center",
  },
  {
    url: "/banner1.jpg",
    caption: "Siegma Logistics",
    // Keep the top area visible for this image; center-cropping hides key content.
    position: "100% 50%",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const bgRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Parallax effect — background moves slower than scroll
  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.45}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goTo = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent(idx);
    startTimer();
  };

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Parallax background layer */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: idx === current ? 1 : 0 }}
          >
            <img
              src={slide.url}
              alt={slide.caption}
              className="w-full h-full object-cover"
              style={{ objectPosition: slide.position }}
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Dark gradient overlay — stronger on left so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25 z-10" />

      {/* Content */}
      <div className="container-logistics relative z-20">
        <div className="max-w-2xl text-white space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium">Trusted Logistics Partner Since 2010</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
            Delivering{" "}
            <span className="text-accent">Excellence</span>
            <br />
            Across India
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-lg">
            From parcels to full truck loads, Siegma Logistics ensures your goods
            reach their destination safely and on time, every time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link to="/request/general-parcel">
              <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                <Package className="w-5 h-5" />
                Request General Parcel
              </Button>
            </Link>
            <Link to="/request/full-truck-load">
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto gap-2">
                <Truck className="w-5 h-5" />
                Request Full Truck Load
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
            {[
              { value: "15+", label: "Years Experience" },
              { value: "500+", label: "Cities Covered" },
              { value: "50K+", label: "Happy Customers" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-accent">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/55 border border-white/20 flex items-center justify-center text-white transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/55 border border-white/20 flex items-center justify-center text-white transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Caption + dot indicators */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        <span className="text-white/75 text-sm font-medium tracking-wide drop-shadow">
          {slides[current].caption}
        </span>
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current ? "bg-accent w-8" : "bg-white/50 w-4 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
