// Precharge Resistor Rating Calculator
// RC circuit precharge design for high-voltage systems with capacitive loads
import { useState, useMemo } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface PrechargeInput {
  desiredPrechargeTime: number; // seconds
  requiredTauMultiplier: number; // typically 5 (5T = 99.3% charged)
  systemVoltage: number;        // V
  systemCapacitance: number;    // F
  seriesResistance: number;     // Ohm (main contactor contact resistance, excluding precharge)
}

const DEFAULTS: PrechargeInput = {
  desiredPrechargeTime: 0.5,
  requiredTauMultiplier: 5,
  systemVoltage: 103,
  systemCapacitance: 0.006,
  seriesResistance: 0.0004,
};

// Time constant milestones
const TAU_MILESTONES = [
  { tau: 1, pct: 63.2 },
  { tau: 2, pct: 86.5 },
  { tau: 3, pct: 95.0 },
  { tau: 4, pct: 98.2 },
  { tau: 5, pct: 99.3 },
];

function calculate(inp: PrechargeInput) {
  const { desiredPrechargeTime, requiredTauMultiplier, systemVoltage, systemCapacitance, seriesResistance } = inp;

  // Tau = desired precharge time / required tau multiplier
  const tau = desiredPrechargeTime / requiredTauMultiplier;

  // Required resistor value: R = Tau / C - R_series
  const rTotal = tau / systemCapacitance;
  const rPrecharge = rTotal - seriesResistance;

  // Max inrush current (at t=0)
  const maxInrushCurrent = systemVoltage / rTotal;

  // Energy dissipated in resistor = 0.5 × C × V²
  const energyDissipation = 0.5 * systemCapacitance * systemVoltage * systemVoltage;

  // Energy during precharge time (integral up to xT)
  const energyForPrechargeTime = energyDissipation * (1 - Math.exp(-2 * desiredPrechargeTime / tau));

  // Required resistor power rating = Energy / precharge time
  const requiredResistorPower = energyDissipation / desiredPrechargeTime;

  // Max inrush power = I_max² × R
  const maxInrushPower = maxInrushCurrent * maxInrushCurrent * rTotal;

  // Voltage remaining after precharge = V × e^(-xT/τ)
  const voltageRemaining = systemVoltage * Math.exp(-desiredPrechargeTime / tau);

  // Main contactor inrush current = voltage remaining / series resistance
  const mainContactorInrush = seriesResistance > 0 ? voltageRemaining / seriesResistance : Infinity;

  // Charged voltage at end of precharge
  const chargedVoltage = systemVoltage * (1 - Math.exp(-desiredPrechargeTime / tau));

  // Generate charging curve time series (0 to 2×prechargeTime, 21 steps)
  const timeSteps: { t: number; vCharged: number; iCharging: number }[] = [];
  const tMax = desiredPrechargeTime * 2;
  const dt = tMax / 20;
  for (let i = 0; i <= 20; i++) {
    const t = i * dt;
    const vc = systemVoltage * (1 - Math.exp(-t / tau));
    const ic = (systemVoltage / rTotal) * Math.exp(-t / tau);
    timeSteps.push({ t, vCharged: vc, iCharging: ic });
  }

  return {
    tau,
    rTotal,
    rPrecharge,
    maxInrushCurrent,
    energyDissipation,
    energyForPrechargeTime,
    requiredResistorPower,
    maxInrushPower,
    voltageRemaining,
    mainContactorInrush,
    chargedVoltage,
    timeSteps,
  };
}

export default function PrechargeCalc() {
  const [inputs, setInputs] = useState<PrechargeInput>(DEFAULTS);
  const result = useMemo(() => calculate(inputs), [inputs]);


// ─────────────────────────────────────────────────────────────
// Shared UI Primitives
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
        <div className="absolute top-full left-0 mt-1 z-50 bg-black text-[#ffc812] text-[9px] px-2 py-1.5 w-48 leading-relaxed"
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



  const inputsPanel = (
    <div className="space-y-3">
      <CollapsibleSection title="Precharge Parameters" icon="⏱">
        <Field label="Target Precharge Time" id="dpt" value={inputs.desiredPrechargeTime} onChange={(v: number) => setInputs({ ...inputs, desiredPrechargeTime: v })} unit="s" step="0.01" hint="Time until main contactor closure" />
        <Field label="Tau Multiplier (xT)" id="rtm" value={inputs.requiredTauMultiplier} onChange={(v: number) => setInputs({ ...inputs, requiredTauMultiplier: Math.max(1, v) })} unit="×T" step="1" hint="Typically 5 for 99.3% charge" />
      </CollapsibleSection>

      <CollapsibleSection title="System Electrical" icon="⚡" defaultOpen={true}>
        <Field label="System Voltage" id="sv" value={inputs.systemVoltage} onChange={(v: number) => setInputs({ ...inputs, systemVoltage: v })} unit="V" step="1" />
        <Field label="System Capacitance" id="sc" value={inputs.systemCapacitance} onChange={(v: number) => setInputs({ ...inputs, systemCapacitance: v })} unit="F" step="0.0001" hint="Total bus capacitance" />
        <Field label="Series Resistance" id="sr" value={inputs.seriesResistance} onChange={(v: number) => setInputs({ ...inputs, seriesResistance: v })} unit="Ω" step="0.0001" hint="Internal/Contact resistance excluding precharge resistor" />
      </CollapsibleSection>

      {/* Tau Milestones */}
      <CollapsibleSection title="Tau Decay Constants" icon="📊" defaultOpen={false}>
        <div className="space-y-1 mt-1">
          {TAU_MILESTONES.map(m => (
            <div key={m.tau} className="flex items-center gap-2 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
              <span className="w-8 text-right font-bold text-black">{m.tau}T</span>
              <div className="flex-1 h-3 bg-gray-50 border border-gray-100 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-[#ffc812]/20" style={{ width: `${m.pct}%` }} />
                <div className="absolute inset-y-0 left-0 border-r border-[#ffc812]/50" style={{ width: `${m.pct}%` }} />
              </div>
              <span className="w-14 text-right text-gray-400 font-medium">{m.pct}%</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );

  const resultsPanel = (
    <div id="prechargecalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="Precharge Strategy Analysis" />
      <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 italic font-Lexend">
            Precharge resistor sizing and inrush current analysis for HV systems.
          </p>
        </div>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Precharge_Analysis.pdf" />
      </div>

      <div className="flex items-center gap-2">
        <div className="px-3 py-1 bg-black text-[#ffc812] border border-black shadow-sm">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-Michroma">
            τ = {result.tau.toFixed(4)} s
          </span>
        </div>
        <div className="px-3 py-1 bg-white border border-gray-200">
          <span className="text-[10px] tracking-wider text-gray-400 font-Michroma">
            WINDOW: {inputs.desiredPrechargeTime} s
          </span>
        </div>
      </div>

      {/* Key Results */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard label="Resistor Value" value={result.rPrecharge.toFixed(2)} unit="Ω" sub={`Total R: ${result.rTotal.toFixed(2)} Ω`} type="good" />
        <StatCard label="Max Inrush" value={result.maxInrushCurrent.toFixed(1)} unit="A" type={result.maxInrushCurrent > 50 ? "warn" : "normal"} sub="Peak at t=0" />
        <StatCard label="Total Energy" value={result.energyDissipation.toFixed(2)} unit="J" sub="Capacitor Energy" />
        <StatCard label="Avg Power" value={result.requiredResistorPower.toFixed(1)} unit="W" sub={`Peak: ${result.maxInrushPower.toFixed(0)} W`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <StatCard label="Residual Voltage" value={result.voltageRemaining.toFixed(2)} unit="V" sub={`Gap at contactor closure`} type={result.voltageRemaining > 10 ? "warn" : "normal"} />
        <StatCard
          label="Contactor Inrush"
          value={result.mainContactorInrush === Infinity ? "∞" : result.mainContactorInrush.toFixed(1)}
          unit="A"
          type={result.mainContactorInrush > 500 ? "danger" : "normal"}
          sub="At main contactor close"
        />
      </div>

      {/* Charging Curve Visualization */}
      <div className="border border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] uppercase text-[#ffc812] tracking-[0.2em] font-bold font-Michroma">Charging Response Curve</p>
          <div className="flex items-center gap-3 text-[8px] font-Michroma uppercase">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffc812]" /> Voltage</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-black" /> Current</span>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.timeSteps} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc812" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ffc812" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fontFamily: 'Michroma' }} label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fontSize: 8 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fontFamily: 'Michroma' }} label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fontSize: 8 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fontFamily: 'Michroma' }} label={{ value: 'Current (A)', angle: 90, position: 'insideRight', fontSize: 8 }} />
              <Tooltip labelStyle={{ fontSize: 10, fontFamily: 'Michroma' }} contentStyle={{ fontSize: 10, fontFamily: 'Lexend' }} />
              <Area yAxisId="left" type="monotone" dataKey="vCharged" name="Voltage" stroke="#ffc812" fillOpacity={1} fill="url(#colorV)" strokeWidth={3} />
              <Area yAxisId="right" type="monotone" dataKey="iCharging" name="Current" stroke="#000" fillOpacity={1} fill="url(#colorI)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Summary & Formulas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="border border-gray-200 overflow-hidden">
          <div className="bg-neutral-50 px-3 py-1.5 border-b border-gray-100 flex items-center justify-between font-Michroma">
              <span className="text-[9px] uppercase tracking-wider text-black font-bold">Step Data</span>
              <span className="text-[8px] text-gray-400 italic font-Lexend tracking-tighter">(Linear Sampling)</span>
          </div>
          <div className="max-h-[160px] overflow-y-auto">
            <table className="w-full text-left text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
              <thead className="bg-gray-50/50 sticky top-0 text-[8px] uppercase text-gray-400">
                <tr>
                  <th className="px-3 py-1.5">T (s)</th>
                  <th className="px-3 py-1.5 text-right">V Load</th>
                  <th className="px-3 py-1.5 text-right">% V</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {result.timeSteps.filter((_, i) => i % 2 === 0).map((step, i) => (
                  <tr key={i} className="hover:bg-gray-50/30">
                    <td className="px-3 py-1 font-bold text-gray-700">{step.t.toFixed(2)}</td>
                    <td className="px-3 py-1 text-right text-gray-500">{step.vCharged.toFixed(1)} V</td>
                    <td className="px-3 py-1 text-right font-black text-black">
                      {((step.vCharged / inputs.systemVoltage) * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-neutral-900 border border-black p-3 text-white">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#ffc812] font-bold font-Michroma mb-3">Model Physics</p>
          <div className="space-y-2 text-[10px] font-Lexend opacity-80 leading-relaxed italic">
            <p>τ = R × C <span className="text-[8px] opacity-40 ml-2">(Transient time constant)</span></p>
            <p>V(t) = V₀(1 − e<sup>−t/τ</sup>) <span className="text-[8px] opacity-40 ml-2">(Charging equation)</span></p>
            <p>E = ½CV² <span className="text-[8px] opacity-40 ml-2">(Stored energy in Joules)</span></p>
            <div className="pt-2 border-t border-white/10 mt-2 not-italic">
              <p className="text-[8px] text-[#ffc812] uppercase font-bold font-Michroma mb-1">Safety Note</p>
              <p className="text-[9px] leading-tight">Ensure resistor peak pulse energy rating exceeds {result.energyDissipation.toFixed(1)} J. Resistance should be verified for temperature coefficient.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
