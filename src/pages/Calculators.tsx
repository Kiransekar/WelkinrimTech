import { useLocation } from "wouter";
import Footer from "@/components/Footer";

const CALC_CARDS = [
  {
    id: "propcalc",
    label: "propCalc",
    tag: "Airplane",
    description: "Propeller thrust, power, RPM, efficiency, flight time and partial-load analysis for fixed-wing RC aircraft.",
    accent: "#ffc914",
    textColor: "#000",
    status: "live",
    metrics: ["Thrust", "Pitch Speed", "Stall Speed", "Flight Time"],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-12 h-12">
        <ellipse cx="32" cy="32" rx="28" ry="10" />
        <line x1="4" y1="32" x2="60" y2="32" />
        <ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(60 32 32)" />
        <circle cx="32" cy="32" r="4" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "xcoptercalc",
    label: "xcopterCalc",
    tag: "Multirotor",
    description: "Hover power, disc loading, TWR, flight time (hover / mixed / full) and throttle curve for multi-rotor drones.",
    accent: "#ffc914",
    textColor: "#000",
    status: "live",
    metrics: ["Hover RPM", "Flight Time", "TWR", "Range"],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-12 h-12">
        <circle cx="32" cy="32" r="5" fill="currentColor" />
        <line x1="32" y1="8" x2="32" y2="27" /><line x1="32" y1="37" x2="32" y2="56" />
        <line x1="8"  y1="32" x2="27" y2="32" /><line x1="37" y1="32" x2="56" y2="32" />
        <ellipse cx="32" cy="8"  rx="8" ry="3" />
        <ellipse cx="32" cy="56" rx="8" ry="3" />
        <ellipse cx="8"  cy="32" rx="3" ry="8" />
        <ellipse cx="56" cy="32" rx="3" ry="8" />
      </svg>
    ),
  },
  {
    id: "xcoptercalc",
    label: "heliCalc",
    tag: "Helicopter",
    description: "Electric helicopter main & tail rotor RPM, torque, motor current, efficiency and collective pitch analysis.",
    accent: "#22c55e",
    textColor: "#fff",
    status: "soon",
    metrics: ["Rotor RPM", "Torque", "Head Speed", "Collective"],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-12 h-12">
        <line x1="8" y1="20" x2="56" y2="20" />
        <circle cx="32" cy="20" r="4" fill="currentColor" />
        <line x1="32" y1="20" x2="32" y2="52" />
        <line x1="44" y1="44" x2="60" y2="44" />
        <circle cx="44" cy="44" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "xcoptercalc",
    label: "fanCalc",
    tag: "EDF / Jet",
    description: "Ducted fan thrust, power and efficiency. Static and dynamic performance curves for EDF-powered jets.",
    accent: "#3b82f6",
    textColor: "#fff",
    status: "soon",
    metrics: ["Fan Thrust", "Fan RPM", "Efficiency", "Jet Velocity"],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-12 h-12">
        <rect x="12" y="22" width="40" height="20" rx="10" />
        <circle cx="32" cy="32" r="7" />
      </svg>
    ),
  },
  {
    id: "xcoptercalc",
    label: "cgCalc",
    tag: "CG / Stability",
    description: "Multi-component CG solver with moment arm inputs, neutral point and static stability margin analysis.",
    accent: "#a855f7",
    textColor: "#fff",
    status: "soon",
    metrics: ["CG Position", "Neutral Pt", "Stab Margin", "Moment"],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-12 h-12">
        <line x1="8" y1="44" x2="56" y2="44" />
        <polygon points="32,16 8,44 56,44" />
        <circle cx="32" cy="38" r="4" fill="currentColor" />
        <line x1="32" y1="44" x2="32" y2="56" />
      </svg>
    ),
  },
  {
    id: "xcoptercalc",
    label: "perfCalc",
    tag: "Performance",
    description: "Full aircraft performance analysis: power required, drag polar, range (Breguet), endurance and climb curves.",
    accent: "#ef4444",
    textColor: "#fff",
    status: "soon",
    metrics: ["Range", "Endurance", "V-best", "Climb Rate"],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-12 h-12">
        <polyline points="8,48 20,32 30,40 42,20 56,16" />
        <line x1="8" y1="48" x2="56" y2="48" />
        <line x1="8" y1="16" x2="8"  y2="48" />
      </svg>
    ),
  },
];

export default function Calculators() {
  const [, navigate] = useLocation();

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* ── Page header ── */}
        <div className="bg-black pt-24 md:pt-28 pb-12 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => navigate("/")}
                className="text-[#ffc914]/60 hover:text-[#ffc914] text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Home
              </button>
              <span className="text-white/20 text-[10px]">/</span>
              <span className="text-[#ffc914] text-[10px] tracking-widest uppercase"
                    style={{ fontFamily: "Michroma, sans-serif" }}>Calculators</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                style={{ fontFamily: "Michroma, sans-serif" }}>
              Drive <span className="text-[#ffc914]">Calculator</span>
            </h1>
            <p className="text-white/40 text-sm mt-3 max-w-xl" style={{ fontFamily: "Lexend, sans-serif" }}>
              Professional-grade RC aircraft and drone performance simulation tools.
              All calculations run locally in your browser — no data sent anywhere.
            </p>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10">
              {[
                { v: "6", l: "Calculator Modules" },
                { v: "2",  l: "Live Now" },
                { v: "100%", l: "Client-side" },
                { v: "±10%", l: "Accuracy (ISA model)" },
              ].map(({ v, l }) => (
                <div key={l}>
                  <p className="text-xl md:text-2xl font-black text-[#ffc914]"
                     style={{ fontFamily: "Michroma, sans-serif" }}>{v}</p>
                  <p className="text-[9px] text-white/40 tracking-widest uppercase mt-0.5"
                     style={{ fontFamily: "Michroma, sans-serif" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Calculator grid ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-16">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#808080] mb-6"
             style={{ fontFamily: "Michroma, sans-serif" }}>
            Select a Calculator
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CALC_CARDS.map((c, i) => (
              <button
                key={i}
                onClick={() => c.status === "live" && navigate(`/calculators/detail`)}
                disabled={c.status === "soon"}
                className={`text-left border transition-all duration-300 flex flex-col group ${
                  c.status === "live"
                    ? "border-gray-100 hover:border-gray-300 hover:shadow-xl cursor-pointer"
                    : "border-gray-100 opacity-60 cursor-default"
                }`}
              >
                {/* Card header */}
                <div
                  className="relative flex flex-col items-center justify-center h-36 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 100%)" }}
                >
                  {/* Subtle grid */}
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage: `linear-gradient(${c.accent}88 1px, transparent 1px),
                                        linear-gradient(90deg, ${c.accent}88 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  />
                  {/* Icon */}
                  <div className="relative z-10" style={{ color: c.accent }}>{c.icon}</div>

                  {/* Status badge */}
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5"
                    style={{ background: c.status === "live" ? c.accent : "#333", transform: "skewX(-10deg)" }}
                  >
                    <span
                      className="text-[7px] font-black tracking-widest uppercase"
                      style={{
                        fontFamily: "Michroma, sans-serif",
                        color: c.status === "live" ? c.textColor : "#888",
                        display: "inline-block",
                        transform: "skewX(10deg)",
                      }}
                    >
                      {c.status === "live" ? c.tag : "Soon"}
                    </span>
                  </div>

                  {/* Live indicator */}
                  {c.status === "live" && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                      <span className="text-[7px] text-white/50 tracking-widest uppercase"
                            style={{ fontFamily: "Michroma, sans-serif" }}>Live</span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  {c.status === "live" && (
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: `${c.accent}18` }}
                    >
                      <div className="border border-white/20 px-4 py-1.5" style={{ transform: "skewX(-10deg)" }}>
                        <span className="text-[9px] text-white tracking-widest uppercase"
                              style={{ fontFamily: "Michroma, sans-serif", display: "inline-block", transform: "skewX(10deg)" }}>
                          Open Calculator →
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1 bg-white">
                  <p className="text-[8px] tracking-[0.25em] uppercase mb-0.5"
                     style={{ fontFamily: "Michroma, sans-serif", color: c.accent }}>
                    {c.label}
                  </p>
                  <h3 className="text-sm font-bold text-black mb-2"
                      style={{ fontFamily: "Michroma, sans-serif" }}>
                    {c.tag}
                  </h3>
                  <p className="text-[11px] text-[#666] leading-relaxed mb-3 flex-1"
                     style={{ fontFamily: "Lexend, sans-serif" }}>
                    {c.description}
                  </p>

                  {/* Metric pills */}
                  <div className="flex flex-wrap gap-1">
                    {c.metrics.map(m => (
                      <span
                        key={m}
                        className="text-[8px] bg-gray-50 text-[#555] px-2 py-0.5"
                        style={{ fontFamily: "Michroma, sans-serif" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 pb-12">
          <div className="flex items-start gap-3 bg-[#ffc914]/5 border border-[#ffc914]/20 px-4 py-3">
            <svg className="w-4 h-4 text-[#ffc914] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[10px] text-[#555]" style={{ fontFamily: "Lexend, sans-serif" }}>
              All results are estimates based on momentum theory and empirical models.
              Accuracy is ±10–15%. Always verify with bench testing before flight.
              Calculations use the International Standard Atmosphere (ISA) model with corrections for altitude and temperature.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
