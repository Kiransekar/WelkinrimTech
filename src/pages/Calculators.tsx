import { useState } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";
import {
  CALCULATORS,
  getLiveCalculators,
} from "@/data/calculators";

// Filter tab options
const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "soon", label: "Coming Soon" },
  { id: "airplane", label: "Airplane" },
  { id: "multirotor", label: "Multirotor" },
  { id: "helicopter", label: "Helicopter" },
  { id: "edf-jet", label: "EDF / Jet" },
  { id: "analysis", label: "Analysis" },
  { id: "performance", label: "Performance" },
] as const;

type FilterTab = typeof FILTER_TABS[number]["id"];

// Calculator card component
interface CalculatorCardProps {
  calc: typeof CALCULATORS[number];
}

function CalculatorCard({ calc }: CalculatorCardProps) {
  const [, navigate] = useLocation();
  const isLive = calc.status === "live";

  // FIX: Render icon as a component (<calc.icon />) instead of interpolating a stored element ({calc.icon})
  const Icon = calc.icon;

  return (
    <button
      onClick={() => isLive && navigate(`/calculators/detail/${calc.id}`)}
      disabled={!isLive}
      className={`text-left border transition-all duration-300 flex flex-col group ${
        isLive
          ? "border-gray-200 hover:border-gray-400 hover:shadow-xl cursor-pointer"
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
            backgroundImage: `linear-gradient(${calc.accent}88 1px, transparent 1px),
                              linear-gradient(90deg, ${calc.accent}88 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Icon — FIX: render as JSX component, not interpolated ReactNode */}
        <div className="relative z-10 w-10 h-10" style={{ color: calc.accent }}>
          <Icon />
        </div>

        {/* Status badge */}
        <div
          className="absolute top-3 right-3 px-2 py-0.5"
          style={{ background: isLive ? calc.accent : "#333", transform: "skewX(-10deg)" }}
        >
          <span
            className="text-[7px] font-black tracking-widest uppercase"
            style={{
              fontFamily: "Michroma, sans-serif",
              color: isLive ? calc.textColor : "#888",
              display: "inline-block",
              transform: "skewX(10deg)",
            }}
          >
            {isLive ? calc.tag : "Soon"}
          </span>
        </div>

        {/* Live indicator */}
        {isLive && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[7px] text-white/50 tracking-widest uppercase"
                  style={{ fontFamily: "Michroma, sans-serif" }}>Live</span>
          </div>
        )}

        {/* Popular badge */}
        {calc.popular && (
          <div className="absolute bottom-3 right-3">
            <span className="text-[6px] bg-[#ffc914] text-black px-1.5 py-0.5 font-bold tracking-wider uppercase"
                  style={{ fontFamily: "Michroma, sans-serif" }}>
              Popular
            </span>
          </div>
        )}

        {/* Hover overlay */}
        {isLive && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: `${calc.accent}18` }}
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
           style={{ fontFamily: "Michroma, sans-serif", color: calc.accent }}>
          {calc.label}
        </p>
        <h3 className="text-sm font-bold text-black mb-2"
            style={{ fontFamily: "Michroma, sans-serif" }}>
          {calc.tag}
        </h3>
        <p className="text-[11px] text-[#666] leading-relaxed mb-3 flex-1"
           style={{ fontFamily: "Lexend, sans-serif" }}>
          {calc.description}
        </p>

        {/* Metric pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {calc.metrics.map(m => (
            <span
              key={m}
              className="text-[8px] bg-gray-50 text-[#555] px-2 py-0.5 border border-gray-100"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              {m}
            </span>
          ))}
        </div>

        {/* Stats row */}
        {calc.inputCount && calc.outputCount && (
          <div className="flex items-center gap-3 text-[8px] text-[#808080] pt-2 border-t border-gray-100"
               style={{ fontFamily: "Michroma, sans-serif" }}>
            <span className="tracking-widest uppercase">
              <strong className="text-black">{calc.inputCount}</strong> inputs
            </span>
            <span className="tracking-widest uppercase">
              <strong className="text-black">{calc.outputCount}</strong> outputs
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

export default function Calculators() {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate dynamic stats
  const liveCount = getLiveCalculators().length;
  const soonCount = CALCULATORS.filter(c => c.status === "soon").length;

  // Filter calculators based on active tab and search
  const filteredCalculators = CALCULATORS.filter(calc => {
    // Apply status/category filter
    let matchesFilter = true;
    if (activeFilter === "live") {
      matchesFilter = calc.status === "live";
    } else if (activeFilter === "soon") {
      matchesFilter = calc.status === "soon";
    } else if (activeFilter !== "all") {
      matchesFilter = calc.category === activeFilter;
    }

    // Apply search filter
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        calc.label.toLowerCase().includes(q) ||
        calc.tag.toLowerCase().includes(q) ||
        calc.description.toLowerCase().includes(q) ||
        calc.category.toLowerCase().includes(q) ||
        calc.metrics.some(m => m.toLowerCase().includes(q));
    }

    return matchesFilter && matchesSearch;
  });

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
              Drive <span className="text-[#ffc914]">Calculator</span> Suite
            </h1>
            <p className="text-white/40 text-sm mt-3 max-w-xl" style={{ fontFamily: "Lexend, sans-serif" }}>
              Professional-grade RC aircraft and drone performance simulation tools.
              All calculations run locally in your browser — no data sent anywhere.
            </p>

            {/* Stats strip - Dynamic */}
            <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10">
              {[
                { v: CALCULATORS.length.toString(), l: "Calculator Modules" },
                { v: liveCount.toString(), l: "Live Now" },
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

        {/* ── Search and Filter Bar ── */}
        <div className="bg-white border-b border-gray-100 sticky top-[60px] md:top-[72px] z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-4">
            {/* Search box */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#ffc914] transition-colors"
                  style={{ fontFamily: "Michroma, sans-serif" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808080] hover:text-black"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="text-[9px] text-[#808080]" style={{ fontFamily: "Michroma, sans-serif" }}>
                {filteredCalculators.length} of {CALCULATORS.length} calculators
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map(tab => {
                // FIX: Count for "live"/"soon" uses status, otherwise use category match
                const count =
                  tab.id === "live" ? liveCount :
                  tab.id === "soon" ? soonCount :
                  tab.id === "all" ? CALCULATORS.length :
                  CALCULATORS.filter(c => c.category === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-[9px] tracking-widest uppercase font-bold transition-all duration-200 ${
                      activeFilter === tab.id
                        ? "bg-black text-[#ffc914]"
                        : "bg-gray-100 text-[#808080] hover:bg-gray-200 hover:text-black"
                    }`}
                    style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
                  >
                    <span className="inline-flex items-center gap-2" style={{ transform: "skewX(10deg)" }}>
                      {tab.label}
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-sm font-medium ${
                        activeFilter === tab.id ? "bg-[#ffc914] text-black" : "bg-white text-[#808080]"
                      }`}>
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Calculator grid ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-16">
          {filteredCalculators.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-[#ffc914]/30 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <p className="text-[10px] tracking-widest uppercase text-[#808080]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
                No calculators found
              </p>
              <p className="text-sm text-[#666] mt-2" style={{ fontFamily: "Lexend, sans-serif" }}>
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCalculators.map(calc => (
                <CalculatorCard key={calc.id} calc={calc} />
              ))}
            </div>
          )}
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