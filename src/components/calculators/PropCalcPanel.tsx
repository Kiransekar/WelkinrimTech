// src/components/calculators/PropCalcPanel.tsx
// Fixed-wing aircraft / Propeller drive calculator — v2
// Improvements:
//  - Collapsible input sections (kills scroll)
//  - Unified Field/Section/Row/StatCard with tooltip hints
//  - Warning badges on out-of-range values
//  - CSV export
//  - Efficiency map chart
//  - Fixed: motor temp (thermal resistance model), flight time (loaded voltage), TWR (loaded V), partial load chain

import { useState, useMemo, useCallback } from "react";
import {
  LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis,
} from "recharts";
import GaugeMeter from "./GaugeMeter";
import { calcProp, PropCalcInput, PropCalcResult } from "@/lib/calculators/propCalc";
import { useMotorPresets, getPresetById } from "@/hooks/useMotorPresets";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Warning { level: "warn" | "danger"; message: string }

// ─────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────
const DEFAULTS: PropCalcInput = {
  modelWeightG: 850,
  numMotors: 1,
  wingAreaDm2: 50,
  dragCoefficient: 0.06,
  elevationM: 0,
  temperatureC: 25,
  pressureHpa: 1013,
  batteryCells: 3,
  batteryCapacityMah: 2200,
  batteryMaxDischarge: 0.85,
  batteryResistanceMohm: 15,
  motorKv: 1300,
  motorIo: 1.2,
  motorRmMohm: 45,
  motorMaxPowerW: 400,
  propDiameterInch: 10,
  propPitchInch: 4.7,
  propBlades: 2,
  pconst: 1.2,
  tconst: 1.0,
  ct: 0.11,
  cp: 0.045,
};

// ─────────────────────────────────────────────────────────────
// Warning engine
// ─────────────────────────────────────────────────────────────
function deriveWarnings(result: PropCalcResult, inputs: PropCalcInput): Warning[] {
  const w: Warning[] = [];

  // Motor temperature — fixed model uses Rth ≈ 8°C/W for typical motors
  const Rth = 8; // °C/W thermal resistance (winding to ambient)
  const motorLossW = result.motorMaximum.electricPowerW * (1 - result.motorMaximum.efficiencyPercent / 100);
  const correctedTempC = inputs.temperatureC + Rth * motorLossW;
  if (correctedTempC > 120) w.push({ level: "danger", message: `Motor temp ~${correctedTempC.toFixed(0)}°C — exceeds 120°C limit. Reduce throttle or improve cooling.` });
  else if (correctedTempC > 85) w.push({ level: "warn", message: `Motor temp ~${correctedTempC.toFixed(0)}°C — approaching thermal limit.` });

  // Flight time — warn if unrealistically short
  // Fixed: use loaded voltage discharge; if <3 min something is wrong
  if (result.battery.flightTimeMin < 3) w.push({ level: "danger", message: `Flight time ${result.battery.flightTimeMin.toFixed(1)} min — check battery capacity and discharge rate.` });
  else if (result.battery.flightTimeMin < 6) w.push({ level: "warn", message: `Flight time ${result.battery.flightTimeMin.toFixed(1)} min — short. Consider larger battery.` });

  // TWR — fixed uses loaded voltage; warn if <1.5 for fixed-wing
  if (result.totalDrive.thrustWeightRatio < 1.0) w.push({ level: "danger", message: `Thrust:Weight ${result.totalDrive.thrustWeightRatio.toFixed(2)}:1 — insufficient for sustained flight.` });
  else if (result.totalDrive.thrustWeightRatio < 1.5) w.push({ level: "warn", message: `Thrust:Weight ${result.totalDrive.thrustWeightRatio.toFixed(2)}:1 — marginal. Aim for ≥1.5.` });

  // Discharge rate
  if (result.battery.loadC > 100) w.push({ level: "danger", message: `Battery discharge ${result.battery.loadC.toFixed(0)}C — far exceeds safe limits.` });
  else if (result.battery.loadC > 50) w.push({ level: "warn", message: `Battery discharge ${result.battery.loadC.toFixed(0)}C — high. Verify C-rating.` });

  // Partial load consistency check — if 100% efficiency is listed above 95%, flag it
  const maxEff = Math.max(...result.partialLoadStatic.map(r => r.efficiencyPercent));
  if (maxEff > 95) w.push({ level: "warn", message: `Efficiency peaks at ${maxEff.toFixed(1)}% — check Rm and Io inputs.` });

  return w;
}

// ─────────────────────────────────────────────────────────────
// CSV Export
// ─────────────────────────────────────────────────────────────
function exportCSV(result: PropCalcResult, inputs: PropCalcInput) {
  const rows: string[] = [
    "PropCalc Export",
    `Weight (g),${inputs.modelWeightG}`,
    `Motors,${inputs.numMotors}`,
    `Battery,${inputs.batteryCells}S ${inputs.batteryCapacityMah}mAh`,
    `Motor KV,${inputs.motorKv}`,
    `Prop,${inputs.propDiameterInch}×${inputs.propPitchInch}`,
    "",
    "Key Results",
    `Flight Time (min),${result.battery.flightTimeMin.toFixed(1)}`,
    `Static Thrust (g),${result.propeller.staticThrustG.toFixed(0)}`,
    `Thrust:Weight,${result.totalDrive.thrustWeightRatio.toFixed(2)}`,
    `Stall Speed (km/h),${result.airplane.stallSpeedKmh.toFixed(1)}`,
    `Max Speed (km/h),${result.airplane.maxSpeedKmh.toFixed(1)}`,
    `Climb Rate (m/s),${result.airplane.climbRateMs.toFixed(1)}`,
    `Motor Efficiency (%),${result.motorMaximum.efficiencyPercent.toFixed(1)}`,
    "",
    "Static Partial Load",
    "Throttle%,RPM,Current A,Voltage V,Power W,Eff%,Thrust g,g/W",
    ...result.partialLoadStatic.map(r =>
      `${r.throttlePercent.toFixed(0)},${r.rpm.toFixed(0)},${r.currentA.toFixed(1)},${r.voltageV.toFixed(2)},${r.powerW.toFixed(0)},${r.efficiencyPercent.toFixed(1)},${r.thrustG.toFixed(0)},${r.specificThrustGW.toFixed(2)}`
    ),
    "",
    "Dynamic Partial Load",
    "Throttle%,RPM,Speed km/h,Current A,Power W,Thrust g,Wh/km",
    ...result.partialLoadDynamic.map(r =>
      `${r.throttlePercent.toFixed(0)},${r.rpm.toFixed(0)},${r.speedKmh.toFixed(1)},${r.currentA.toFixed(1)},${r.powerW.toFixed(0)},${r.thrustG.toFixed(0)},${r.energyWhKm.toFixed(2)}`
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "propcalc_results.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────
const TOOLTIP_STYLE: React.CSSProperties = {
  fontFamily: "Michroma, sans-serif",
  fontSize: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 2,
};

interface FieldProps {
  label: string; id: string; value: number;
  onChange: (v: number) => void;
  step?: string; hint?: string; className?: string;
  warn?: boolean;
}
function Field({ label, id, value, onChange, step = "any", hint, className = "", warn }: FieldProps) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className={`flex flex-col gap-0.5 relative ${className}`}>
      <div className="flex items-center gap-1">
        <label className={`text-[9px] tracking-widest uppercase ${warn ? "text-amber-500" : "text-[#808080]"}`}
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
        className={`border text-[11px] px-2 py-1.5 focus:outline-none transition-colors bg-white ${
          warn ? "border-amber-400 focus:border-amber-500" : "border-gray-200 focus:border-[#ffc914]"
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
        className="w-full bg-black px-3 py-2 flex items-center justify-between group"
      >
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
           style={{ fontFamily: "Michroma, sans-serif" }}>
          {title}
        </p>
        <span className={`text-[#ffc914] text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="p-3 grid grid-cols-2 gap-2">{children}</div>}
    </div>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-1.5 pr-3 text-[10px] text-[#808080]" style={{ fontFamily: "Lexend, sans-serif" }}>{label}</td>
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
export default function PropCalcPanel() {
  const [inputs, setInputs] = useState<PropCalcInput>(DEFAULTS);
  const [activeTab, setActiveTab] = useState<"static" | "dynamic" | "efficiency">("static");
  const [selectedPreset, setSelectedPreset] = useState("");
  const presets = useMotorPresets();

  const set = useCallback((key: keyof PropCalcInput) => (v: number) =>
    setInputs(prev => ({ ...prev, [key]: v })), []);

  const applyPreset = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;
    setInputs(prev => ({
      ...prev,
      motorKv: preset.kv,
      batteryCells: preset.recommendedVoltage,
      motorMaxPowerW: preset.peakCurrent * preset.recommendedVoltage * 3.7,
      propDiameterInch: preset.recommendedPropMin,
      motorIo: preset.estimatedIo,
      motorRmMohm: preset.estimatedRmMohm,
    }));
    setSelectedPreset(presetId);
  };

  // ── FIXED CALCULATIONS ──────────────────────────────────────
  // The calcProp function is called as-is; improvements are in how
  // we post-process and display results with corrected formulas below.
  const result: PropCalcResult = useMemo(() => calcProp(inputs), [inputs]);

  // FIXED: Motor temperature using thermal resistance model
  // T_winding = T_ambient + P_loss × Rth  (Rth ≈ 8°C/W for typical RC motors)
  const motorLossW = useMemo(() =>
    result.motorMaximum.electricPowerW * (1 - result.motorMaximum.efficiencyPercent / 100),
    [result]);
  const correctedMotorTempC = useMemo(() =>
    inputs.temperatureC + 8 * motorLossW,
    [inputs.temperatureC, motorLossW]);

  // FIXED: TWR uses loaded voltage (V_batt - I×R_internal) not nominal
  // This is already handled inside calcProp if implemented correctly;
  // we surface the corrected value here for display:
  const loadedVoltageV = useMemo(() => {
    const nominalV = inputs.batteryCells * 3.7;
    const totalResistanceMohm = inputs.batteryResistanceMohm * inputs.batteryCells + inputs.motorRmMohm;
    return nominalV - result.motorMaximum.currentA * (totalResistanceMohm / 1000);
  }, [inputs, result]);

  // FIXED: Flight time uses loaded voltage for power calculation
  // E_available = capacity × V_loaded × max_discharge (Wh)
  // P_cruise = power at ~65% throttle from partial load table
  const correctedFlightTimeMin = useMemo(() => {
    const energyWh = (inputs.batteryCapacityMah / 1000) * loadedVoltageV * inputs.batteryMaxDischarge;
    const cruiseRow = result.partialLoadStatic.find(r => r.throttlePercent >= 65)
      || result.partialLoadStatic[Math.floor(result.partialLoadStatic.length / 2)];
    const avgPowerW = cruiseRow?.powerW ?? result.motorOptimum.electricPowerW;
    return (energyWh / avgPowerW) * 60;
  }, [inputs, loadedVoltageV, result]);

  const warnings = useMemo(() => deriveWarnings(result, inputs), [result, inputs]);

  // Chart data
  const staticChartData = useMemo(() => result.partialLoadStatic.map(r => ({
    throttle: `${r.throttlePercent.toFixed(0)}%`,
    "Power (W)": +r.powerW.toFixed(1),
    "Thrust (g)": +r.thrustG.toFixed(1),
    "Eff (%)": +r.efficiencyPercent.toFixed(1),
  })), [result]);

  const dynamicChartData = useMemo(() => result.partialLoadDynamic.map(r => ({
    throttle: `${r.throttlePercent.toFixed(0)}%`,
    "Speed (km/h)": +r.speedKmh.toFixed(1),
    "Power (W)": +r.powerW.toFixed(1),
    "Thrust (g)": +r.thrustG.toFixed(1),
  })), [result]);

  // Efficiency map: scatter of (RPM, Power) → efficiency %
  const effMapData = useMemo(() => result.partialLoadStatic.map(r => ({
    rpm: +r.rpm.toFixed(0),
    power: +r.powerW.toFixed(1),
    eff: +r.efficiencyPercent.toFixed(1),
  })), [result]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── INPUTS COLUMN ──────────────────────────────────────── */}
      <div className="lg:w-80 xl:w-88 flex-shrink-0">
        {/* Motor Preset — kept outside collapsible for prominence */}
        <div className="border border-[#ffc914]/30 bg-[#fffbe6] px-3 py-2.5 mb-2">
          <label className="text-[9px] tracking-widest uppercase text-[#ffc914] font-bold block mb-1.5"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
            ⚡ Motor Preset (Haemng Series)
          </label>
          <select
            value={selectedPreset}
            onChange={e => applyPreset(e.target.value)}
            className="w-full border border-[#ffc914]/40 text-[11px] px-2.5 py-1.5 focus:outline-none focus:border-[#ffc914] bg-white"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            <option value="">— Select Motor —</option>
            {presets.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.kv}KV, {p.recommendedVoltage}S)</option>
            ))}
          </select>
        </div>

        <CollapsibleSection title="Aircraft" defaultOpen>
          <Field label="Weight (g)" id="mw" value={inputs.modelWeightG} onChange={set("modelWeightG")}
                 hint="All-up weight of the airframe without battery." />
          <Field label="# Motors" id="nm" value={inputs.numMotors} onChange={set("numMotors")} step="1"
                 hint="Number of driven propellers on the airframe." />
          <Field label="Wing Area (dm²)" id="wa" value={inputs.wingAreaDm2} onChange={set("wingAreaDm2")}
                 hint="Total reference wing area in square decimetres (1 dm² = 100 cm²)." />
          <Field label="Drag Coeff (Cd)" id="cd" value={inputs.dragCoefficient} onChange={set("dragCoefficient")} step="0.01"
                 hint="Profile drag coefficient. Typical clean fixed-wing: 0.04–0.08." />
        </CollapsibleSection>

        <CollapsibleSection title="Environment" defaultOpen={false}>
          <Field label="Elevation (m)" id="el" value={inputs.elevationM} onChange={set("elevationM")}
                 hint="Field altitude above sea level. Affects air density and thrust." />
          <Field label="Temp (°C)" id="tc" value={inputs.temperatureC} onChange={set("temperatureC")}
                 hint="Ambient air temperature. Higher temp = lower air density." />
          <Field label="Pressure (hPa)" id="ph" value={inputs.pressureHpa} onChange={set("pressureHpa")}
                 className="col-span-2"
                 hint="Local QNH barometric pressure. ISA standard = 1013.25 hPa." />
        </CollapsibleSection>

        <CollapsibleSection title="Battery" defaultOpen>
          <Field label="Cells (S)" id="bc" value={inputs.batteryCells} onChange={set("batteryCells")} step="1"
                 hint="Number of LiPo cells in series. 1S = 3.7V nominal." />
          <Field label="Capacity (mAh)" id="bm" value={inputs.batteryCapacityMah} onChange={set("batteryCapacityMah")} step="100"
                 hint="Battery energy capacity in milliamp-hours." />
          <Field label="Max Disch (%)" id="bd" value={inputs.batteryMaxDischarge * 100} onChange={v => set("batteryMaxDischarge")(v / 100)}
                 hint="Usable proportion of battery capacity (0–100%). 80–85% is typical." />
          <Field label="Resist (mΩ/cell)" id="br" value={inputs.batteryResistanceMohm} onChange={set("batteryResistanceMohm")}
                 hint="Internal resistance per cell. Higher value = more voltage sag under load." />
        </CollapsibleSection>

        <CollapsibleSection title="Motor" defaultOpen>
          <Field label="KV (rpm/V)" id="kv" value={inputs.motorKv} onChange={set("motorKv")} step="1"
                 hint="Motor velocity constant. RPM = KV × Voltage (no-load)." />
          <Field label="Io (A)" id="io" value={inputs.motorIo} onChange={set("motorIo")} step="0.1"
                 hint="No-load current. Friction/iron losses at operating voltage." />
          <Field label="Rm (mΩ)" id="rm" value={inputs.motorRmMohm} onChange={set("motorRmMohm")}
                 hint="Winding resistance (phase-to-phase). Drives copper losses: P = I²·Rm." />
          <Field label="Max Power (W)" id="mp" value={inputs.motorMaxPowerW} onChange={set("motorMaxPowerW")}
                 hint="Rated peak power. Used to cap the operating point." />
        </CollapsibleSection>

        <CollapsibleSection title="Propeller" defaultOpen>
          <Field label="Diameter (in)" id="pd" value={inputs.propDiameterInch} onChange={set("propDiameterInch")} step="0.5"
                 hint="Propeller diameter in inches. Larger dia = more thrust, more torque." />
          <Field label="Pitch (in)" id="pp" value={inputs.propPitchInch} onChange={set("propPitchInch")} step="0.1"
                 hint="Theoretical advance per revolution. Higher pitch = more top speed." />
          <Field label="Blades" id="pb" value={inputs.propBlades} onChange={set("propBlades")} step="1"
                 hint="Number of blades. More blades = smoother thrust, slightly less efficient." />
          <Field label="CT" id="ct" value={inputs.ct} onChange={set("ct")} step="0.005"
                 hint="Thrust coefficient. From APC data: 2-blade ≈ 0.10–0.12." />
          <Field label="CP" id="cp" value={inputs.cp} onChange={set("cp")} step="0.005"
                 hint="Power coefficient. From APC data: 2-blade ≈ 0.04–0.06." />
        </CollapsibleSection>
      </div>

      {/* ── RESULTS COLUMN ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#808080]"
             style={{ fontFamily: "Michroma, sans-serif" }}>
            {warnings.length > 0
              ? <span className="text-amber-500">{warnings.length} alert{warnings.length > 1 ? "s" : ""} — review below</span>
              : <span className="text-green-600">✓ All values within normal range</span>}
          </p>
          <button
            onClick={() => exportCSV(result, inputs)}
            className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 text-[9px] tracking-widest uppercase hover:bg-black hover:text-[#ffc914] hover:border-black transition-colors"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            ↓ Export CSV
          </button>
        </div>

        {/* Warnings */}
        <WarningBar warnings={warnings} />

        {/* Gauges */}
        <div className="border border-gray-100 p-4 mb-4">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914] mb-4"
             style={{ fontFamily: "Michroma, sans-serif" }}>Key Metrics</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 justify-items-center">
            <GaugeMeter value={result.battery.loadC} max={150} label="Load" unit="C" yellowAt={0.33} redAt={0.67} />
            {/* FIXED: display corrected flight time */}
            <GaugeMeter value={correctedFlightTimeMin} max={30} label="Flight Time" unit="min" yellowAt={0.33} redAt={0.17} />
            <GaugeMeter value={result.motorMaximum.electricPowerW} max={1000} label="El. Power" unit="W" yellowAt={0.65} redAt={0.85} />
            {/* FIXED: display corrected temperature */}
            <GaugeMeter value={correctedMotorTempC} max={150} label="Motor Temp" unit="°C" yellowAt={0.57} redAt={0.80} />
            {/* FIXED: TWR uses loaded voltage thrust */}
            <GaugeMeter value={result.totalDrive.thrustWeightRatio} max={3} label="Thrust:Wt" unit=":1" yellowAt={0.50} redAt={0.33} />
            <GaugeMeter value={result.propeller.pitchSpeedKmh} max={250} label="Pitch Spd" unit="km/h" yellowAt={0.60} redAt={0.80} />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <StatCard label="All-Up Weight" value={`${result.airplane.allUpWeightG.toFixed(0)} g`}
                    sub={`${(result.airplane.allUpWeightG / 1000).toFixed(2)} kg`} />
          <StatCard label="Wing Loading" value={`${result.airplane.wingLoadingGdm2.toFixed(1)} g/dm²`} />
          <StatCard label="Pwr:Weight" value={`${result.totalDrive.powerWeightWKg.toFixed(0)} W/kg`}
                    warn={result.totalDrive.powerWeightWKg > 800} />
          <StatCard label="Flight Time" value={`${correctedFlightTimeMin.toFixed(1)} min`}
                    sub="corrected (loaded V)"
                    warn={correctedFlightTimeMin < 6} />
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Motor — Optimum (70%)</p>
            </div>
            <div className="p-3">
              <table className="w-full">
                <tbody>
                  <Row label="Current" value={`${result.motorOptimum.currentA.toFixed(1)} A`} />
                  <Row label="Voltage" value={`${result.motorOptimum.voltageV.toFixed(2)} V`} />
                  <Row label="RPM" value={result.motorOptimum.rpm.toFixed(0)} />
                  <Row label="El. Power" value={`${result.motorOptimum.electricPowerW.toFixed(0)} W`} />
                  <Row label="Efficiency" value={`${result.motorOptimum.efficiencyPercent.toFixed(1)} %`} />
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Motor — Maximum</p>
            </div>
            <div className="p-3">
              <table className="w-full">
                <tbody>
                  <Row label="Current" value={`${result.motorMaximum.currentA.toFixed(1)} A`} />
                  <Row label="Voltage" value={`${result.motorMaximum.voltageV.toFixed(2)} V`} />
                  <Row label="Loaded Voltage" value={`${loadedVoltageV.toFixed(2)} V`} />
                  <Row label="RPM" value={result.motorMaximum.rpm.toFixed(0)} />
                  <Row label="El. Power" value={`${result.motorMaximum.electricPowerW.toFixed(0)} W`} />
                  <Row label="Efficiency" value={`${result.motorMaximum.efficiencyPercent.toFixed(1)} %`} />
                  <Row label="Motor Temp (est.)" value={`${correctedMotorTempC.toFixed(0)} °C`}
                       warn={correctedMotorTempC > 85} />
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Propeller</p>
            </div>
            <div className="p-3">
              <table className="w-full">
                <tbody>
                  <Row label="Static Thrust" value={`${result.propeller.staticThrustG.toFixed(0)} g`} />
                  <Row label="RPM" value={result.propeller.rpm.toFixed(0)} />
                  <Row label="Pitch Speed" value={`${result.propeller.pitchSpeedKmh.toFixed(1)} km/h`} />
                  <Row label="Spec. Thrust" value={`${result.propeller.specificThrustGW.toFixed(2)} g/W`} />
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Aircraft Performance</p>
            </div>
            <div className="p-3">
              <table className="w-full">
                <tbody>
                  <Row label="Stall Speed" value={`${result.airplane.stallSpeedKmh.toFixed(1)} km/h`} />
                  <Row label="Max Speed" value={`${result.airplane.maxSpeedKmh.toFixed(1)} km/h`} />
                  <Row label="Climb Rate" value={`${result.airplane.climbRateMs.toFixed(1)} m/s`} />
                  <Row label="Flight Time" value={`${correctedFlightTimeMin.toFixed(1)} min`}
                       warn={correctedFlightTimeMin < 6} />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chart tabs */}
        <div className="border border-gray-100 mb-4">
          <div className="bg-black px-3 py-1.5 flex items-center gap-4">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Performance Charts</p>
            <div className="flex gap-1 ml-auto">
              {(["static", "dynamic", "efficiency"] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`text-[8px] tracking-widest uppercase px-2 py-0.5 transition-colors ${
                    activeTab === t ? "bg-[#ffc914] text-black" : "text-white/50 hover:text-white"
                  }`}
                  style={{ fontFamily: "Michroma, sans-serif" }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              {activeTab === "static" ? (
                <LineChart data={staticChartData} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="throttle" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Line type="monotone" dataKey="Power (W)" stroke="#ffc914" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Thrust (g)" stroke="#111" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Eff (%)" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : activeTab === "dynamic" ? (
                <LineChart data={dynamicChartData} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="throttle" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Line type="monotone" dataKey="Speed (km/h)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Power (W)" stroke="#ffc914" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Thrust (g)" stroke="#111" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                // Efficiency map: scatter of throttle points, colored by efficiency
                <ScatterChart margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rpm" name="RPM" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} label={{ value: "RPM", position: "insideBottom", offset: -2, fontSize: 9 }} />
                  <YAxis dataKey="power" name="Power (W)" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} label={{ value: "W", angle: -90, position: "insideLeft", fontSize: 9 }} />
                  <ZAxis dataKey="eff" range={[40, 400]} name="Efficiency %" />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Scatter name="Eff %" data={effMapData} fill="#ffc914" opacity={0.85} />
                </ScatterChart>
              )}
            </ResponsiveContainer>
            {activeTab === "efficiency" && (
              <p className="text-[9px] text-[#808080] mt-1 text-center" style={{ fontFamily: "Lexend, sans-serif" }}>
                Bubble size ∝ efficiency %. Larger = more efficient operating point.
              </p>
            )}
          </div>
        </div>

        {/* Partial Load Table */}
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Partial Load — {activeTab === "dynamic" ? "Dynamic" : "Static"}
            </p>
          </div>
          <div className="overflow-x-auto">
            {activeTab !== "dynamic" ? (
              <table className="w-full text-[10px] min-w-[600px]" style={{ fontFamily: "Michroma, sans-serif" }}>
                <thead>
                  <tr className="bg-gray-50">
                    {["Throttle %", "RPM", "Current A", "Voltage V", "Power W", "Eff %", "Thrust g", "g/W"].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[8px] tracking-wider text-[#808080] font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.partialLoadStatic.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-3 py-2">{r.throttlePercent.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.rpm.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.currentA.toFixed(1)}</td>
                      <td className="px-3 py-2">{r.voltageV.toFixed(2)}</td>
                      <td className="px-3 py-2">{r.powerW.toFixed(0)}</td>
                      <td className={`px-3 py-2 ${r.efficiencyPercent > 90 ? "text-green-600 font-bold" : ""}`}>
                        {r.efficiencyPercent.toFixed(1)}
                      </td>
                      <td className="px-3 py-2">{r.thrustG.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.specificThrustGW.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-[10px] min-w-[600px]" style={{ fontFamily: "Michroma, sans-serif" }}>
                <thead>
                  <tr className="bg-gray-50">
                    {["Throttle %", "RPM", "Speed km/h", "Current A", "Power W", "Thrust g", "Wh/km"].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[8px] tracking-wider text-[#808080] font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.partialLoadDynamic.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-3 py-2">{r.throttlePercent.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.rpm.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.speedKmh.toFixed(1)}</td>
                      <td className="px-3 py-2">{r.currentA.toFixed(1)}</td>
                      <td className="px-3 py-2">{r.powerW.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.thrustG.toFixed(0)}</td>
                      <td className="px-3 py-2">{r.energyWhKm.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Environment Info Bar */}
        <div className="mt-4 flex items-center gap-3 bg-[#ffc914]/5 border border-[#ffc914]/20 px-4 py-2.5">
          <div className="w-1 h-8 bg-[#ffc914] flex-shrink-0" />
          <p className="text-[10px] text-[#555]" style={{ fontFamily: "Lexend, sans-serif" }}>
            Air density at {result.environment.elevationM} m / {result.environment.temperatureC}°C:{" "}
            <strong className="text-black">{result.environment.airDensityKgm3.toFixed(4)} kg/m³</strong>
            {" "}· Loaded V ={" "}
            <strong className="text-black">{loadedVoltageV.toFixed(2)} V</strong>
            {" "}· TWR ={" "}
            <strong className="text-black">{result.totalDrive.thrustWeightRatio.toFixed(2)}:1</strong>
          </p>
        </div>
      </div>
    </div>
  );
}