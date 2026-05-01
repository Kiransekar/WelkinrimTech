import Reveal from "@/components/Reveal";

export const INVESTORS: { name: string; full: string; logo?: string; noFilter?: boolean }[] = [
  { name: "IITM", full: "IITM Incubation Cell", logo: "assets/backed/svg/iitm.svg", noFilter: true },
  { name: "Meity", full: "Meity Startup Hub", logo: "assets/backed/svg/meity.svg" },
  { name: "Forge", full: "Forge Innovation & Ventures", logo: "assets/backed/svg/forge.svg" },
  { name: "SIPCOT", full: "SIPCOT", logo: "assets/backed/svg/sipcot.svg" },
  { name: "GSF", full: "Global Super Fund", logo: "assets/backed/svg/gsf.svg" },
  { name: "CAN", full: "Chennai Angels Network", logo: "assets/backed/svg/can.svg", noFilter: true },
];

export default function InvestorsSection() {
  return (
    <section id="partners" className="bg-[#050505] py-14 md:py-20 relative overflow-hidden">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(#ffc812 1px, transparent 1px), linear-gradient(90deg, #ffc812 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      <div className="max-w-7xl mx-auto px-4 md:px-12 relative">
        <Reveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#ffc812]/60" />
              <span className="text-[#808080] text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>
                Backed By
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#ffc812]/60" />
            </div>
          </div>
        </Reveal>

        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
          {INVESTORS.map((inv, i) => (
            <Reveal key={inv.name} delay={i * 80}>
              <div className="group cursor-default flex items-center justify-center">
                {inv.logo ? (
                  <img
                    src={`${import.meta.env.BASE_URL}${inv.logo}`}
                    alt={inv.full}
                    className={`h-12 md:h-16 w-auto max-w-[180px] object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out ${!inv.noFilter ? 'brightness-0 invert' : ''}`}
                  />
                ) : (
                  <span className="text-xl md:text-2xl font-black text-white/40 tracking-[0.15em] uppercase group-hover:text-[#ffc812] transition-colors"
                        style={{ fontFamily: "Michroma, sans-serif" }}>
                    {inv.name}
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
