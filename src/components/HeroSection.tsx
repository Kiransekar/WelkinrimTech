import { useState, useEffect, useRef, useCallback } from "react";

const industries = [
  {
    id: "uav",
    label: "UAV / eVTOL",
    bg: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1920&q=85&fit=crop",
    accent: "Autonomous Aerial Systems",
  },
  {
    id: "marine",
    label: "Marine",
    bg: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=85&fit=crop",
    bgFallback: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=85&fit=crop",
    accent: "Maritime Electric Drives",
  },
  {
    id: "land",
    label: "Land",
    bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85&fit=crop",
    accent: "Ground Vehicle Propulsion",
  },
  {
    id: "robotics",
    label: "Robotics",
    bg: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&q=85&fit=crop",
    accent: "Industrial Automation",
  },
];

export default function HeroSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning || idx === activeIdx) return;
      setTransitioning(true);
      setPrevIdx(activeIdx);
      setTimeout(() => {
        setActiveIdx(idx);
        setTimeout(() => {
          setPrevIdx(null);
          setTransitioning(false);
        }, 800);
      }, 50);
    },
    [activeIdx, transitioning]
  );

  const next = useCallback(() => {
    goTo((activeIdx + 1) % industries.length);
  }, [activeIdx, goTo]);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(next, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  const handleHoverArea = (pause: boolean) => {
    setIsPaused(pause);
  };

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden">
      {/* Background Images */}
      {industries.map((ind, i) => (
        <div
          key={ind.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === activeIdx ? 1 : 0,
            zIndex: i === activeIdx ? 1 : 0,
          }}
        >
          <img
            src={ind.bg}
            alt={ind.label}
            className="w-full h-full object-cover object-center"
            loading={i === 0 ? "eager" : "lazy"}
            onError={(e) => {
              const img = e.currentTarget;
              if ("bgFallback" in ind && ind.bgFallback && img.src !== ind.bgFallback) {
                img.src = ind.bgFallback as string;
              }
            }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-3">
          <div className="h-px w-12 bg-[#FFCC00]" />
          <span
            className="text-[#FFCC00] text-xs tracking-[0.3em] uppercase"
            style={{ fontFamily: 'Michroma, sans-serif' }}
          >
            Next Generation Propulsion
          </span>
        </div>

        {/* Fixed headline */}
        <div className="mb-2">
          <p
            className="text-white/80 text-lg md:text-xl lg:text-2xl tracking-widest uppercase"
            style={{ fontFamily: 'Michroma, sans-serif' }}
          >
            Precision Electric Propulsion For
          </p>
        </div>

        {/* Animated industry name */}
        <div className="h-[80px] md:h-[100px] lg:h-[120px] overflow-hidden relative">
          {industries.map((ind, i) => (
            <div
              key={ind.id}
              className={`absolute left-0 transition-all duration-700 ease-in-out ${
                i === activeIdx
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ top: 0 }}
            >
              <h1
                className="text-[48px] md:text-[64px] lg:text-[80px] font-bold text-[#FFCC00] leading-tight whitespace-nowrap"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                {ind.label}
              </h1>
            </div>
          ))}
        </div>

        {/* Accent */}
        <div className="mt-4 h-8 overflow-hidden relative">
          {industries.map((ind, i) => (
            <div
              key={ind.id}
              className={`absolute left-0 transition-all duration-700 ease-in-out delay-100 ${
                i === activeIdx
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <p
                className="text-white/60 text-sm tracking-[0.2em] uppercase"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                {ind.accent}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-wrap gap-4">
          <button
            onClick={() => {
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3 bg-[#FFCC00] text-black text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#e6b800] transition-all duration-300 hover:shadow-lg hover:shadow-[#FFCC00]/30"
            style={{ fontFamily: 'Michroma, sans-serif' }}
          >
            Get in Touch
          </button>
          <button
            onClick={() => {
              document.querySelector("#technology")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3 border border-white/50 text-white text-xs tracking-[0.2em] uppercase font-medium hover:border-[#FFCC00] hover:text-[#FFCC00] transition-all duration-300 backdrop-blur-sm"
            style={{ fontFamily: 'Michroma, sans-serif' }}
          >
            Our Technology
          </button>
        </div>
      </div>

      {/* Industry Selector — hover area at lower center */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
        onMouseEnter={() => handleHoverArea(true)}
        onMouseLeave={() => handleHoverArea(false)}
      >
        <p
          className="text-white/50 text-[10px] tracking-[0.3em] uppercase mb-1"
          style={{ fontFamily: 'Michroma, sans-serif' }}
        >
          Select Industry
        </p>
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full">
          {industries.map((ind, i) => (
            <button
              key={ind.id}
              onClick={() => goTo(i)}
              className={`text-xs tracking-widest uppercase font-medium transition-all duration-300 px-3 py-1 rounded-full ${
                i === activeIdx
                  ? "bg-[#FFCC00] text-black"
                  : "text-white/70 hover:text-[#FFCC00]"
              }`}
              style={{ fontFamily: 'Michroma, sans-serif' }}
            >
              {ind.label}
            </button>
          ))}
        </div>
        {/* Progress indicators */}
        <div className="flex gap-2">
          {industries.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-500 rounded-full ${
                i === activeIdx
                  ? "w-8 h-1.5 bg-[#FFCC00]"
                  : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-10 z-10 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#FFCC00]" />
        <span className="text-white/40 text-[10px] tracking-widest uppercase rotate-90 origin-center translate-y-6" style={{ fontFamily: 'Michroma, sans-serif' }}>Scroll</span>
      </div>
    </section>
  );
}
