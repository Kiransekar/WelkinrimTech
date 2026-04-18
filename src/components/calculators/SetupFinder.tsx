// src/components/calculators/SetupFinder.tsx
// SetupFinder - Motor/ESC/Prop combo matcher for fixed-wing & multirotor
// Features: mode selector, ESC pairing, expandable detail cards, comparison

import { useState, useMemo } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { calcProp, PropCalcInput, PropCalcResult } from "@/lib/calculators/propCalc";
import { calculateMulticopter, MulticopterCalcInput, MulticopterCalcResult } from "@/lib/calculators/multicopterConfig";
import { PROPELLERS, Propeller } from "@/data/propellers";
import { suggestESCs, ESC } from "@/data/escs";
import { getPresetById, useMotorPresets } from "@/hooks/useMotorPresets";
import SplitLayout from "./SplitLayout";

type AircraftMode = "airplane" | "multicopter";
type MCProfile = "balanced" | "racing" | "survey" | "cargo";
interface Warning { level: "warn" | "danger"; message: string }

// Mission-specific weight profiles (sum to 1.0) — from Calculations.md
const WEIGHT_PROFILES: Record<MCProfile, { eta: number; time: number; margin: number }> = {
  racing:   { eta: 0.25, time: 0.15, margin: 0.60 },
  survey:   { eta: 0.50, time: 0.40, margin: 0.10 },
  cargo:    { eta: 0.30, time: 0.20, margin: 0.50 },
  balanced: { eta: 0.40, time: 0.35, margin: 0.25 },
};

const DEFAULTS = {
  mode: "airplane" as AircraftMode,
  mcProfile: "balanced" as MCProfile,
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
  cellMinV: 3.3,
  cellNomV: 3.7,
  cellMaxV: 4.2,
  motorKv: 380,
  motorIo: 1.2,
  motorRmMohm: 35,
  motorMaxPowerW: 800,
  motorMaxCurrentA: 30,
  escBrand: "Welkinrim",
  maxPropDiameterInch: 16,
  mission: "sport" as "sport" | "racer" | "aerobatic" | "3d" | "scale" | "glider" | "glider_tow",
  gliderTowWeightG: 1000,
  minFlightTimeMin: 10,
  maxThrottleHover: 55,
};

// Min-max normalize an array of values (returns neutral 0.5 when all identical)
function minMaxNorm(values: number[]): number[] {
  const mn = Math.min(...values), mx = Math.max(...values);
  if (mx === mn) return values.map(() => 0.5);
  return values.map(v => (v - mn) / (mx - mn));
}

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
  mcResult?: MulticopterCalcResult;
  preferenceBadge?: string;
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

function deriveMCWarnings(result: MulticopterCalcResult, totalWeightG: number): Warning[] {
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

    const results: ComboResult[] = [];

    for (const prop of candidates) {
      try {
        if (isMC) {
          const mcInput: MulticopterCalcInput = {
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
            cellMinV: inputs.cellMinV,
            cellNomV: inputs.cellNomV,
            cellMaxV: inputs.cellMaxV,
            motorKv: inputs.motorKv,
            motorIo: inputs.motorIo,
            motorRmMohm: inputs.motorRmMohm,
            motorMaxCurrentA: inputs.motorMaxCurrentA,
            escRatingA: inputs.motorMaxCurrentA * 1.2,
            escResistanceOhm: 0.005,
            escMassG: 20,
            escBrand: inputs.escBrand,
            propDiameterInch: prop.diameterInch,
            propPitchInch: prop.pitchInch,
            ct: prop.ct,
            cp: prop.cp,
          };
          const mcResult = calculateMulticopter(mcInput);
          const warnings = deriveMCWarnings(mcResult, inputs.modelWeightG);
          const twr = mcResult.performance.totalThrustG / inputs.modelWeightG;
          const escs = suggestESCs(inputs.motorMaxCurrentA, inputs.batteryCells, "multicopter");

          results.push({
            id: `mc-${prop.id}`,
            prop,
            esc: escs.length > 0 ? escs[0] : null,
            score: 0, // filled after normalization pass
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
          // Airplane mode
          const fwInput: PropCalcInput = {
            modelWeightG: inputs.modelWeightG,
            numMotors: inputs.numMotors,
            wingAreaDm2: 50,
            dragCoefficient: 0.06,
            elevationM: inputs.elevationM,
            temperatureC: inputs.temperatureC,
            pressureHpa: inputs.pressureHpa,
            headWindMs: 0,
            batteryCells: inputs.batteryCells,
            batteryCapacityMah: inputs.batteryCapacityMah,
            batteryMaxDischarge: inputs.batteryMaxDischarge,
            batteryResistanceMohm: inputs.batteryResistanceMohm,
            cellMinV: inputs.cellMinV,
            cellNomV: inputs.cellNomV,
            cellMaxV: inputs.cellMaxV,
            motorKv: inputs.motorKv,
            motorIo: inputs.motorIo,
            motorRmMohm: inputs.motorRmMohm,
            motorMaxPowerW: inputs.motorMaxPowerW,
            escRatingA: 40,
            escResistanceOhm: 0.005,
            escMassG: 40,
            escBrand: inputs.escBrand,
            propDiameterInch: prop.diameterInch,
            propPitchInch: prop.pitchInch,
            propBlades: prop.blades,
            pconst: 1.2, tconst: 1.0,
            ct: prop.ct, cp: prop.cp,
          };
          const fwResult = calcProp(fwInput);
          const warnings = deriveFWWarnings(fwResult, fwInput);
          const totalWeight = inputs.mission === "glider_tow"
            ? inputs.modelWeightG + inputs.gliderTowWeightG
            : inputs.modelWeightG;
          const hoverThrottle = fwResult.propeller.staticThrustG > 0
            ? (totalWeight / fwResult.propeller.staticThrustG) * 100 : 100;
          const escs = suggestESCs(inputs.motorMaxCurrentA || Math.ceil(inputs.motorMaxPowerW / (inputs.batteryCells * 3.7)), inputs.batteryCells, "airplane");

          results.push({
            id: `fw-${prop.id}`,
            prop,
            esc: escs.length > 0 ? escs[0] : null,
            score: 0,
            warnings,
            thrustG: fwResult.propeller.staticThrustG,
            hoverThrottle,
            flightTimeMin: fwResult.battery.flightTimeMin,
            efficiency: fwResult.motorMaximum.efficiencyPercent,
            twr: fwResult.totalDrive.thrustWeightRatio,
            powerW: fwResult.motorMaximum.electricPowerW,
            currentA: fwResult.motorMaximum.currentA,
            rpmMax: fwResult.propeller.rpm,
            mode: "airplane",
            fwResult,
          });
        }
      } catch (e) { console.error(e); }
    }

    // ── MADM scoring: min-max normalization across the pool then weighted sum ──
    if (results.length > 0) {
      const effNorm    = minMaxNorm(results.map(r => r.efficiency));
      const timeNorm   = minMaxNorm(results.map(r => r.flightTimeMin));
      const marginNorm = minMaxNorm(results.map(r => Math.max(0, r.twr - 1.5)));

      const w = isMC
        ? WEIGHT_PROFILES[inputs.mcProfile]
        : { eta: 0.35, time: 0.35, margin: 0.30 };

      results.forEach((r, i) => {
        let base = w.eta * effNorm[i] + w.time * timeNorm[i] + w.margin * marginNorm[i];

        // Penalty multipliers per Calculations.md §Step 5
        const dangerCount = r.warnings.filter(x => x.level === "danger").length;
        if (dangerCount > 0)           base *= Math.pow(0.70, dangerCount);
        if (r.hoverThrottle > inputs.maxThrottleHover) base *= 0.80;
        if (isMC && r.twr < 1.2)       base  = 0; // disqualify unsafe TWR

        r.score = Math.round(Math.min(100, base * 100));
      });
    }

    const sorted = results.sort((a, b) => b.score - a.score);
    if (sorted[0]) sorted[0].preferenceBadge = "🥇 Preference 1";
    if (sorted[1]) sorted[1].preferenceBadge = "🥈 Preference 2";
    if (sorted[2]) sorted[2].preferenceBadge = "🥉 Preference 3";
    return sorted;
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
      {/* Vehicle Type Toggle */}
      <div className="space-y-1.5">
        <label className="text-[9px] tracking-[0.2em] uppercase text-gray-400 font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>Vehicle Type</label>
        <div className="grid grid-cols-2 border border-gray-200 p-0.5 bg-gray-50 rounded-sm">
          {(["airplane", "multicopter"] as AircraftMode[]).map(m => (
            <button key={m}
              onClick={() => setInputs(prev => ({ ...prev, mode: m, numMotors: m === "airplane" ? 1 : prev.numMotors, numRotors: m === "multicopter" ? 4 : prev.numRotors }))}
              className={`text-[9px] tracking-widest uppercase py-2 transition-all rounded-[1px] ${inputs.mode === m ? "bg-black text-[#ffc812] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              {m === "airplane" ? "Airplane" : "Multicopter"}
            </button>
          ))}
        </div>
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

      <Section title="Bird Specification">
        <Field label="AUM (kg)" id="mw" value={inputs.modelWeightG / 1000} onChange={v => set("modelWeightG")(v * 1000)}
               hint="All-Up Mass including battery in Kilograms." />
        <Field label="Max Prop (inch)" id="pmax" value={inputs.maxPropDiameterInch} onChange={set("maxPropDiameterInch")} step="1"
               hint="Maximum propeller diameter clearance." />
        <Field label="Battery Config (S)" id="bc" value={inputs.batteryCells} onChange={set("batteryCells")} step="1" />
        {isMC ? (
          <Field label="# Rotors" id="nr" value={inputs.numRotors} onChange={set("numRotors")} step="1"
                 hint="4 = quad, 6 = hex, 8 = octo" />
        ) : (
          <>
            <Field label="# Motors" id="nm" value={inputs.numMotors} onChange={set("numMotors")} step="1" />
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
            {inputs.mission === "glider_tow" && (
              <Field label="Tow Wt (g)" id="towWeight" value={inputs.gliderTowWeightG} onChange={set("gliderTowWeightG")} />
            )}
          </>
        )}
      </Section>

      <Section title="Battery Specs">
        <Field label="Capacity (mAh)" id="bm" value={inputs.batteryCapacityMah} onChange={set("batteryCapacityMah")} step="100" />
        <Field label="Resist (mΩ)" id="br" value={inputs.batteryResistanceMohm} onChange={set("batteryResistanceMohm")} />
        <Field label="Cell Min (V)" id="cmin" value={inputs.cellMinV} onChange={set("cellMinV")} step="0.1" />
        <Field label="Cell Nom (V)" id="cnom" value={inputs.cellNomV} onChange={set("cellNomV")} step="0.1" />
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
        {isMC && (
          <div className="w-full py-0.5">
            <label className="text-[8px] tracking-widest uppercase text-[#808080] mb-1 block"
                   style={{ fontFamily: "Michroma, sans-serif" }}>Mission Profile</label>
            <select
              value={inputs.mcProfile}
              onChange={e => setInputs(prev => ({ ...prev, mcProfile: e.target.value as MCProfile }))}
              className="w-full border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc812] bg-white transition-colors"
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              <option value="balanced">Balanced (η 40 / Time 35 / Margin 25)</option>
              <option value="racing">Racing (η 25 / Time 15 / Margin 60)</option>
              <option value="survey">Survey (η 50 / Time 40 / Margin 10)</option>
              <option value="cargo">Cargo (η 30 / Time 20 / Margin 50)</option>
            </select>
          </div>
        )}
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

      {/* Comparison Drawer */}
      {compareIds.size > 0 && (
        <div className="border-2 border-black bg-white shadow-xl p-4 sticky top-4 z-[100]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] tracking-[0.3em] uppercase font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
              Configuration Comparison ({compareIds.size})
            </h3>
            <button onClick={() => setCompareIds(new Set())} 
                    className="text-[8px] tracking-widest uppercase px-2 py-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    style={{ fontFamily: "Michroma, sans-serif" }}>
              Reset
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: "Michroma, sans-serif" }}>
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2 text-[8px] text-gray-400 uppercase tracking-widest">Parameter</th>
                  {comparedCombos.map(c => (
                    <th key={c.id} className="py-2 px-4 text-[9px] font-bold text-center border-l border-gray-100">
                      {c.prop.diameterInch}x{c.prop.pitchInch}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[10px]">
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Weight (AUM)</td>
                  {comparedCombos.map(c => <td key={c.id} className="py-2 text-center border-l border-gray-100 font-medium">{(inputs.modelWeightG/1000).toFixed(2)} kg</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Total Thrust</td>
                  {comparedCombos.map(c => <td key={c.id} className="py-2 text-center border-l border-gray-100 font-bold">{(c.thrustG * (isMC ? inputs.numRotors : inputs.numMotors)).toFixed(0)}g</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Efficiency</td>
                  {comparedCombos.map(c => <td key={c.id} className="py-2 text-center border-l border-gray-100 text-[#22c55e]">{c.efficiency.toFixed(1)} g/W</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Flight Time</td>
                  {comparedCombos.map(c => <td key={c.id} className="py-2 text-center border-l border-gray-100 font-bold">{c.flightTimeMin.toFixed(1)} min</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Hover/Static RPM</td>
                  {comparedCombos.map(c => <td key={c.id} className="py-2 text-center border-l border-gray-100">{c.rpmMax.toFixed(0)}</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Match Score</td>
                  {comparedCombos.map(c => <td key={c.id} className="py-2 text-center border-l border-gray-100 font-black text-[#ffc812]">{c.score.toFixed(0)}%</td>)}
                </tr>
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
            {comboResults.slice(0, 12).map((c) => {
              const bgClass = c.score >= 90 ? "bg-green-50 border-green-200" 
                           : c.score >= 60 ? "bg-orange-50 border-orange-200" 
                           : "bg-red-50 border-red-200";
              const accentColor = c.score >= 90 ? "#22c55e" : c.score >= 60 ? "#f59e0b" : "#ef4444";
              
              return (
                <div key={c.id} className={`border-2 p-3 transition-all relative ${bgClass} ${compareIds.has(c.id) ? "ring-2 ring-black" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {c.preferenceBadge && (
                        <div className="text-[8px] tracking-widest uppercase mb-1 font-bold"
                             style={{ fontFamily: "Michroma, sans-serif", color: accentColor }}>{c.preferenceBadge}</div>
                      )}
                      <p className="text-[11px] font-bold text-gray-900" style={{ fontFamily: "Michroma, sans-serif" }}>
                        {inputs.motorKv}KV Motor
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={compareIds.has(c.id)}
                      onChange={() => toggleCompare(c.id)}
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1 text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
                    <div className="flex justify-between border-b border-black/5 pb-0.5">
                      <span className="text-gray-500 uppercase text-[8px]">Motor</span>
                      <span className="font-bold truncate max-w-[100px]">{selectedPreset || "Custom"}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-0.5">
                      <span className="text-gray-500 uppercase text-[8px]">ESC</span>
                      <span className="font-bold">{c.esc?.model || "Standard ESC"}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-0.5">
                      <span className="text-gray-500 uppercase text-[8px]">Propeller</span>
                      <span className="font-bold">{c.prop.diameterInch}×{c.prop.pitchInch}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-0.5">
                      <span className="text-gray-500 uppercase text-[8px]">Hover Thrust</span>
                      <span className="font-bold">{c.thrustG.toFixed(0)}g</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-0.5">
                      <span className="text-gray-500 uppercase text-[8px]">Efficiency</span>
                      <span className="font-bold">{(c.thrustG / (c.powerW || 1)).toFixed(1)} g/W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase text-[8px]">Flight Time</span>
                      <span className="font-bold">{c.flightTimeMin.toFixed(1)} min</span>
                    </div>
                  </div>

                  <div className="my-2 border-t border-dashed border-gray-300"></div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]" style={{ fontFamily: "Lexend, sans-serif" }}>
                    <div className="text-gray-400">Match Score: <span className="font-bold" style={{ color: accentColor }}>{c.score.toFixed(0)}%</span></div>
                    <div className="text-gray-400">Total Thrust: <span className="text-gray-600">{(c.thrustG * (isMC ? inputs.numRotors : inputs.numMotors)).toFixed(0)}g</span></div>
                  </div>

                  <button 
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className="w-full mt-2 py-1 text-[8px] tracking-widest uppercase bg-white/50 hover:bg-white border border-gray-200 transition-colors"
                  >
                    {expandedId === c.id ? "Close Details" : "View Specs"}
                  </button>

                  {expandedId === c.id && (
                    <div className="mt-2 p-2 bg-white/80 rounded-sm text-[9px] space-y-1">
                      {isMC ? (
                        <>
                          <div className="flex justify-between"><span className="text-gray-400">Max RPM:</span><span>{c.rpmMax.toFixed(0)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Disc Loading:</span><span>{c.mcResult?.hover.discLoadingNm2.toFixed(1)} N/m²</span></div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between"><span className="text-gray-400">Pitch Speed:</span><span>{c.fwResult?.propeller.pitchSpeedKmh.toFixed(1)} km/h</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">TWR:</span><span>{c.twr.toFixed(2)}</span></div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scatter chart - HIDDEN per instructions */}
      {false && comboResults.length > 0 && (
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
