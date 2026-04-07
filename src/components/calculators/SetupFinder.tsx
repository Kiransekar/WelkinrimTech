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
  mission: "sport" as "sport" | "racer" | "aerobatic" | "3d" | "scale" | "glider" | "glider_tow",
  gliderTowWeightG: 1000, // Only used if mission === "glider_tow"
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
      <input
        id={id} type="number" step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-200 text-[11px] px-2 py-1 focus:outline-none focus:border-[#ffc812] transition-colors bg-white"
        style={{ fontFamily: "Michroma, sans-serif" }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 mb-3">
      <div className="bg-black px-3 py-1.5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
           style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
      </div>
      <div className="p-2 space-y-0.5">{children}</div>
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

        // Mission-based rules (Section 8.1)
        const totalWeight = inputs.mission === "glider_tow" ? inputs.modelWeightG + inputs.gliderTowWeightG : inputs.modelWeightG;
        const thrustRatio = result.propeller.staticThrustG / totalWeight;
        const pitchSpeed = result.propeller.pitchSpeedKmh;
        
        let requiredThrustRatio = 0.5;
        let requiredPitchSpeed = 60; // Approximate minimums based on 30km/h stall
        
        switch (inputs.mission) {
          case "sport": requiredThrustRatio = 0.5; requiredPitchSpeed = 70; break;
          case "racer": requiredThrustRatio = 0.8; requiredPitchSpeed = 150; break;
          case "aerobatic": requiredThrustRatio = 1.0; requiredPitchSpeed = 80; break;
          case "3d": requiredThrustRatio = 1.5; requiredPitchSpeed = 50; break;
          case "scale": requiredThrustRatio = 0.8; requiredPitchSpeed = 65; break;
          case "glider": requiredThrustRatio = 0.5; requiredPitchSpeed = 45; break;
          case "glider_tow": requiredThrustRatio = 0.8; requiredPitchSpeed = 70; break;
        }

        // Thrust scoring
        if (thrustRatio >= requiredThrustRatio) score += 20;
        else score -= (requiredThrustRatio - thrustRatio) * 100;
        
        // Pitch speed scoring
        if (pitchSpeed >= requiredPitchSpeed) score += 15;
        else score -= (requiredPitchSpeed - pitchSpeed) * 2;

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
    <div className="space-y-4">
      {/* ── Compact Inputs ── */}
      {/* Motor Preset */}
      <div className="border border-[#ffc812]/30 bg-[#fffbe6] px-3 py-2 flex items-center gap-3">
        <label className="text-[9px] tracking-widest uppercase text-[#ffc812] font-bold whitespace-nowrap"
               style={{ fontFamily: "Michroma, sans-serif" }}>
          ⚡ Motor Preset
        </label>
        <select
          value={selectedPreset}
          onChange={e => applyPreset(e.target.value)}
          className="flex-1 border border-[#ffc812]/40 text-[11px] px-2.5 py-1 focus:outline-none focus:border-[#ffc812] bg-white"
          style={{ fontFamily: "Michroma, sans-serif" }}
        >
          <option value="">— Select Haemng Motor —</option>
          {presets.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.kv}KV, {p.recommendedVoltage}S)</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Section title="Aircraft">
          <Field label="Weight (g)" id="mw" value={inputs.modelWeightG} onChange={set("modelWeightG")}
                 hint="Total aircraft weight including battery" />
          <Field label="# Motors" id="nm" value={inputs.numMotors} onChange={set("numMotors")} step="1" />
          <div className="col-span-2 mt-1 relative">
            <label className="text-[9px] tracking-widest uppercase text-[#808080] mb-1 block" style={{ fontFamily: "Michroma, sans-serif" }}>
              Mission
            </label>
            <select
              value={inputs.mission}
              onChange={(e) => setInputs(prev => ({ ...prev, mission: e.target.value as any }))}
              className="w-full border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc812] bg-white transition-colors"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              <option value="sport">Trainer / Sport</option>
              <option value="racer">Racer</option>
              <option value="aerobatic">Aerobatic</option>
              <option value="3d">3D / Hover</option>
              <option value="scale">Scale</option>
              <option value="glider">Glider</option>
              <option value="glider_tow">Glider Tow</option>
            </select>
          </div>
          {inputs.mission === "glider_tow" && (
            <Field label="Tow Wt (g)" id="towWeight" value={inputs.gliderTowWeightG} onChange={set("gliderTowWeightG")} className="col-span-2" />
          )}
        </Section>

        <Section title="Battery">
          <Field label="Cells (S)" id="bc" value={inputs.batteryCells} onChange={set("batteryCells")} step="1" />
          <Field label="Capacity" id="bm" value={inputs.batteryCapacityMah} onChange={set("batteryCapacityMah")} step="100" />
          <Field label="Max Disch (%)" id="bd" value={inputs.batteryMaxDischarge * 100} onChange={v => set("batteryMaxDischarge")(v / 100)} />
          <Field label="Resist (mΩ)" id="br" value={inputs.batteryResistanceMohm} onChange={set("batteryResistanceMohm")} />
        </Section>

        <Section title="Motor">
          <Field label="KV" id="kv" value={inputs.motorKv} onChange={set("motorKv")} step="1" />
          <Field label="Io (A)" id="io" value={inputs.motorIo} onChange={set("motorIo")} step="0.1" />
          <Field label="Rm (mΩ)" id="rm" value={inputs.motorRmMohm} onChange={set("motorRmMohm")} />
          <Field label="Max Pwr (W)" id="mp" value={inputs.motorMaxPowerW} onChange={set("motorMaxPowerW")} />
        </Section>

        <Section title="Targets">
          <Field label="Min Flight (min)" id="mft" value={inputs.minFlightTimeMin} onChange={set("minFlightTimeMin")} />
          <Field label="Max Hover (%)" id="mht" value={inputs.maxThrottleHover} onChange={set("maxThrottleHover")}
                 hint="Maximum throttle for stable hover" />
          <Field label="Prop Min (in)" id="pmin" value={propFilter.min} onChange={v => setPropFilter(prev => ({...prev, min: v}))} step="1" />
          <Field label="Prop Max (in)" id="pmax" value={propFilter.max} onChange={v => setPropFilter(prev => ({...prev, max: v}))} step="1" />
        </Section>

        <Section title="Environment">
          <Field label="Elevation (m)" id="el" value={inputs.elevationM} onChange={set("elevationM")} />
          <Field label="Temp (°C)" id="tc" value={inputs.temperatureC} onChange={set("temperatureC")} />
          <Field label="Pressure" id="ph" value={inputs.pressureHpa} onChange={set("pressureHpa")} />
        </Section>
      </div>

      {/* ── Results ── */}
      <div>
        <div className="border border-gray-100 p-4 mb-5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812] mb-4"
             style={{ fontFamily: "Michroma, sans-serif" }}>
            Top Propeller Matches ({propResults.length} tested)
          </p>

          {propResults.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No props match your criteria. Adjust prop range or inputs.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {propResults.slice(0, 9).map((r, i) => (
                <div key={r.prop.id} className={`border-2 rounded-lg p-3 ${i === 0 ? 'border-[#ffc812] bg-[#fffbe6]' : 'border-gray-200'}`}>
                  {i === 0 && (
                    <div className="text-[8px] tracking-widest uppercase text-[#ffc812] mb-1 font-bold"
                         style={{ fontFamily: "Michroma, sans-serif" }}>Best Match</div>
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
                      <span className="font-bold text-[#ffc812]">{r.score.toFixed(0)}</span>
                    </div>
                  </div>
                  {r.warnings.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {r.warnings.slice(0, 2).map((w, wi) => (
                        <p key={wi} className={`text-[9px] ${w.level === "danger" ? "text-red-500" : "text-amber-500"}`}
                           style={{ fontFamily: "Lexend, sans-serif" }}>{w.message}</p>
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
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
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
                  <Scatter name="Props" data={scatterData} fill="#ffc812" line={{ strokeWidth: 0 }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Full results table */}
        {propResults.length > 0 && (
          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
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
                      <td className="px-3 py-2 text-right font-bold text-[#ffc812]">{r.score.toFixed(0)}</td>
                      <td className="px-3 py-2">
                        {r.warnings.map((w, wi) => (
                          <span key={wi} className={`mr-2 ${w.level === "danger" ? "text-red-500" : "text-amber-500"}`}>
                            {w.level === "danger" ? "ERROR" : "WARN"}
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
