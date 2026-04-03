import { useState } from "react";
import { PRODUCTS, SERIES_CFG, type Product } from "@/data/products";

// Motor SVG icon used in cards
function MotorIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-80">
      <circle cx="40" cy="40" r="30" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="40" cy="40" r="18" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="40" cy="40" r="6"  fill={color} />
      {[0,60,120,180,240,300].map(a => {
        const r = Math.PI * a / 180;
        const x1 = 40 + 18 * Math.cos(r), y1 = 40 + 18 * Math.sin(r);
        const x2 = 40 + 28 * Math.cos(r), y2 = 40 + 28 * Math.sin(r);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function EscIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-80">
      <rect x="10" y="20" width="60" height="40" rx="4" fill="none" stroke={color} strokeWidth="2.5" />
      <rect x="18" y="30" width="12" height="8"  rx="1" fill={color} opacity=".4" />
      <rect x="34" y="30" width="12" height="8"  rx="1" fill={color} opacity=".4" />
      <rect x="50" y="30" width="12" height="8"  rx="1" fill={color} opacity=".4" />
      <line x1="10" y1="52" x2="70" y2="52" stroke={color} strokeWidth="1.5" opacity=".4" />
      {[15,25,35,45,55,65].map(x => (
        <line key={x} x1={x} y1="52" x2={x} y2="60" stroke={color} strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function FcIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-80">
      <rect x="8" y="8" width="64" height="64" rx="6" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="40" cy="40" r="12" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="40" cy="40" r="4"  fill={color} />
      {[8,16,24].map((r,i) => (
        <circle key={i} cx="40" cy="40" r={r+24} fill="none" stroke={color} strokeWidth=".8" opacity=".25" />
      ))}
    </svg>
  );
}

const TABS = [
  { id: "all",     label: "All Products",               count: PRODUCTS.length },
  { id: "haemng",  label: "Haemng Series",               count: PRODUCTS.filter(p=>p.series==="haemng").length },
  { id: "maelard", label: "Maelard Series",              count: PRODUCTS.filter(p=>p.series==="maelard").length },
  { id: "esc",     label: "ESCs",                        count: PRODUCTS.filter(p=>p.series==="esc").length },
  { id: "fc",      label: "Flight Controller",           count: 1 },
  { id: "ips",     label: "Integrated Systems",          count: PRODUCTS.filter(p=>p.series==="ips").length },
];

function ProductCard({ p, expanded, onToggle }: {
  p: Product;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = SERIES_CFG[p.series];

  return (
    <div className={`flex flex-col border transition-all duration-300 ${
      expanded ? "border-gray-300 shadow-xl" : "border-gray-100 hover:border-gray-300 hover:shadow-md"
    }`}>

      {/* Visual header */}
      <div className="relative flex flex-col items-center justify-center h-32 md:h-44 overflow-hidden"
           style={{ background: `linear-gradient(135deg, #111 0%, #1a1a1a 100%)` }}>

        {/* Faint grid overlay */}
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: `linear-gradient(${cfg.accent}33 1px, transparent 1px),
                                 linear-gradient(90deg, ${cfg.accent}33 1px, transparent 1px)`,
               backgroundSize: "20px 20px",
             }} />

        {/* Motor/ESC/FC icon */}
        <div className="relative z-10 mb-1 md:mb-2">
          {p.series === "haemng" ? (
            <img src={`${import.meta.env.BASE_URL}haemng.svg`} alt="Haemng" className="h-10 md:h-14 w-auto" style={{ filter: "brightness(0) invert(1)", opacity: 0.7 }} />
          ) : p.series === "maelard" ? (
            <img src={`${import.meta.env.BASE_URL}Maelard.svg`} alt="Maelard" className="h-8 md:h-10 w-auto" style={{ filter: "brightness(0) invert(1)", opacity: 0.7 }} />
          ) : p.series === "esc" ? <EscIcon color={cfg.accent} />
            : p.series === "fc" ? <FcIcon color={cfg.accent} />
            : <MotorIcon color={cfg.accent} />}
        </div>

        {/* Dimension badge */}
        {p.allSpecs.find(s => s.label === "Dimension") && (
          <p className="relative z-10 text-[7px] md:text-[9px] tracking-widest text-white/40 uppercase"
             style={{ fontFamily: "Michroma, sans-serif" }}>
            {p.allSpecs.find(s => s.label === "Dimension")?.value}
          </p>
        )}

        {/* Series badge top-right */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3 px-1.5 md:px-2 py-0.5"
             style={{ background: cfg.accent, transform: "skewX(-10deg)" }}>
          <span className="text-[6px] md:text-[8px] font-black tracking-widest uppercase"
                style={{ fontFamily: "Michroma, sans-serif",
                         color: p.series === "haemng" ? "#000" : "#fff",
                         display: "inline-block", transform: "skewX(10deg)" }}>
            {p.series === "ips" ? "IPS" : p.series === "fc" ? "FC" : p.series.toUpperCase()}
          </span>
        </div>

        {/* Tag bottom-left */}
        <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3">
          <span className="text-[6px] md:text-[8px] tracking-widest uppercase text-white/60 border border-white/20 px-1.5 md:px-2 py-0.5"
                style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)", display: "inline-block" }}>
            <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>{p.tag}</span>
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-3 md:p-5">
        <p className="text-[8px] md:text-[9px] tracking-[0.25em] uppercase mb-0.5"
           style={{ fontFamily: "Michroma, sans-serif", color: cfg.accent }}>
          {p.model}
        </p>
        <h3 className="text-sm font-bold text-black mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
          {p.seriesLabel}
        </h3>
        <p className="text-[9px] md:text-[10px] text-[#808080] mb-3 md:mb-4 leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>{p.application}</p>

        {/* Key 3 specs as badges */}
        <div className="grid grid-cols-3 gap-px bg-gray-100 mb-3 md:mb-4">
          {p.keySpecs.map(s => (
            <div key={s.label} className="bg-white px-1 md:px-2 py-1 md:py-2 text-center">
              <p className="text-[8px] md:text-[10px] font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                {s.value}
              </p>
              <p className="text-[8px] text-[#808080] mt-0.5 leading-tight" style={{ fontFamily: "Lexend, sans-serif" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Expanded: full spec table */}
        {expanded && (
          <div className="mb-4">
            <p className="text-[8px] tracking-[0.3em] uppercase text-[#808080] mb-2"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Full Specifications
            </p>
            <div className="border border-gray-100 divide-y divide-gray-50">
              {p.allSpecs.map(s => (
                <div key={s.label} className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[9px] text-[#808080]" style={{ fontFamily: "Lexend, sans-serif" }}>{s.label}</span>
                  <span className="text-[9px] font-bold text-black" style={{ fontFamily: "Lexend, sans-serif" }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Performance table (motors only) */}
            {p.perf && p.perf.length > 0 && (
              <div className="mt-3">
                <p className="text-[8px] tracking-[0.3em] uppercase text-[#808080] mb-2"
                   style={{ fontFamily: "Michroma, sans-serif" }}>
                  Bench Test Data *
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[8px]">
                    <thead>
                      <tr className="bg-gray-50">
                        {["Throttle","Voltage","Power","Thrust","Current"].map(h => (
                          <th key={h} className="px-2 py-1.5 text-left text-[#808080] font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {p.perf.map(r => (
                        <tr key={r.throttle} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 font-bold text-black">{r.throttle}</td>
                          <td className="px-2 py-1.5 text-[#444]">{r.voltage}</td>
                          <td className="px-2 py-1.5 text-[#444]">{r.power}</td>
                          <td className="px-2 py-1.5 font-bold" style={{ color: cfg.accent }}>{r.thrust}</td>
                          <td className="px-2 py-1.5 text-[#444]">{r.current}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[7px] text-[#aaa] mt-1.5 leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
                    * Bench test at ambient room temperature, MSL. Actual results may vary by field conditions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={onToggle}
            className="flex-1 py-2 border border-gray-200 text-[9px] tracking-widest uppercase text-[#808080] hover:border-black hover:text-black transition-all duration-200"
            style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
          >
            <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>{expanded ? "Collapse" : "Full Specs"}</span>
          </button>
          <button
            onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            className="flex-1 py-2 text-[9px] tracking-widest uppercase font-black transition-all duration-200"
            style={{ fontFamily: "Michroma, sans-serif",
                     background: cfg.accent,
                     color: p.series === "haemng" ? "#000" : "#fff",
                     transform: "skewX(-10deg)" }}
          >
            <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Enquire</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [expanded,  setExpanded]  = useState<string | null>(null);

  const visible = activeTab === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.series === activeTab);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <section id="products" className="py-24 bg-white scroll-mt-[72px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-[#ffc914]" />
              <span className="text-[#808080] text-[10px] tracking-[0.3em] uppercase"
                    style={{ fontFamily: "Michroma, sans-serif" }}>
                Product Catalogue
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight"
                style={{ fontFamily: "Michroma, sans-serif" }}>
              Engineered for<br /><span className="text-[#ffc914]">Every Frontier</span>
            </h2>
          </div>
          <p className="text-[#808080] text-sm max-w-xs leading-relaxed" style={{ fontFamily: "Lexend, sans-serif" }}>
            IIT Madras incubated · Five purpose-built product lines · 36+ variants ·
            Designed and tested in Chennai, India.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-100 pb-5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpanded(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest uppercase font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-black text-[#ffc914]"
                  : "bg-gray-100 text-[#808080] hover:bg-gray-200 hover:text-black"
              }`}
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span className="inline-flex items-center gap-2" style={{ transform: "skewX(10deg)" }}>
                {tab.label}
                <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-medium ${
                  activeTab === tab.id ? "bg-[#ffc914] text-black" : "bg-white text-[#808080]"
                }`}>
                  {tab.count}
                </span>
              </span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-1 text-[10px] text-[#aaa]"
               style={{ fontFamily: "Michroma, sans-serif" }}>
            {visible.length} / {PRODUCTS.length} shown
          </div>
        </div>

        {/* Series group labels when "All" */}
        {activeTab === "all" ? (
          Object.entries(SERIES_CFG).map(([key, cfg]) => {
            const group = PRODUCTS.filter(p => p.series === key);
            if (!group.length) return null;
            return (
              <div key={key} className="mb-14">
                {/* Series heading */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-1 h-8 flex-shrink-0" style={{ background: cfg.accent }} />
                  <div>
                    {'useSvgLogo' in cfg && cfg.useSvgLogo ? (
                      <img
                        src={`${import.meta.env.BASE_URL}${cfg.logoSrc}`}
                        alt={cfg.label}
                        className="h-8 w-auto"
                      />
                    ) : (
                      <h3 className="text-lg font-bold text-black leading-none"
                          style={{ fontFamily: "Michroma, sans-serif" }}>
                        {cfg.label}
                      </h3>
                    )}
                    <p className="text-[10px] text-[#808080] mt-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>
                      {group.length} model{group.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {group.map(p => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      expanded={expanded === p.id}
                      onToggle={() => toggle(p.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map(p => (
              <ProductCard
                key={p.id}
                p={p}
                expanded={expanded === p.id}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-black p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] text-[#ffc914] tracking-[0.3em] uppercase mb-1"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              IIT Madras Incubated
            </p>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
              Need a custom propulsion solution?
            </h3>
            <p className="text-sm text-white/50 mt-1" style={{ fontFamily: "Lexend, sans-serif" }}>
              Custom KV ratings · Form factors · Voltage ranges · IP ratings · OEM available
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 bg-[#ffc914] text-black text-[10px] tracking-widest uppercase font-black hover:bg-[#e0b212] transition-all duration-300 whitespace-nowrap"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Get in Touch</span>
            </button>
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 border border-white/20 text-white text-[10px] tracking-widest uppercase hover:border-[#ffc914] hover:text-[#ffc914] transition-all duration-300 whitespace-nowrap"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Download Catalogue</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
