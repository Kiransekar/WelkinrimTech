// src/components/calculators/WireGaugeCalc.tsx
// AWG vs SWG Conversion & Wire Standards Reference
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

// ─────────────────────────────────────────────────────────────
// Data Standards
// ─────────────────────────────────────────────────────────────

interface GaugeSpec {
  gauge: number;
  awgMm: number;
  swgMm: number;
}

// Data for gauges 0 to 40
const GAUGE_DATA: GaugeSpec[] = [
  { gauge: 0,  awgMm: 8.251, swgMm: 8.230 },
  { gauge: 1,  awgMm: 7.348, swgMm: 7.620 },
  { gauge: 2,  awgMm: 6.544, swgMm: 7.010 },
  { gauge: 3,  awgMm: 5.827, swgMm: 6.401 },
  { gauge: 4,  awgMm: 5.189, swgMm: 5.893 },
  { gauge: 5,  awgMm: 4.621, swgMm: 5.385 },
  { gauge: 6,  awgMm: 4.115, swgMm: 4.877 },
  { gauge: 7,  awgMm: 3.665, swgMm: 4.470 },
  { gauge: 8,  awgMm: 3.264, swgMm: 4.064 },
  { gauge: 9,  awgMm: 2.906, swgMm: 3.658 },
  { gauge: 10, awgMm: 2.588, swgMm: 3.251 },
  { gauge: 11, awgMm: 2.305, swgMm: 2.946 },
  { gauge: 12, awgMm: 2.053, swgMm: 2.642 },
  { gauge: 13, awgMm: 1.828, swgMm: 2.337 },
  { gauge: 14, awgMm: 1.628, swgMm: 2.032 },
  { gauge: 15, awgMm: 1.450, swgMm: 1.829 },
  { gauge: 16, awgMm: 1.291, swgMm: 1.626 },
  { gauge: 17, awgMm: 1.150, swgMm: 1.422 },
  { gauge: 18, awgMm: 1.024, swgMm: 1.219 },
  { gauge: 19, awgMm: 0.912, swgMm: 1.016 },
  { gauge: 20, awgMm: 0.812, swgMm: 0.914 },
  { gauge: 21, awgMm: 0.723, swgMm: 0.813 },
  { gauge: 22, awgMm: 0.644, swgMm: 0.711 },
  { gauge: 23, awgMm: 0.573, swgMm: 0.610 },
  { gauge: 24, awgMm: 0.511, swgMm: 0.559 },
  { gauge: 25, awgMm: 0.455, swgMm: 0.508 },
  { gauge: 26, awgMm: 0.405, swgMm: 0.457 },
  { gauge: 27, awgMm: 0.361, swgMm: 0.417 },
  { gauge: 28, awgMm: 0.321, swgMm: 0.376 },
  { gauge: 29, awgMm: 0.286, swgMm: 0.345 },
  { gauge: 30, awgMm: 0.255, swgMm: 0.315 },
  { gauge: 31, awgMm: 0.227, swgMm: 0.295 },
  { gauge: 32, awgMm: 0.202, swgMm: 0.274 },
  { gauge: 33, awgMm: 0.180, swgMm: 0.254 },
  { gauge: 34, awgMm: 0.160, swgMm: 0.234 },
  { gauge: 35, awgMm: 0.143, swgMm: 0.213 },
  { gauge: 36, awgMm: 0.127, swgMm: 0.193 },
  { gauge: 37, awgMm: 0.113, swgMm: 0.173 },
  { gauge: 38, awgMm: 0.101, swgMm: 0.152 },
  { gauge: 39, awgMm: 0.090, swgMm: 0.132 },
  { gauge: 40, awgMm: 0.080, swgMm: 0.122 },
];

const COPPER_RES_OHM_M = 1.68e-8; // at 20C

// ─────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────



interface FieldProps {
  label: string; id: string; value: number;
  onChange: (v: number) => void;
  step?: string; hint?: string; className?: string;
  unit?: string;
}

function Field({ label, id, value, onChange, step = "any", hint, className = "", unit }: FieldProps) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className={`w-full py-0.5 relative ${className}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <label className="text-[8px] tracking-widest uppercase text-[#808080]"
               style={{ fontFamily: "Michroma, sans-serif" }} htmlFor={id} title={label}>
          {label}
        </label>
        {hint && (
          <button
            type="button"
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
            className="w-3 h-3 rounded-full bg-gray-200 text-[7px] text-gray-500 flex items-center justify-center flex-shrink-0 hover:bg-[#ffc812] hover:text-black transition-colors"
          >?</button>
        )}
      </div>
      {showHint && hint && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-black text-[#ffc812] text-[9px] px-2 py-1.5 w-48 leading-relaxed font-Lexend"
             style={{ fontFamily: "Lexend, sans-serif" }}>
          {hint}
        </div>
      )}
      <div className="flex items-center border border-gray-200 bg-white focus-within:border-[#ffc812] transition-colors overflow-hidden">
        <input
          id={id} type="number" step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full text-[11px] px-2 py-1 focus:outline-none bg-white font-bold"
          style={{ fontFamily: "Lexend, sans-serif" }}
        />
        {unit && <span className="bg-gray-50 text-[8px] text-gray-400 px-1.5 py-1.5 border-l border-gray-100 font-Michroma uppercase">{unit}</span>}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = true, icon, action }: { title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: string; action?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 mb-2 overflow-hidden bg-white shadow-sm transition-all text-[11px]">
      <div 
        className="bg-black px-3 py-2 flex items-center justify-between cursor-pointer group hover:bg-neutral-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#ffc812] text-xs">{icon}</span>}
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#ffc812] font-bold"
             style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
        </div>
        <div className="flex items-center gap-3">
          {action}
          <span className={`text-[#ffc812] text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
        </div>
      </div>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100 p-2" : "max-h-0 opacity-0 p-0"}`}>
        <div className="space-y-1">{children}</div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, unit, sub, type = "normal" }: any) => {
  const isDanger = type === "danger";
  const isWarn = type === "warn";
  const isGood = type === "good";
  return (
    <div className={`border p-2.5 bg-white transition-all hover:shadow-md ${isDanger ? "border-red-500 shadow-red-50" : isWarn ? "border-amber-400 shadow-amber-50" : isGood ? "border-green-500 shadow-green-50" : "border-gray-200"}`}>
      <p className="text-[8px] tracking-[0.15em] uppercase text-[#808080] mb-1 font-bold font-Michroma">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-black font-Michroma">{value}</span>
        {unit && <span className="text-[9px] font-bold text-gray-400 uppercase font-Michroma">{unit}</span>}
      </div>
      {sub && <p className="text-[9px] text-gray-400 mt-1 font-Lexend italic border-t border-gray-50 pt-1 leading-tight">{sub}</p>}
    </div>
  );
};



// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function WireGaugeCalc() {
  const [selectedGauge, setSelectedGauge] = useState(18);
  const [timeStepMs, setTimeStepMs] = useState(1.0); // 0.1 to 10.0 ms

  const currentSpec = useMemo(() => {
    return GAUGE_DATA.find(d => d.gauge === selectedGauge) || GAUGE_DATA[0];
  }, [selectedGauge]);

  const results = useMemo(() => {
    const awgRad = currentSpec.awgMm / 2000; // to meters
    const swgRad = currentSpec.swgMm / 2000;
    
    const awgArea = Math.PI * Math.pow(awgRad, 2);
    const swgArea = Math.PI * Math.pow(swgRad, 2);

    const awgRes = COPPER_RES_OHM_M / awgArea; // per meter
    const swgRes = COPPER_RES_OHM_M / swgArea;

    // Time constant estimation (Simplified: Thermal time constant approximation)
    // T = R * C, but here we can imply a "thermal decay" or "frequency response" indicator
    const skinDepth = Math.sqrt(COPPER_RES_OHM_M / (Math.PI * (1 / (timeStepMs/1000))));

    return {
      awgAreaMm2: awgArea * 1_000_000,
      swgAreaMm2: swgArea * 1_000_000,
      awgResOhmKm: awgRes * 1000,
      swgResOhmKm: swgRes * 1000,
      skinDepthMm: skinDepth * 1000,
    };
  }, [currentSpec, timeStepMs]);

  const chartData = useMemo(() => {
    return GAUGE_DATA.slice(Math.max(0, selectedGauge - 10), Math.min(GAUGE_DATA.length, selectedGauge + 10))
      .map(d => ({
        gauge: d.gauge,
        AWG: d.awgMm,
        SWG: d.swgMm,
      }));
  }, [selectedGauge]);

  const inputsPanel = (
    <div className="space-y-3">
      <CollapsibleSection title="Direct Controls" icon="🎚️">
        <Field 
          label="Gauge Selection" 
          id="gs"
          value={selectedGauge} 
          onChange={setSelectedGauge} 
          unit="#" 
          hint="Wire gauge number (0 is thickest, 40 is thinnest)"
          step="1"
        />
        <Field 
          label="Time Constant" 
          id="tc"
          value={timeStepMs} 
          onChange={setTimeStepMs} 
          unit="ms" 
          hint="Frequency analysis point for transient calculations"
          step="0.1"
        />
      </CollapsibleSection>

      <CollapsibleSection title="Standard Shortcuts" icon="⚡">
        <div className="grid grid-cols-5 gap-1 py-1">
          {[10, 12, 14, 16, 18, 20, 22, 24, 26, 28].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGauge(g)}
              className={`py-2 text-[10px] border transition-all ${
                selectedGauge === g ? "bg-black text-[#ffc812] border-black font-bold" : "bg-white border-gray-100 text-gray-400 hover:border-[#ffc812] hover:text-black font-medium"
              } font-Michroma`}
            >
              #{g}
            </button>
          ))}
        </div>
      </CollapsibleSection>
      
      <div className="p-3 bg-neutral-50 border border-gray-100">
         <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma mb-2">Standard Note</p>
         <p className="text-[9px] font-Lexend text-gray-500 italic leading-relaxed">
           AWG (American Wire Gauge) and SWG (Standard Wire Gauge) diverge significantly in resolution over gauge #40.
         </p>
      </div>
    </div>
  );

  const resultsPanel = (
    <div id="wirecalc-report" className="relative space-y-4">
      <PdfTemplateHeader calculatorName="Conductor Geometry Standards" />
      <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 italic font-Lexend leading-relaxed">
            Cross-standard geometric comparison and material analysis for copper conductors.
          </p>
        </div>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Wire_Standards.pdf" />
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AWG Block */}
        <div className="border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-neutral-900 px-3 py-1.5 flex items-center justify-between font-Michroma">
            <span className="text-[9px] uppercase tracking-wider text-[#ffc812] font-bold">AWG System</span>
          </div>
          <div className="p-3 space-y-2">
            <StatCard label="Diameter" value={currentSpec.awgMm.toFixed(3)} unit="mm" />
            <StatCard label="Cross Section" value={results.awgAreaMm2.toFixed(4)} unit="mm²" type="good" />
            <StatCard label="Resistance" value={results.awgResOhmKm.toFixed(2)} unit="Ω/km" />
          </div>
        </div>

        {/* SWG Block */}
        <div className="border border-gray-200 bg-white overflow-hidden shadow-sm opacity-90 lg:opacity-100">
          <div className="bg-neutral-100 px-3 py-1.5 flex items-center justify-between font-Michroma border-b border-gray-200">
            <span className="text-[9px] uppercase tracking-wider text-black font-bold">SWG (UK Imperial)</span>
          </div>
          <div className="p-3 space-y-2">
            <StatCard label="Diameter" value={currentSpec.swgMm.toFixed(3)} unit="mm" />
            <StatCard label="Cross Section" value={results.swgAreaMm2.toFixed(4)} unit="mm²" />
            <StatCard label="Resistance" value={results.swgResOhmKm.toFixed(2)} unit="Ω/km" />
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-black font-bold font-Michroma">Proximity Trends</p>
            <p className="text-[8px] font-Lexend text-gray-400 mt-1">Geometric divergence (Ø mm) at current window ±10</p>
          </div>
          <div className="flex items-center gap-3 text-[8px] font-Michroma">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffc812]" /> AWG</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-black" /> SWG</span>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="gauge" tick={{ fontSize: 9, fontFamily: 'Michroma' }} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fontFamily: 'Michroma' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 10, fontFamily: 'Lexend', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="AWG" stroke="#ffc812" strokeWidth={3} dot={{ r: 2, fill: '#ffc812' }} activeDot={{ r: 4 }} animationDuration={1000} />
              <Line type="monotone" dataKey="SWG" stroke="#000" strokeWidth={2} dot={{ r: 1, fill: '#000' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="p-4 bg-neutral-900 border border-black text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-[#ffc812] font-Michroma font-bold">Physics Anchor</span>
              <p className="text-[10px] font-Lexend opacity-70 leading-relaxed italic">
                At current Time Constant ({timeStepMs}ms), calculated skin depth is <strong>{results.skinDepthMm.toFixed(3)}mm</strong>.
                AWG uses a logarithmic scale (ratio of 1.12), while SWG uses discrete imperial mappings.
              </p>
            </div>
            <div className="flex justify-end grayscale opacity-50">
               <div className="border border-white/20 p-2 text-[8px] font-Michroma uppercase text-center w-24">
                 Copper Ref<br/>20°C / 68°F
               </div>
            </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
