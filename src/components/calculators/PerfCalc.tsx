// src/components/calculators/PerfCalc.tsx
// Full aircraft performance calculator
// Calculates power required, drag polar, range (Breguet), endurance and climb curves

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface Warning { level: "warn" | "danger"; message: string; }

interface PerfCalcInput {
  // Aircraft
  modelWeightG: number;
  wingAreaDm2: number;
  wingspanCm: number;
  aspectRatio: number;
  oswaldEfficiency: number;
  cdo: number; // Zero-lift drag coefficient

  // Propulsion
  motorMaxPowerW: number;
  propEfficiency: number;
  batteryCapacityMah: number;
  batteryCells: number;
  batteryMaxDischarge: number;

  // Environment
  elevationM: number;
  temperatureC: number;

  // Performance factors
  liftCoeffMax: number; // CLmax
  liftCoeffCruise: number; // CL for cruise
}

interface PerfCalcResult {
  // Drag polar
  cdo: number;
  k: number; // induced drag factor
  ldMax: number; // max L/D ratio
  ldMaxSpeed: number; // speed at max L/D

  // Speeds
  stallSpeedKph: number;
  minPowerSpeedKph: number;
  bestClimbSpeedKph: number;
  bestRangeSpeedKph: number;
  bestEnduranceSpeedKph: number;

  // Performance
  maxSpeedKph: number;
  maxClimbRateMs: number;
  maxRangeKm: number;
  maxEnduranceMin: number;

  // Power
  minPowerRequiredW: number;
  maxAvailablePowerW: number;
}

const DEFAULTS: PerfCalcInput = {
  modelWeightG: 2500,
  wingAreaDm2: 50,
  wingspanCm: 180,
  aspectRatio: 6.5,
  oswaldEfficiency: 0.85,
  cdo: 0.032,
  motorMaxPowerW: 800,
  propEfficiency: 0.80,
  batteryCapacityMah: 5000,
  batteryCells: 6,
  batteryMaxDischarge: 0.80,
  elevationM: 0,
  temperatureC: 25,
  liftCoeffMax: 1.2,
  liftCoeffCruise: 0.5,
};

function deriveWarnings(result: PerfCalcResult, inputs: PerfCalcInput): Warning[] {
  const w: Warning[] = [];

  // L/D ratio
  if (result.ldMax < 8) w.push({ level: "warn", message: `Max L/D ${result.ldMax.toFixed(1)} — low, expect high power consumption.` });
  if (result.ldMax > 20) w.push({ level: "warn", message: `Max L/D ${result.ldMax.toFixed(1)} — very high, verify drag estimates.` });

  // Wing loading
  const wingLoading = inputs.modelWeightG / inputs.wingAreaDm2;
  if (wingLoading > 80) w.push({ level: "warn", message: `Wing loading ${wingLoading.toFixed(0)} g/dm² — high, fast landing speed expected.` });
  if (wingLoading < 20) w.push({ level: "warn", message: `Wing loading ${wingLoading.toFixed(0)} g/dm² — very light, sensitive to wind.` });

  // Range
  if (result.maxRangeKm < 5) w.push({ level: "warn", message: `Range ${result.maxRangeKm.toFixed(1)} km — short, consider larger battery.` });

  // Stall speed
  if (result.stallSpeedKph > 60) w.push({ level: "danger", message: `Stall speed ${result.stallSpeedKph.toFixed(0)} km/h — very high landing speed.` });
  else if (result.stallSpeedKph > 45) w.push({ level: "warn", message: `Stall speed ${result.stallSpeedKph.toFixed(0)} km/h — high, long runway needed.` });

  return w;
}

function calculatePerf(input: PerfCalcInput): PerfCalcResult {
  // Air density
  const T = input.temperatureC + 273.15;
  const P = 101325 * Math.pow(1 - 2.25577e-5 * input.elevationM, 5.25588);
  const rho = P / (287.05 * T); // kg/m³

  // Geometry conversions
  const weightKg = input.modelWeightG / 1000;
  const weightN = weightKg * 9.81;
  const wingAreaM2 = input.wingAreaDm2 / 100;

  // Drag polar
  const k = 1 / (Math.PI * input.aspectRatio * input.oswaldEfficiency);
  const cdo = input.cdo;
  const ldMax = 0.5 / Math.sqrt(cdo * k);

  // Stall speed
  const stallSpeedMs = Math.sqrt((2 * weightN) / (rho * wingAreaM2 * input.liftCoeffMax));
  const stallSpeedKph = stallSpeedMs * 3.6;

  // Speed for max L/D
  const ldMaxSpeedMs = Math.sqrt((2 * weightN) / (rho * wingAreaM2) * Math.sqrt(k / cdo));
  const ldMaxSpeedKph = ldMaxSpeedMs * 3.6;

  // Minimum power speed (for max endurance)
  const minPowerSpeedMs = Math.sqrt((2 * weightN) / (rho * wingAreaM2) * Math.sqrt(k / (3 * cdo)));
  const minPowerSpeedKph = minPowerSpeedMs * 3.6;

  // Best range speed (max L/D)
  const bestRangeSpeedMs = ldMaxSpeedMs;
  const bestRangeSpeedKph = bestRangeSpeedMs * 3.6;

  // Carson speed (best compromise between range and speed)
  const carsonSpeedMs = ldMaxSpeedMs * 1.316; // 4th root of 3 ≈ 1.316
  // We use Carson speed for the 'best endurance speed' UI slot or we'll just redefine it:
  const bestEnduranceSpeedKph = carsonSpeedMs * 3.6; // We'll map "Carson Speed" to this UI field if needed, or keep minPower speed for Endurance.

  // Power required curve (find minimum)
  // P_req = (D * V) / propEfficiency
  // D = 0.5 * rho * V² * S * (cdo + k * CL²)
  // CL = 2 * W / (rho * V² * S)

  let minPowerRequiredW = Infinity;
  let bestClimbSpeedMs = 0;

  for (let v = stallSpeedMs * 1.1; v < 100; v += 0.5) {
    const CL = (2 * weightN) / (rho * wingAreaM2 * v * v);
    const CD = cdo + k * CL * CL;
    const dragN = 0.5 * rho * v * v * wingAreaM2 * CD;
    const powerRequiredW = (dragN * v) / input.propEfficiency;

    if (powerRequiredW < minPowerRequiredW) {
      minPowerRequiredW = powerRequiredW;
      bestClimbSpeedMs = v;
    }
  }

  const bestClimbSpeedKph = bestClimbSpeedMs * 3.6;

  // Max speed (where power required = power available)
  const maxAvailablePowerW = input.motorMaxPowerW * input.propEfficiency;

  // Solve for max speed iteratively
  let maxSpeedMs = bestClimbSpeedMs;
  // Dynamic available power estimate: prop efficiency usually drops near top speed.
  // We will assume a linearly decreasing power available to model a fixed-pitch prop drop-off:
  // P_avail(V) = maxPower * eff * (1 - (V/200)^2) just as a rough dynamic model if we lack pitch.
  // Actually, formulas.md says: P_dynamic(V_max) = P_required(V_max)
  // We will use a standard prop degradation model:
  for (let v = bestClimbSpeedMs; v < 150; v += 0.5) {
    const CL = (2 * weightN) / (rho * wingAreaM2 * v * v);
    const CD = cdo + k * CL * CL;
    const dragN = 0.5 * rho * v * v * wingAreaM2 * CD;
    const powerRequiredW = dragN * v;

    // Use input.propEfficiency as baseline, degrading slightly at high speeds
    const dynamicAvailW = input.motorMaxPowerW * input.propEfficiency * Math.max(0.5, 1 - Math.pow(v / 100, 2));

    if (powerRequiredW >= dynamicAvailW) {
      maxSpeedMs = v;
      break;
    }
  }
  const maxSpeedKph = maxSpeedMs * 3.6;

  // Max climb rate
  const excessPowerW = maxAvailablePowerW - minPowerRequiredW;
  const maxClimbRateMs = excessPowerW / weightN;

  // Range (Breguet range equation for electric)
  // Range = (η / g) * (L/D) * (E / m)
  // E = battery energy in Wh, m = mass in kg
  const batteryEnergyWh = input.batteryCells * 3.7 * input.batteryCapacityMah / 1000;
  const usableEnergyWh = batteryEnergyWh * input.batteryMaxDischarge;

  // Best range L/D (at sqrt(3) * V_ldMax for props)
  const bestRangeLD = ldMax * 0.87;
  const maxRangeKm = (input.propEfficiency / 9.81) * bestRangeLD * (usableEnergyWh * 3600 / weightKg) / 1000;

  // Endurance (time aloft)
  // E = (η / g) * (CL^1.5 / CD) * sqrt(2S/rho) * (1/sqrt(W)) * energy
  const maxEnduranceMin = (input.propEfficiency * usableEnergyWh * 60) / minPowerRequiredW;

  return {
    cdo,
    k,
    ldMax,
    ldMaxSpeed: ldMaxSpeedKph,
    stallSpeedKph,
    minPowerSpeedKph,
    bestClimbSpeedKph,
    bestRangeSpeedKph,
    bestEnduranceSpeedKph,
    maxSpeedKph,
    maxClimbRateMs,
    maxRangeKm,
    maxEnduranceMin,
    minPowerRequiredW,
    maxAvailablePowerW,
  };
}

export default function PerfCalcPanel() {
  const [inputs, setInputs] = useState<PerfCalcInput>(DEFAULTS);

  const result = useMemo(() => calculatePerf(inputs), [inputs]);
  const warnings = useMemo(() => deriveWarnings(result, inputs), [result, inputs]);

  // Drag polar curve
  const dragPolarData = useMemo(() => {
    const data = [];
    const rho = 1.225;
    const weightN = inputs.modelWeightG / 1000 * 9.81;
    const wingAreaM2 = inputs.wingAreaDm2 / 100;

    for (let CL = 0; CL <= inputs.liftCoeffMax * 1.2; CL += 0.05) {
      const CD = result.cdo + result.k * CL * CL;
      const LD = CL > 0 ? CL / CD : 0;

      // Speed for this CL
      const V = Math.sqrt((2 * weightN) / (rho * wingAreaM2 * CL));
      const speedKph = V * 3.6;

      // Power required
      const dragN = 0.5 * rho * V * V * wingAreaM2 * CD;
      const powerW = (dragN * V) / inputs.propEfficiency;

      data.push({
        cl: CL,
        cd: CD,
        ld: LD,
        speed: speedKph,
        power: powerW,
      });
    }
    return data;
  }, [result, inputs]);

  // Power curve
  const powerCurveData = useMemo(() => {
    const data = [];
    const rho = 1.225;
    const weightN = inputs.modelWeightG / 1000 * 9.81;
    const wingAreaM2 = inputs.wingAreaDm2 / 100;

    const stallSpeedMs = Math.sqrt((2 * weightN) / (rho * wingAreaM2 * inputs.liftCoeffMax));

    for (let v = stallSpeedMs * 1.1; v <= result.maxSpeedKph / 3.6 * 1.1; v += 2) {
      const CL = (2 * weightN) / (rho * wingAreaM2 * v * v);
      const CD = result.cdo + result.k * CL * CL;
      const dragN = 0.5 * rho * v * v * wingAreaM2 * CD;
      const powerRequiredW = (dragN * v) / inputs.propEfficiency;

      // Rate of climb at this speed
      const excessPowerW = result.maxAvailablePowerW - powerRequiredW;
      const rocMs = excessPowerW > 0 ? excessPowerW / weightN : 0;

      data.push({
        speed: v * 3.6,
        powerReq: powerRequiredW,
        powerAvail: result.maxAvailablePowerW,
        roc: rocMs * 60, // m/min
      });
    }
    return data;
  }, [result, inputs]);

  const updateInput = (key: keyof PerfCalcInput, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const Field = ({ label, value, onChange, step = 1, min, max, unit, hint }: any) => (
    <div className="w-full py-0.5">
      <label className="text-[8px] uppercase text-[#808080] tracking-wider block mb-0.5" style={{ fontFamily: "Michroma, sans-serif" }} title={hint || label}>{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e: any) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className="flex-1 w-full min-w-0 border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:border-[#ffc812]"
          style={{ fontFamily: "Michroma, sans-serif" }}
        />
        {unit && <span className="text-[10px] text-gray-400 w-6 flex-shrink-0">{unit}</span>}
      </div>
    </div>
  );

  const Section = ({ title, children }: any) => (
    <div className="border border-gray-100 mb-4">
      <div className="bg-black px-3 py-1.5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
          {title}
        </p>
      </div>
      <div className="p-2 space-y-0.5">{children}</div>
    </div>
  );

  const StatCard = ({ label, value, unit, sub, warn }: any) => (
    <div className={`border p-3 ${warn ? "border-amber-300 bg-amber-50" : "border-gray-100"}`}>
      <p className="text-[8px] uppercase text-[#ffc812] tracking-wider">{label}</p>
      <p className="text-lg font-black" style={{ fontFamily: "Michroma, sans-serif" }}>
        {value} <span className="text-sm font-medium text-gray-400">{unit}</span>
      </p>
      {sub && <p className="text-[9px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  const inputsPanel = (
    <div className="space-y-3">
      <Section title="Aircraft Geometry">
        <Field label="Weight" value={inputs.modelWeightG} onChange={(v: number) => updateInput("modelWeightG", v)} step={50} unit="g" />
        <Field label="Wing Area" value={inputs.wingAreaDm2} onChange={(v: number) => updateInput("wingAreaDm2", v)} step={0.5} unit="dm²" />
        <Field label="Wingspan" value={inputs.wingspanCm} onChange={(v: number) => updateInput("wingspanCm", v)} step={1} unit="cm" />
        <Field label="Aspect Ratio" value={inputs.aspectRatio} onChange={(v: number) => updateInput("aspectRatio", v)} step={0.1} min={3} max={30} unit="AR" />
        <Field label="Oswald Eff" value={inputs.oswaldEfficiency} onChange={(v: number) => updateInput("oswaldEfficiency", v)} step={0.01} min={0.6} max={0.95} unit="e" />
        <Field label="Cdo" value={inputs.cdo} onChange={(v: number) => updateInput("cdo", v)} step={0.001} min={0.01} max={0.1} unit="Cd" />
      </Section>

      <Section title="Propulsion">
        <Field label="Motor Power" value={inputs.motorMaxPowerW} onChange={(v: number) => updateInput("motorMaxPowerW", v)} step={10} unit="W" />
        <Field label="Prop Eff" value={inputs.propEfficiency * 100} onChange={(v: number) => updateInput("propEfficiency", v / 100)} step={1} min={50} max={90} unit="%" />
        <Field label="Battery" value={inputs.batteryCapacityMah} onChange={(v: number) => updateInput("batteryCapacityMah", v)} step={100} unit="mAh" />
        <Field label="Cells" value={inputs.batteryCells} onChange={(v: number) => updateInput("batteryCells", v)} step={1} min={1} max={14} unit="S" />
        <Field label="Max Disch" value={inputs.batteryMaxDischarge * 100} onChange={(v: number) => updateInput("batteryMaxDischarge", v / 100)} step={5} min={50} max={100} unit="%" />
      </Section>

      <Section title="Aerodynamics">
        <Field label="CL Max" value={inputs.liftCoeffMax} onChange={(v: number) => updateInput("liftCoeffMax", v)} step={0.05} min={0.8} max={2.0} unit="CL" />
        <Field label="CL Cruise" value={inputs.liftCoeffCruise} onChange={(v: number) => updateInput("liftCoeffCruise", v)} step={0.05} min={0.2} max={1.0} unit="CL" />
      </Section>
    </div>
  );

  const resultsPanel = (
    <div id="perfcalc-report-area" className="relative space-y-4">
      <PdfTemplateHeader calculatorName="Aircraft Performance" />
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {warnings.map((w, i) => (
            <div key={i} className={`px-3 py-1.5 border-l-2 text-[10px] ${w.level === "danger" ? "border-red-500 bg-red-50 text-red-700" : "border-amber-400 bg-amber-50 text-amber-700"}`}
                 style={{ fontFamily: "Lexend, sans-serif" }}>{w.message}</div>
          ))}
        </div>
      )}

      {/* ── Results Summary ── */}
      <div className="flex items-center justify-between mb-3 border-t border-gray-100 pt-4">
        <h3 className="text-xs uppercase font-bold tracking-widest pdf-no-hide" style={{ fontFamily: "Michroma, sans-serif" }}>Results Summary</h3>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Perf_Report.pdf" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Max L/D" value={result.ldMax.toFixed(1)} unit=":1" />
        <StatCard label="Stall Speed" value={result.stallSpeedKph.toFixed(0)} unit="km/h" warn={result.stallSpeedKph > 45} />
        <StatCard label="Max Speed" value={result.maxSpeedKph.toFixed(0)} unit="km/h" />
        <StatCard label="Best Range" value={result.bestRangeSpeedKph.toFixed(0)} unit="km/h" />
        <StatCard label="Max Range" value={result.maxRangeKm.toFixed(1)} unit="km" />
        <StatCard label="Endurance" value={result.maxEnduranceMin.toFixed(0)} unit="min" />
        <StatCard label="Climb Rate" value={result.maxClimbRateMs.toFixed(1)} unit="m/s" />
        <StatCard label="Min Power" value={(result.minPowerRequiredW / 1000).toFixed(2)} unit="kW" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
              Drag Polar & L/D Curve
            </p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dragPolarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="cl" tick={{ fontSize: 9 }} name="CL" />
                <YAxis yAxisId="left" tick={{ fontSize: 9 }} name="CD" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} name="L/D" />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line yAxisId="left" type="monotone" dataKey="cd" stroke="#ef4444" strokeWidth={2} name="Drag (CD)" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="ld" stroke="#22c55e" strokeWidth={2} name="L/D Ratio" dot={false} />
                <ReferenceLine x={Math.sqrt(inputs.cdo / result.k)} stroke="#ffc812" strokeDasharray="3 3" label="Max L/D" yAxisId="right" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
              Power Required & Rate of Climb
            </p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={powerCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="speed" tick={{ fontSize: 9 }} unit="km/h" />
                <YAxis yAxisId="left" tick={{ fontSize: 9 }} unit="W" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} unit="m/min" />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line yAxisId="left" type="monotone" dataKey="powerReq" stroke="#3b82f6" strokeWidth={2} name="Power Required" dot={false} />
                <Line yAxisId="left" type="step" dataKey="powerAvail" stroke="#22c55e" strokeWidth={2} strokeDasharray="3 3" name="Power Available" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="roc" stroke="#ef4444" strokeWidth={2} name="Rate of Climb" dot={false} />
                <ReferenceLine x={result.bestClimbSpeedKph} stroke="#ffc812" strokeDasharray="3 3" label="Best Climb" yAxisId="left" />
                <ReferenceLine x={result.minPowerSpeedKph} stroke="#9ca3af" strokeDasharray="3 3" label="Min Power" yAxisId="left" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Detail Tables ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>Characteristic Speeds</p>
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Stall Speed</span><span className="font-bold">{result.stallSpeedKph.toFixed(0)} km/h</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Min Power Speed</span><span className="font-bold">{result.minPowerSpeedKph.toFixed(0)} km/h</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Best Climb</span><span className="font-bold">{result.bestClimbSpeedKph.toFixed(0)} km/h</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Best Range</span><span className="font-bold">{result.bestRangeSpeedKph.toFixed(0)} km/h</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Best Endurance</span><span className="font-bold">{result.bestEnduranceSpeedKph.toFixed(0)} km/h</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Max L/D Speed</span><span className="font-bold">{result.ldMaxSpeed.toFixed(0)} km/h</span></div>
          </div>
        </div>

        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>Drag Polar Parameters</p>
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Zero-lift Drag (Cdo)</span><span className="font-bold">{result.cdo.toFixed(3)}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Induced Drag (k)</span><span className="font-bold">{result.k.toFixed(4)}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Max L/D Ratio</span><span className="font-bold">{result.ldMax.toFixed(1)}:1</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Min Power Required</span><span className="font-bold">{result.minPowerRequiredW.toFixed(0)} W</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Max Power Available</span><span className="font-bold">{result.maxAvailablePowerW.toFixed(0)} W</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Excess Power</span><span className="font-bold">{(result.maxAvailablePowerW - result.minPowerRequiredW).toFixed(0)} W</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
