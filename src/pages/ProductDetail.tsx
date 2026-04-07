import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { PRODUCTS, SERIES_CFG } from "@/data/products";
import Footer from "@/components/Footer";

function MotorIcon({ color, size = 120 }: { color: string; size?: number }) {
  const cx = size / 2, cy = size / 2, r1 = size * 0.38, r2 = size * 0.23, r3 = size * 0.08;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke={color} strokeWidth="3" opacity=".6" />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r3} fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const rad = (Math.PI * a) / 180;
        const x1 = cx + r2 * Math.cos(rad), y1 = cy + r2 * Math.sin(rad);
        const x2 = cx + r1 * 0.9 * Math.cos(rad), y2 = cy + r1 * 0.9 * Math.sin(rad);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".7" />;
      })}
    </svg>
  );
}

function EscIcon({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 120 80" width={size} height={(size * 80) / 120}>
      <rect x="8" y="10" width="104" height="60" rx="5" fill="none" stroke={color} strokeWidth="2.5" opacity=".7" />
      {[18, 42, 66, 90].map(x => (
        <rect key={x} x={x} y="22" width="16" height="12" rx="2" fill={color} opacity=".3" />
      ))}
      <line x1="8" y1="50" x2="112" y2="50" stroke={color} strokeWidth="1.5" opacity=".3" />
      {[14, 24, 34, 44, 54, 64, 74, 84, 94, 104].map(x => (
        <line key={x} x1={x} y1="50" x2={x} y2="70" stroke={color} strokeWidth="2" strokeLinecap="round" opacity=".5" />
      ))}
    </svg>
  );
}

function FcIcon({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size}>
      <rect x="12" y="12" width="96" height="96" rx="8" fill="none" stroke={color} strokeWidth="2.5" opacity=".6" />
      <circle cx="60" cy="60" r="18" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="60" cy="60" r="6" fill={color} opacity=".8" />
      <path d="M60 12v16M60 92v16M12 60h16M92 60h16" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
      <circle cx="60" cy="60" r="32" fill="none" stroke={color} strokeWidth="1" opacity=".2" strokeDasharray="4 3" />
    </svg>
  );
}

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const product = PRODUCTS.find(p => p.id === params.id);

  const handleEnquire = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => { window.scrollTo(0, 0); }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-[#808080] mb-4" style={{ fontFamily: "Michroma, sans-serif" }}>Product not found</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-[#ffc812] text-black text-[10px] tracking-widest uppercase font-bold"
            style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
          >
            <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Back to Products</span>
          </button>
        </div>
      </div>
    );
  }

  const cfg = SERIES_CFG[product.series];
  const siblings = PRODUCTS.filter(p => p.series === product.series && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="bg-black pt-28 pb-0 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(${cfg.accent} 1px, transparent 1px),
                              linear-gradient(90deg, ${cfg.accent} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-20">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1" style={{ background: cfg.accent, transform: "skewX(-10deg)" }}>
                <span className="text-[9px] font-black tracking-widest uppercase"
                      style={{ fontFamily: "Michroma, sans-serif", color: cfg.textOnAccent, display: "inline-block", transform: "skewX(10deg)" }}>
                  {product.tag}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-none mb-2"
                  style={{ fontFamily: "Michroma, sans-serif" }}>
                {product.name}
              </h1>
              <p className="text-xl font-bold mb-1" style={{ fontFamily: "Michroma, sans-serif", color: cfg.accent }}>
                {product.model}
              </p>
              <p className="text-white/40 text-sm mt-3">{product.application}</p>

              <div className="flex flex-wrap gap-3 mt-8">
                {product.keySpecs.map(s => (
                  <div key={s.label} className="border border-white/10 px-5 py-3 min-w-[100px]">
                    <p className="text-xl font-black text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
                      {s.value}
                    </p>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5"
                       style={{ fontFamily: "Michroma, sans-serif" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-10 flex-wrap">
                <button
                  onClick={handleEnquire}
                  className="px-8 py-3 text-[10px] tracking-widest uppercase font-black transition-colors duration-300 hover:opacity-90"
                  style={{ fontFamily: "Michroma, sans-serif", background: cfg.accent, color: cfg.textOnAccent, transform: "skewX(-10deg)" }}
                >
                  <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Enquire Now</span>
                </button>
                <button
                  onClick={() => navigate("/products")}
                  className="px-8 py-3 border border-white/20 text-white text-[10px] tracking-widest uppercase hover:border-white/60 transition-colors duration-300"
                  style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
                >
                  <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>← All Products</span>
                </button>
              </div>
            </div>

            {/* Right: illustration */}
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="relative flex flex-col items-center">
                {/* Motor image with shadow — scaled up visually with a safer container to avoid cropping */}
                <div className="relative group transition-transform duration-500 hover:scale-105" 
                     style={{ 
                       transform: "scale(2.2)", 
                       transformOrigin: "center center",
                       filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.15))"
                     }}>
                  <div className="absolute inset-0 blur-3xl opacity-20 scale-110"
                       style={{ background: cfg.accent }} />
                  {product.thumbnailUrl ? (
                    <img 
                      src={product.thumbnailUrl} 
                      alt={product.model} 
                      className="h-48 w-auto relative z-10" 
                    />
                  ) : (
                    <div className="relative z-10 flex items-center justify-center">
                      {product.series === "haemng" ? <MotorIcon color={cfg.accent} size={180} />
                        : product.series === "maelard" ? <MotorIcon color={cfg.accent} size={160} />
                        : product.series === "esc" ? <EscIcon color={cfg.accent} size={200} />
                        : product.series === "fc" ? <FcIcon color={cfg.accent} size={180} />
                        : <MotorIcon color={cfg.accent} size={180} />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 bg-gradient-to-b from-black to-white" />
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col gap-14">

          {/* Specifications */}
          <section id="specifications" className="relative z-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6" style={{ background: cfg.accent }} />
              <h2 className="text-lg font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                Specifications
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-gray-100 shadow-sm">
              {product.allSpecs.map((s) => (
                <div key={s.label}
                     className="flex flex-col px-5 py-5 border-b border-r border-gray-100 bg-white hover:bg-gray-50/50 transition-colors min-h-[85px]">
                  <span className="text-[9px] font-bold text-[#808080] uppercase tracking-wider mb-1.5" style={{ fontFamily: "Michroma, sans-serif" }}>
                    {s.label}
                  </span>
                  <span className="text-[13px] font-black text-black leading-tight" style={{ fontFamily: "Lexend, sans-serif" }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
            {product.perf && (
              <p className="text-[9px] text-[#aaa] mt-5 leading-relaxed bg-gray-50/50 p-3 italic">
                * Bench test data is for reference only, tested at ambient temperature at MSL.
                Actual results may vary by field conditions.
              </p>
            )}
          </section>

          {/* Product Wireframe */}
          <section id="dimensions" className="relative z-10 scroll-mt-20">
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 px-4 md:px-12 shadow-[0_4px_20px_-5px_theme(colors.gray.100)] rounded-sm overflow-hidden">
              <p className="text-[10px] tracking-[0.5em] uppercase text-[#999] mb-16 font-bold text-center" style={{ fontFamily: "Michroma, sans-serif" }}>
                Technical Dimensions (mm)
              </p>
              <div className="relative w-full max-w-5xl group flex justify-center">
                <div className="absolute inset-0 bg-transparent z-20" />
                <img
                  src={product.wireframeUrl || `${import.meta.env.BASE_URL}wireframes/${product.id}.png`}
                  alt={`${product.name} Technical Drawing`}
                  className="w-full max-w-4xl h-auto relative z-10 transition-all duration-700 group-hover:scale-[1.01]"
                  style={{ filter: "contrast(1.05)" }}
                />
                <div className="absolute inset-x-0 -bottom-10 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-40" />
              </div>
            </div>
          </section>

          {/* Performance */}
          {product.perf && product.perf.length > 0 ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6" style={{ background: cfg.accent }} />
                <h2 className="text-lg font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                  Performance Data
                </h2>
              </div>

              <div className="border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: cfg.accent }}>
                      {[
                        "Throttle", 
                        "Voltage(V)", 
                        "Current(A)", 
                        "Power(W)", 
                        "Thrust(g)", 
                        "Speed(RPM)", 
                        "Efficiency(g/W)"
                      ].map(h => (
                        <th key={h}
                            className="px-3 py-3 text-left text-[8px] tracking-widest uppercase font-black"
                            style={{ fontFamily: "Michroma, sans-serif", color: cfg.textOnAccent }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.perf.map((row, i) => (
                      <tr key={row.throttle}
                          className={`border-t border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-3 py-3 text-[11px] font-black text-black"
                            style={{ fontFamily: "Michroma, sans-serif" }}>{row.throttle}</td>
                        <td className="px-3 py-3 text-[11px] text-[#555]">{row.voltage}</td>
                        <td className="px-3 py-3 text-[11px] text-[#555]">{row.current}</td>
                        <td className="px-3 py-3 text-[11px] text-[#555]">{row.power}</td>
                        <td className="px-3 py-3 text-[11px] font-bold" style={{ color: cfg.accent }}>{row.thrust}</td>
                        <td className="px-3 py-3 text-[11px] text-[#555]">{row.speed || "-"}</td>
                        <td className="px-3 py-3 text-[11px] text-[#555]">{row.efficiency || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Thrust bar */}
              <div className="mt-6">
                <p className="text-[9px] text-[#808080] tracking-widest uppercase mb-3"
                   style={{ fontFamily: "Michroma, sans-serif" }}>
                  Thrust at Throttle
                </p>
                <div className="space-y-2">
                  {product.perf.map(row => {
                    const maxVal = parseFloat(product.perf![product.perf!.length - 1].thrust.replace(/[^0-9.]/g, "")) || 1;
                    const val = parseFloat(row.thrust.replace(/[^0-9.]/g, "")) || 0;
                    const pct = Math.min(100, (val / maxVal) * 100);
                    return (
                      <div key={row.throttle} className="flex items-center gap-3">
                        <span className="text-[9px] text-[#808080] w-10 flex-shrink-0 text-right"
                              style={{ fontFamily: "Michroma, sans-serif" }}>
                          {row.throttle}
                        </span>
                        <div className="flex-1 bg-gray-100 h-4">
                          <div className="h-full transition-all duration-700"
                               style={{ width: `${pct}%`, background: cfg.accent }} />
                        </div>
                        <span className="text-[9px] font-bold text-black w-20 flex-shrink-0"
                              style={{ fontFamily: "Michroma, sans-serif" }}>
                          {row.thrust}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center mt-2 max-w-4xl mx-auto w-full">
              <div className="text-center p-12 border border-gray-100 w-full bg-gray-50/30">
                <p className="text-[10px] text-[#808080] tracking-widest uppercase"
                   style={{ fontFamily: "Michroma, sans-serif" }}>
                  Contact us for detailed performance data
                </p>
                <button
                  onClick={handleEnquire}
                  className="mt-6 px-8 py-3 text-[9px] tracking-widest uppercase font-black hover:opacity-90 transition-opacity duration-300"
                  style={{ fontFamily: "Michroma, sans-serif", background: cfg.accent, color: cfg.textOnAccent, transform: "skewX(-10deg)" }}
                >
                  <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Get in Touch</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Enquire CTA ── */}
        <div className="mt-16 bg-black p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] text-[#ffc812] tracking-[0.3em] uppercase mb-1"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Ready to Order?
            </p>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Michroma, sans-serif" }}>
              Get a quote for {product.model}
            </h3>
            <p className="text-sm text-white/40 mt-1">Custom specs · Volume pricing · OEM available</p>
          </div>
          <button
            onClick={handleEnquire}
            className="px-10 py-3 bg-[#ffc812] text-black text-[10px] tracking-widest uppercase font-black hover:bg-[#e0b212] transition-colors duration-300 whitespace-nowrap flex-shrink-0"
            style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
          >
            <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>Enquire Now</span>
          </button>
        </div>

        {/* ── Sibling products ── */}
        {siblings.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-1 h-6" style={{ background: cfg.accent }} />
              <h2 className="text-lg font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                More in {product.seriesLabel}
              </h2>
              <div className="flex-1 h-px bg-gray-100" />
              <button
                onClick={() => navigate("/products")}
                className="text-[9px] tracking-widest uppercase text-[#808080] hover:text-black transition-colors"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {siblings.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="text-left border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <div
                    className="h-24 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #111 0%, #1c1c1c 100%)" }}
                  >
                    <div className="scale-75">
                      {p.series === "haemng" ? <MotorIcon color={cfg.accent} size={60} />
                        : p.series === "maelard" ? <MotorIcon color={cfg.accent} size={55} />
                        : p.series === "esc" ? <EscIcon color={cfg.accent} size={60} />
                        : p.series === "fc" ? <FcIcon color={cfg.accent} size={55} />
                        : <MotorIcon color={cfg.accent} size={55} />}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[8px] tracking-widest uppercase mb-0.5"
                       style={{ fontFamily: "Michroma, sans-serif", color: cfg.accent }}>
                      {p.name}
                    </p>
                    <p className="text-xs font-bold text-black truncate" style={{ fontFamily: "Michroma, sans-serif" }}>
                      {p.keySpecs[0].value}
                    </p>
                    <p className="text-[9px] text-[#808080]">{p.keySpecs[0].label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
