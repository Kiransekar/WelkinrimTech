import { useState } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";
import PropCalcPanel from "@/components/calculators/PropCalcPanel";
import XcopterCalcPanel from "@/components/calculators/XcopterCalcPanel";
import CalcStub from "@/components/calculators/CalcStub";

// ── Calculator definitions ─────────────────────────────────────────────────
const CALCS = [
  {
    id: "propcalc",
    label: "propCalc",
    tag: "Airplane",
    description: "Propeller & motor drive for fixed-wing aircraft",
    status: "live" as const,
    accent: "#ffc914",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <ellipse cx="32" cy="32" rx="28" ry="10" />
        <line x1="4" y1="32" x2="60" y2="32" />
        <ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(60 32 32)" />
        <circle cx="32" cy="32" r="4" fill="currentColor" />
      </svg>
    ),
    stubDescription: "",
  },
  {
    id: "xcoptercalc",
    label: "xcopterCalc",
    tag: "Multirotor",
    description: "Multirotor (quadcopter, hex, octo) drive simulation",
    status: "live" as const,
    accent: "#ffc914",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <circle cx="32" cy="32" r="5" fill="currentColor" />
        <line x1="32" y1="8" x2="32" y2="27" /><line x1="32" y1="37" x2="32" y2="56" />
        <line x1="8"  y1="32" x2="27" y2="32" /><line x1="37" y1="32" x2="56" y2="32" />
        <ellipse cx="32" cy="8"  rx="8" ry="3" />
        <ellipse cx="32" cy="56" rx="8" ry="3" />
        <ellipse cx="8"  cy="32" rx="3" ry="8" />
        <ellipse cx="56" cy="32" rx="3" ry="8" />
      </svg>
    ),
    stubDescription: "",
  },
  {
    id: "helicalc",
    label: "heliCalc",
    tag: "Helicopter",
    description: "Electric helicopter main & tail rotor calculator",
    status: "soon" as const,
    accent: "#22c55e",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <line x1="8" y1="20" x2="56" y2="20" />
        <circle cx="32" cy="20" r="4" fill="currentColor" />
        <line x1="32" y1="20" x2="32" y2="52" />
        <line x1="44" y1="44" x2="60" y2="44" />
        <circle cx="44" cy="44" r="3" fill="currentColor" />
      </svg>
    ),
    stubDescription: "Electric helicopter main rotor, tail rotor RPM, torque, motor current and efficiency analysis.",
  },
  {
    id: "fancalc",
    label: "fanCalc",
    tag: "EDF / Jet",
    description: "Electric Ducted Fan and jet turbine simulator",
    status: "soon" as const,
    accent: "#3b82f6",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <rect x="12" y="20" width="40" height="24" rx="12" />
        <circle cx="32" cy="32" r="8" />
        {[0,45,90,135,180,225,270,315].map(a => {
          const r = (Math.PI * a) / 180;
          const x1 = 32 + 8 * Math.cos(r), y1 = 32 + 8 * Math.sin(r);
          const x2 = 32 + 12 * Math.cos(r), y2 = 32 + 12 * Math.sin(r);
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </svg>
    ),
    stubDescription: "EDF thrust, static & dynamic performance, jet power, fan efficiency and velocity analysis.",
  },
  {
    id: "cgcalc",
    label: "cgCalc",
    tag: "CG Analysis",
    description: "Center of Gravity calculator for any airframe",
    status: "soon" as const,
    accent: "#a855f7",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <line x1="8" y1="44" x2="56" y2="44" />
        <polygon points="32,16 8,44 56,44" />
        <circle cx="32" cy="38" r="4" fill="currentColor" />
        <line x1="32" y1="44" x2="32" y2="56" />
      </svg>
    ),
    stubDescription: "Multi-component CG solver with moment arm inputs, neutral point calculation and stability margin.",
  },
  {
    id: "perfcalc",
    label: "perfCalc",
    tag: "Performance",
    description: "Full aircraft performance & range analysis",
    status: "soon" as const,
    accent: "#ef4444",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <polyline points="8,48 20,32 30,40 42,20 56,16" />
        <line x1="8" y1="48" x2="56" y2="48" />
        <line x1="8" y1="16" x2="8"  y2="48" />
      </svg>
    ),
    stubDescription: "Drag polar, power-required curve, cruise efficiency, range (Breguet), endurance and climb analysis.",
  },
] as const;

type CalcId = typeof CALCS[number]["id"];

export default function CalculatorDetail() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<CalcId>("propcalc");

  const current = CALCS.find(c => c.id === active)!;

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="bg-black pt-24 md:pt-28 pb-8 md:pb-10">
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
                    style={{ fontFamily: "Michroma, sans-serif" }}>
                Calculators
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight"
                    style={{ fontFamily: "Michroma, sans-serif" }}>
                  Drive <span className="text-[#ffc914]">Calculator</span> Suite
                </h1>
                <p className="text-white/40 text-sm mt-2 max-w-lg"
                   style={{ fontFamily: "Lexend, sans-serif" }}>
                  Professional-grade RC aircraft & drone performance simulation —
                  all calculations run locally, no data sent to any server.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <p className="text-[10px] text-white/40 tracking-widest uppercase"
                   style={{ fontFamily: "Michroma, sans-serif" }}>
                  Client-side · No signup required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <div className="sticky top-[60px] md:top-[72px] z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
              {CALCS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-[9px] tracking-widest uppercase font-bold whitespace-nowrap transition-all duration-200 border-b-2 flex-shrink-0 ${
                    active === c.id
                      ? "border-[#ffc914] text-black"
                      : "border-transparent text-[#808080] hover:text-black hover:border-gray-200"
                  }`}
                  style={{ fontFamily: "Michroma, sans-serif" }}
                >
                  {c.label}
                  {c.status === "soon" && (
                    <span className="text-[7px] bg-gray-100 text-[#808080] px-1 py-0.5 rounded-sm">soon</span>
                  )}
                  {c.status === "live" && active === c.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-10">
          {/* Calculator sub-header */}
          <div className="flex items-start gap-4 mb-8">
            <div
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-gray-100 p-2"
              style={{ color: current.accent }}
            >
              {current.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-black"
                    style={{ fontFamily: "Michroma, sans-serif" }}>
                  {current.label}
                </h2>
                <span
                  className="text-[8px] font-bold tracking-widest uppercase px-2 py-0.5"
                  style={{
                    fontFamily: "Michroma, sans-serif",
                    background: current.accent,
                    color: "#000",
                    transform: "skewX(-10deg)",
                    display: "inline-block",
                  }}
                >
                  <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>
                    {current.tag}
                  </span>
                </span>
              </div>
              <p className="text-sm text-[#808080]" style={{ fontFamily: "Lexend, sans-serif" }}>
                {current.description}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 bg-[#ffc914]/5 border border-[#ffc914]/20 px-4 py-3 mb-6">
            <svg className="w-4 h-4 text-[#ffc914] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[10px] text-[#555]" style={{ fontFamily: "Lexend, sans-serif" }}>
              Results are estimates based on momentum theory and empirical motor models (±10–15% accuracy).
              Always verify with bench testing before flight. Calculations run entirely in your browser.
            </p>
          </div>

          {/* Panel */}
          {active === "propcalc"    && <PropCalcPanel />}
          {active === "xcoptercalc" && <XcopterCalcPanel />}
          {active === "helicalc"    && (
            <CalcStub
              name="heliCalc — Helicopter"
              description={CALCS.find(c => c.id === "helicalc")!.stubDescription}
              icon={CALCS.find(c => c.id === "helicalc")!.icon}
            />
          )}
          {active === "fancalc" && (
            <CalcStub
              name="fanCalc — EDF / Jet"
              description={CALCS.find(c => c.id === "fancalc")!.stubDescription}
              icon={CALCS.find(c => c.id === "fancalc")!.icon}
            />
          )}
          {active === "cgcalc" && (
            <CalcStub
              name="cgCalc — Center of Gravity"
              description={CALCS.find(c => c.id === "cgcalc")!.stubDescription}
              icon={CALCS.find(c => c.id === "cgcalc")!.icon}
            />
          )}
          {active === "perfcalc" && (
            <CalcStub
              name="perfCalc — Performance"
              description={CALCS.find(c => c.id === "perfcalc")!.stubDescription}
              icon={CALCS.find(c => c.id === "perfcalc")!.icon}
            />
          )}
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="bg-black py-16 mt-8">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] text-[#ffc914] tracking-[0.3em] uppercase mb-1"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
                Need precise data?
              </p>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
                Test our motors in your system.
              </h3>
              <p className="text-sm text-white/40 mt-1" style={{ fontFamily: "Lexend, sans-serif" }}>
                Welkinrim provides dyno-tested motor data sheets for all product variants.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-10 py-3 bg-[#ffc914] text-black text-[10px] tracking-widest uppercase font-black hover:bg-[#e0b212] transition-colors duration-300 whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>
                View Products
              </span>
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
