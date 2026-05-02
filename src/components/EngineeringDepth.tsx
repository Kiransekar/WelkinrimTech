import { useState, useEffect, useRef } from "react";

const industries = [
  {
    id: "air",
    label: "UAV/EVTOL",
    tabLabel: "UAV/EVTOL",
    fullLabel: "UAV/eVTOL",
    testedStatus: "JSS 55555 and MIL STD 810 G Tested",
    metrics: [
      { label: "POWER",          display: "100W to 30kW" },
      { label: "TORQUE",         display: "1 Nm to 100 Nm" },
      { label: "MAX RPM",        display: "Upto 10,000 RPM" },
      { label: "WEIGHT",         display: "50g to 5kg" },
      { label: "DIAMETER",       display: "30 to 300mm" },
      { label: "TORQUE DENSITY", display: "20 to 30 Nm/kg" },
    ],
  },
  {
    id: "marine",
    label: "MARINE",
    tabLabel: "MARINE",
    fullLabel: "Marine",
    testedStatus: "JSS 55555 and MIL STD 810 G to be Tested",
    metrics: [
      { label: "POWER",          display: "100W to 2.5kW" },
      { label: "TORQUE",         display: "1 Nm to 10 Nm" },
      { label: "MAX RPM",        display: "Upto 3,600 RPM" },
      { label: "WEIGHT",         display: "150g to 5kg" },
      { label: "DIAMETER",       display: "50mm to 300mm" },
      { label: "TORQUE DENSITY", display: "20 to 30 Nm/kg" },
    ],
  },
  {
    id: "land",
    label: "LAND",
    tabLabel: "LAND",
    fullLabel: "Land Vehicles",
    testedStatus: "JSS 55555 and MIL STD 810 G to be Tested",
    metrics: [
      { label: "POWER",          display: "50W to 15kW" },
      { label: "TORQUE",         display: "Upto 60 Nm" },
      { label: "MAX RPM",        display: "Upto 20,000 RPM" },
      { label: "WEIGHT",         display: "2kg to 20kg" },
      { label: "DIAMETER",       display: "150mm to 300mm" },
      { label: "TORQUE DENSITY", display: "4 to 8 Nm/kg" },
    ],
  },
  {
    id: "robotics",
    label: "ROBOTICS",
    tabLabel: "ROBOTICS",
    fullLabel: "Robotics",
    testedStatus: "JSS 55555 and MIL STD 810 G to be Tested",
    metrics: [
      { label: "POWER",          display: "100W to 30kW" },
      { label: "TORQUE",         display: "1 Nm to 100 Nm" },
      { label: "MAX RPM",        display: "Upto 10,000 RPM" },
      { label: "WEIGHT",         display: "50g to 5kg" },
      { label: "DIAMETER",       display: "30 to 300mm" },
      { label: "TORQUE DENSITY", display: "20 to 30 Nm/kg" },
    ],
  },
];


// ── SpecRow ──────────────────────────────────────────────────────────────────
function SpecRow({
  metric,
  active,
  idx,
}: {
  metric: (typeof industries)[0]["metrics"][0];
  active: boolean;
  idx: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!active) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), idx * 80);
    return () => clearTimeout(t);
  }, [active, idx]);

  return (
    <div
      className={`flex items-baseline gap-4 pl-3 border-l transition-all duration-500 ${
        visible
          ? "border-[#ffc812]/60 opacity-100 translate-y-0"
          : "border-white/5 opacity-0 translate-y-2"
      }`}
    >
      <span
        className="text-[8px] tracking-[0.25em] text-white/30 uppercase w-[108px] flex-shrink-0"
        style={{ fontFamily: "Michroma, sans-serif" }}
      >
        {metric.label}
      </span>
      <span
        className="text-[13px] font-bold text-white/90"
        style={{ fontFamily: "Michroma, sans-serif" }}
      >
        {metric.display}
      </span>
    </div>
  );
}

// ── Main Section ─────────────────────────────────────────────────────────────
export default function EngineeringDepth() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [metricsActive, setMetricsActive] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const active = industries[activeIdx];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMetricsActive(true);
        } else {
          setMetricsActive(false);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTab = (idx: number) => {
    if (idx === activeIdx) return;
    setMetricsActive(false);
    setActiveIdx(idx);
    setResetKey((k) => k + 1);
    setTimeout(() => setMetricsActive(true), 100);
  };

  return (
    <section
      id="depth"
      ref={sectionRef}
      className="w-full bg-[#050505] overflow-hidden scroll-mt-[60px] md:scroll-mt-[72px]"
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 py-10 md:py-12">

        {/* ── Section header ── */}
        <div className="flex items-end justify-between mb-5">
          <h2
            className="text-3xl md:text-5xl lg:text-6xl text-white font-medium tracking-tight"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            Engineering depth.
          </h2>
          <button
            onClick={() =>
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-[10px] text-white hover:text-[#ffc812] tracking-[0.2em] uppercase font-bold transition-colors flex items-center gap-2 group font-mono mb-2 md:mb-4"
          >
            EXPLORE TECH
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* ── Industry tabs ── */}
        <div className="flex items-center gap-4 text-[9px] md:text-[10px] text-white/50 tracking-[0.3em] uppercase font-mono mb-10">
          {industries.map((ind, i) => (
            <button
              key={ind.id}
              onClick={() => handleTab(i)}
              className={`transition-all duration-200 ${
                i === activeIdx
                  ? "text-[#ffc812]"
                  : "hover:text-white/80"
              }`}
            >
              {ind.tabLabel}
            </button>
          ))}
        </div>


        {/* ── Main two-column body ── */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 items-stretch">

          {/* LEFT — motor card */}
          <div
            className="relative w-full lg:w-[52%] flex-shrink-0 overflow-hidden bg-[#0a0a0a] border border-white/[0.06]"
            style={{ minHeight: "420px" }}
          >
            <div className="absolute top-4 left-4 z-20">
              <span className="text-[10px] text-[#ffc812] tracking-[0.2em] font-mono">
                0{activeIdx + 1}
              </span>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-6 pt-16"
              style={{
                background: "linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.4) 60%, transparent 100%)",
              }}
            >
              <h3
                className="text-[28px] md:text-[36px] font-medium text-white tracking-tight leading-none mb-1"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                {active.fullLabel}
              </h3>
              <p className="text-[9px] text-white/40 tracking-[0.25em] uppercase font-mono">
                Simulation-Validated
              </p>
            </div>

            <img
              key={activeIdx}
              src={`${import.meta.env.BASE_URL}motor-hero.png`}
              alt={active.fullLabel}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 opacity-60 hover:opacity-75"
            />
          </div>

          {/* RIGHT — spec panel */}
          <div className="flex-1 flex flex-col justify-between bg-[#080808] border border-l-0 border-white/[0.06] px-8 md:px-10 py-8 md:py-10">

            <div className="mb-6 overflow-hidden">
              <p className="text-[9px] tracking-[0.3em] text-white/20 uppercase font-mono mb-2">
                Product Range
              </p>
              <h4
                key={activeIdx}
                className="text-[38px] md:text-[52px] font-black uppercase leading-none tracking-tighter transition-all duration-500"
                style={{
                  fontFamily: "Michroma, sans-serif",
                  color: "transparent",
                  WebkitTextStroke: "1px rgba(255,200,18,0.15)",
                }}
              >
                {active.label}
              </h4>
            </div>

            <div key={resetKey} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 flex-1">
              {active.metrics.map((metric, i) => (
                <SpecRow
                  key={`${activeIdx}-${i}`}
                  metric={metric}
                  active={metricsActive}
                  idx={i}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffc812] animate-pulse flex-shrink-0" />
                <p className="text-[8px] tracking-[0.25em] text-white/20 uppercase font-mono">
                  {active.testedStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
