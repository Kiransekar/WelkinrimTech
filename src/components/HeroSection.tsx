import { useState, useEffect, useRef, useCallback } from "react";

const industries = [
  {
    id: "uav",
    label: "UAV/eVTOL",
    bg: "/hero-uav-bg.jpeg",
    accent: "Autonomous Aerial Systems",
  },
  {
    id: "marine",
    label: "Marine",
    bg: "/hero-uav-bg.jpeg",
    accent: "Maritime Electric Drives",
  },
  {
    id: "land",
    label: "Land",
    bg: "/hero-uav-bg.jpeg",
    accent: "Ground Vehicle Propulsion",
  },
  {
    id: "robotics",
    label: "Robotics",
    bg: "/hero-uav-bg.jpeg",
    accent: "Industrial Automation",
  },
];

export default function HeroSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning || idx === activeIdx) return;
      setTransitioning(true);
      setTimeout(() => {
        setActiveIdx(idx);
        setTimeout(() => {
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
      {industries.map((ind, i) => {
        return (
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
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </div>
        );
      })}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 lg:pb-36 px-4 md:px-12 lg:px-16">
        {/* Fixed headline */}
        <div className="mb-1">
          <p
            className="text-[10px] md:text-xs tracking-widest uppercase transition-colors duration-700 text-white"
            style={{ fontFamily: 'Michroma, sans-serif' }}
          >
            Precision Electric Propulsion For
          </p>
        </div>

        {/* Animated industry name */}
        <div className="h-[50px] md:h-[80px] lg:h-[100px] xl:h-[10vw] overflow-hidden relative">
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
                className="text-[36px] md:text-[56px] lg:text-[72px] xl:text-[7vw] font-bold text-[#ffc812] leading-[1.1]"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                {ind.label}
              </h1>
            </div>
          ))}
        </div>

        {/* Accent */}
        <div className="mt-2 h-6 overflow-hidden relative">
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
                className="text-xs tracking-[0.2em] uppercase text-white/60"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                {ind.accent}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-4 md:mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 md:px-8 py-2.5 md:py-3 bg-[#ffc812] text-black text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#e0b212] transition-all duration-300 hover:shadow-lg hover:shadow-[#ffc812]/30"
            style={{ fontFamily: 'Michroma, sans-serif', transform: 'skewX(-10deg)' }}
          >
            <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>Get in Touch</span>
          </button>
          <button
            onClick={() => {
              document.querySelector("#technology")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 md:px-8 py-2.5 md:py-3 border border-white/50 text-white text-[10px] md:text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 backdrop-blur-sm hover:border-[#ffc812] hover:text-[#ffc812]"
            style={{ fontFamily: 'Michroma, sans-serif', transform: 'skewX(-10deg)' }}
          >
            <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>Our Technology</span>
          </button>
        </div>
      </div>

      {/* Industry Selector — left-aligned tabs */}
      <div
        className="absolute bottom-16 md:bottom-20 left-4 md:left-12 lg:left-16 z-20 flex items-center flex-wrap gap-y-2"
        onMouseEnter={() => handleHoverArea(true)}
        onMouseLeave={() => handleHoverArea(false)}
      >
        {industries.map((ind, i) => (
          <div key={ind.id} className="flex items-center">
            <button
              onClick={() => goTo(i)}
              className={`text-xs tracking-[0.15em] uppercase font-bold pb-1 transition-all duration-200 ${
                i === activeIdx
                  ? "text-white border-b-2 border-[#ffc812]"
                  : "text-white/50 hover:text-white border-b-2 border-transparent"
              }`}
              style={{ fontFamily: 'Michroma, sans-serif' }}
            >
              {ind.label}
            </button>
            {i < industries.length - 1 && (
              <span className="mx-3 text-sm select-none text-white/30">|</span>
            )}
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 md:bottom-8 right-6 md:right-10 z-10 flex flex-col items-center gap-2">
        <div className="w-px h-10 md:h-12 bg-gradient-to-b from-transparent to-[#ffc812]" />
        <span className="text-[9px] md:text-[10px] tracking-widest uppercase rotate-90 origin-center translate-y-4 md:translate-y-6 text-white/40" style={{ fontFamily: 'Michroma, sans-serif' }}>Scroll</span>
      </div>
    </section>
  );
}
