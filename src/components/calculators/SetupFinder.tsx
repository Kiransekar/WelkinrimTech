// src/components/calculators/SetupFinder.tsx
// SetupFinder - Propeller matcher/sizer (inspired by ecalc.ch setupFinder)
// Finds optimal propeller for given motor/aircraft constraints

import { useState, useMemo } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { calcProp, PropCalcInput, PropCalcResult } from "@/lib/calculators/propCalc";
import { PROPELLERS, Propeller } from "@/data/propellers";
import { getPresetById, useMotorPresets } from "@/hooks/useMotorPresets";

interface Warning { level: "warn" | "danger"; message: string }

const DEFAULTS = {
  modelWeightG: 1500,
  numMotors: 1,
  elevationM: 0,
  temperatureC: 20,
  pressureHpa: 1013,
  batteryCells: 6,
  batteryCapacityMah: 5000,
  batteryMaxDischarge: 0.75,
  batteryResistanceMohm: 10,
  motorKv: 380,
  motorIo: 1.2,
  motorRmMohm: 35,
  motorMaxPowerW: 800,
  targetThrustG: 2500,
  minFlightTimeMin: 10,
  maxThrottleHover: 55,
};

function Field({
  label, id, value, onChange, step = "any", hint, className = "",
}: {
  label: string; id: string; value: number;
  onChange: (v: number) => void; step?: string; hint?: string; className?: string;
}) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className={`flex flex-col gap-0.5 relative ${className}`}>
      <div className="flex items-center gap-1">
        <label className="text-[9px] tracking-widest uppercase text-[#808080]"
               style={{ fontFamily: "Michroma, sans-serif" }} htmlFor={id}>
          {label}
        </label>
        {hint && (
          <button
            type="button"
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
            className="w-3 h-3 rounded-full bg-gray-200 text-[7px] text-gray-500 flex items-center justify-center flex-shrink-0 hover:bg-[#ffc914] hover:text-black transition-colors"
          >?</button>
        )}
      </div>
      {showHint && hint && (
        <div className="absolute top-5 left-0 z-50 bg-black text-[#ffc914] text-[9px] px-2 py-1.5 w-48 leading-relaxed"
             style={{ fontFamily: "Lexend, sans-serif" }}>
          {hint}
        </div>
      )}
      <input
        id={id} type="number" step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc914] transition-colors bg-white"
        style={{ fontFamily: "Michroma, sans-serif" }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 mb-3">
      <div className="bg-black px-3 py-1.5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
           style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

interface PropResult {
  prop: Propeller;
  result: PropCalcResult;
  score: number;
  warnings: Warning[];
  thrustG: number;
  throttleHover: number;
  flightTimeMin: number;
  efficiency: number;
}

function deriveWarnings(result: PropCalcResult, inputs: PropCalcInput): Warning[] {
  const w: Warning[] = [];
  const Rth = 8;
  const motorLossW = result.motorMaximum.electricPowerW * (1 - result.motorMaximum.efficiencyPercent / 100);
  const correctedTempC = inputs.temperatureC + Rth * motorLossW;

  if (correctedTempC > 150) w.push({ level: "danger", message: `Motor temp ~${correctedTempC.toFixed(0)}°C — exceeds 150°C limit.` });
  else if (correctedTempC > 110) w.push({ level: "warn", message: `Motor temp ~${correctedTempC.toFixed(0)}°C — approaching thermal limit.` });

  if (result.battery.flightTimeMin < 3) w.push({ level: "danger", message: `Flight time ${result.battery.flightTimeMin.toFixed(1)} min — critically short.` });
  else if (result.battery.flightTimeMin < 6) w.push({ level: "warn", message: `Flight time ${result.battery.flightTimeMin.toFixed(1)} min — short.` });

  const twr = result.totalDrive.thrustWeightRatio;
  if (twr < 0.5) w.push({ level: "danger", message: `TWR ${twr.toFixed(2)}:1 — need ≥1.5.` });
  else if (twr < 1.0) w.push({ level: "warn", message: `TWR ${twr.toFixed(2)}:1 — aim for ≥2.0.` });

  return w;
}

export default function SetupFinder() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [propFilter, setPropFilter] = useState({ min: 10, max: 30 });
  const presets = useMotorPresets();

  const set = (key: keyof typeof DEFAULTS) => (v: number) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  const applyPreset = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;
    setInputs(prev => ({
      ...prev,
      motorKv: preset.kv,
      batteryCells: preset.recommendedVoltage,
      motorMaxPowerW: preset.peakCurrent * preset.recommendedVoltage * 3.7,
      motorIo: preset.estimatedIo,
      motorRmMohm: preset.estimatedRmMohm,
    }));
    setSelectedPreset(presetId);
  };

  // Calculate for all props in range
  const propResults: PropResult[] = useMemo(() => {
    const baseInputs: PropCalcInput = {
      modelWeightG: inputs.modelWeightG,
      numMotors: inputs.numMotors,
      wingAreaDm2: 50,
      dragCoefficient: 0.06,
      elevationM: inputs.elevationM,
      temperatureC: inputs.temperatureC,
      pressureHpa: inputs.pressureHpa,
      batteryCells: inputs.batteryCells,
      batteryCapacityMah: inputs.batteryCapacityMah,
      batteryMaxDischarge: inputs.batteryMaxDischarge,
      batteryResistanceMohm: inputs.batteryResistanceMohm,
      motorKv: inputs.motorKv,
      motorIo: inputs.motorIo,
      motorRmMohm: inputs.motorRmMohm,
      motorMaxPowerW: inputs.motorMaxPowerW,
      propDiameterInch: 10,
      propPitchInch: 4.7,
      propBlades: 2,
      pconst: 1.2,
      tconst: 1.0,
      ct: 0.11,
      cp: 0.045,
    };

    const results: PropResult[] = [];
    const candidates = PROPELLERS.filter(p =>
      p.diameterInch >= propFilter.min &&
      p.diameterInch <= propFilter.max &&
      (p.application === "airplane" || p.application === "both")
    );

    for (const prop of candidates) {
      const testInputs = {
        ...baseInputs,
        propDiameterInch: prop.diameterInch,
        propPitchInch: prop.pitchInch,
        propBlades: prop.blades,
        ct: prop.ct,
        cp: prop.cp,
      };

      try {
        const result = calcProp(testInputs);
        const warnings = deriveWarnings(result, testInputs);
        const dangerCount = warnings.filter(w => w.level === "danger").length;

        // Scoring: higher is better
        let score = 100;
        score -= dangerCount * 30;
        score -= warnings.filter(w => w.level === "warn").length * 10;

        // Thrust target bonus
        const thrustRatio = result.propeller.staticThrustG / inputs.targetThrustG;
        if (thrustRatio >= 0.9 && thrustRatio <= 1.5) score += 20;
        else if (thrustRatio < 0.9) score -= (0.9 - thrustRatio) * 50;
        else score -= 10;

        // Flight time bonus
        if (result.battery.flightTimeMin >= inputs.minFlightTimeMin) score += 15;
        else score -= (inputs.minFlightTimeMin - result.battery.flightTimeMin) * 3;

        // Hover throttle bonus (want 40-60%)
        const hoverThrottle = result.motorOptimum.efficiencyPercent > 0
          ? (testInputs.modelWeightG / result.propeller.staticThrustG) * 100
          : 100;
        if (hoverThrottle >= 35 && hoverThrottle <= inputs.maxThrottleHover) score += 15;
        else if (hoverThrottle > inputs.maxThrottleHover) score -= (hoverThrottle - inputs.maxThrottleHover) * 2;

        // Efficiency bonus
        score += result.motorMaximum.efficiencyPercent * 0.3;

        results.push({
          prop,
          result,
          score: Math.max(0, score),
          warnings,
          thrustG: result.propeller.staticThrustG,
          throttleHover: hoverThrottle,
          flightTimeMin: result.battery.flightTimeMin,
          efficiency: result.motorMaximum.efficiencyPercent,
        });
      } catch (e) {
        // Skip props that fail calculation
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }, [inputs, propFilter]);

  // Chart data
  const scatterData = useMemo(() => propResults.slice(0, 50).map(r => ({
    x: r.thrustG,
    y: r.flightTimeMin,
    z: r.score,
    name: `${r.prop.brand} ${r.prop.model}`,
    efficiency: r.efficiency,
  })), [propResults]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Inputs */}
      <div className="lg:w-80 xl:w-96 flex-shrink-0">
        <Section title="Motor Preset">
          <div className="col-span-2">
            <select
              value={selectedPreset}
              onChange={e => applyPreset(e.target.value)}
              className="w-full border-2 border-[#ffc914]/40 text-[12px] px-3 py-2 focus:outline-none focus:border-[#ffc914] transition-colors bg-[#fffbe6] font-medium"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              <option value="">-- Select Haemng Motor --</option>
              {presets.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.kv}KV, {p.recommendedVoltage}S)</option>
              ))}
            </select>
          </div>
        </Section>

        <Section title="Aircraft">
          <Field label="Weight (g)" id="mw" value={inputs.modelWeightG} onChange={set("modelWeightG")}
                 hint="Total aircraft weight including battery" />
          <Field label="# Motors" id="nm" value={inputs.numMotors} onChange={set("numMotors")} step="1" />
        </Section>

        <Section title="Environment">
          <Field label="Elevation (m)" id="el" value={inputs.elevationM} onChange={set("elevationM")} />
          <Field label="Temp (°C)" id="tc" value={inputs.temperatureC} onChange={set("temperatureC")} />
          <Field label="Pressure (hPa)" id="ph" value={inputs.pressureHpa} onChange={set("pressureHpa")} className="col-span-2" />
        </Section>

        <Section title="Battery">
          <Field label="Cells (S)" id="bc" value={inputs.batteryCells} onChange={set("batteryCells")} step="1" />
          <Field label="Capacity (mAh)" id="bm" value={inputs.batteryCapacityMah} onChange={set("batteryCapacityMah")} step="100" />
          <Field label="Max Disch (%)" id="bd" value={inputs.batteryMaxDischarge * 100} onChange={v => set("batteryMaxDischarge")(v / 100)} />
          <Field label="Resist (mΩ)" id="br" value={inputs.batteryResistanceMohm} onChange={set("batteryResistanceMohm")} />
        </Section>

        <Section title="Motor">
          <Field label="KV (rpm/V)" id="kv" value={inputs.motorKv} onChange={set("motorKv")} step="1" />
          <Field label="Io (A)" id="io" value={inputs.motorIo} onChange={set("motorIo")} step="0.1" />
          <Field label="Rm (mΩ)" id="rm" value={inputs.motorRmMohm} onChange={set("motorRmMohm")} />
          <Field label="Max Power (W)" id="mp" value={inputs.motorMaxPowerW} onChange={set("motorMaxPowerW")} />
        </Section>

        <Section title="Targets">
          <Field label="Target Thrust (g)" id="tt" value={inputs.targetThrustG} onChange={set("targetThrustG")}
                 hint="Desired static thrust for your aircraft" />
          <Field label="Min Flight Time (min)" id="mft" value={inputs.minFlightTimeMin} onChange={set("minFlightTimeMin")} />
          <Field label="Max Hover Throttle (%)" id="mht" value={inputs.maxThrottleHover} onChange={set("maxThrottleHover")}
                 hint="Maximum throttle for stable hover" />
          <Field label="Prop Min (inch)" id="pmin" value={propFilter.min} onChange={v => setPropFilter(prev => ({...prev, min: v}))} step="1" />
          <Field label="Prop Max (inch)" id="pmax" value={propFilter.max} onChange={v => setPropFilter(prev => ({...prev, max: v}))} step="1" />
        </Section>
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0">
        <div className="border border-gray-100 p-4 mb-5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914] mb-4"
             style={{ fontFamily: "Michroma, sans-serif" }}>
            Top Propeller Matches ({propResults.length} tested)
          </p>

          {propResults.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No props match your criteria. Adjust prop range or inputs.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {propResults.slice(0, 9).map((r, i) => (
                <div key={r.prop.id} className={`border-2 rounded-lg p-3 ${i === 0 ? 'border-[#ffc914] bg-[#fffbe6]' : 'border-gray-200'}`}>
                  {i === 0 && (
                    <div className="text-[8px] tracking-widest uppercase text-[#ffc914] mb-1 font-bold"
                         style={{ fontFamily: "Michroma, sans-serif" }}>★ Best Match</div>
                  )}
                  <p className="text-sm font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>
                    {r.prop.brand} {r.prop.model}
                  </p>
                  <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: "Lexend, sans-serif" }}>
                    {r.prop.diameterInch}×{r.prop.pitchInch} {r.prop.blades} blades
                  </div>
                  <div className="mt-2 space-y-1 text-xs" style={{ fontFamily: "Michroma, sans-serif" }}>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Thrust:</span>
                      <span className="font-bold">{r.thrustG.toFixed(0)} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Flight Time:</span>
                      <span className="font-bold">{r.flightTimeMin.toFixed(1)} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Efficiency:</span>
                      <span className="font-bold">{r.efficiency.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Score:</span>
                      <span className="font-bold text-[#ffc914]">{r.score.toFixed(0)}</span>
                    </div>
                  </div>
                  {r.warnings.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {r.warnings.slice(0, 2).map((w, wi) => (
                        <p key={wi} className={`text-[9px] ${w.level === "danger" ? "text-red-500" : "text-amber-500"}`}
                           style={{ fontFamily: "Lexend, sans-serif" }}>⚠ {w.message}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Efficiency vs Thrust scatter chart */}
        {propResults.length > 0 && (
          <div className="border border-gray-100 mb-5">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
                Propeller Performance Map
              </p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" dataKey="x" name="Thrust" unit="g"
                         tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <YAxis type="number" dataKey="y" name="Flight Time" unit="min"
                         tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} name="Score" />
                  <Tooltip contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif" }}
                           cursor={{ strokeDasharray: "3 3" }}
                           itemStyle={{ fontFamily: "Michroma, sans-serif", fontSize: 9 }} />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Scatter name="Props" data={scatterData} fill="#ffc914" line={{ strokeWidth: 0 }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Full results table */}
        {propResults.length > 0 && (
          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
                All Propeller Results
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left">Propeller</th>
                    <th className="px-3 py-2 text-right">Thrust (g)</th>
                    <th className="px-3 py-2 text-right">Flight Time (min)</th>
                    <th className="px-3 py-2 text-right">Efficiency (%)</th>
                    <th className="px-3 py-2 text-right">Score</th>
                    <th className="px-3 py-2 text-left">Warnings</th>
                  </tr>
                </thead>
                <tbody>
                  {propResults.map((r, i) => (
                    <tr key={r.prop.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-3 py-2 font-bold">{r.prop.brand} {r.prop.model}</td>
                      <td className="px-3 py-2 text-right">{r.thrustG.toFixed(0)}</td>
                      <td className="px-3 py-2 text-right">{r.flightTimeMin.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">{r.efficiency.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right font-bold text-[#ffc914]">{r.score.toFixed(0)}</td>
                      <td className="px-3 py-2">
                        {r.warnings.map((w, wi) => (
                          <span key={wi} className={`mr-2 ${w.level === "danger" ? "text-red-500" : "text-amber-500"}`}>
                            {w.level === "danger" ? "⛔" : "⚠"}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
