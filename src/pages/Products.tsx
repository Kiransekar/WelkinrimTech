import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PRODUCTS, SERIES_CFG } from "@/data/products";
import Footer from "@/components/Footer";

// Hook to get current hash and subscribe to hash changes
function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1));

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash.slice(1));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash;
}

const TABS = [
  { id: "all",     label: "All",                        count: PRODUCTS.length },
  { id: "haemng",  label: "Haemng Series",              count: PRODUCTS.filter(p => p.series === "haemng").length },
  { id: "maelard", label: "Maelard Series",             count: PRODUCTS.filter(p => p.series === "maelard").length },
  { id: "esc",     label: "ESCs",                       count: PRODUCTS.filter(p => p.series === "esc").length },
  { id: "fc",      label: "Flight Controller",          count: 1 },
  { id: "ips",     label: "Integrated Power Systems",   count: PRODUCTS.filter(p => p.series === "ips").length },
];

function MotorIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-14 h-14 opacity-70">
      <circle cx="40" cy="40" r="28" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="40" cy="40" r="17" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="40" cy="40" r="5" fill={color} />
      {[0, 60, 120, 180, 240, 300].map(a => {
        const r = (Math.PI * a) / 180;
        const x1 = 40 + 17 * Math.cos(r), y1 = 40 + 17 * Math.sin(r);
        const x2 = 40 + 26 * Math.cos(r), y2 = 40 + 26 * Math.sin(r);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function EscIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-14 h-14 opacity-70">
      <rect x="10" y="22" width="60" height="36" rx="3" fill="none" stroke={color} strokeWidth="2" />
      <rect x="17" y="31" width="10" height="7" rx="1" fill={color} opacity=".35" />
      <rect x="35" y="31" width="10" height="7" rx="1" fill={color} opacity=".35" />
      <rect x="53" y="31" width="10" height="7" rx="1" fill={color} opacity=".35" />
      <line x1="10" y1="50" x2="70" y2="50" stroke={color} strokeWidth="1.2" opacity=".35" />
      {[15, 25, 35, 45, 55, 65].map(x => (
        <line key={x} x1={x} y1="50" x2={x} y2="58" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function FcIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 80" className="w-14 h-14 opacity-70">
      <rect x="10" y="10" width="60" height="60" rx="5" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="40" cy="40" r="11" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="40" cy="40" r="4" fill={color} />
      <path d="M40 10v9M40 61v9M10 40h9M61 40h9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Products() {
  const [, navigate] = useLocation();
  const hash = useHash();
  const [search, setSearch] = useState("");

  // Derive activeTab directly from hash - no separate state needed
  const activeTab = (hash && TABS.some(t => t.id === hash)) ? hash : "all";

  const visible = PRODUCTS.filter(p => {
    const matchTab = activeTab === "all" || p.series === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.model.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q) ||
      p.application.toLowerCase().includes(q) ||
      p.keySpecs.some(s => s.value.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  const grouped = Object.keys(SERIES_CFG).map(key => ({
    key,
    cfg: SERIES_CFG[key as keyof typeof SERIES_CFG],
    items: visible.filter(p => p.series === key),
  })).filter(g => g.items.length > 0);

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* ── Page header ── */}
        <div className="bg-black pt-28 pb-12">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/")}
                className="text-[#FFCC00]/60 hover:text-[#FFCC00] text-[10px] tracking-widest uppercase transition-colors duration-200 flex items-center gap-1"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Home
              </button>
              <span className="text-white/20 text-[10px]">/</span>
              <span className="text-[#FFCC00] text-[10px] tracking-widest uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
                Products
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight" style={{ fontFamily: "Michroma, sans-serif" }}>
              Product <span className="text-[#FFCC00]">Catalogue</span>
            </h1>
            <p className="text-white/40 text-sm mt-3 max-w-lg" style={{ fontFamily: "Lexend, sans-serif" }}>
              IIT Madras Incubated · 36+ variants · Haemng, Maelard, ESC, Flight Controller & Integrated Systems
            </p>
          </div>
        </div>

        {/* ── Sticky filter bar ── */}
        <div className="sticky top-[72px] z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center gap-4 py-3">
            {/* Tabs - scrollable */}
            <div className="flex items-center gap-0 overflow-x-auto flex-1 pb-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { window.location.hash = tab.id; setSearch(""); }}
                  className={`flex items-center gap-2 px-5 py-2 text-[10px] tracking-widest uppercase font-bold whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "border-[#FFCC00] text-black"
                      : "border-transparent text-[#808080] hover:text-black hover:border-gray-200"
                  }`}
                  style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
                >
                  <span className="inline-flex items-center gap-2" style={{ transform: "skewX(10deg)" }}>
                    {tab.label}
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-medium ${
                      activeTab === tab.id ? "bg-[#FFCC00] text-black" : "bg-gray-100 text-[#808080]"
                    }`}>
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {/* Search - fixed on right */}
            <div className="flex-shrink-0">
              <input
                type="text"
                placeholder="Search model, KV, application…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-[10px] border border-gray-200 px-3 py-2 w-64 focus:outline-none focus:border-[#FFCC00] transition-colors duration-200"
                style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
              />
            </div>
          </div>
        </div>

        {/* ── Product grid ── */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          {visible.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#808080] text-sm" style={{ fontFamily: "Michroma, sans-serif" }}>
                No products match "{search}"
              </p>
            </div>
          ) : activeTab === "all" ? (
            grouped.map(({ key, cfg, items }) => (
              <div key={key} className="mb-16">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-1 h-8 flex-shrink-0" style={{ background: cfg.accent }} />
                  <div>
                    <h2 className="text-xl font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                      {cfg.label}
                    </h2>
                    <p className="text-[10px] text-[#808080] mt-0.5">{items.length} model{items.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <ProductGrid items={items} cfg={cfg} navigate={navigate} />
              </div>
            ))
          ) : (
            <ProductGrid items={visible} cfg={SERIES_CFG[activeTab as keyof typeof SERIES_CFG] ?? SERIES_CFG.haemng} navigate={navigate} />
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="bg-black py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] text-[#FFCC00] tracking-[0.3em] uppercase mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
                Custom Requirements?
              </p>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
                We engineer to your specification.
              </h3>
              <p className="text-sm text-white/40 mt-1">Custom KV · Form factor · Voltage · IP rating · OEM available</p>
            </div>
            <button
              onClick={() => navigate("/#contact")}
              className="px-10 py-3 bg-[#FFCC00] text-black text-[10px] tracking-widest uppercase font-black hover:bg-[#e6b800] transition-colors duration-300 whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Get in Touch</span>
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

/* ─── Product Card ────────────────────────────────────────────────────────── */
function ProductGrid({
  items,
  cfg,
  navigate,
}: {
  items: ReturnType<typeof PRODUCTS.filter>;
  cfg: typeof SERIES_CFG[keyof typeof SERIES_CFG];
  navigate: (to: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map(p => (
        <button
          key={p.id}
          onClick={() => navigate(`/products/${p.id}`)}
          className="text-left border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col group"
        >
          {/* Visual header */}
          <div
            className="relative flex flex-col items-center justify-center h-40 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #111 0%, #1c1c1c 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(${cfg.accent}44 1px, transparent 1px),
                                  linear-gradient(90deg, ${cfg.accent}44 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative z-10">
              {p.series === "esc" ? <EscIcon color={cfg.accent} />
                : p.series === "fc" ? <FcIcon color={cfg.accent} />
                : <MotorIcon color={cfg.accent} />}
            </div>
            {p.allSpecs.find(s => s.label === "Dimension") && (
              <p className="relative z-10 text-[8px] tracking-widest text-white/30 uppercase mt-1"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
                {p.allSpecs.find(s => s.label === "Dimension")?.value}
              </p>
            )}
            {/* Series badge */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5" style={{ background: cfg.accent, transform: "skewX(-10deg)" }}>
              <span className="text-[7px] font-black tracking-widest uppercase"
                    style={{ fontFamily: "Michroma, sans-serif", color: cfg.textOnAccent, display: "inline-block", transform: "skewX(10deg)" }}>
                {p.series === "ips" ? "IPS" : p.series === "fc" ? "FC" : p.series.toUpperCase()}
              </span>
            </div>
            {/* Tag */}
            <div className="absolute bottom-2.5 left-2.5 border border-white/20 px-2 py-0.5" style={{ transform: "skewX(-10deg)" }}>
              <span className="text-[7px] tracking-widest uppercase text-white/50"
                    style={{ fontFamily: "Michroma, sans-serif", display: "inline-block", transform: "skewX(10deg)" }}>{p.tag}</span>
            </div>
            {/* Hover arrow */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                 style={{ background: `${cfg.accent}18` }}>
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-4 flex flex-col flex-1">
            <p className="text-[8px] tracking-[0.25em] uppercase mb-0.5"
               style={{ fontFamily: "Michroma, sans-serif", color: cfg.accent }}>
              {p.model}
            </p>
            <h3 className="text-sm font-bold text-black mb-3" style={{ fontFamily: "Michroma, sans-serif" }}>
              {p.seriesLabel}
            </h3>
            <div className="grid grid-cols-3 gap-px bg-gray-100 mt-auto">
              {p.keySpecs.map(s => (
                <div key={s.label} className="bg-white px-2 py-2 text-center">
                  <p className="text-[10px] font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                    {s.value}
                  </p>
                  <p className="text-[8px] text-[#808080] mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
