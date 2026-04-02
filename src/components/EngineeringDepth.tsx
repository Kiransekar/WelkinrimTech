import { useState, useEffect, useRef } from "react";

const industries = [
  {
    id: "air",
    label: "UAV / eVTOL",
    tabLabel: "UAV / eVTOL",
    fullLabel: "UAV / eVTOL",
    tags: ["FLUX DENSITY", "THERMAL", "EFFICIENCY", "STRESS", "COGGING", "FOC"],
    metrics: [
      { label: "RATED POWER",    value: 1.2,    unit: "kW",    decimals: 1 },
      { label: "RATED TORQUE",   value: 0.96,   unit: "Nm",    decimals: 2 },
      { label: "MAX RPM",        value: 12000,  unit: "",      decimals: 0 },
      { label: "WEIGHT",         value: 0.42,   unit: "kg",    decimals: 2 },
      { label: "DIAMETER",       value: 38,     unit: "mm",    decimals: 0 },
      { label: "PROTECTION",     value: 54,     unit: "",      prefix: "IP", decimals: 0 },
      { label: "PEAK η",         value: 97.2,   unit: "%",     decimals: 1 },
      { label: "MAX WINDING",    value: 218,    unit: "°C",    decimals: 0 },
      { label: "PWR DENSITY",    value: 5.2,    unit: "kW/kg", decimals: 1 },
    ],
  },
  {
    id: "marine",
    label: "MARINE",
    tabLabel: "MARINE",
    fullLabel: "Marine",
    tags: ["WATERPROOFING", "CORROSION", "EFFICIENCY", "TORQUE", "THERMAL", "SEAL"],
    metrics: [
      { label: "RATED POWER",    value: 22,    unit: "kW",    decimals: 0 },
      { label: "RATED TORQUE",   value: 1200,  unit: "Nm",    decimals: 0 },
      { label: "MAX RPM",        value: 3600,  unit: "",      decimals: 0 },
      { label: "WEIGHT",         value: 18,    unit: "kg",    decimals: 0 },
      { label: "DIAMETER",       value: 280,   unit: "mm",    decimals: 0 },
      { label: "PROTECTION",     value: 68,    unit: "",      prefix: "IP", decimals: 0 },
      { label: "PEAK η",         value: 94.5,  unit: "%",     decimals: 1 },
      { label: "MAX WINDING",    value: 155,   unit: "°C",    decimals: 0 },
      { label: "PWR DENSITY",    value: 1.2,   unit: "kW/kg", decimals: 1 },
    ],
  },
  {
    id: "land",
    label: "LAND",
    tabLabel: "LAND",
    fullLabel: "Land Vehicles",
    tags: ["TORQUE DENSITY", "THERMAL", "RESPONSE", "VOLTAGE", "RELIABILITY", "VECTOR"],
    metrics: [
      { label: "RATED POWER",    value: 150,   unit: "kW",    decimals: 0 },
      { label: "RATED TORQUE",   value: 2400,  unit: "Nm",    decimals: 0 },
      { label: "MAX RPM",        value: 18000, unit: "",      decimals: 0 },
      { label: "WEIGHT",         value: 45,    unit: "kg",    decimals: 0 },
      { label: "DIAMETER",       value: 350,   unit: "mm",    decimals: 0 },
      { label: "VOLTAGE",        value: 800,   unit: "V",     decimals: 0 },
      { label: "RESPONSE",       value: 2,     unit: "ms",    decimals: 0 },
      { label: "MAX WINDING",    value: 200,   unit: "°C",    decimals: 0 },
      { label: "PWR DENSITY",    value: 3.3,   unit: "kW/kg", decimals: 1 },
    ],
  },
  {
    id: "robotics",
    label: "ROBOTICS",
    tabLabel: "ROBOTICS",
    fullLabel: "Robotics",
    tags: ["PRECISION", "BACKDRIVABILITY", "BANDWIDTH", "COMPLIANCE", "STIFFNESS", "FOC"],
    metrics: [
      { label: "RATED POWER",    value: 2.4,   unit: "kW",    decimals: 1 },
      { label: "RATED TORQUE",   value: 48,    unit: "Nm",    decimals: 0 },
      { label: "MAX RPM",        value: 6000,  unit: "",      decimals: 0 },
      { label: "WEIGHT",         value: 1.2,   unit: "kg",    decimals: 1 },
      { label: "ACCURACY",       value: 0.01,  unit: "°",     decimals: 2 },
      { label: "BACKDRIVE",      value: 99,    unit: "%",     decimals: 0 },
      { label: "BANDWIDTH",      value: 10,    unit: "kHz",   decimals: 0 },
      { label: "MAX WINDING",    value: 155,   unit: "°C",    decimals: 0 },
      { label: "PWR DENSITY",    value: 2.0,   unit: "kW/kg", decimals: 1 },
    ],
  },
];

function useCountUp(target: number, duration = 1100, active = false, decimals = 0) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!active) { setCount(0); return; }
    const start = performance.now();
    const run = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = parseFloat((eased * target).toFixed(decimals));
      setCount(val);
      if (t < 1) rafRef.current = requestAnimationFrame(run);
      else setCount(target);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration, decimals]);

  return count;
}

function MetricCell({
  metric,
  active,
  idx,
}: {
  metric: (typeof industries)[0]["metrics"][0];
  active: boolean;
  idx: number;
}) {
  const [da, setDa] = useState(false);
  useEffect(() => {
    if (!active) { setDa(false); return; }
    const t = setTimeout(() => setDa(true), idx * 60);
    return () => clearTimeout(t);
  }, [active, idx]);

  const count = useCountUp(metric.value, 1100, da, metric.decimals);
  const displayed = da ? count.toFixed(metric.decimals) : "0";

  const row = Math.floor(idx / 3);
  const col = idx % 3;
  const isLastRow = row === 2;
  const isLastCol = col === 2;

  return (
    <div
      className={`flex flex-col justify-center py-1 px-1.5 ${
        !isLastRow ? "border-b border-black/10" : ""
      } ${!isLastCol ? "border-r border-black/10" : ""}`}
    >
      <p
        className="text-xs tracking-[0.15em] text-black/40 uppercase mb-1"
        style={{ fontFamily: "Michroma, sans-serif" }}
      >
        {metric.label}
      </p>
      <div className="flex items-baseline gap-1 leading-none flex-wrap">
        {metric.prefix ? (
          <span
            className="text-sm font-bold text-black leading-none"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            {metric.prefix}{da ? Math.round(metric.value) : "0"}
          </span>
        ) : (
          <>
            <span
              className="text-sm font-bold text-black leading-none"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              {metric.value >= 1000 && da
                ? Number(count.toFixed(metric.decimals)).toLocaleString()
                : displayed}
            </span>
            {metric.unit && (
              <span
                className="text-xs font-bold text-black/50"
                style={{ fontFamily: "Michroma, sans-serif" }}
              >
                {metric.unit}
              </span>
            )}
          </>
        )}
      </div>
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
    <section id="technology" ref={sectionRef} className="w-full bg-white overflow-hidden scroll-mt-[72px]">
      <div className="relative flex flex-col lg:flex-row min-h-[100vh] lg:min-h-[calc(100vh-72px)]">

        {/* ══════════ LEFT WHITE PANEL ══════════ */}
        <div className="relative flex flex-col justify-center bg-white z-10
                        w-full lg:w-[45%] flex-shrink-0
                        px-6 md:px-8 lg:pl-10 lg:pr-[180px] xl:pr-[200px] py-8 lg:py-10 gap-3">

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
              className="text-[32px] md:text-[40px] xl:text-[48px] font-black text-black uppercase tracking-tight"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              Engineering
            </div>
            <div
              className="text-[32px] md:text-[40px] xl:text-[48px] font-black text-[#ffc914] uppercase tracking-tight"
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
        <div className="lg:hidden flex justify-center -mt-4 mb-4 relative z-20">
          <div className="w-[240px] h-[240px] rounded-full overflow-hidden border-4 border-white shadow-2xl bg-[#1a1a1a]">
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
          <div className="relative z-40 px-4 lg:pl-[200px] xl:pl-[220px] lg:pr-8 xl:pr-10 pt-6 lg:pt-8">
            <h3
              className="text-[44px] md:text-[56px] xl:text-[72px] font-black text-black/30 uppercase leading-none"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              {active.label}
            </h3>
          </div>

          {/* Inner content - metrics grid on top of yellow */}
          <div className="relative z-40 flex flex-col px-4 lg:pl-[200px] xl:pl-[220px] lg:pr-8 xl:pr-10 pb-6 lg:pb-8">
            <p
              className="text-xs tracking-[0.25em] text-black/70 font-semibold uppercase mb-4"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              Motor Specifications
            </p>

            {/* 3×3 Metric grid - smaller cells */}
            <div
              key={resetKey}
              className="grid grid-cols-3 gap-1"
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
                Welkinrim Technologies &nbsp;|&nbsp; Proprietary &nbsp;|&nbsp; Rev. 0003.1
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
