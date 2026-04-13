// src/components/calculators/SetupFinder.tsx
// SetupFinder - Motor/ESC/Prop combo matcher for fixed-wing & multirotor
// Features: mode selector, ESC pairing, expandable detail cards, comparison

import { useState, useMemo } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { calcProp, PropCalcInput, PropCalcResult } from "@/lib/calculators/propCalc";
import { calcXcopter, XcopterCalcInput, XcopterCalcResult } from "@/lib/calculators/xcopterCalc";
import { PROPELLERS, Propeller } from "@/data/propellers";
import { suggestESCs, ESC } from "@/data/escs";
import { getPresetById, useMotorPresets } from "@/hooks/useMotorPresets";
import SplitLayout from "./SplitLayout";

type AircraftMode = "fixedwing" | "multicopter";
interface Warning { level: "warn" | "danger"; message: string }

const DEFAULTS = {
  mode: "fixedwing" as AircraftMode,
  modelWeightG: 1500,
  numMotors: 1,
  numRotors: 4,
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
  motorMaxCurrentA: 30,
  mission: "sport" as "sport" | "racer" | "aerobatic" | "3d" | "scale" | "glider" | "glider_tow",
  gliderTowWeightG: 1000,
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

interface ComboResult {
  id: string;
  prop: Propeller;
  esc: ESC | null;
  score: number;
  warnings: Warning[];
  thrustG: number;
  hoverThrottle: number;
  flightTimeMin: number;
  efficiency: number;
  twr: number;
  powerW: number;
  currentA: number;
  rpmMax: number;
  mode: AircraftMode;
  // Raw results for detail view
  fwResult?: PropCalcResult;
  mcResult?: XcopterCalcResult;
}

function deriveFWWarnings(result: PropCalcResult, inputs: PropCalcInput): Warning[] {
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

function deriveMCWarnings(result: XcopterCalcResult, totalWeightG: number): Warning[] {
  const w: Warning[] = [];
  const twr = result.performance.totalThrustG / totalWeightG;
  if (twr < 1.2) w.push({ level: "danger", message: `TWR ${twr.toFixed(2)}:1 — unsafe, need ≥1.5.` });
  else if (twr < 1.8) w.push({ level: "warn", message: `TWR ${twr.toFixed(2)}:1 — marginal, aim ≥2.0.` });

  if (result.hover.throttlePercent > 85) w.push({ level: "danger", message: `Hover throttle ${result.hover.throttlePercent.toFixed(0)}% — no headroom.` });
  else if (result.hover.throttlePercent > 70) w.push({ level: "warn", message: `Hover throttle ${result.hover.throttlePercent.toFixed(0)}% — limited headroom.` });

  if (result.flightTime.hoverMin < 3) w.push({ level: "danger", message: `Hover ${result.flightTime.hoverMin.toFixed(1)} min — critically short.` });
  else if (result.flightTime.hoverMin < 6) w.push({ level: "warn", message: `Hover ${result.flightTime.hoverMin.toFixed(1)} min — short.` });
  return w;
}

export default function SetupFinder() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [propFilter, setPropFilter] = useState({ min: 10, max: 30 });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
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
      motorMaxCurrentA: preset.peakCurrent,
      motorIo: preset.estimatedIo,
      motorRmMohm: preset.estimatedRmMohm,
    }));
    setSelectedPreset(presetId);
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isMC = inputs.mode === "multicopter";

  // Calculate combos for all props in range
  const comboResults: ComboResult[] = useMemo(() => {
    const appFilter: Propeller["application"] = isMC ? "multicopter" : "airplane";
    const candidates = PROPELLERS.filter(p =>
      p.diameterInch >= propFilter.min &&
      p.diameterInch <= propFilter.max &&
      (p.application === appFilter || p.application === "both")
    );

    const escApp = isMC ? "multicopter" : "airplane";
    const results: ComboResult[] = [];

    for (const prop of candidates) {
      try {
        if (isMC) {
          // Multicopter mode — use xcopterCalc
          const mcInput: XcopterCalcInput = {
            numRotors: inputs.numRotors,
            auwG: inputs.modelWeightG,
            payloadG: 0,
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
            motorMaxCurrentA: inputs.motorMaxCurrentA,
            propDiameterInch: prop.diameterInch,
            propPitchInch: prop.pitchInch,
            ct: prop.ct,
            cp: prop.cp,
          };
          const mcResult = calcXcopter(mcInput);
          const warnings = deriveMCWarnings(mcResult, inputs.modelWeightG);
          const dangerCount = warnings.filter(w => w.level === "danger").length;

          let score = 100 - dangerCount * 30 - warnings.filter(w => w.level === "warn").length * 10;
          const twr = mcResult.performance.totalThrustG / inputs.modelWeightG;
          if (twr >= 2.0) score += 25; else if (twr >= 1.5) score += 10;
          if (mcResult.hover.throttlePercent <= 60) score += 20;
          else if (mcResult.hover.throttlePercent <= 70) score += 10;
          if (mcResult.flightTime.hoverMin >= inputs.minFlightTimeMin) score += 15;
          else score -= (inputs.minFlightTimeMin - mcResult.flightTime.hoverMin) * 3;
          score += mcResult.hover.efficiencyPercent * 0.2;

          const escs = suggestESCs(inputs.motorMaxCurrentA, inputs.batteryCells, escApp as any);

          results.push({
            id: `mc-${prop.id}`,
            prop,
            esc: escs.length > 0 ? escs[0] : null,
            score: Math.max(0, score),
            warnings,
            thrustG: mcResult.performance.totalThrustG,
            hoverThrottle: mcResult.hover.throttlePercent,
            flightTimeMin: mcResult.flightTime.hoverMin,
            efficiency: mcResult.hover.efficiencyPercent,
            twr,
            powerW: mcResult.hover.powerW * inputs.numRotors,
            currentA: mcResult.hover.currentA * inputs.numRotors,
            rpmMax: mcResult.maximum.rpm,
            mode: "multicopter",
            mcResult,
          });
        } else {
          // Fixed-wing mode — use propCalc
          const fwInput: PropCalcInput = {
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
            propDiameterInch: prop.diameterInch,
            propPitchInch: prop.pitchInch,
            propBlades: prop.blades,
            pconst: 1.2, tconst: 1.0,
            ct: prop.ct, cp: prop.cp,
          };
          const fwResult = calcProp(fwInput);
          const warnings = deriveFWWarnings(fwResult, fwInput);
          const dangerCount = warnings.filter(w => w.level === "danger").length;

          let score = 100 - dangerCount * 30 - warnings.filter(w => w.level === "warn").length * 10;
          const totalWeight = inputs.mission === "glider_tow" ? inputs.modelWeightG + inputs.gliderTowWeightG : inputs.modelWeightG;
          const thrustRatio = fwResult.propeller.staticThrustG / totalWeight;
          const pitchSpeed = fwResult.propeller.pitchSpeedKmh;
          let reqTR = 0.5, reqPS = 60;
          switch (inputs.mission) {
            case "sport": reqTR = 0.5; reqPS = 70; break;
            case "racer": reqTR = 0.8; reqPS = 150; break;
            case "aerobatic": reqTR = 1.0; reqPS = 80; break;
            case "3d": reqTR = 1.5; reqPS = 50; break;
            case "scale": reqTR = 0.8; reqPS = 65; break;
            case "glider": reqTR = 0.5; reqPS = 45; break;
            case "glider_tow": reqTR = 0.8; reqPS = 70; break;
          }
          if (thrustRatio >= reqTR) score += 20; else score -= (reqTR - thrustRatio) * 100;
          if (pitchSpeed >= reqPS) score += 15; else score -= (reqPS - pitchSpeed) * 2;
          if (fwResult.battery.flightTimeMin >= inputs.minFlightTimeMin) score += 15;
          else score -= (inputs.minFlightTimeMin - fwResult.battery.flightTimeMin) * 3;
          score += fwResult.motorMaximum.efficiencyPercent * 0.3;

          const hoverThrottle = fwResult.propeller.staticThrustG > 0
            ? (inputs.modelWeightG / fwResult.propeller.staticThrustG) * 100 : 100;

          const escs = suggestESCs(inputs.motorMaxCurrentA || Math.ceil(inputs.motorMaxPowerW / (inputs.batteryCells * 3.7)), inputs.batteryCells, escApp as any);

          results.push({
            id: `fw-${prop.id}`,
            prop,
            esc: escs.length > 0 ? escs[0] : null,
            score: Math.max(0, score),
            warnings,
            thrustG: fwResult.propeller.staticThrustG,
            hoverThrottle,
            flightTimeMin: fwResult.battery.flightTimeMin,
            efficiency: fwResult.motorMaximum.efficiencyPercent,
            twr: fwResult.totalDrive.thrustWeightRatio,
            powerW: fwResult.motorMaximum.electricPowerW,
            currentA: fwResult.motorMaximum.currentA,
            rpmMax: fwResult.propeller.rpm,
            mode: "fixedwing",
            fwResult,
          });
        }
      } catch { /* skip */ }
    }
    return results.sort((a, b) => b.score - a.score);
  }, [inputs, propFilter, isMC]);

  // Comparison subset
  const comparedCombos = useMemo(() =>
    comboResults.filter(c => compareIds.has(c.id)),
    [comboResults, compareIds]);

  // Chart data
  const scatterData = useMemo(() => comboResults.slice(0, 50).map(r => ({
    x: r.thrustG,
    y: r.flightTimeMin,
    z: r.score,
    name: `${r.prop.type} ${r.prop.diameterInch}×${r.prop.pitchInch}`,
    efficiency: r.efficiency,
  })), [comboResults]);

  // ── Inputs Panel ──
  const inputsPanel = (
    <div className="space-y-3">
      {/* Mode selector */}
      <div className="grid grid-cols-2 border border-gray-200">
        {(["fixedwing", "multicopter"] as AircraftMode[]).map(m => (
          <button key={m}
            onClick={() => setInputs(prev => ({ ...prev, mode: m, numMotors: m === "fixedwing" ? 1 : prev.numMotors, numRotors: m === "multicopter" ? 4 : prev.numRotors }))}
            className={`text-[9px] tracking-widest uppercase py-2 transition-colors ${inputs.mode === m ? "bg-black text-[#ffc812]" : "bg-white text-gray-400 hover:text-gray-600"}`}
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            {m === "fixedwing" ? "Fixed Wing" : "Multicopter"}
          </button>
        ))}
      </div>

      {/* Motor Preset */}
      <div className="border border-[#ffc812]/30 bg-[#fffbe6] px-3 py-2 flex flex-col gap-2">
        <label className="text-[9px] tracking-widest uppercase text-[#ffc812] font-bold whitespace-nowrap"
               style={{ fontFamily: "Michroma, sans-serif" }}>Motor Preset</label>
        <select
          value={selectedPreset}
          onChange={e => applyPreset(e.target.value)}
          className="w-full border border-[#ffc812]/40 text-[11px] px-2.5 py-1 focus:outline-none focus:border-[#ffc812] bg-white"
          style={{ fontFamily: "Michroma, sans-serif" }}
        >
          <option value="">— Select Haemng Motor —</option>
          {presets.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.kv}KV, {p.recommendedVoltage}S)</option>
          ))}
        </select>
      </div>

      <Section title={isMC ? "Multicopter" : "Aircraft"}>
        <Field label="AUW / Weight (g)" id="mw" value={inputs.modelWeightG} onChange={set("modelWeightG")}
               hint="All-up weight including battery" />
        {isMC ? (
          <Field label="# Rotors" id="nr" value={inputs.numRotors} onChange={set("numRotors")} step="1"
                 hint="4 = quad, 6 = hex, 8 = octo" />
        ) : (
          <Field label="# Motors" id="nm" value={inputs.numMotors} onChange={set("numMotors")} step="1" />
        )}
        {!isMC && (
          <div className="mt-1 relative">
            <label className="text-[9px] tracking-widest uppercase text-[#808080] mb-1 block" style={{ fontFamily: "Michroma, sans-serif" }}>Mission</label>
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
        )}
        {!isMC && inputs.mission === "glider_tow" && (
          <Field label="Tow Wt (g)" id="towWeight" value={inputs.gliderTowWeightG} onChange={set("gliderTowWeightG")} />
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
        {isMC ? (
          <Field label="Max Curr (A)" id="mc" value={inputs.motorMaxCurrentA} onChange={set("motorMaxCurrentA")} />
        ) : (
          <Field label="Max Pwr (W)" id="mp" value={inputs.motorMaxPowerW} onChange={set("motorMaxPowerW")} />
        )}
      </Section>

      <Section title="Targets">
        <Field label="Min Flight (min)" id="mft" value={inputs.minFlightTimeMin} onChange={set("minFlightTimeMin")} />
        {isMC && <Field label="Max Hover (%)" id="mht" value={inputs.maxThrottleHover} onChange={set("maxThrottleHover")} hint="Maximum throttle for stable hover" />}
        <Field label="Prop Min (in)" id="pmin" value={propFilter.min} onChange={v => setPropFilter(prev => ({...prev, min: v}))} step="1" />
        <Field label="Prop Max (in)" id="pmax" value={propFilter.max} onChange={v => setPropFilter(prev => ({...prev, max: v}))} step="1" />
      </Section>

      <Section title="Environment">
        <Field label="Elevation (m)" id="el" value={inputs.elevationM} onChange={set("elevationM")} />
        <Field label="Temp (°C)" id="tc" value={inputs.temperatureC} onChange={set("temperatureC")} />
        <Field label="Pressure" id="ph" value={inputs.pressureHpa} onChange={set("pressureHpa")} />
      </Section>
    </div>
  );

  // ── Results Panel ──
  const resultsPanel = (
    <div className="space-y-4">
      {/* Description */}
      <p className="text-[11px] text-gray-500 border-l-2 border-[#ffc812] pl-3 py-1" style={{ fontFamily: "Lexend, sans-serif" }}>
        {isMC
          ? "Find the best motor + ESC + propeller combination for your multirotor. Click a card for detailed analysis, or select multiple to compare."
          : "Find the optimal propeller for your fixed-wing aircraft. Each combo includes a matched ESC suggestion. Click to expand details or select to compare."}
      </p>

      {/* Comparison bar */}
      {compareIds.size > 0 && (
        <div className="border-2 border-[#ffc812] bg-[#fffbe6] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812] font-bold"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Comparing {compareIds.size} configuration{compareIds.size > 1 ? "s" : ""}
            </p>
            <button onClick={() => setCompareIds(new Set())}
              className="text-[8px] tracking-widest uppercase text-gray-400 hover:text-red-500 transition-colors"
              style={{ fontFamily: "Michroma, sans-serif" }}>Clear</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
              <thead>
                <tr className="bg-black text-[#ffc812]">
                  <th className="px-2 py-1.5 text-left text-[8px] tracking-wider">Propeller</th>
                  <th className="px-2 py-1.5 text-right text-[8px] tracking-wider">ESC</th>
                  <th className="px-2 py-1.5 text-right text-[8px] tracking-wider">Thrust</th>
                  <th className="px-2 py-1.5 text-right text-[8px] tracking-wider">TWR</th>
                  <th className="px-2 py-1.5 text-right text-[8px] tracking-wider">{isMC ? "Hover" : "Flight"}</th>
                  <th className="px-2 py-1.5 text-right text-[8px] tracking-wider">Eff %</th>
                  <th className="px-2 py-1.5 text-right text-[8px] tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody>
                {comparedCombos.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-2 py-1.5 font-bold">{c.prop.type} {c.prop.diameterInch}×{c.prop.pitchInch}</td>
                    <td className="px-2 py-1.5 text-right text-gray-500">{c.esc ? `${c.esc.model} ${c.esc.continuousA}A` : "—"}</td>
                    <td className="px-2 py-1.5 text-right">{c.thrustG.toFixed(0)}g</td>
                    <td className="px-2 py-1.5 text-right">{c.twr.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{c.flightTimeMin.toFixed(1)} min</td>
                    <td className="px-2 py-1.5 text-right">{c.efficiency.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right font-bold text-[#ffc812]">{c.score.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top combo cards */}
      <div className="border border-gray-100 p-4">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812] mb-4"
           style={{ fontFamily: "Michroma, sans-serif" }}>
          Top {isMC ? "Multirotor" : "Propeller"} Combos ({comboResults.length} tested)
        </p>

        {comboResults.length === 0 ? (
          <p className="text-center text-gray-400 py-8" style={{ fontFamily: "Lexend, sans-serif" }}>No combinations match. Adjust prop range or inputs.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {comboResults.slice(0, 9).map((c, i) => (
              <div key={c.id} className={`border-2 p-3 transition-colors cursor-pointer ${
                i === 0 ? "border-[#ffc812] bg-[#fffbe6]" : compareIds.has(c.id) ? "border-[#ffc812]/50 bg-[#fffbe6]/30" : "border-gray-200 hover:border-gray-300"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    {i === 0 && (
                      <div className="text-[8px] tracking-widest uppercase text-[#ffc812] mb-1 font-bold"
                           style={{ fontFamily: "Michroma, sans-serif" }}>Best Match</div>
                    )}
                    <p className="text-sm font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>
                      {c.prop.type} {c.prop.diameterInch}×{c.prop.pitchInch}
                    </p>
                    <div className="text-[10px] text-gray-500 mt-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>
                      {c.prop.blades}-blade
                      {c.esc && <span className="ml-1 text-gray-400">+ {c.esc.model}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCompare(c.id); }}
                    className={`text-[7px] tracking-widest uppercase px-1.5 py-0.5 border transition-colors flex-shrink-0 ${
                      compareIds.has(c.id) ? "border-[#ffc812] bg-[#ffc812] text-black" : "border-gray-300 text-gray-400 hover:border-[#ffc812]"
                    }`}
                    style={{ fontFamily: "Michroma, sans-serif" }}
                  >{compareIds.has(c.id) ? "CMP" : "+"}</button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}
                     onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                  <div className="flex justify-between"><span className="text-gray-500">Thrust:</span><span className="font-bold">{c.thrustG.toFixed(0)}g</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">TWR:</span><span className="font-bold">{c.twr.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">{isMC ? "Hover:" : "Flight:"}</span><span className="font-bold">{c.flightTimeMin.toFixed(1)} min</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Eff:</span><span className="font-bold">{c.efficiency.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Score:</span><span className="font-bold text-[#ffc812]">{c.score.toFixed(0)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Power:</span><span className="font-bold">{c.powerW.toFixed(0)}W</span></div>
                </div>

                {c.warnings.length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {c.warnings.slice(0, 2).map((w, wi) => (
                      <p key={wi} className={`text-[9px] ${w.level === "danger" ? "text-red-500" : "text-amber-500"}`}
                         style={{ fontFamily: "Lexend, sans-serif" }}>{w.message}</p>
                    ))}
                  </div>
                )}

                {/* Expandable detail panel */}
                {expandedId === c.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
                    <p className="text-[8px] tracking-widest uppercase text-[#ffc812] font-bold">Detailed Analysis</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <div className="flex justify-between"><span className="text-gray-400">Max RPM:</span><span>{c.rpmMax.toFixed(0)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Current:</span><span>{c.currentA.toFixed(1)}A</span></div>
                      {isMC && c.mcResult && (
                        <>
                          <div className="flex justify-between"><span className="text-gray-400">Hover Thr:</span><span>{c.mcResult.hover.throttlePercent.toFixed(1)}%</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Disc Load:</span><span>{c.mcResult.hover.discLoadingNm2.toFixed(1)} N/m²</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Hover RPM:</span><span>{c.mcResult.hover.rpm.toFixed(0)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Mixed Time:</span><span>{c.mcResult.flightTime.mixedMin.toFixed(1)} min</span></div>
                        </>
                      )}
                      {!isMC && c.fwResult && (
                        <>
                          <div className="flex justify-between"><span className="text-gray-400">Pitch Spd:</span><span>{c.fwResult.propeller.pitchSpeedKmh.toFixed(1)} km/h</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">g/W:</span><span>{c.fwResult.propeller.specificThrustGW.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Motor Eff:</span><span>{c.fwResult.motorOptimum.efficiencyPercent.toFixed(1)}%</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Pwr/Wt:</span><span>{c.fwResult.totalDrive.powerWeightWKg.toFixed(0)} W/kg</span></div>
                        </>
                      )}
                    </div>
                    {c.esc && (
                      <div className="bg-gray-50 border border-gray-200 px-2 py-1.5">
                        <p className="text-[8px] tracking-widest uppercase text-gray-400 mb-0.5">Suggested ESC</p>
                        <p className="font-bold text-[11px]">{c.esc.model}</p>
                        <p className="text-gray-400 text-[9px]" style={{ fontFamily: "Lexend, sans-serif" }}>
                          {c.esc.continuousA}A cont / {c.esc.burstA}A burst · {c.esc.minCells}–{c.esc.maxCells}S · {c.esc.weight}g
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scatter chart */}
      {comboResults.length > 0 && (
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Performance Map</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="x" name="Thrust" unit="g"
                       tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                <YAxis type="number" dataKey="y" name={isMC ? "Hover Time" : "Flight Time"} unit="min"
                       tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Score" />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif" }}
                         cursor={{ strokeDasharray: "3 3" }}
                         itemStyle={{ fontFamily: "Michroma, sans-serif", fontSize: 9 }} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                <Scatter name="Combos" data={scatterData} fill="#ffc812" line={{ strokeWidth: 0 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Full results table */}
      {comboResults.length > 0 && (
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>All Results</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-2 text-left w-6"></th>
                  <th className="px-2 py-2 text-left">Propeller</th>
                  <th className="px-2 py-2 text-left">ESC</th>
                  <th className="px-2 py-2 text-right">Thrust</th>
                  <th className="px-2 py-2 text-right">TWR</th>
                  <th className="px-2 py-2 text-right">{isMC ? "Hover" : "Flight"}</th>
                  <th className="px-2 py-2 text-right">Eff %</th>
                  <th className="px-2 py-2 text-right">Score</th>
                  <th className="px-2 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {comboResults.map((c, i) => (
                  <tr key={c.id} className={`${compareIds.has(c.id) ? "bg-[#ffc812]/10" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} cursor-pointer hover:bg-gray-100/50`}
                      onClick={() => toggleCompare(c.id)}>
                    <td className="px-2 py-1.5 text-center">
                      <span className={`inline-block w-3 h-3 border ${compareIds.has(c.id) ? "bg-[#ffc812] border-[#ffc812]" : "border-gray-300"}`} />
                    </td>
                    <td className="px-2 py-1.5 font-bold">{c.prop.type} {c.prop.diameterInch}×{c.prop.pitchInch}</td>
                    <td className="px-2 py-1.5 text-gray-500">{c.esc ? `${c.esc.model} ${c.esc.continuousA}A` : "—"}</td>
                    <td className="px-2 py-1.5 text-right">{c.thrustG.toFixed(0)}g</td>
                    <td className="px-2 py-1.5 text-right">{c.twr.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{c.flightTimeMin.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right">{c.efficiency.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right font-bold text-[#ffc812]">{c.score.toFixed(0)}</td>
                    <td className="px-2 py-1.5 text-center">
                      {c.warnings.length === 0 ? <span className="text-green-500">OK</span> : c.warnings.some(w => w.level === "danger") ? <span className="text-red-500">ERR</span> : <span className="text-amber-500">WRN</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
