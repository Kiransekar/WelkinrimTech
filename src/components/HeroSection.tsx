import { useState, useEffect, useRef, useCallback } from "react";

const industries = [
  {
    id: "uav",
    label: "UAV",
    bg: "/motor-hero.png",
    accent: "Autonomous Aerial Systems",
    pos: "right center",
    fit: "contain",
  },
  {
    id: "marine",
    label: "Marine",
    bg: "/assets/products/maelard_1560.png",
    accent: "Maritime Electric Drives",
    pos: "right center",
    fit: "contain",
  },
  {
    id: "land",
    label: "Land",
    bg: "/assets/products/maelard_9007.png",
    accent: "Ground Vehicle Propulsion",
    pos: "right center",
    fit: "contain",
  },
  {
    id: "robotics",
    label: "Robotics",
    bg: "/assets/products/haemng_1536.png",
    accent: "Industrial Automation",
    pos: "right center",
    fit: "contain",
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
              backgroundColor: "#050505",
            }}
          >
            <img
              src={ind.bg}
              alt={ind.label}
              className="w-full h-full opacity-80"
              style={{ 
                objectPosition: (ind as any).pos || "center",
                objectFit: (ind as any).fit || "cover"
              }}
              loading={i === 0 ? "eager" : "lazy"}
            />

            {/* Slide Index (Engineering Depth style) */}
            <div className="absolute top-8 left-8 md:top-12 md:left-12 lg:top-16 lg:left-16 z-20">
              <span className="text-[10px] md:text-xs text-[#ffc812] tracking-[0.3em] font-mono font-bold">
                0{i + 1}
              </span>
            </div>

            {/* Vignette Overlay (Engineering Depth theme) */}
            <div 
              className="absolute inset-0 z-[1]"
              style={{
                background: `
                  radial-gradient(circle at 70% 50%, transparent 20%, rgba(5,5,5,0.4) 60%, rgba(5,5,5,0.95) 100%),
                  linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(5,5,5,0.5) 20%, transparent 50%)
                `
              }}
            />
          </div>
        );
      })}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 lg:pb-36 px-4 md:px-12 lg:px-16 max-w-[1600px] mx-auto">
        {/* Fixed headline */}
        <div className="mb-1">
          <p
            className="text-[10px] md:text-xs tracking-[0.4em] uppercase transition-colors duration-700 text-white/80"
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
              className={`absolute left-0 transition-all duration-700 ease-in-out ${i === activeIdx
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
                }`}
              style={{ top: 0 }}
            >
              <h1
                className="text-[42px] md:text-[64px] lg:text-[86px] xl:text-[8vw] font-bold uppercase leading-[0.9] tracking-tighter"
                style={{ fontFamily: 'Michroma, sans-serif' }}
              >
                <span className="text-white">
                  {ind.label.split('/')[0].split(' ')[0]}
                </span>
                {(ind.label.includes(' ') || ind.label.includes('/')) && (
                  <span className="text-[#ffc812] ml-4">
                    {ind.label.includes('/')
                      ? ind.label.substring(ind.label.indexOf('/'))
                      : ind.label.split(' ').slice(1).join(' ')}
                  </span>
                )}
              </h1>
            </div>
          ))}
        </div>

        {/* Accent */}
        <div className="mt-2 h-6 overflow-hidden relative">
          {industries.map((ind, i) => (
            <div
              key={ind.id}
              className={`absolute left-0 transition-all duration-700 ease-in-out delay-100 ${i === activeIdx
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
                }`}
            >
              <p
                className="text-sm tracking-[0.5em] uppercase text-[#ffc812] font-semibold"
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
              className={`text-xs tracking-[0.15em] uppercase font-bold pb-1 transition-all duration-200 ${i === activeIdx
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
