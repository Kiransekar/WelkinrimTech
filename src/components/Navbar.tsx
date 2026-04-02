import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { PRODUCTS } from "@/data/products";

const PRODUCT_CATEGORIES = [
  {
    id: "haemng",
    label: "Haemng Series",
    tagline: "UAV & eVTOL Motors — 11 variants",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="10" strokeDasharray="3 2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    ),
    products: PRODUCTS.filter(p => p.series === "haemng"),
  },
  {
    id: "maelard",
    label: "Maelard Series",
    tagline: "Marine, UAV & Multi-mission — 10 variants",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <ellipse cx="12" cy="12" rx="5" ry="9" />
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
    products: PRODUCTS.filter(p => p.series === "maelard"),
  },
  {
    id: "esc",
    label: "ESCs",
    tagline: "Electronic Speed Controllers — 9 models",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="6" width="20" height="12" rx="1" />
        <path d="M6 10h2M10 10h2M14 10h2M6 14h4M12 14h4" />
      </svg>
    ),
    products: PRODUCTS.filter(p => p.series === "esc"),
  },
  {
    id: "fc",
    label: "Flight Controller",
    tagline: "Autonomous UAV Navigation",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </svg>
    ),
    products: PRODUCTS.filter(p => p.series === "fc"),
  },
  {
    id: "ips",
    label: "Integrated Power Systems",
    tagline: "Motor + ESC Matched Assemblies — 5 combos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        <path d="M10 7h4M7 10v4M17 10v4M10 17h4" />
      </svg>
    ),
    products: PRODUCTS.filter(p => p.series === "ips"),
  },
];

export default function Navbar() {
  const [scrolled, setScrolled]             = useState(false);
  const [menuOpen, setMenuOpen]             = useState(false);
  const [megaOpen, setMegaOpen]             = useState(false);
  const [activeCategory, setActiveCategory] = useState(PRODUCT_CATEGORIES[0].id);
  const megaCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [location, navigate]               = useLocation();

  const isHome = location === "/" || location === "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    setMegaOpen(false);
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 350);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToProducts = (categoryId?: string) => {
    setMenuOpen(false);
    setMegaOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Use window.location for hash-based navigation to ensure hash is preserved
    if (categoryId) {
      window.location.href = `/products#${categoryId}`;
    } else {
      window.location.href = "/products";
    }
  };

  const goToProduct = (id: string) => {
    setMegaOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/products/${id}`);
  };

  const openMega  = () => { if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current); setMegaOpen(true); };
  const closeMega = () => { megaCloseTimer.current = setTimeout(() => setMegaOpen(false), 140); };

  const activeCat = PRODUCT_CATEGORIES.find(c => c.id === activeCategory)!;
  const isTransparent = !scrolled && !megaOpen;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent ? "bg-transparent" : "bg-white/95 backdrop-blur-md shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">

          {/* ── Desktop Nav (left) ── */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Home",       action: () => scrollToSection("home")       },
              { label: "Technology", action: () => scrollToSection("technology") },
              { label: "About",      action: () => scrollToSection("about")      },
              { label: "Contact",    action: () => scrollToSection("contact")    },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className={`text-xs tracking-widest uppercase font-medium transition-all duration-300 hover:text-[#FFCC00] relative group ${
                  isTransparent ? "text-white" : "text-black"
                }`}
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFCC00] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}

            {/* Products trigger */}
            <div className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button
                onClick={goToProducts}
                className={`text-xs tracking-widest uppercase font-medium transition-all duration-300 flex items-center gap-1 relative group ${
                  isTransparent ? "text-white" : "text-black"
                } ${megaOpen ? "text-[#FFCC00]" : "hover:text-[#FFCC00]"}`}
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                <span>Products</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#FFCC00] transition-all duration-300 ${megaOpen ? "w-full" : "w-0 group-hover:w-full"}`} />
              </button>
            </div>

            <button
              onClick={() => scrollToSection("contact")}
              className="ml-2 px-5 py-2 bg-[#FFCC00] text-black text-xs tracking-widest uppercase font-bold hover:bg-[#e6b800] transition-all duration-300"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Get Quote</span>
            </button>
          </div>

          {/* ── Logo (right) ── */}
          <button
            onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`flex items-center gap-3 ml-auto rounded-md transition-all duration-500 ${isTransparent ? 'bg-white/90 backdrop-blur-sm px-3 py-1' : ''}`}
          >
            <img
              src={`${import.meta.env.BASE_URL}welkinrim-logo.svg`}
              alt="Welkinrim Technologies"
              className="h-12 w-auto"
              style={{
                mixBlendMode: 'multiply',
              }}
            />
          </button>

          {/* ── Mobile toggle ── */}
          <button
            className={`md:hidden flex flex-col gap-1.5 transition-colors duration-300 ml-4 ${isTransparent ? "text-white" : "text-black"}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-96 bg-white/97 backdrop-blur-md" : "max-h-0"}`}>
          <div className="px-6 py-4 flex flex-col gap-4 border-t border-gray-100">
            {[
              { label: "Home",       action: () => scrollToSection("home")       },
              { label: "Technology", action: () => scrollToSection("technology") },
              { label: "Products",   action: goToProducts                         },
              { label: "About",      action: () => scrollToSection("about")      },
              { label: "Contact",    action: () => scrollToSection("contact")    },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="text-left text-xs tracking-widest uppercase font-medium text-black hover:text-[#FFCC00] transition-colors duration-200"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection("contact")}
              className="px-5 py-2 bg-[#FFCC00] text-black text-xs tracking-widest uppercase font-bold hover:bg-[#e6b800] transition-all duration-300 text-left"
              style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Get Quote</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mega Menu Panel ── */}
      <div
        className={`fixed top-[72px] left-0 right-0 z-40 transition-all duration-300 ${
          megaOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        onMouseEnter={openMega}
        onMouseLeave={closeMega}
      >
        <div className="bg-white border-b border-gray-100 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-0">

            {/* Left: category list */}
            <div className="col-span-3 border-r border-gray-100 pr-8">
              <p className="text-[9px] text-[#808080] tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "Michroma, sans-serif" }}>
                Product Lines
              </p>
              <div className="flex flex-col gap-1">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveCategory(cat.id)}
                    onClick={() => goToProducts(cat.id)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-sm text-left transition-all duration-200 group ${
                      activeCategory === cat.id ? "bg-[#FFCC00]/10 text-black" : "text-[#444] hover:bg-gray-50"
                    }`}
                  >
                    <span className={`transition-colors duration-200 ${activeCategory === cat.id ? "text-[#FFCC00]" : "text-[#808080] group-hover:text-black"}`}>
                      {cat.icon}
                    </span>
                    <div>
                      <p className="text-xs font-bold tracking-wide" style={{ fontFamily: "Michroma, sans-serif" }}>{cat.label}</p>
                      <p className="text-[10px] text-[#808080] mt-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>{cat.tagline}</p>
                    </div>
                    {activeCategory === cat.id && (
                      <svg className="ml-auto w-4 h-4 text-[#FFCC00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: products for active category */}
            <div className="col-span-9 pl-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] text-[#808080] tracking-[0.3em] uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
                    {activeCat.label}
                  </p>
                  <p className="text-xs text-[#444] mt-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>{activeCat.tagline}</p>
                </div>
                <button
                  onClick={() => goToProducts(activeCategory)}
                  className="text-[10px] text-[#FFCC00] hover:text-black tracking-widest uppercase transition-colors duration-200 flex items-center gap-1"
                  style={{ fontFamily: "Michroma, sans-serif" }}
                >
                  View All
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {activeCat.products.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => goToProduct(p.id)}
                    className="text-left border border-gray-100 hover:border-[#FFCC00] p-3 transition-all duration-200 group"
                  >
                    <div className="w-full h-16 bg-gray-50 mb-2 flex items-center justify-center group-hover:bg-[#FFCC00]/5 transition-colors duration-200">
                      <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black text-[#b89600] leading-none" style={{ fontFamily: "Michroma, sans-serif" }}>WR</span>
                        <span className="text-[9px] font-black text-black/30 mt-0.5" style={{ fontFamily: "Michroma, sans-serif" }}>{p.name}</span>
                      </div>
                    </div>
                    <p className="text-[8px] text-[#FFCC00] tracking-widest uppercase font-bold mb-0.5 truncate" style={{ fontFamily: "Michroma, sans-serif" }}>{p.tag}</p>
                    <p className="text-xs font-bold text-black truncate" style={{ fontFamily: "Michroma, sans-serif" }}>{p.model}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.keySpecs.map((s) => (
                        <span key={s.label} className="text-[7px] bg-gray-100 text-[#444] px-1 py-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>{s.value}</span>
                      ))}
                    </div>
                  </button>
                ))}
                {activeCat.products.length > 4 && (
                  <button
                    onClick={() => goToProducts(activeCategory)}
                    className="border border-dashed border-gray-200 hover:border-[#FFCC00] p-3 flex flex-col items-center justify-center gap-2 group transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#FFCC00]/10 flex items-center justify-center transition-colors duration-200">
                      <span className="text-[#808080] group-hover:text-[#FFCC00] text-base font-bold leading-none">+</span>
                    </div>
                    <p className="text-[9px] text-[#808080] group-hover:text-black text-center" style={{ fontFamily: "Michroma, sans-serif" }}>
                      +{activeCat.products.length - 4} more
                    </p>
                  </button>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[10px] text-[#808080]" style={{ fontFamily: "Lexend, sans-serif" }}>
                  36+ product variants across 5 lines
                </p>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="px-4 py-1.5 bg-[#FFCC00] text-black text-[9px] tracking-widest uppercase font-bold hover:bg-[#e6b800] transition-colors duration-200"
                  style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
                >
                  <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Request a Quote</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {megaOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMegaOpen(false)} />
      )}
    </>
  );
}
