import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SERIES_CFG } from "@/data/products";
import { fetchProducts } from "@/lib/supabase";
import Footer from "@/components/Footer";

type Product = {
  id: string;
  series: "haemng" | "maelard" | "esc" | "fc" | "ips";
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

const USE_DATABASE = true; // Set to true to fetch from Supabase

export default function Products() {
  const [, navigate] = useLocation();
  const hash = useHash();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from database or use static data
  useEffect(() => {
    const loadProducts = async () => {
      if (USE_DATABASE) {
        const dbProducts = await fetchProducts();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
          setLoading(false);
        } else {
          // Fallback to static data
          import('@/data/products').then(mod => {
            setProducts(mod.PRODUCTS);
            setLoading(false);
          });
        }
      } else {
        // Use static data
        import('@/data/products').then(mod => {
          setProducts(mod.PRODUCTS);
          setLoading(false);
        });
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

  // Generate tabs dynamically from products
  const TABS = [
    { id: "all", label: "ALL", count: products.length },
    { id: "haemng", label: "HAEMNG", count: products.filter(p => p.series === "haemng").length },
    { id: "maelard", label: "MAELARD", count: products.filter(p => p.series === "maelard").length },
    { id: "esc", label: "ESC", count: products.filter(p => p.series === "esc").length },
    { id: "fc", label: "FLIGHT CONTROLLER", count: products.filter(p => p.series === "fc").length },
    { id: "ips", label: "IPS", count: products.filter(p => p.series === "ips").length },
  ];

  // Derive activeTab directly from hash
  const activeTab = (hash && TABS.some(t => t.id === hash)) ? hash : "all";

  const visible = products.filter(p => {
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
        <div className="bg-black pt-24 md:pt-28 pb-8 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ fontFamily: "Michroma, sans-serif" }}>
              Product <span className="text-[#ffc812]">Catalogue</span>
            </h1>
            <p className="text-white/40 text-sm mt-3 max-w-lg" style={{ fontFamily: "Lexend, sans-serif" }}>
              IIT Madras Incubated · 36+ variants · Haemng, Maelard, ESC, Flight Controller & Integrated Systems
            </p>
          </div>
        </div>

        {/* ── Sticky filter bar ── */}
        <div className="sticky top-[60px] md:top-[72px] z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col lg:flex-row lg:items-center gap-3 md:gap-4 py-3">
            {/* Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 flex-1 w-full">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { window.location.hash = tab.id; setSearch(""); }}
                  className={`flex items-center justify-center gap-1 px-2 md:px-3 py-2 text-[9px] tracking-wide uppercase font-bold whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "border-[#ffc812] text-black"
                      : "border-transparent text-[#808080] hover:text-black hover:border-gray-200"
                  }`}
                  style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
                >
                  <span className="inline-flex items-center gap-1" style={{ transform: "skewX(10deg)" }}>
                    {tab.label}
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-medium ${
                      activeTab === tab.id ? "bg-[#ffc812] text-black" : "bg-gray-100 text-[#808080]"
                    }`}>
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {/* Search - fixed on right */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-[10px] border border-gray-200 px-3 py-2 w-full lg:w-56 xl:w-64 focus:outline-none focus:border-[#ffc812] transition-colors duration-200"
                style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
              />
            </div>
          </div>
        </div>

        {/* ── Product grid ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12">
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
          ) : activeTab === "all" ? (
            grouped.map(({ key, cfg, items }) => (
              <div key={key} className="mb-10 md:mb-16">
                <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-7">
                  <div className="w-1 h-6 md:h-8 flex-shrink-0" style={{ background: cfg.accent }} />
                  <div>
                    {'useSvgLogo' in cfg && cfg.useSvgLogo ? (
                      <img
                        src={`${import.meta.env.BASE_URL}${(cfg as { logoSrc: string }).logoSrc}`}
                        alt={cfg.label}
                        className="h-6 md:h-8 w-auto"
                      />
                    ) : (
                      <h2 className="text-lg md:text-xl font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                        {cfg.label}
                      </h2>
                    )}
                    <p className="text-[9px] md:text-[10px] text-[#808080] mt-0.5">{items.length} model{items.length > 1 ? "s" : ""}</p>
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
            style={{ background: "#ffffff" }}
          >
            <div
              className="absolute inset-0 opacity-10"
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
                    style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
                  />
                </div>
              ) : (
                <div className="relative z-10">
                  {p.series === "haemng" ? (
                    <img src={`${import.meta.env.BASE_URL}haemng.svg`} alt="Haemng" className="h-10 md:h-14 w-auto" style={{ opacity: 0.8 }} />
                  ) : (
                    <img src={`${import.meta.env.BASE_URL}Maelard.svg`} alt="Maelard" className="h-8 md:h-10 w-auto" style={{ opacity: 0.85 }} />
                  )}
                </div>
              )
            ) : (
              <div className="relative z-10">
                <img
                  src={`${import.meta.env.BASE_URL}favicon.svg`}
                  alt="Welkinrim"
                  className="h-10 md:h-12 w-auto opacity-90"
                />
              </div>
            )}
            {p.allSpecs.find(s => s.label === "Dimension") && (
              <p className="relative z-10 text-[7px] md:text-[8px] tracking-widest text-[#808080] uppercase mt-0.5 md:mt-1"
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
            <div className="absolute bottom-2.5 left-2.5 border border-gray-300 px-2 py-0.5 bg-white/90" style={{ transform: "skewX(-10deg)" }}>
              <span className="text-[7px] tracking-widest uppercase text-[#808080]"
                    style={{ fontFamily: "Michroma, sans-serif", display: "inline-block", transform: "skewX(10deg)" }}>{p.tag}</span>
            </div>
            {/* Hover arrow */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                 style={{ background: `${cfg.accent}18` }}>
              <div className="w-10 h-10 rounded-full border border-black/20 bg-white/90 flex items-center justify-center">
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <h3 className="text-sm font-bold text-black mb-3 uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
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
