// Precharge Resistor Rating Calculator
// RC circuit precharge design for high-voltage systems with capacitive loads
import { useState, useMemo } from "react";
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

  const Field = ({ label, value, onChange, unit, step = 1 }: any) => (
    <div className="w-full py-0.5">
      <label className="text-[8px] uppercase text-[#808080] tracking-wider block mb-0.5" style={{ fontFamily: "Michroma, sans-serif" }}>
        {label}
      </label>
      <div className="flex items-center border border-gray-200 focus-within:border-[#ffc812] transition-colors">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 text-[11px] outline-none"
          style={{ fontFamily: "Lexend, sans-serif" }}
        />
        {unit && <span className="text-[9px] text-gray-400 px-2 whitespace-nowrap" style={{ fontFamily: "Lexend, sans-serif" }}>{unit}</span>}
      </div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border border-gray-100 p-2 bg-gray-50/30">
      <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2 border-b border-gray-100 pb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );

  const StatCard = ({ label, value, unit, sub, warn }: any) => (
    <div className={`border p-2 bg-white ${warn ? "border-amber-400 bg-amber-50" : "border-gray-200"}`}>
      <p className="text-[8px] uppercase text-[#ffc812] tracking-wider">{label}</p>
      <p className="text-base font-black" style={{ fontFamily: "Michroma, sans-serif" }}>
        {value} <span className="text-xs font-medium text-gray-400">{unit}</span>
      </p>
      {sub && <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  // Calculate bar width for charging curve visualization
  const maxV = inputs.systemVoltage;
  const maxI = result.maxInrushCurrent;

  const inputsPanel = (
    <div className="space-y-3">
      <Section title="Precharge Parameters">
        <Field label="Desired Precharge Time" value={inputs.desiredPrechargeTime} onChange={(v: number) => setInputs({ ...inputs, desiredPrechargeTime: v })} unit="s" step={0.01} />
        <Field label="Required Tau Multiplier (xT)" value={inputs.requiredTauMultiplier} onChange={(v: number) => setInputs({ ...inputs, requiredTauMultiplier: Math.max(1, v) })} unit="×T" step={1} />
      </Section>

      <Section title="System Electrical">
        <Field label="System Voltage" value={inputs.systemVoltage} onChange={(v: number) => setInputs({ ...inputs, systemVoltage: v })} unit="V" step={1} />
        <Field label="System Capacitance" value={inputs.systemCapacitance} onChange={(v: number) => setInputs({ ...inputs, systemCapacitance: v })} unit="F" step={0.0001} />
        <Field label="Series Resistance (excl. precharge)" value={inputs.seriesResistance} onChange={(v: number) => setInputs({ ...inputs, seriesResistance: v })} unit="Ω" step={0.0001} />
      </Section>

      {/* Tau Milestones */}
      <Section title="Time Constant Reference">
        <div className="space-y-1">
          {TAU_MILESTONES.map(m => (
            <div key={m.tau} className="flex items-center gap-2 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
              <span className="w-8 text-right font-medium text-gray-700">{m.tau}T</span>
              <div className="flex-1 h-3 bg-gray-100 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-[#ffc812]/30" style={{ width: `${m.pct}%` }} />
              </div>
              <span className="w-14 text-right text-gray-500">{m.pct}% V</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );

  const resultsPanel = (
    <div id="prechargecalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="Precharge Resistor Calculator" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500 border-l-2 border-[#ffc812] pl-3 py-1 pdf-no-hide" style={{ fontFamily: "Lexend, sans-serif" }}>
          Precharge resistor sizing for high-voltage capacitive systems.
        </p>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Precharge_Report.pdf" />
      </div>

      {/* Tau Badge */}
      <div className="inline-flex gap-2">
        <div className="px-3 py-1 bg-[#ffc812]/10 border border-[#ffc812]/30">
          <span className="text-[10px] uppercase tracking-wider text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
            τ = {result.tau.toFixed(4)} s
          </span>
        </div>
        <div className="px-3 py-1 bg-gray-50 border border-gray-200">
          <span className="text-[10px] tracking-wider text-gray-600" style={{ fontFamily: "Michroma, sans-serif" }}>
            {inputs.requiredTauMultiplier}T = {inputs.desiredPrechargeTime} s
          </span>
        </div>
      </div>

      {/* Key Results */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Required Resistor" value={result.rPrecharge.toFixed(2)} unit="Ω" sub={`R_total = ${result.rTotal.toFixed(2)} Ω`} />
        <StatCard label="Max Inrush Current" value={result.maxInrushCurrent.toFixed(2)} unit="A" />
        <StatCard label="Energy Dissipation" value={result.energyDissipation.toFixed(2)} unit="J" sub={`In precharge: ${result.energyForPrechargeTime.toFixed(2)} J`} />
        <StatCard label="Resistor Power Rating" value={result.requiredResistorPower.toFixed(2)} unit="W" sub={`Max inrush: ${result.maxInrushPower.toFixed(1)} W`} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Voltage Remaining" value={result.voltageRemaining.toFixed(4)} unit="V" sub={`After ${inputs.desiredPrechargeTime}s precharge`} />
        <StatCard
          label="Contactor Inrush"
          value={result.mainContactorInrush === Infinity ? "∞" : result.mainContactorInrush.toFixed(1)}
          unit="A"
          warn={result.mainContactorInrush > 1000}
          sub="At main contactor close"
        />
      </div>

      {/* Charging Curve Visualization */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Charging Curve
        </p>
        <div className="space-y-0.5">
          {result.timeSteps.map((step, i) => {
            const vPct = maxV > 0 ? (step.vCharged / maxV) * 100 : 0;
            const iPct = maxI > 0 ? (step.iCharging / maxI) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-1 text-[9px]" style={{ fontFamily: "Lexend, sans-serif" }}>
                <span className="w-10 text-right text-gray-400 shrink-0">{step.t.toFixed(2)}s</span>
                <div className="flex-1 h-3 bg-gray-100 relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-y-0 left-0 bg-blue-400/60" style={{ width: `${vPct}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-amber-400/80" style={{ width: `${iPct}%`, height: "40%", top: "60%" }} />
                </div>
                <span className="w-16 text-right text-blue-600 shrink-0">{step.vCharged.toFixed(1)}V</span>
                <span className="w-12 text-right text-amber-600 shrink-0">{step.iCharging.toFixed(2)}A</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2 text-[8px] text-gray-400" style={{ fontFamily: "Michroma, sans-serif" }}>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-blue-400/60 inline-block" /> Voltage</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-amber-400/80 inline-block" /> Current</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Precharge Data
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]" style={{ fontFamily: "Lexend, sans-serif" }}>
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-1 text-gray-500 font-medium">Time (s)</th>
                <th className="text-right py-1 text-gray-500 font-medium">Charged V</th>
                <th className="text-right py-1 text-gray-500 font-medium">Current (A)</th>
                <th className="text-right py-1 text-gray-500 font-medium">% Charged</th>
              </tr>
            </thead>
            <tbody>
              {result.timeSteps.map((step, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-0.5 text-gray-700">{step.t.toFixed(2)}</td>
                  <td className="py-0.5 text-right text-gray-700">{step.vCharged.toFixed(2)}</td>
                  <td className="py-0.5 text-right text-gray-700">{step.iCharging.toFixed(2)}</td>
                  <td className="py-0.5 text-right text-gray-700">{maxV > 0 ? ((step.vCharged / maxV) * 100).toFixed(1) : "0"}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulas */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Formula Reference
        </p>
        <div className="space-y-1 text-[10px] text-gray-600" style={{ fontFamily: "Lexend, sans-serif" }}>
          <p>τ = R × C</p>
          <p>V<sub>c</sub>(t) = V<sub>s</sub> × (1 − e<sup>−t/RC</sup>)</p>
          <p>I(t) = (V<sub>s</sub> − V<sub>c</sub>(t)) / R</p>
          <p>E = ½ × C × V²</p>
          <p>5T ≈ 99.3% fully charged (best practice)</p>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
