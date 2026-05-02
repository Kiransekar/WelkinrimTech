import { Link } from "wouter";
import { PRODUCTS } from "@/data/products";

const FAMILIES = [
  { id: "haemng", name: "HÆMNG", series: "haemng", num: "01", image: "/welkinrim-motor.png" },
  { id: "maelard", name: "MÆLARD", series: "maelard", num: "02", image: "/place/image.png" },
  { id: "esc", name: "ESC", series: "esc", num: "03", image: "/motor-hero.png" },
  { id: "fc", name: "AUTO PILOT", series: "fc", num: "04", image: "/hero-uav-bg.jpeg" },
  { id: "ips", name: "IPS", series: "ips", num: "05", image: "/welkinrim-motor.png" },
  { id: "cellar", name: "CELLAR", series: "cellar", num: "06", image: "/place/image.png" },
  { id: "vagans", name: "VAGANS", series: "vagans", num: "07", image: "/motor-hero.png" },
  { id: "sciatic", name: "SCIATIC", series: "sciatic", num: "08", image: "/welkinrim-motor.png" },
];

// Card fixed width in px — change here to resize cards everywhere
const CARD_W = 360;
const CARD_GAP = 24;

export default function FamiliesSection() {
  const totalModels = PRODUCTS.length;
  const getVariantCount = (series: string) => PRODUCTS.filter(p => p.series === series).length;

  const getFamilyImage = (family: typeof FAMILIES[0]) => {
    const productWithImage = PRODUCTS.find(p => p.series === family.series && p.thumbnailUrl);
    return productWithImage?.thumbnailUrl || import.meta.env.BASE_URL + family.image.replace(/^\//, "");
  };

  return (
    <section id="families" className="bg-[#050505] w-full py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
        {/* Header Row */}
        <div className="flex items-end justify-between mb-2">
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-white font-medium tracking-tight">
            Product families.
          </h2>
          <Link href="/products">
            <a className="text-[10px] text-white hover:text-[#ffc812] tracking-[0.2em] uppercase font-bold transition-colors flex items-center gap-2 group font-mono mb-2 md:mb-4">
              BROWSE ALL
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </Link>
        </div>

        {/* Info Labels Subtitle */}
        <div className="flex flex-wrap items-center gap-4 text-[9px] md:text-[10px] text-white/50 tracking-[0.3em] uppercase font-mono mb-10">
          <span>{totalModels} MODELS</span>
          <span className="text-white/20">|</span>
          <span>MIL-STD 810G</span>
          <span className="text-white/20">|</span>
          <span>5,000 M QUALIFIED</span>
          <span className="text-white/20">|</span>
          <span>JSS 55555 TESTED</span>
        </div>
      </div>

      {/* ── Marquee ─────────────────────────────────────────────────────────── */}
      {/*
        Technique: place two identical lists side-by-side and slide the whole
        wrapper left by exactly 50% (= width of one list). When it reaches -50%
        we reset to 0 — seamless because both halves look identical.
      */}
      <style>{`
        @keyframes families-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .families-track {
          animation: families-marquee 38s linear infinite;
        }
        .families-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Outer clipping window */}
      <div className="relative mt-2 overflow-hidden">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 z-10 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 z-10 bg-gradient-to-l from-[#050505] to-transparent" />

        {/* Sliding track — exactly 2× one set of cards wide */}
        <div
          className="families-track flex"
          style={{ gap: `${CARD_GAP}px`, paddingInline: `${CARD_GAP / 2}px` }}
        >
          {/* List A */}
          {FAMILIES.map((fam) => (
            <FamilyCard key={fam.id} fam={fam} cardW={CARD_W} getImage={getFamilyImage} getCount={getVariantCount} />
          ))}
          {/* List B — identical clone for seamless loop */}
          {FAMILIES.map((fam) => (
            <FamilyCard key={`${fam.id}-b`} fam={fam} cardW={CARD_W} getImage={getFamilyImage} getCount={getVariantCount} />
          ))}
        </div>
      </div>

      {/* Footer Row */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
        <div className="mt-12 md:mt-16 pt-6 border-t border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            <Link href="/about">
              <a className="text-[9px] md:text-[10px] text-white/50 hover:text-white transition-colors tracking-widest uppercase font-mono">
                Custom &amp; OEM <span className="text-white/30 ml-1">25</span>
              </a>
            </Link>
            <Link href="/calculators">
              <a className="text-[9px] md:text-[10px] text-white/50 hover:text-white transition-colors tracking-widest uppercase font-mono">
                Drive Calculators
              </a>
            </Link>
            <Link href="/products">
              <a className="text-[9px] md:text-[10px] text-white/50 hover:text-white transition-colors tracking-widest uppercase font-mono">
                Datasheets
              </a>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── Card sub-component ─────────────────────────────────────────────────── */
function FamilyCard({
  fam,
  cardW,
  getImage,
  getCount,
}: {
  fam: { id: string; name: string; series: string; num: string };
  cardW: number;
  getImage: (f: any) => string;
  getCount: (s: string) => number;
}) {
  return (
    <Link href={`/products#${fam.id}`}>
      <a
        className="relative block flex-none rounded-xl overflow-hidden group cursor-pointer border border-white/10 hover:border-[#ffc812]/50 hover:shadow-2xl transition-all duration-500 bg-[#0a0a0a] hover:-translate-y-2"
        style={{ width: cardW, aspectRatio: "4/3" }}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={getImage(fam)}
            alt={fam.name}
            className="w-full h-full object-cover object-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 group-hover:via-black/20 transition-all duration-500" />

        {/* Text content */}
        <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
          <span className="text-[#ffc812] text-[9px] font-bold tracking-[0.2em] mb-1.5 font-mono opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {fam.num}
          </span>
          <h3
            className="text-white text-lg md:text-xl font-bold uppercase tracking-wider mb-1"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            {fam.name}
          </h3>
          <p className="text-white/50 group-hover:text-white/90 text-[9px] uppercase tracking-widest font-mono transition-colors duration-300">
            {getCount(fam.series)} variants
          </p>
        </div>
      </a>
    </Link>
  );
}
