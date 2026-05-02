import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SERIES_CFG, PRODUCTS } from "@/data/products";
import { fetchProducts } from "@/lib/supabase";
import Footer from "@/components/Footer";

type Product = {
  id: string;
  series: "haemng" | "maelard" | "esc" | "fc" | "ips" | "cellar" | "vagans" | "sciatic" | "other";
  seriesLabel: string;
  model: string;
  name: string;
  tag: string;
  application: string;
  keySpecs: { label: string; value: string }[];
  allSpecs: { label: string; value: string }[];
  perf?: any[];
  thumbnailUrl?: string | null;
  iconUrl?: string | null;
};

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

const USE_DATABASE = true; // Fetch from Supabase

export default function Products() {
  const [, navigate] = useLocation();
  const hash = useHash();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVoltage, setActiveVoltage] = useState("all");

  // Fetch products from database or use static data
  useEffect(() => {
    const loadProducts = async () => {
      if (USE_DATABASE) {
        const dbProducts = await fetchProducts();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
          setLoading(false);
        } else {
          setProducts(PRODUCTS);
          setLoading(false);
        }
      } else {
        setProducts(PRODUCTS);
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleEnquire = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Generate family tabs
  const FAMILIES = [
    { id: "all", label: "All", count: products.length },
    { id: "haemng", label: "HAEMNG", count: products.filter(p => p.series === "haemng").length },
    { id: "maelard", label: "MAELARD", count: products.filter(p => p.series === "maelard").length },
    { id: "esc", label: "ESC", count: products.filter(p => p.series === "esc").length },
    { id: "fc", label: "Auto Pilot", count: products.filter(p => p.series === "fc").length },
    { id: "ips", label: "IPS", count: products.filter(p => p.series === "ips").length },
    { id: "vagans", label: "VAGANS", count: products.filter(p => p.series === "vagans").length },
    { id: "cellar", label: "CELLAR", count: products.filter(p => p.series === "cellar").length },
    { id: "sciatic", label: "SCIATIC", count: products.filter(p => p.series === "sciatic").length },
    { id: "other", label: "Other", count: products.filter(p => p.series === "other").length },
  ];

  // Extract unique voltages from products
  const VOLTAGES = [
    "all",
    ...Array.from(new Set(products.map(p => {
      const voltSpec = p.keySpecs.find(s => s.label === "Voltage" || s.label === "Battery");
      return voltSpec ? voltSpec.value : null;
    }).filter(v => v !== null))).sort()
  ];

  // Derive activeFamily directly from hash
  const activeFamily = (hash && FAMILIES.some(t => t.id === hash)) ? hash : "all";

  const visible = products.filter(p => {
    const matchFamily = activeFamily === "all" || p.series === activeFamily;
    
    const voltSpec = p.keySpecs.find(s => s.label === "Voltage" || s.label === "Battery");
    const matchVoltage = activeVoltage === "all" || (voltSpec && voltSpec.value === activeVoltage);

    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.model.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q) ||
      p.application.toLowerCase().includes(q) ||
      p.keySpecs.some(s => s.value.toLowerCase().includes(q));
    return matchFamily && matchVoltage && matchSearch;
  });

  const grouped = Object.keys(SERIES_CFG).map(key => ({
    key,
    cfg: SERIES_CFG[key as keyof typeof SERIES_CFG],
    items: visible.filter(p => p.series === key),
  })).filter(g => g.items.length > 0);

  return (
    <>
      <div className="min-h-screen bg-[#050505]">
        {/* ── Page header ── */}
        <div className="bg-black pt-28 md:pt-32 pb-4 md:pb-6">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 flex flex-col">
            {/* Accent stripe */}
            <div className="w-12 h-0.5 bg-[#ffc812] mb-6" />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => navigate("/")}
                className="text-[#ffc812]/60 hover:text-[#ffc812] text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1 group"
                style={{ fontFamily: "Michroma, sans-serif" }}>
                <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Home
              </button>
              <span className="text-white/20 text-[10px]">/</span>
              <span className="text-[#ffc812] text-[10px] tracking-widest uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>Products</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: "Michroma, sans-serif" }}>
              Product <span className="text-[#ffc812]">Catalogue</span>
            </h1>
            
            {/* Search integrated in header */}
            <div className="relative group w-full md:w-64 lg:w-80">
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-[10px] text-white focus:outline-none focus:border-[#ffc812] transition-all duration-300 rounded-sm"
                style={{ fontFamily: "Michroma, sans-serif" }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* ── Sticky filter bar ── */}
        <div className="sticky top-[60px] md:top-[72px] z-30 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 py-3 md:py-4">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 space-y-3">
            
            {/* Family Row */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span className="text-[9px] tracking-[0.2em] text-white/30 font-bold uppercase w-16" style={{ fontFamily: "Michroma, sans-serif" }}>
                Family
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FAMILIES.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { window.location.hash = tab.id; }}
                    className={`px-3 py-1.5 text-[8px] md:text-[9px] tracking-widest uppercase font-bold rounded-full transition-all duration-300 border ${
                      activeFamily === tab.id
                        ? "bg-[#ffc812] text-black border-[#ffc812]"
                        : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                    style={{ fontFamily: "Michroma, sans-serif" }}
                  >
                    {tab.label} <span className="opacity-40 ml-1">· {tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voltage Row */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span className="text-[9px] tracking-[0.2em] text-white/30 font-bold uppercase w-16" style={{ fontFamily: "Michroma, sans-serif" }}>
                Voltage
              </span>
              <div className="flex flex-wrap gap-1.5">
                {VOLTAGES.map(volt => (
                  <button
                    key={volt}
                    onClick={() => setActiveVoltage(volt)}
                    className={`px-3 py-1.5 text-[8px] md:text-[9px] tracking-widest uppercase font-bold rounded-full transition-all duration-300 border ${
                      activeVoltage === volt
                        ? "bg-[#ffc812] text-black border-[#ffc812]"
                        : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                    style={{ fontFamily: "Michroma, sans-serif" }}
                  >
                    {volt === "all" ? "All voltages" : volt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Product grid ── */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 py-8 md:py-12">
          {loading ? (
            <div className="py-24 text-center">
              <p className="text-[#808080] text-sm" style={{ fontFamily: "Michroma, sans-serif" }}>
                Loading products...
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#808080] text-sm" style={{ fontFamily: "Michroma, sans-serif" }}>
                No products match "{search}"
              </p>
            </div>
          ) : activeFamily === "all" ? (
            grouped.map(({ key, cfg, items }) => (
              <div key={key} className="mb-10 md:mb-16">
                <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-7">
                  <div className="w-1 h-6 md:h-8 flex-shrink-0" style={{ background: cfg.accent }} />
                  <div>
                    {'useSvgLogo' in cfg && cfg.useSvgLogo ? (
                      <img
                        src={`${import.meta.env.BASE_URL}${(cfg as { logoSrc: string }).logoSrc}`}
                        alt={cfg.label}
                        className="h-6 md:h-8 w-auto brightness-0 invert"
                      />
                    ) : (
                      <h2 className="text-lg md:text-xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
                        {cfg.label}
                      </h2>
                    )}
                    <p className="text-[9px] md:text-[10px] text-white/40 mt-0.5">{items.length} model{items.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <ProductGrid items={items} cfg={cfg} navigate={navigate} />
              </div>
            ))
          ) : (
            <ProductGrid items={visible} cfg={SERIES_CFG[activeFamily as keyof typeof SERIES_CFG] ?? SERIES_CFG.haemng} navigate={navigate} />
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="bg-black py-16">
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] text-[#ffc812] tracking-[0.3em] uppercase mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
                Custom Requirements?
              </p>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
                We engineer to your specification.
              </h3>
              <p className="text-sm text-white/40 mt-1">Custom KV · Form factor · Voltage · IP rating · OEM available</p>
            </div>
            <button
              onClick={handleEnquire}
              className="px-10 py-3 bg-[#ffc812] text-black text-[10px] tracking-widest uppercase font-black hover:bg-[#e0b212] transition-colors duration-300 whitespace-nowrap flex-shrink-0"
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
  items: Product[];
  cfg: typeof SERIES_CFG[keyof typeof SERIES_CFG];
  navigate: (to: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((p: Product) => (
        <button
          key={p.id}
          onClick={() => navigate(`/products/${p.id}`)}
          className="text-left border border-white/10 hover:border-[#ffc812]/40 hover:shadow-2xl hover:shadow-[#ffc812]/5 transition-all duration-300 flex flex-col group bg-[#080808]"
        >
          {/* Visual header */}
          <div
            className="relative flex flex-col items-center justify-center h-40 overflow-hidden"
            style={{ background: "#0a0a0a" }}
          >
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(${cfg.accent}44 1px, transparent 1px),
                                  linear-gradient(90deg, ${cfg.accent}44 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />
            {(p.series === "haemng" || p.series === "maelard") ? (
              p.thumbnailUrl ? (
                <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                  <img
                    src={p.thumbnailUrl}
                    alt={p.model}
                    className="max-w-full max-h-full object-contain"
                    style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
                  />
                </div>
              ) : (
                <div className="relative z-10">
                  {p.series === "haemng" ? (
                    <img src={`${import.meta.env.BASE_URL}haemng.svg`} alt="Haemng" className="h-10 md:h-14 w-auto brightness-0 invert opacity-60" />
                  ) : (
                    <img src={`${import.meta.env.BASE_URL}Maelard.svg`} alt="Maelard" className="h-8 md:h-10 w-auto brightness-0 invert opacity-60" />
                  )}
                </div>
              )
            ) : (
              <div className="relative z-10">
                <img
                  src={`${import.meta.env.BASE_URL}favicon.svg`}
                  alt="Welkinrim"
                  className="h-10 md:h-12 w-auto opacity-40 brightness-0 invert"
                />
              </div>
            )}
            {p.allSpecs.find((s: { label: string; value: string }) => s.label === "Dimension") && (
              <div className="absolute bottom-2 left-0 right-0 text-center z-10">
                <p className="text-[8px] md:text-[9px] tracking-widest text-white/30 uppercase"
                   style={{ fontFamily: "Michroma, sans-serif" }}>
                  {p.allSpecs.find((s: { label: string; value: string }) => s.label === "Dimension")?.value}
                </p>
              </div>
            )}
            {/* Badge removed as per request */}


          </div>

          {/* Card body */}
          <div className="p-4 flex flex-col flex-1 bg-[#080808]">
            <p className="text-[8px] tracking-[0.25em] uppercase mb-0.5 text-white/40"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              {p.application}
            </p>
            <h3 className="text-sm font-bold mb-3 uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
              <span style={{ color: cfg.accent }}>{p.model.split(' ')[0]}</span>
              <span className="text-white"> {p.model.split(' ').slice(1).join(' ')}</span>
            </h3>
            <div className="grid grid-cols-3 gap-px bg-white/5 mt-auto">
              {p.keySpecs.map((s: { label: string; value: string }) => (
                <div key={s.label} className="bg-[#0a0a0a] px-2 py-2 text-center">
                  <p className="text-[10px] font-black text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
                    {s.value}
                  </p>
                  <p className="text-[8px] text-white/30 mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
