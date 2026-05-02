import { useState } from "react";
import { PRODUCTS, SERIES_CFG, type Product } from "@/data/products";

const TABS = [
  { id: "all", label: "All Products", count: PRODUCTS.length },
  { id: "haemng", label: "Haemng Series", count: PRODUCTS.filter(p => p.series === "haemng").length },
  { id: "maelard", label: "Maelard Series", count: PRODUCTS.filter(p => p.series === "maelard").length },
  { id: "esc", label: "ESCs", count: PRODUCTS.filter(p => p.series === "esc").length },
  { id: "fc", label: "Flight Controller", count: 1 },
  { id: "ips", label: "Integrated Systems", count: PRODUCTS.filter(p => p.series === "ips").length },
];

function ProductCard({ p, expanded, onToggle }: {
  p: Product;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = SERIES_CFG[p.series];

  return (
    <div className={`flex flex-col border transition-all duration-300 ${expanded ? "border-gray-300 shadow-xl" : "border-gray-100 hover:border-gray-300 hover:shadow-md"
      }`}>

      {/* Visual header */}
      <div className="relative flex flex-col items-center justify-center h-32 md:h-44 overflow-hidden"
        style={{ background: "#ffffff" }}>

        {/* Faint grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${cfg.accent}33 1px, transparent 1px),
                                 linear-gradient(90deg, ${cfg.accent}33 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }} />

        {/* Series visual */}
        <div className="relative z-10 mb-1 md:mb-2">
          {p.series === "haemng" ? (
            <img src={`${import.meta.env.BASE_URL}haemng.svg`} alt="Haemng" className="h-10 md:h-14 w-auto" style={{ opacity: 0.8 }} />
          ) : p.series === "maelard" ? (
            <img src={`${import.meta.env.BASE_URL}Maelard.svg`} alt="Maelard" className="h-8 md:h-10 w-auto" style={{ opacity: 0.85 }} />
          ) : (
            <img
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              alt="Welkinrim"
              className="h-10 md:h-12 w-auto opacity-90"
            />
          )}
        </div>

        {/* Dimension badge */}
        {p.allSpecs.find(s => s.label === "Dimension") && (
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <p className="text-[9px] md:text-[10px] tracking-widest text-black/40 uppercase"
              style={{ fontFamily: "Michroma, sans-serif" }}>
              {p.allSpecs.find(s => s.label === "Dimension")?.value}
            </p>
          </div>
        )}

        {/* Series badge top-right */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3 px-1.5 md:px-2 py-0.5"
          style={{ background: cfg.accent, transform: "skewX(-10deg)" }}>
          <span className="text-[6px] md:text-[8px] font-black tracking-widest uppercase"
            style={{
              fontFamily: "Michroma, sans-serif",
              color: cfg.textOnAccent,
              display: "inline-block", transform: "skewX(10deg)"
            }}>
            {p.series === "ips" ? "IPS" : p.series === "fc" ? "FC" : p.series.toUpperCase()}
          </span>
        </div>


      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-3 md:p-5">
        <p className="text-[8px] md:text-[9px] tracking-[0.25em] uppercase mb-0.5"
          style={{ fontFamily: "Michroma, sans-serif", color: cfg.accent }}>
          {p.application}
        </p>
        <h3 className="text-sm font-bold text-black mb-3 md:mb-4 uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
          {p.model}
        </h3>

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
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-gray-100">
              {p.allSpecs.map(s => (
                <div key={s.label} className="flex items-center justify-between px-3 py-1.5 border-b border-r border-gray-100 gap-3">
                  <span className="text-[9px] font-medium text-black" style={{ fontFamily: "Lexend, sans-serif" }}>{s.label}</span>
                  <span className="text-[9px] text-[#808080]" style={{ fontFamily: "Lexend, sans-serif" }}>{s.value}</span>
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
                        {["Throttle", "Voltage", "Current", "Power", "Thrust", ...(p.perf[0].speed ? ["Speed"] : []), ...(p.perf[0].efficiency ? ["Efficiency"] : [])].map(h => (
                          <th key={h} className="px-2 py-1.5 text-left text-[#808080] font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {p.perf.map(r => (
                        <tr key={r.throttle} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 font-bold text-black">{r.throttle}</td>
                          <td className="px-2 py-1.5 text-[#444]">{r.voltage}</td>
                          <td className="px-2 py-1.5 text-[#444]">{r.current}</td>
                          <td className="px-2 py-1.5 text-[#444]">{r.power}</td>
                          <td className="px-2 py-1.5 font-bold" style={{ color: cfg.accent }}>{r.thrust}</td>
                          {r.speed && <td className="px-2 py-1.5 text-[#444]">{r.speed}</td>}
                          {r.efficiency && <td className="px-2 py-1.5 text-[#444]">{r.efficiency}</td>}
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
            style={{
              fontFamily: "Michroma, sans-serif",
              background: cfg.accent,
              color: cfg.textOnAccent,
              transform: "skewX(-10deg)"
            }}
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
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = activeTab === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.series === activeTab);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <section id="products" className="py-24 bg-white scroll-mt-[72px]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-[#ffc812]" />
              <span className="text-[#808080] text-[10px] tracking-[0.3em] uppercase"
                style={{ fontFamily: "Michroma, sans-serif" }}>
                Product Catalogue
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight"
              style={{ fontFamily: "Michroma, sans-serif" }}>
              Engineered for<br /><span className="text-[#ffc812]">Every Frontier</span>
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
              className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest uppercase font-bold transition-all duration-200 ${activeTab === tab.id
                  ? "bg-black text-[#ffc812]"
                  : "bg-gray-100 text-[#808080] hover:bg-gray-200 hover:text-black"
                }`}
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span className="inline-flex items-center gap-2" style={{ transform: "skewX(10deg)" }}>
                {tab.label}
                <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-medium ${activeTab === tab.id ? "bg-[#ffc812] text-black" : "bg-white text-[#808080]"
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
            <p className="text-[10px] text-[#ffc812] tracking-[0.3em] uppercase mb-1"
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
              className="px-8 py-3 bg-[#ffc812] text-black text-[10px] tracking-widest uppercase font-black hover:bg-[#e0b212] transition-all duration-300 whitespace-nowrap"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Get in Touch</span>
            </button>
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 border border-white/20 text-white text-[10px] tracking-widest uppercase hover:border-[#ffc812] hover:text-[#ffc812] transition-all duration-300 whitespace-nowrap"
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
