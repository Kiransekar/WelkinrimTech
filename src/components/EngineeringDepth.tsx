import { useState, useEffect, useRef } from "react";

const industries = [
  {
    id: "air",
    label: "UAV/eVTOL",
    tabLabel: "UAV/eVTOL",
    fullLabel: "UAV/eVTOL",
    tags: ["FLUX DENSITY", "THERMAL", "EFFICIENCY", "STRESS", "COGGING", "FOC"],
    testedStatus: "JSS 55555 and MIL STD 810 G Tested",
    metrics: [
      { label: "POWER",           display: "100W to 30kW" },
      { label: "TORQUE",          display: "1 Nm to 100 Nm" },
      { label: "MAX RPM",         display: "Upto 10,000 RPM" },
      { label: "WEIGHT",          display: "50g to 5kg" },
      { label: "DIAMETER",        display: "30 to 300mm" },
      { label: "TORQUE DENSITY",  display: "20 to 30 Nm/kg" },

    ],
  },
  {
    id: "marine",
    label: "MARINE",
    tabLabel: "MARINE",
    fullLabel: "Marine",
    tags: ["WATERPROOFING", "CORROSION", "EFFICIENCY", "TORQUE", "THERMAL", "SEAL"],
    testedStatus: "JSS 55555 and MIL STD 810 G to be Tested",
    metrics: [
      { label: "POWER",           display: "100W to 2.5kW" },
      { label: "TORQUE",          display: "1 Nm to 10 Nm" },
      { label: "MAX RPM",         display: "Upto 3,600 RPM" },
      { label: "WEIGHT",          display: "150g to 5kg" },
      { label: "DIAMETER",        display: "50mm to 300mm" },
      { label: "TORQUE DENSITY",  display: "20 to 30 Nm/kg" },

    ],
  },
  {
    id: "land",
    label: "LAND",
    tabLabel: "LAND",
    fullLabel: "Land Vehicles",
    tags: ["TORQUE DENSITY", "THERMAL", "RESPONSE", "VOLTAGE", "RELIABILITY", "VECTOR"],
    testedStatus: "JSS 55555 and MIL STD 810 G to be Tested",
    metrics: [
      { label: "POWER",           display: "50W to 15kW" },
      { label: "TORQUE",          display: "Upto 60 Nm" },
      { label: "MAX RPM",         display: "Upto 20,000 RPM" },
      { label: "WEIGHT",          display: "2kg to 20kg" },
      { label: "DIAMETER",        display: "150mm to 300mm" },
      { label: "TORQUE DENSITY",  display: "4 to 8 Nm/kg" },

    ],
  },
  {
    id: "robotics",
    label: "ROBOTICS",
    tabLabel: "ROBOTICS",
    fullLabel: "Robotics",
    tags: ["PRECISION", "BACKDRIVABILITY", "BANDWIDTH", "COMPLIANCE", "STIFFNESS", "FOC"],
    testedStatus: "JSS 55555 and MIL STD 810 G to be Tested",
    metrics: [
      { label: "POWER",           display: "100W to 30kW" },
      { label: "TORQUE",          display: "1 Nm to 100 Nm" },
      { label: "MAX RPM",         display: "Upto 10,000 RPM" },
      { label: "WEIGHT",          display: "50g to 5kg" },
      { label: "DIAMETER",        display: "30 to 300mm" },
      { label: "TORQUE DENSITY",  display: "20 to 30 Nm/kg" },

    ],
  },
];


function MetricCell({
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
    const t = setTimeout(() => setVisible(true), idx * 60);
    return () => clearTimeout(t);
  }, [active, idx]);

  const row = Math.floor(idx / 3);
  const col = idx % 3;
  const isLastRow = row === 1;
  const isLastCol = col === 2;

  return (
    <div
      className={`flex flex-col justify-center py-4 px-2 lg:py-6 lg:px-4 ${
        !isLastRow ? "border-b border-black/10" : ""
      } ${!isLastCol ? "border-r border-black/10" : ""}`}
    >
      <p
        className="text-xs tracking-[0.15em] text-black/40 uppercase mb-1"
        style={{ fontFamily: "Michroma, sans-serif" }}
      >
        {metric.label}
      </p>
      <span
        className={`text-sm font-bold text-black leading-none transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ fontFamily: "Michroma, sans-serif" }}
      >
        {metric.display}
      </span>
    </div>
  );
}

export default function EngineeringDepth() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [metricsActive, setMetricsActive] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const active = industries[activeIdx];

  // Trigger count-up when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMetricsActive(true);
        else setMetricsActive(false);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTab = (idx: number) => {
    if (idx === activeIdx) return;
    setMetricsActive(false);
    setActiveIdx(idx);
    setResetKey((k) => k + 1);
    setTimeout(() => setMetricsActive(true), 80);
  };

  return (
    <section id="technology" ref={sectionRef} className="w-full bg-white overflow-hidden scroll-mt-[60px] md:scroll-mt-[72px]">
      <div className="relative flex flex-col lg:flex-row min-h-[100vh] lg:min-h-[calc(100vh-72px)]">

        {/* ══════════ LEFT WHITE PANEL ══════════ */}
        <div className="relative flex flex-col justify-center bg-white z-10
                        w-full lg:w-[45%] flex-shrink-0
                        px-4 md:px-8 lg:pl-10 lg:pr-[180px] xl:pr-[200px] py-8 lg:py-10 gap-3">

          {/* Tag */}
          <p
            className="text-xs tracking-[0.2em] text-[#808080] uppercase"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            Simulation-Validated
          </p>

          {/* Heading */}
          <div className="leading-[0.95]">
            <div
              className="text-[28px] md:text-[40px] xl:text-[48px] font-black text-black uppercase tracking-tight"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              Engineering
            </div>
            <div
              className="text-[28px] md:text-[40px] xl:text-[48px] font-black text-[#ffc914] uppercase tracking-tight"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              Depth
            </div>
          </div>

          {/* Industry tabs with pipe separators */}
          <div className="flex items-center flex-wrap gap-y-2">
            {industries.map((ind, i) => (
              <div key={ind.id} className="flex items-center">
                <button
                  onClick={() => handleTab(i)}
                  className={`text-xs tracking-[0.15em] uppercase font-bold pb-1 transition-all duration-200 ${
                    i === activeIdx
                      ? "text-black border-b-2 border-[#ffc914]"
                      : "text-[#aaa] border-b-2 border-transparent hover:text-black"
                  }`}
                  style={{ fontFamily: "Michroma, sans-serif" }}
                >
                  {ind.tabLabel}
                </button>
                {i < industries.length - 1 && (
                  <span className="text-[#ccc] mx-3 text-xs select-none">|</span>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() =>
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
            }
            className="self-start inline-flex items-center gap-2 px-6 py-3 bg-[#ffc914] text-black text-xs tracking-[0.22em] uppercase font-bold hover:bg-[#e0b212] transition-all duration-300 mt-2"
            style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
          >
            <span className="inline-flex items-center gap-2" style={{ transform: "skewX(10deg)" }}>
              Explore Technology
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>

        {/* ══════════ CENTER MOTOR IMAGE (overlapping both panels) ══════════ */}
        <div
          className="hidden lg:flex absolute z-30 items-center justify-center pointer-events-none"
          style={{
            left: "45%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "380px",
            height: "380px",
          }}
        >
          <div className="w-[280px] h-[280px] xl:w-[380px] xl:h-[380px] rounded-full overflow-hidden border-[6px] border-white shadow-xl bg-[#1a1a1a]">
            <img
              key={activeIdx}
              src={`${import.meta.env.BASE_URL}motor-hero.png`}
              alt={active.fullLabel}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Mobile motor image */}
        <div className="lg:hidden flex justify-center -mt-2 md:-mt-4 mb-3 md:mb-4 relative z-20">
          <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] rounded-full overflow-hidden border-4 border-white shadow-2xl bg-[#1a1a1a]">
            <img
              key={`mobile-${activeIdx}`}
              src={`${import.meta.env.BASE_URL}motor-hero.png`}
              alt={active.fullLabel}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ══════════ RIGHT YELLOW PANEL ══════════ */}
        <div className="flex-1 relative flex flex-col justify-center z-20">
          {/* Parallelogram shape using clip-path */}
          <div
            className="absolute inset-0 bg-[#ffc914]"
            style={{
              clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
            }}
          />

          {/* AIR/WATER label - on top of yellow and motor */}
          <div className="relative z-40 px-4 md:px-6 lg:pl-[200px] xl:pl-[220px] lg:pr-8 xl:pr-10 pt-4 md:pt-6 lg:pt-8">
            <h3
              className="text-[32px] md:text-[48px] lg:text-[56px] xl:text-[72px] font-black text-black/30 uppercase leading-none whitespace-nowrap"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              {active.label}
            </h3>
          </div>

          {/* Inner content - metrics grid on top of yellow */}
          <div className="relative z-40 flex flex-col px-4 md:px-6 lg:pl-[200px] xl:pl-[220px] lg:pr-8 xl:pr-10 pb-4 md:pb-6 lg:pb-8">
            <p
              className="text-xs tracking-[0.25em] text-black/70 font-semibold uppercase mb-4 ml-[2px]"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              Product Range
            </p>

            {/* 2×3 Metric grid - larger cells */}
            <div
              key={resetKey}
              className="grid grid-cols-3 gap-2 lg:gap-4"
            >
              {active.metrics.map((metric, i) => (
                <MetricCell
                  key={`${activeIdx}-${i}`}
                  metric={metric}
                  active={metricsActive}
                  idx={i}
                />
              ))}
            </div>

            {/* Proprietary footer */}
            <div className="mt-4 pt-3 border-t border-black/10">
              <p
                className="text-xs tracking-[0.2em] text-black/30 uppercase text-right"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                {active.testedStatus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
