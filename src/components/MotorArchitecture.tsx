import { useState, useEffect, useRef } from "react";

const leftNodes = [
  { id: "stator",   label: "Stator Core",     desc: "High-permeability silicon steel", icon: "⬡" },
  { id: "rotor",    label: "Rotor Assembly",   desc: "Neodymium magnet array",         icon: "◎" },
  { id: "windings", label: "Phase Windings",   desc: "High-temp copper wire",          icon: "∿" },
  { id: "sensors",  label: "Hall Sensors",     desc: "Precision position feedback",    icon: "◈" },
];

// ── SVG Constants (viewBox 0 0 1000 480) ──
const NR = 140;  // Card overlay depth
const TX = 360;  // Trunk x (Moved left for better flow)
const TY = 230;  // Center y (Adjusted for better vertical balance)
const HL = 460;  // Hub left x
const HR = 620;  // Hub right x
const RX = 720;  // Right node start x
const NY = [60, 175, 290, 405]; // More compact, uniform vertical spacing

const SW = 32;   // Thick liquid stroke
const GOLD = "#ffc812";

export default function MotorArchitecture() {
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setOn(true); },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const d = (ms: number) => `${ms}ms`;

  return (
    <section ref={ref} className="w-full bg-[#050505] py-32 overflow-hidden border-t border-white/[0.03]">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-24 transition-all duration-1000"
             style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(30px)" }}>
          <span className="px-5 py-2 rounded-full bg-[#ffc812]/5 text-[#ffc812] text-[10px] tracking-[0.3em] font-mono uppercase mb-6 inline-block border border-[#ffc812]/15">
            System Integration
          </span>
          <h2 className="text-4xl md:text-6xl text-white font-medium tracking-tighter"
              style={{ fontFamily: "Michroma, sans-serif" }}>
            How our motors work
          </h2>
        </div>

        {/* Diagram container */}
        <div className="relative w-full max-w-[1100px] mx-auto" style={{ paddingBottom: "48%" }}>
          
          <svg viewBox="0 0 1000 480" className="absolute inset-0 w-full h-full overflow-visible" fill="none">
            <defs>
              <filter id="blob-filter">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                <feColorMatrix 
                  in="blur" 
                  mode="matrix" 
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" 
                  result="blob" 
                />
                <feComposite in="SourceGraphic" in2="blob" operator="atop" />
              </filter>
            </defs>

            {/* ── Background Glow ── */}
            <g opacity="0.02">
               <line x1={TX} y1={NY[0]} x2={TX} y2={NY[3]} stroke={GOLD} strokeWidth={SW + 12} strokeLinecap="round" />
               {NY.map((y, i) => <line key={`g-b-${i}`} x1={NR} y1={y} x2={TX} y2={y} stroke={GOLD} strokeWidth={SW + 12} strokeLinecap="round" />)}
               <line x1={TX} y1={TY} x2={HL} y2={TY} stroke={GOLD} strokeWidth={SW + 12} strokeLinecap="round" />
               <line x1={HR} y1={TY} x2={RX} y2={TY} stroke={GOLD} strokeWidth={SW + 12} strokeLinecap="round" />
            </g>

            {/* ── THE LIQUID BLOB LAYER ── */}
            <g filter="url(#blob-filter)">
              {/* Vertical Trunk (Wait for all branches) */}
              <line 
                x1={TX} y1={NY[0]} x2={TX} y2={NY[3]} 
                stroke={GOLD} strokeWidth={SW} strokeLinecap="round"
                style={{
                  opacity: on ? 1 : 0,
                  strokeDasharray: 400,
                  strokeDashoffset: on ? 0 : 400,
                  transition: on ? `stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 4.8s` : "none"
                }}
              />

              {/* Horizontal Branches (Sequential with cards) */}
              {NY.map((y, i) => (
                <line
                  key={`branch-${i}`}
                  x1={NR} y1={y} x2={TX} y2={y}
                  stroke={GOLD} strokeWidth={SW} strokeLinecap="round"
                  style={{
                    opacity: on ? 1 : 0,
                    strokeDasharray: 250,
                    strokeDashoffset: on ? 0 : 250,
                    transition: on ? `stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1) ${d(i * 1200 + 400)}` : "none"
                  }}
                />
              ))}

              {/* Center Connection (After Trunk) */}
              <line 
                x1={TX} y1={TY} x2={HL} y2={TY} 
                stroke={GOLD} strokeWidth={SW} strokeLinecap="round"
                style={{
                  opacity: on ? 1 : 0,
                  strokeDasharray: 150,
                  strokeDashoffset: on ? 0 : 150,
                  transition: on ? `stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1) 5.8s` : "none"
                }}
              />

              {/* Right Connection */}
              <line 
                x1={HR} y1={TY} x2={RX + 100} y2={TY} 
                stroke={GOLD} strokeWidth={SW} strokeLinecap="round"
                style={{
                  opacity: on ? 1 : 0,
                  strokeDasharray: 250,
                  strokeDashoffset: on ? 0 : 250,
                  transition: on ? `stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1) 7s` : "none"
                }}
              />
            </g>
          </svg>

          {/* ── Left Cards (Sequential) ── */}
          {leftNodes.map((node, i) => (
            <div key={node.id}
              className="absolute flex items-center gap-5 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#ffc812]/15 rounded-2xl px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
              style={{
                left: 0,
                top: `${(NY[i] / 480) * 100}%`,
                width: "26%",
                transform: `translateY(-50%) scale(${on ? 1 : 0.95})`,
                opacity: on ? 1 : 0,
                transition: on ? `opacity 0.8s ease ${d(i * 1200)}, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${d(i * 1200)}` : "none",
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-[#ffc812] flex-shrink-0 text-2xl border border-white/5 transition-all duration-700 shadow-inner"
                style={{ opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(0.5)", transitionDelay: d(i * 1200 + 300) }}
              >
                {node.icon}
              </div>
              <div className="min-w-0 overflow-hidden">
                <div 
                  className="transition-all duration-700 transform"
                  style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(20px)", transitionDelay: d(i * 1200 + 400) }}
                >
                  <h4 className="text-white text-[13px] font-bold leading-tight uppercase tracking-[0.1em]" style={{ fontFamily: "Michroma, sans-serif" }}>{node.label}</h4>
                </div>
                <div 
                  className="transition-all duration-700 transform"
                  style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(20px)", transitionDelay: d(i * 1200 + 550) }}
                >
                  <p className="text-white/40 text-[10px] leading-relaxed mt-1.5 font-medium">{node.desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* ── Central Hub (After All Sequential Steps) ── */}
          <div
            className="absolute flex flex-col items-center justify-center rounded-[2.5rem] border border-[#ffc812]/20 shadow-[0_0_80px_-20px_rgba(255,200,18,0.25)] z-10"
            style={{
              left: `${(HL / 1000) * 100}%`,
              top: `${(TY / 480) * 100}%`,
              width: "18%",
              height: "40%",
              transform: `translateY(-50%) scale(${on ? 1 : 0.8})`,
              background: "linear-gradient(135deg, #161616, #080808)",
              opacity: on ? 1 : 0,
              transition: on ? `opacity 1s ease 6s, transform 1s cubic-bezier(0.34, 1.56, 0.64, 1) 6s` : "none",
            }}
          >
            <div 
              className="relative mb-4 flex h-4 w-4 transition-all duration-1000"
              style={{ opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(0)", transitionDelay: "6.4s" }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffc812] opacity-40" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#ffc812]" />
            </div>
            <div 
              className="text-center transition-all duration-1000"
              style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(20px)", transitionDelay: "6.6s" }}
            >
              <p className="text-white text-2xl font-black tracking-[0.2em] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>WR</p>
              <p className="text-[#ffc812] text-[8px] tracking-[0.4em] uppercase font-mono font-bold opacity-70">Motor Core</p>
            </div>
          </div>

          {/* ── Right Card ── */}
          <div
            className="absolute flex items-center gap-5 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#ffc812]/15 rounded-2xl px-6 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
            style={{
              left: `${(RX / 1000) * 100}%`,
              top: `${(TY / 480) * 100}%`,
              width: "30%",
              transform: `translateY(-50%) scale(${on ? 1 : 0.95})`,
              opacity: on ? 1 : 0,
              transition: on ? `opacity 1s ease 7.5s, transform 1s cubic-bezier(0.34, 1.56, 0.64, 1) 7.5s` : "none",
            }}
          >
            <div 
              className="w-14 h-14 rounded-xl bg-white/[0.03] flex items-center justify-center text-[#ffc812] text-3xl flex-shrink-0 border border-white/5 transition-all duration-1000 shadow-inner"
              style={{ opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(0.5)", transitionDelay: "7.9s" }}
            >
              ⚡
            </div>
            <div className="overflow-hidden">
              <div 
                className="transition-all duration-1000 transform"
                style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(30px)", transitionDelay: "8.1s" }}
              >
                <p className="text-[#ffc812] text-[9px] tracking-[0.4em] uppercase font-mono mb-1.5 font-bold">Output</p>
                <h4 className="text-white text-[14px] font-bold tracking-wider uppercase leading-tight" style={{ fontFamily: "Michroma, sans-serif" }}>ESC / Controller</h4>
              </div>
              <div 
                className="transition-all duration-1000 transform"
                style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(30px)", transitionDelay: "8.4s" }}
              >
                <p className="text-white/40 text-[10px] mt-1.5 font-medium">Intelligent power delivery</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
