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
        className="relative flex flex-col items-center justify-center h-36 overflow-hidden bg-white border-b border-gray-100"
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px),
                              linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Icon — FIX: render as JSX component, not interpolated ReactNode */}
        <div className="relative z-10 w-16 h-16">
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
            <span className="text-[7px] text-gray-400 tracking-widest uppercase"
                  style={{ fontFamily: "Michroma, sans-serif" }}>Live</span>
          </div>
        )}

        {/* Popular badge */}
        {calc.popular && (
          <div className="absolute bottom-3 right-3">
            <span className="text-[6px] bg-[#ffc812] text-black px-1.5 py-0.5 font-bold tracking-wider uppercase"
                  style={{ fontFamily: "Michroma, sans-serif" }}>
              Popular
            </span>
          </div>
        )}

        {/* Hover overlay */}
        {isLive && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(255, 200, 18, 0.05)" }}
          >
            <div className="border border-black/10 px-4 py-1.5" style={{ transform: "skewX(-10deg)" }}>
              <span className="text-[9px] text-black tracking-widest uppercase"
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
  const [showCompare, setShowCompare] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

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
        <div className="relative bg-black pt-24 md:pt-28 pb-14 md:pb-20 overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(#ffc812 1px, transparent 1px),
                                linear-gradient(90deg, #ffc812 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-black/90" />
          
          <div className="relative max-w-7xl mx-auto px-4 md:px-12">
            {/* Accent stripe */}
            <div className="w-12 h-0.5 bg-[#ffc812] mb-6" />
            
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => navigate("/")}
                className="text-[#ffc812]/60 hover:text-[#ffc812] text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1 group"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Home
              </button>
              <span className="text-white/20 text-[10px]">/</span>
              <span className="text-[#ffc812] text-[10px] tracking-widest uppercase"
                    style={{ fontFamily: "Michroma, sans-serif" }}>Calculators</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                style={{ fontFamily: "Michroma, sans-serif" }}>
              Drive <span className="text-[#ffc812]">Calculator</span> Suite
            </h1>
            <p className="text-white/50 text-sm md:text-base mt-4 max-w-2xl leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
              Professional-grade RC aircraft and drone performance simulation tools.
              All calculations run locally in your browser — no data sent anywhere.
            </p>

            {/* Stats strip - Dynamic */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-10 pt-8 border-t border-white/10">
              {[
                { v: CALCULATORS.length.toString(), l: "Calculator Modules" },
                { v: liveCount.toString(), l: "Live Now" },
                { v: "100%", l: "Client-side" },
                { v: "±10%", l: "Accuracy (ISA)" },
              ].map(({ v, l }) => (
                <div key={l} className="flex items-start gap-3">
                  <div>
                    <p className="text-2xl md:text-3xl font-black text-[#ffc812]"
                       style={{ fontFamily: "Michroma, sans-serif" }}>{v}</p>
                    <p className="text-[9px] text-white/40 tracking-widest uppercase mt-1"
                       style={{ fontFamily: "Michroma, sans-serif" }}>{l}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search and Filter Bar ── */}
        <div className="bg-white border-b border-gray-200 sticky top-[60px] md:top-[72px] z-20 shadow-md">
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-5">
            {/* Search box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-lg">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search calculators by name, category, or feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 text-sm focus:outline-none focus:border-[#ffc812] transition-colors rounded-sm"
                  style={{ fontFamily: "Lexend, sans-serif" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808080] hover:text-black p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[10px] text-[#808080] whitespace-nowrap" style={{ fontFamily: "Michroma, sans-serif" }}>
                  <span className="font-bold text-black">{filteredCalculators.length}</span> of {CALCULATORS.length}
                </div>
                <button
                  onClick={() => setShowCompare(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-black text-[#ffc812] text-[9px] tracking-widest uppercase font-bold hover:bg-[#222] transition-colors whitespace-nowrap"
                  style={{ fontFamily: "Michroma, sans-serif" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                  Compare
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map(tab => {
                const count =
                  tab.id === "live" ? liveCount :
                  tab.id === "soon" ? soonCount :
                  tab.id === "all" ? CALCULATORS.length :
                  CALCULATORS.filter(c => c.category === tab.id).length;

                const isActive = activeFilter === tab.id;
                const isStatus = tab.id === "live" || tab.id === "soon";

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`group flex items-center gap-2 px-4 py-2.5 text-[9px] tracking-widest uppercase font-bold transition-all duration-200 border-2 ${
                      isActive
                        ? "bg-black text-[#ffc812] border-black"
                        : "bg-white text-[#666] border-gray-200 hover:border-gray-400 hover:text-black"
                    }`}
                    style={{ fontFamily: "Michroma, sans-serif" }}
                  >
                    {isStatus && (
                      <span className={`w-2 h-2 rounded-full ${
                        tab.id === "live" ? "bg-green-500" : "bg-amber-400"
                      } ${isActive ? "" : "opacity-60"}`} />
                    )}
                    {tab.label}
                    <span className={`text-[8px] px-2 py-0.5 font-bold transition-colors ${
                      isActive 
                        ? "bg-[#ffc812] text-black" 
                        : "bg-gray-100 text-[#808080] group-hover:bg-gray-200"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Calculator grid ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-14">
          {/* Section header showing current filter */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                {activeFilter === "all" ? "All Calculators" :
                 activeFilter === "live" ? "Live Calculators" :
                 activeFilter === "soon" ? "Coming Soon" :
                 FILTER_TABS.find(t => t.id === activeFilter)?.label + " Calculators"}
              </h2>
              <p className="text-xs text-[#808080] mt-1" style={{ fontFamily: "Lexend, sans-serif" }}>
                {activeFilter === "all" 
                  ? "Showing all available and upcoming calculators"
                  : activeFilter === "live"
                  ? "Ready to use — click any calculator to start"
                  : activeFilter === "soon"
                  ? "In development — check back soon!"
                  : `Calculators for ${FILTER_TABS.find(t => t.id === activeFilter)?.label.toLowerCase()} applications`}
              </p>
            </div>
            {filteredCalculators.length > 0 && (
              <div className="hidden md:flex items-center gap-2 text-[9px] text-[#808080]" style={{ fontFamily: "Michroma, sans-serif" }}>
                <span className="w-2 h-2 rounded-full bg-green-500" /> Live first
              </div>
            )}
          </div>

          {filteredCalculators.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-lg">
              <svg className="w-16 h-16 text-[#ffc812]/30 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
              <button
                onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}
                className="mt-4 px-4 py-2 bg-black text-[#ffc812] text-[9px] tracking-widest uppercase font-bold hover:bg-[#222] transition-colors"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculators.map(calc => (
                <CalculatorCard key={calc.id} calc={calc} />
              ))}
            </div>
          )}
        </div>

        {/* ── Disclaimer ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 pb-12">
          <div className="flex items-start gap-3 bg-[#ffc812]/5 border border-[#ffc812]/20 px-4 py-3">
            <svg className="w-4 h-4 text-[#ffc812] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[10px] text-[#555]" style={{ fontFamily: "Lexend, sans-serif" }}>
              All results are estimates based on momentum theory and empirical models.
              Accuracy is ±10–15%. Always verify with bench testing before flight.
              Calculations use the International Standard Atmosphere (ISA) model with corrections for altitude and temperature.
            </p>
          </div>
        </div>

        {/* ── Compare Modal ── */}
        {showCompare && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="bg-black px-4 py-3 flex items-center justify-between sticky top-0">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
                   style={{ fontFamily: "Michroma, sans-serif" }}>
                  Compare Calculators
                </p>
                <button
                  onClick={() => { setShowCompare(false); setCompareSelection([]); }}
                  className="text-white hover:text-[#ffc812] text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: "Lexend, sans-serif" }}>
                  Select 2 calculators to compare their features and capabilities:
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {CALCULATORS.filter(c => c.status === "live").map(calc => {
                    const isSelected = compareSelection.includes(calc.id);
                    const isDisabled = !isSelected && compareSelection.length >= 2;

                    return (
                      <button
                        key={calc.id}
                        onClick={() => {
                          if (isDisabled) return;
                          if (isSelected) {
                            setCompareSelection(compareSelection.filter(id => id !== calc.id));
                          } else {
                            setCompareSelection([...compareSelection, calc.id]);
                          }
                        }}
                        disabled={isDisabled}
                        className={`p-4 border-2 transition-all text-left ${
                          isSelected
                            ? "border-[#ffc812] bg-[#fffbe6]"
                            : isDisabled
                            ? "border-gray-100 opacity-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6" style={{ color: calc.accent }}>
                            <calc.icon />
                          </div>
                          <span className="text-sm font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>
                            {calc.label}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500" style={{ fontFamily: "Lexend, sans-serif" }}>
                          {calc.tag}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {compareSelection.length === 2 && (() => {
                  const calc1 = CALCULATORS.find(c => c.id === compareSelection[0])!;
                  const calc2 = CALCULATORS.find(c => c.id === compareSelection[1])!;

                  return (
                    <div className="border-t pt-4">
                      <table className="w-full text-sm" style={{ fontFamily: "Michroma, sans-serif" }}>
                        <thead>
                          <tr className="border-b">
                            <th className="px-3 py-2 text-left text-gray-500 text-[9px] uppercase tracking-wider">Feature</th>
                            <th className="px-3 py-2 text-right text-[9px] uppercase tracking-wider" style={{ color: calc1.accent }}>{calc1.label}</th>
                            <th className="px-3 py-2 text-right text-[9px] uppercase tracking-wider" style={{ color: calc2.accent }}>{calc2.label}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: "tag", label: "Category" },
                            { key: "description", label: "Description", full: true },
                            { key: "inputCount", label: "Input Parameters" },
                            { key: "outputCount", label: "Output Metrics" },
                            { key: "metrics", label: "Key Metrics", array: true },
                          ].map(row => (
                            <tr key={row.key} className="border-b border-gray-100">
                              <td className="px-3 py-3 text-[9px] uppercase tracking-wider text-gray-500">{row.label}</td>
                              <td className="px-3 py-3 text-right font-bold" style={{ color: calc1.accent }}>
                                {row.array
                                  ? (calc1[row.key as keyof typeof calc1] as string[])?.join(", ")
                                  : row.full
                                  ? calc1[row.key as keyof typeof calc1] as string
                                  : (calc1[row.key as keyof typeof calc1] as number)?.toString() || "—"}
                              </td>
                              <td className="px-3 py-3 text-right font-bold" style={{ color: calc2.accent }}>
                                {row.array
                                  ? (calc2[row.key as keyof typeof calc2] as string[])?.join(", ")
                                  : row.full
                                  ? calc2[row.key as keyof typeof calc2] as string
                                  : (calc2[row.key as keyof typeof calc2] as number)?.toString() || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    {compareSelection.length === 0 && "Select calculators to compare"}
                    {compareSelection.length === 1 && "Select 1 more calculator"}
                    {compareSelection.length === 2 && "Ready to compare!"}
                  </p>
                  <button
                    onClick={() => { setShowCompare(false); setCompareSelection([]); }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 text-[9px] tracking-widest uppercase font-bold hover:bg-gray-200 transition-colors"
                    style={{ fontFamily: "Michroma, sans-serif" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}