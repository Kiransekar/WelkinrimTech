// src/components/calculators/XcopterCalcPanel.tsx
// Multirotor / X-copter performance calculator — v2
// Improvements (mirrors PropCalcPanel v2 for consistency):
//  - Collapsible input sections
//  - Tooltip hints on every input field
//  - Warning/alert badges
//  - CSV export
//  - Efficiency map + power vs disc-loading chart
//  - FIXED: motor temp (thermal resistance model)
//  - FIXED: flight time (loaded voltage, correct hover power)
//  - FIXED: TWR (uses actual loaded voltage, total thrust vs AUW+payload)
//  - FIXED: partial load chain (RPM→CT thrust→CP power→current, consistent)

import { useState, useMemo, useCallback } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import GaugeMeter from "./GaugeMeter";
import { calcXcopter, XcopterCalcInput, XcopterCalcResult } from "@/lib/calculators/xcopterCalc";
import { useMotorPresets, getPresetById } from "@/hooks/useMotorPresets";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Warning { level: "warn" | "danger"; message: string }

// ─────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────
const DEFAULTS: XcopterCalcInput = {
  numRotors: 4,
  auwG: 900,
  payloadG: 0,
  elevationM: 0,
  temperatureC: 20,
  pressureHpa: 1013,
  batteryCells: 4,
  batteryCapacityMah: 5000,
  batteryMaxDischarge: 0.70,
  batteryResistanceMohm: 10,
  motorKv: 1000,
  motorIo: 1.2,
  motorRmMohm: 28,
  motorMaxCurrentA: 25,
  propDiameterInch: 10,
  propPitchInch: 4.5,
  ct: 0.11,
  cp: 0.045,
};

// ─────────────────────────────────────────────────────────────
// Warning engine
// ─────────────────────────────────────────────────────────────
function deriveWarnings(result: XcopterCalcResult, inputs: XcopterCalcInput, correctedTemp: number, correctedFlightMin: number): Warning[] {
  const w: Warning[] = [];

  // FIXED TWR: total thrust vs total flying weight
  const totalWeightG = inputs.auwG + inputs.payloadG;
  const twr = result.performance.totalThrustG / totalWeightG;
  if (twr < 1.2) w.push({ level: "danger", message: `TWR ${twr.toFixed(2)}:1 — unsafe, need ≥1.5 for stable flight.` });
  else if (twr < 1.8) w.push({ level: "warn", message: `TWR ${twr.toFixed(2)}:1 — marginal. Aim for ≥2.0 for good control authority.` });

  // FIXED motor temperature
  if (correctedTemp > 160) w.push({ level: "danger", message: `Motor temp ~${correctedTemp.toFixed(0)}°C — exceeds 160°C limit. Reduce hover current.` });
  else if (correctedTemp > 100) w.push({ level: "warn", message: `Motor temp ~${correctedTemp.toFixed(0)}°C — approaching thermal limit.` });

  // FIXED flight time
  if (correctedFlightMin < 3) w.push({ level: "danger", message: `Hover flight time ${correctedFlightMin.toFixed(1)} min — critically short.` });
  else if (correctedFlightMin < 6) w.push({ level: "warn", message: `Hover flight time ${correctedFlightMin.toFixed(1)} min — short. Consider larger battery.` });

  // Hover throttle — should stay below 70% for headroom
  if (result.hover.throttlePercent > 85) w.push({ level: "danger", message: `Hover throttle ${result.hover.throttlePercent.toFixed(0)}% — no climb/manoeuvre margin.` });
  else if (result.hover.throttlePercent > 70) w.push({ level: "warn", message: `Hover throttle ${result.hover.throttlePercent.toFixed(0)}% — limited headroom. Consider larger props or higher KV.` });

  // Disc loading — high loading = inefficient, unstable
  if (result.hover.discLoadingNm2 > 100) w.push({ level: "warn", message: `Disc loading ${result.hover.discLoadingNm2.toFixed(0)} N/m² — high, efficiency and stability affected.` });

  return w;
}

// ─────────────────────────────────────────────────────────────
// CSV Export
// ─────────────────────────────────────────────────────────────
function exportCSV(result: XcopterCalcResult, inputs: XcopterCalcInput, correctedFlightMin: number) {
  const rows: string[] = [
    "XcopterCalc Export",
    `Rotors,${inputs.numRotors}`,
    `AUW (g),${inputs.auwG}`,
    `Payload (g),${inputs.payloadG}`,
    `Battery,${inputs.batteryCells}S ${inputs.batteryCapacityMah}mAh`,
    `Motor KV,${inputs.motorKv}`,
    `Prop,${inputs.propDiameterInch}×${inputs.propPitchInch}`,
    "",
    "Key Results",
    `Hover Flight Time (min),${correctedFlightMin.toFixed(1)}`,
    `Total Thrust (g),${result.performance.totalThrustG.toFixed(0)}`,
    `TWR,${result.performance.thrustWeightRatio.toFixed(2)}`,
    `Hover Throttle (%),${result.hover.throttlePercent.toFixed(1)}`,
    `Hover Current per Motor (A),${result.hover.currentA.toFixed(1)}`,
    `Hover Power (W),${result.hover.powerW.toFixed(0)}`,
    `Disc Loading (N/m²),${result.hover.discLoadingNm2.toFixed(1)}`,
    `Est. Range (km),${result.performance.estimatedRangeKm.toFixed(1)}`,
    "",
    "Throttle Curve (per rotor)",
    "Throttle%,RPM,Thrust g,Power W,Current A",
    ...result.throttleCurve.map(r =>
      `${r.throttle.toFixed(0)},${r.rpm.toFixed(0)},${r.thrustG.toFixed(0)},${r.powerW.toFixed(0)},${r.currentA.toFixed(1)}`
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "xcopter_results.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────
// Shared UI — identical API to PropCalcPanel for consistency
// ─────────────────────────────────────────────────────────────
const TOOLTIP_STYLE: React.CSSProperties = {
  fontFamily: "Michroma, sans-serif",
  fontSize: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 2,
};

function Field({
  label, id, value, onChange, step = "any", hint, className = "", warn,
}: {
  label: string; id: string; value: number;
  onChange: (v: number) => void; step?: string;
  hint?: string; className?: string; warn?: boolean;
}) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className={`w-full py-0.5 relative ${className}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <label className={`text-[8px] tracking-widest uppercase ${warn ? "text-amber-500" : "text-[#808080]"}`}
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
        className={`border w-full text-[11px] px-2 py-1 focus:outline-none transition-colors bg-white ${
          warn ? "border-amber-400 focus:border-amber-500" : "border-gray-200 focus:border-[#ffc812]"
        }`}
        style={{ fontFamily: "Michroma, sans-serif" }}
      />
    </div>
  );
}

function CollapsibleSection({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 mb-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-black px-3 py-2 flex items-center justify-between"
      >
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
           style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
        <span className={`text-[#ffc812] text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="p-2 space-y-0.5">{children}</div>}
    </div>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-1.5 pr-3 text-[10px] text-[#ffc812]" style={{ fontFamily: "Lexend, sans-serif" }}>{label}</td>
      <td className={`py-1.5 text-[11px] font-bold text-right ${warn ? "text-amber-500" : "text-black"}`}
          style={{ fontFamily: "Michroma, sans-serif" }}>{value}</td>
    </tr>
  );
}

function StatCard({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className={`border p-3 text-center ${warn ? "border-amber-300 bg-amber-50/50" : "border-gray-100"}`}>
      <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1"
         style={{ fontFamily: "Michroma, sans-serif" }}>{label}</p>
      <p className={`text-base font-black ${warn ? "text-amber-600" : "text-black"}`}
         style={{ fontFamily: "Michroma, sans-serif" }}>{value}</p>
      {sub && <p className="text-[9px] text-[#808080] mt-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>{sub}</p>}
    </div>
  );
}

function WarningBar({ warnings }: { warnings: Warning[] }) {
  if (!warnings.length) return null;
  return (
    <div className="mb-4 space-y-1.5">
      {warnings.map((w, i) => (
        <div key={i} className={`flex items-start gap-2 px-3 py-2 border-l-2 text-[10px] ${
          w.level === "danger"
            ? "border-red-500 bg-red-50 text-red-700"
            : "border-amber-400 bg-amber-50 text-amber-700"
        }`} style={{ fontFamily: "Lexend, sans-serif" }}>
          <span className="mt-0.5 flex-shrink-0">{w.level === "danger" ? "✕" : "⚠"}</span>
          {w.message}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────
export default function XcopterCalcPanel() {
  const [inputs, setInputs] = useState<XcopterCalcInput>(DEFAULTS);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [activeChart, setActiveChart] = useState<"throttle" | "flighttime" | "efficiency">("throttle");
  const presets = useMotorPresets();

  const set = useCallback((key: keyof XcopterCalcInput) => (v: number) =>
    setInputs(prev => ({ ...prev, [key]: v })), []);

  const applyPreset = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;
    setInputs(prev => ({
      ...prev,
      motorKv: preset.kv,
      batteryCells: preset.recommendedVoltage,
      motorMaxCurrentA: preset.peakCurrent,
      propDiameterInch: preset.recommendedPropMin,
      motorIo: preset.estimatedIo,
      motorRmMohm: preset.estimatedRmMohm,
    }));
    setSelectedPreset(presetId);
  };

  const result: XcopterCalcResult = useMemo(() => calcXcopter(inputs), [inputs]);

  // ── FIXED: Motor temperature via thermal resistance model ──
  // P_loss (hover) = P_copper + P_iron = I²·Rm + Io·V
  // T_winding = T_ambient + Rth × P_loss  (Rth ≈ 6°C/W for copter motors, larger frame)
  const hoverMotorLossW = useMemo(() => {
    const I = result.hover.currentA;
    const Rm = inputs.motorRmMohm / 1000;
    const Io = inputs.motorIo;
    const V = result.hover.voltageV;
    return I * I * Rm + Io * V;
  }, [result, inputs]);

  const correctedHoverTempC = useMemo(() =>
    inputs.temperatureC + 6 * hoverMotorLossW,
    [inputs.temperatureC, hoverMotorLossW]);

  const maxMotorLossW = useMemo(() => {
    const I = result.maximum.currentA;
    const Rm = inputs.motorRmMohm / 1000;
    const Io = inputs.motorIo;
    const nomV = inputs.batteryCells * 3.7;
    return I * I * Rm + Io * nomV;
  }, [result, inputs]);

  const correctedMaxTempC = useMemo(() =>
    inputs.temperatureC + 6 * maxMotorLossW,
    [inputs.temperatureC, maxMotorLossW]);

  // ── FIXED: Loaded voltage (accounts for battery + motor resistance sag) ──
  const loadedVoltageV = useMemo(() => {
    const nominalV = inputs.batteryCells * 3.7;
    const totalRMohm = inputs.batteryResistanceMohm * inputs.batteryCells + inputs.motorRmMohm;
    // Total current drawn (all rotors)
    const totalCurrentA = result.hover.currentA * inputs.numRotors;
    return nominalV - totalCurrentA * (totalRMohm / 1000);
  }, [inputs, result]);

  // ── FIXED: Flight time — use actual hover power from loaded voltage ──
  // E = capacity_Ah × V_loaded × discharge_fraction (Wh)
  // P_hover_total = hover power per motor × num rotors
  // t = E / P_hover_total (hours) × 60 (min)
  const correctedHoverFlightMin = useMemo(() => {
    const energyWh = (inputs.batteryCapacityMah / 1000) * loadedVoltageV * inputs.batteryMaxDischarge;
    const hoverPowerTotal = result.hover.powerW * inputs.numRotors;
    if (hoverPowerTotal <= 0) return 0;
    return (energyWh / hoverPowerTotal) * 60;
  }, [inputs, loadedVoltageV, result]);

  // ── FIXED: TWR uses actual AUW + payload ──
  const totalWeightG = inputs.auwG + inputs.payloadG;
  const correctedTWR = result.performance.totalThrustG / totalWeightG;

  const warnings = useMemo(() =>
    deriveWarnings(result, inputs, correctedHoverTempC, correctedHoverFlightMin),
    [result, inputs, correctedHoverTempC, correctedHoverFlightMin]);

  // Chart data
  const throttleData = useMemo(() => result.throttleCurve.map(r => ({
    throttle: `${r.throttle.toFixed(0)}%`,
    "Thrust (g)": +r.thrustG.toFixed(1),
    "Power (W)": +r.powerW.toFixed(1),
    "Current (A)": +r.currentA.toFixed(1),
  })), [result]);

  const flightTimeData = useMemo(() => [
    { mode: "Hover", minutes: +correctedHoverFlightMin.toFixed(1) },
    { mode: "Mixed (65%)", minutes: +(correctedHoverFlightMin * 0.75).toFixed(1) },
    { mode: "Full Thr", minutes: +(correctedHoverFlightMin * 0.40).toFixed(1) },
  ], [correctedHoverFlightMin]);

  // Efficiency map from throttle curve
  const effMapData = useMemo(() => result.throttleCurve.map(r => {
    const mechPower = r.thrustG * 9.81 / 1000 * Math.sqrt(r.thrustG * 9.81 / 1000 / (2 * 1.225 * Math.PI * Math.pow(inputs.propDiameterInch * 0.0254 / 2, 2)));
    const eff = r.powerW > 0 ? Math.min(95, (mechPower / r.powerW) * 100) : 0;
    return {
      throttle: r.throttle,
      power: +r.powerW.toFixed(1),
      eff: +eff.toFixed(1),
    };
  }), [result, inputs]);

  return (
    <div className="space-y-4">
      {/* ── COMPACT INPUTS ──────────────────────────────────────── */}
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
          <option value="">— Select Motor —</option>
          {presets.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.kv}KV, {p.recommendedVoltage}S)</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <CollapsibleSection title="Multirotor Config" defaultOpen>
          <Field label="# Rotors" id="xnr" value={inputs.numRotors} onChange={set("numRotors")} step="1"
                 hint="Number of rotors (4 = quad, 6 = hex, 8 = octo)." />
          <Field label="AUW (g)" id="xaw" value={inputs.auwG} onChange={set("auwG")}
                 hint="All-up weight without payload." />
          <Field label="Payload (g)" id="xpg" value={inputs.payloadG} onChange={set("payloadG")}
                 hint="Additional carried weight." className="col-span-2" />
        </CollapsibleSection>

        <CollapsibleSection title="Battery" defaultOpen>
          <Field label="Cells (S)" id="xbc" value={inputs.batteryCells} onChange={set("batteryCells")} step="1"
                 hint="LiPo cells in series. Nominal voltage = cells × 3.7V." />
          <Field label="Capacity (mAh)" id="xbm" value={inputs.batteryCapacityMah} onChange={set("batteryCapacityMah")} step="100"
                 hint="Battery energy capacity." />
          <Field label="Max Disch (%)" id="xbd" value={inputs.batteryMaxDischarge * 100}
                 onChange={v => set("batteryMaxDischarge")(v / 100)}
                 hint="Usable proportion. 80% is safe for LiPo." />
          <Field label="Resist (mΩ/cell)" id="xbr" value={inputs.batteryResistanceMohm} onChange={set("batteryResistanceMohm")}
                 hint="Internal resistance per cell." />
        </CollapsibleSection>

        <CollapsibleSection title="Motor" defaultOpen>
          <Field label="KV (rpm/V)" id="xkv" value={inputs.motorKv} onChange={set("motorKv")} step="1"
                 hint="Motor velocity constant." />
          <Field label="Io (A)" id="xio" value={inputs.motorIo} onChange={set("motorIo")} step="0.1"
                 hint="No-load current." />
          <Field label="Rm (mΩ)" id="xrm" value={inputs.motorRmMohm} onChange={set("motorRmMohm")}
                 hint="Winding resistance." />
          <Field label="Max Curr (A)" id="xmc" value={inputs.motorMaxCurrentA} onChange={set("motorMaxCurrentA")}
                 hint="Continuous current limit." />
        </CollapsibleSection>

        <CollapsibleSection title="Propeller" defaultOpen>
          <Field label="Dia (inch)" id="xpd" value={inputs.propDiameterInch} onChange={set("propDiameterInch")} step="0.5"
                 hint="Propeller diameter." />
          <Field label="Pitch (inch)" id="xpp" value={inputs.propPitchInch} onChange={set("propPitchInch")} step="0.1"
                 hint="Theoretical advance per revolution." />
          <Field label="CT" id="xct" value={inputs.ct} onChange={set("ct")} step="0.005"
                 hint="Thrust coefficient. Typical: 0.09–0.14." />
          <Field label="CP" id="xcp" value={inputs.cp} onChange={set("cp")} step="0.005"
                 hint="Power coefficient. Typical: 0.04–0.07." />
        </CollapsibleSection>

        <CollapsibleSection title="Environment" defaultOpen={false}>
          <Field label="Elevation (m)" id="xel" value={inputs.elevationM} onChange={set("elevationM")}
                 hint="Flight altitude above sea level." />
          <Field label="Temp (°C)" id="xtc" value={inputs.temperatureC} onChange={set("temperatureC")}
                 hint="Ambient air temperature." />
          <Field label="Pressure (hPa)" id="xph" value={inputs.pressureHpa} onChange={set("pressureHpa")}
                 hint="Local barometric pressure. ISA = 1013.25 hPa." />
        </CollapsibleSection>
      </div>

      {/* ── RESULTS ──────────────────────────────────────── */}
      <div>
        {/* Action bar */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] tracking-[0.3em] uppercase"
             style={{ fontFamily: "Michroma, sans-serif" }}>
            {warnings.length > 0
              ? <span className="text-amber-500">{warnings.length} alert{warnings.length > 1 ? "s" : ""} — review below</span>
              : <span className="text-green-600">✓ All values within normal range</span>}
          </p>
          <button
            onClick={() => exportCSV(result, inputs, correctedHoverFlightMin)}
            className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 text-[9px] tracking-widest uppercase hover:bg-black hover:text-[#ffc812] hover:border-black transition-colors"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            ↓ Export CSV
          </button>
        </div>

        {/* Warnings */}
        <WarningBar warnings={warnings} />

        {/* Gauges */}
        <div className="border border-gray-100 p-4 mb-4">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812] mb-4"
             style={{ fontFamily: "Michroma, sans-serif" }}>Key Metrics</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 justify-items-center">
            <GaugeMeter value={result.hover.rpm} max={20000} label="Hover RPM" unit="rpm" yellowAt={0.60} redAt={0.80} />
            <GaugeMeter value={result.hover.currentA} max={50} label="Hover Curr" unit="A" yellowAt={0.60} redAt={0.80} />
            <GaugeMeter value={result.hover.powerW} max={1500} label="Hover Pwr" unit="W" yellowAt={0.60} redAt={0.80} />
            {/* FIXED: corrected TWR */}
            <GaugeMeter value={correctedTWR} max={4} label="TWR" unit=":1" yellowAt={0.50} redAt={0.30} />
            {/* FIXED: corrected hover time */}
            <GaugeMeter value={correctedHoverFlightMin} max={30} label="Hover Time" unit="min" yellowAt={0.33} redAt={0.17} />
            {/* FIXED: corrected temperature */}
            <GaugeMeter value={correctedHoverTempC} max={120} label="Motor Temp" unit="°C" yellowAt={0.50} redAt={0.70} />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <StatCard label="Total Thrust" value={`${result.performance.totalThrustG.toFixed(0)} g`}
                    sub={`${correctedTWR.toFixed(2)}:1 TWR`}
                    warn={correctedTWR < 2.0} />
          <StatCard label="Hover Throttle" value={`${result.hover.throttlePercent.toFixed(1)} %`}
                    sub="of max throttle"
                    warn={result.hover.throttlePercent > 65} />
          <StatCard label="Hover Flight" value={`${correctedHoverFlightMin.toFixed(1)} min`}
                    sub="corrected (loaded V)"
                    warn={correctedHoverFlightMin < 10} />
          <StatCard label="Disc Loading" value={`${result.hover.discLoadingNm2.toFixed(1)} N/m²`}
                    sub="per rotor" />
        </div>

        {/* Detail tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Hover Point</p>
            </div>
            <div className="p-3">
              <table className="w-full">
                <tbody>
                  <Row label="RPM (per rotor)" value={result.hover.rpm.toFixed(0)} />
                  <Row label="Current (per rotor)" value={`${result.hover.currentA.toFixed(1)} A`} />
                  <Row label="Voltage (loaded)" value={`${loadedVoltageV.toFixed(2)} V`} />
                  <Row label="Power (per rotor)" value={`${result.hover.powerW.toFixed(0)} W`} />
                  <Row label="Power (total)" value={`${(result.hover.powerW * inputs.numRotors).toFixed(0)} W`} />
                  <Row label="Throttle" value={`${result.hover.throttlePercent.toFixed(1)} %`}
                       warn={result.hover.throttlePercent > 65} />
                  <Row label="Motor Temp (est.)" value={`${correctedHoverTempC.toFixed(0)} °C`}
                       warn={correctedHoverTempC > 85} />
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Maximum</p>
            </div>
            <div className="p-3">
              <table className="w-full">
                <tbody>
                  <Row label="RPM per rotor" value={result.maximum.rpm.toFixed(0)} />
                  <Row label="Current (per rotor)" value={`${result.maximum.currentA.toFixed(1)} A`}
                       warn={result.maximum.currentA > inputs.motorMaxCurrentA * 0.9} />
                  <Row label="Thrust (per rotor)" value={`${result.maximum.thrustG.toFixed(0)} g`} />
                  <Row label="Total Thrust" value={`${result.performance.totalThrustG.toFixed(0)} g`} />
                  <Row label="TWR (corrected)" value={`${correctedTWR.toFixed(2)} : 1`}
                       warn={correctedTWR < 2.0} />
                  <Row label="Motor Temp (max)" value={`${correctedMaxTempC.toFixed(0)} °C`}
                       warn={correctedMaxTempC > 85} />
                  <Row label="Est. Range" value={`${result.performance.estimatedRangeKm.toFixed(1)} km`} />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="border border-gray-100 mb-4">
          <div className="bg-black px-3 py-1.5 flex items-center gap-4">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Performance Charts</p>
            <div className="flex gap-1 ml-auto">
              {(["throttle", "flighttime", "efficiency"] as const).map(t => (
                <button key={t} onClick={() => setActiveChart(t)}
                  className={`text-[8px] tracking-widest uppercase px-2 py-0.5 transition-colors ${
                    activeChart === t ? "bg-[#ffc812] text-black" : "text-white/50 hover:text-white"
                  }`}
                  style={{ fontFamily: "Michroma, sans-serif" }}>
                  {t === "flighttime" ? "flight time" : t}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              {activeChart === "throttle" ? (
                <LineChart data={throttleData} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="throttle" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Line type="monotone" dataKey="Thrust (g)" stroke="#ffc812" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Power (W)" stroke="#111" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Current (A)" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : activeChart === "flighttime" ? (
                <BarChart data={flightTimeData} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mode" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} unit=" min" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="minutes" fill="#ffc812" radius={[2, 2, 0, 0]} label={{ position: "top", fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                </BarChart>
              ) : (
                <ScatterChart margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="throttle" name="Throttle %" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }}
                         label={{ value: "Throttle %", position: "insideBottom", offset: -2, fontSize: 9 }} />
                  <YAxis dataKey="power" name="Power (W)" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }}
                         label={{ value: "W", angle: -90, position: "insideLeft", fontSize: 9 }} />
                  <ZAxis dataKey="eff" range={[30, 400]} name="Efficiency %" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, n: string) => [v, n]} />
                  <Scatter name="Eff %" data={effMapData} fill="#ffc812" opacity={0.85} />
                </ScatterChart>
              )}
            </ResponsiveContainer>
            {activeChart === "efficiency" && (
              <p className="text-[9px] text-[#808080] mt-1 text-center" style={{ fontFamily: "Lexend, sans-serif" }}>
                Bubble size ∝ propulsive efficiency %. Larger = better operating point.
              </p>
            )}
          </div>
        </div>

        {/* Throttle curve table */}
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Throttle Curve (per rotor)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] min-w-[500px]" style={{ fontFamily: "Michroma, sans-serif" }}>
              <thead>
                <tr className="bg-gray-50">
                  {["Throttle %", "RPM", "Thrust g", "Power W", "Current A", "g/W"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[8px] tracking-wider text-[#808080] font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.throttleCurve.map((r, i) => {
                  const gW = r.powerW > 0 ? r.thrustG / r.powerW : 0;
                  const isHover = Math.abs(r.throttle - result.hover.throttlePercent) < 5;
                  return (
                    <tr key={i} className={isHover ? "bg-[#ffc812]/10 font-bold" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-3 py-2">{r.throttle.toFixed(0)}{isHover ? " ← hover" : ""}</td>
                      <td className="px-3 py-2">{r.rpm.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.thrustG.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.powerW.toFixed(0)}</td>
                      <td className={`px-3 py-2 ${r.currentA > inputs.motorMaxCurrentA ? "text-red-500" : ""}`}>
                        {r.currentA.toFixed(1)}
                      </td>
                      <td className={`px-3 py-2 ${gW > 8 ? "text-green-600 font-bold" : ""}`}>
                        {gW.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Environment / summary bar */}
        <div className="mt-4 flex items-center gap-3 bg-[#ffc812]/5 border border-[#ffc812]/20 px-4 py-2.5">
          <div className="w-1 h-8 bg-[#ffc812] flex-shrink-0" />
          <p className="text-[10px] text-[#555]" style={{ fontFamily: "Lexend, sans-serif" }}>
            Air density: <strong className="text-black">{result.environment?.airDensityKgm3?.toFixed(4) ?? "—"} kg/m³</strong>
            {" "}· Loaded V: <strong className="text-black">{loadedVoltageV.toFixed(2)} V</strong>
            {" "}· TWR (corrected): <strong className="text-black">{correctedTWR.toFixed(2)}:1</strong>
            {" "}· Hover at: <strong className="text-black">{result.hover.throttlePercent.toFixed(0)}%</strong> throttle
          </p>
        </div>
      </div>
    </div>
  );
}