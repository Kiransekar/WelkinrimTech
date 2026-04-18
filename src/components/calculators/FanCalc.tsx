// src/components/calculators/FanCalc.tsx
// EDF (Electric Ducted Fan) / Jet calculator
// Calculates thrust, power, RPM, efficiency and jet velocity for EDF-powered RC jets

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface Warning { level: "warn" | "danger"; message: string; }

interface FanCalcInput {
  // Aircraft
  modelWeightG: number;
  wingAreaDm2: number;
  dragCoefficient: number;

  // Environment
  elevationM: number;
  temperatureC: number;
  pressureHpa: number;

  // Power system
  batteryCells: number;
  batteryCapacityMah: number;
  batteryMaxDischarge: number; // 0-1 (percentage of capacity to use)
  batteryResistanceMohm: number;

  // Motor
  motorKv: number;
  motorIo: number; // No-load current (A)
  motorRmMohm: number; // Winding resistance (mΩ)
  motorMaxPowerW: number;
  motorMaxCurrent: number;

  // Fan
  fanDiameterMm: number;
  fanBlades: number;
  fanPitchMm: number;
  fanEfficiency: number; // 0-1
  ductEfficiency: number; // 0-1
  fvr: number; // Fan Velocity Ratio (exit area / fan swept area)
}

interface FanCalcResult {
  // Motor performance
  motorRpm: number;
  motorCurrent: number;
  motorPowerW: number;
  motorEfficiency: number;

  // Fan performance
  fanTipSpeed: number; // m/s
  fanPowerW: number;

  // Thrust
  staticThrustG: number;
  dynamicThrustG: number; // at cruise speed

  // Jet
  jetVelocity: number; // m/s
  massFlowRate: number; // kg/s

  // Performance
  maxSpeedKph: number;
  cruiseSpeedKph: number;
  climbRateMs: number;

  // Battery
  flightTimeMin: number;
  loadC: number;
}

const DEFAULTS: FanCalcInput = {
  modelWeightG: 2500,
  wingAreaDm2: 45,
  dragCoefficient: 0.035,
  elevationM: 0,
  temperatureC: 20,
  pressureHpa: 1013,
  batteryCells: 6,
  batteryCapacityMah: 5000,
  batteryMaxDischarge: 0.80,
  batteryResistanceMohm: 10,
  motorKv: 1900,
  motorIo: 2.0,
  motorRmMohm: 15,
  motorMaxPowerW: 1200,
  motorMaxCurrent: 55,
  fanDiameterMm: 90,
  fanBlades: 5,
  fanPitchMm: 55,
  fanEfficiency: 0.82,
  ductEfficiency: 0.88,
  fvr: 1.0,
};
function calculateFan(inp: FanCalcInput): FanCalcResult {
  const {
    modelWeightG, elevationM, temperatureC,
    batteryCells, batteryCapacityMah, batteryResistanceMohm,
    motorKv, motorIo, motorRmMohm, fanDiameterMm, fanPitchMm,
    fanEfficiency, ductEfficiency, fvr,
  } = inp;

  // 1. Atmosphere
  const rho0 = 1.225;
  const altitudeFactor = Math.pow(1 - (0.0065 * elevationM) / 288.15, 4.256);
  const tempFactor = 288.15 / (273.15 + temperatureC);
  const rho = rho0 * altitudeFactor * tempFactor;

  // 2. Electrical Setup
  const vNominal = batteryCells * 3.7;
  const rTotal = (motorRmMohm + batteryResistanceMohm) / 1000; // Ohms

  // 3. Simplified EDF Iteration
  // We assume the fan absorbs power proportional to RPM^3
  // P_fan = K * RPM^3
  // K is estimated from diameter and pitch
  const diaM = fanDiameterMm / 1000;
  const pitchM = fanPitchMm / 1000;
  const area = (Math.PI / 4) * (diaM * diaM);
  const exitArea = area * fvr;

  // Empirical Fan Constant
  const K = 1.1 * rho * area * Math.pow(pitchM, 3) * Math.pow(1 / 60, 3);

  // Solving for Current (I)
  // V_batt - I*R = RPM/Kv
  // Motor Efficiency eta_m = (RPM/Kv) / V_loaded
  
  let current = 40; // Initial guess
  let rpm = 0;
  for (let i = 0; i < 5; i++) {
    const vLoaded = vNominal - current * rTotal;
    rpm = vLoaded * motorKv * 0.95; // 5% loss due to Io
    const pFanW = K * Math.pow(rpm, 3) / fanEfficiency;
    current = pFanW / vLoaded + motorIo;
  }

  const motorPowerW = vNominal * current;
  const motorEfficiency = ((rpm / motorKv) / (vNominal - current * rTotal)) * 100;

  // 4. Thrust & Jet Velocity
  // V_jet = pitch * RPM / 60
  const vJet = (pitchM * rpm / 60) * ductEfficiency;
  const massFlow = rho * exitArea * vJet;
  const staticThrustN = massFlow * vJet;
  const staticThrustG = staticThrustN * 101.97;

  // Dynamic Thrust (simple model)
  const cruiseSpeedMs = vJet * 0.7; // Typical cruise
  const dynThrustG = staticThrustG * (1 - cruiseSpeedMs / vJet);

  // 5. Performance
  const tipSpeed = (rpm / 60) * Math.PI * diaM;
  const maxSpeedKph = vJet * 3.6 * 0.85; // Airframe drag limited
  const flightTime = (batteryCapacityMah / 1000 / current) * 60 * 0.8; // 80% discharge

  return {
    motorRpm: rpm,
    motorCurrent: current,
    motorPowerW,
    motorEfficiency: Math.min(98, motorEfficiency),
    fanTipSpeed: tipSpeed,
    fanPowerW: motorPowerW * (motorEfficiency / 100),
    staticThrustG,
    dynamicThrustG: dynThrustG,
    jetVelocity: vJet,
    massFlowRate: massFlow,
    maxSpeedKph,
    cruiseSpeedKph: maxSpeedKph * 0.7,
    climbRateMs: (staticThrustG / modelWeightG > 1) ? 15 : 8,
    flightTimeMin: flightTime,
    loadC: current / (batteryCapacityMah / 1000),
  };
}

function deriveWarnings(result: FanCalcResult, inputs: FanCalcInput): Warning[] {
  const w: Warning[] = [];

  // Motor temperature
  const Rth = 6; // °C/W for EDF motors (better cooling)
  const motorLossW = result.motorPowerW * (1 - result.motorEfficiency / 100);
  const tempC = inputs.temperatureC + Rth * motorLossW;
  if (tempC > 140) w.push({ level: "danger", message: `Motor temp ~${tempC.toFixed(0)}°C — exceeds 140°C limit.` });
  else if (tempC > 100) w.push({ level: "warn", message: `Motor temp ~${tempC.toFixed(0)}°C — approaching thermal limit.` });

  // Battery discharge
  if (result.loadC > 100) w.push({ level: "danger", message: `Battery discharge ${result.loadC.toFixed(0)}C — far exceeds safe limits.` });
  else if (result.loadC > 80) w.push({ level: "warn", message: `Battery discharge ${result.loadC.toFixed(0)}C — high. Verify C-rating.` });

  // Flight time
  if (result.flightTimeMin < 2) w.push({ level: "danger", message: `Flight time ${result.flightTimeMin.toFixed(1)} min — extremely short.` });
  else if (result.flightTimeMin < 4) w.push({ level: "warn", message: `Flight time ${result.flightTimeMin.toFixed(1)} min — short for EDF jet.` });

  // Tip speed
  const tipSpeedMach = result.fanTipSpeed / 343;
  if (tipSpeedMach > 0.95) w.push({ level: "danger", message: `Fan tip speed Mach ${tipSpeedMach.toFixed(2)} — approaching transonic losses.` });
  else if (tipSpeedMach > 0.8) w.push({ level: "warn", message: `Fan tip speed Mach ${tipSpeedMach.toFixed(2)} — high efficiency loss expected.` });

  // TWR
  const twr = result.staticThrustG / inputs.modelWeightG;
  if (twr < 0.6) w.push({ level: "danger", message: `TWR ${twr.toFixed(2)} — insufficient for sustained flight.` });
  else if (twr < 0.8) w.push({ level: "warn", message: `TWR ${twr.toFixed(2)} — marginal. Aim for ≥0.8 for jets.` });

  return w;
}

// ─────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────





interface FieldProps {
  label: string; id: string; value: number;
  onChange: (v: number) => void;
  step?: string; hint?: string; className?: string;
  unit?: string; min?: number; max?: number;
}

function Field({ label, id, value, onChange, step = "any", hint, className = "", unit, min, max }: FieldProps) {
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
          id={id} type="number" step={step} value={value} min={min} max={max}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full text-[11px] px-2 py-1 focus:outline-none bg-white font-bold"
          style={{ fontFamily: "Lexend, sans-serif" }}
        />
        {unit && <span className="bg-gray-50 text-[8px] text-gray-400 px-1.5 py-1.5 border-l border-gray-100 font-Michroma uppercase">{unit}</span>}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = true, icon }: { title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: string }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 mb-2 overflow-hidden bg-white shadow-sm transition-all">
      <div 
        className="bg-black px-3 py-2 flex items-center justify-between cursor-pointer group hover:bg-neutral-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#ffc812] text-xs">{icon}</span>}
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#ffc812] font-bold"
             style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
        </div>
        <span className={`text-[#ffc812] text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </div>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100 p-2" : "max-h-0 opacity-0 p-0"}`}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">{children}</div>
      </div>
    </div>
  );
}



const StatCard = ({ label, value, unit, sub, type = "normal" }: any) => {
  const isDanger = type === "danger";
  const isWarn = type === "warn";
  return (
    <div className={`border p-2.5 bg-white transition-all hover:shadow-md ${isDanger ? "border-red-500 shadow-red-50" : isWarn ? "border-amber-400 shadow-amber-50" : "border-gray-200"}`}>
      <p className="text-[8px] tracking-[0.15em] uppercase text-[#808080] mb-1 font-bold font-Michroma">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-black font-Michroma">{value}</span>
        {unit && <span className="text-[9px] font-bold text-gray-400 uppercase font-Michroma">{unit}</span>}
      </div>
      {sub && <p className="text-[9px] text-gray-400 mt-1 font-Lexend italic border-t border-gray-50 pt-1 leading-tight">{sub}</p>}
    </div>
  );
};

export default function FanCalcPanel() {
  const [inputs, setInputs] = useState<FanCalcInput>(DEFAULTS);

  const result = useMemo(() => calculateFan(inputs), [inputs]);
  const warnings = useMemo(() => deriveWarnings(result, inputs), [result, inputs]);

  // Speed curve data
  const speedCurveData = useMemo(() => {
    const data = [];
    for (let speed = 0; speed <= 200; speed += 10) {
      const speedMs = speed / 3.6;
      const thrustFactor = Math.max(0, 1 - speedMs / (result.jetVelocity * 1.2));
      const thrustG = result.staticThrustG * thrustFactor;
      const wingAreaM2 = inputs.wingAreaDm2 / 100;
      const rho = 1.225;
      const dragN = 0.5 * rho * (speedMs * speedMs) * wingAreaM2 * inputs.dragCoefficient;
      const dragG = dragN * 101.97;

      data.push({
        speed,
        thrust: thrustG,
        drag: dragG,
        excess: thrustG - dragG,
      });
    }
    return data;
  }, [result, inputs]);

  const updateInput = (key: keyof FanCalcInput, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };



  

  

  const inputsPanel = (
    <div className="space-y-3">
      <CollapsibleSection title="Aircraft & Environment" icon="✈">
        <Field label="Weight" id="mw" value={inputs.modelWeightG} onChange={(v: number) => updateInput("modelWeightG", v)} step="10" unit="g" />
        <Field label="Wing Area" id="wa" value={inputs.wingAreaDm2} onChange={(v: number) => updateInput("wingAreaDm2", v)} step="0.5" unit="dm²" />
        <Field label="Drag Coeff" id="cd" value={inputs.dragCoefficient} onChange={(v: number) => updateInput("dragCoefficient", v)} step="0.005" min={0.01} max={0.2} unit="Cd" hint="Typically 0.03-0.05 for jets" />
        <Field label="Temperature" id="tc" value={inputs.temperatureC} onChange={(v: number) => updateInput("temperatureC", v)} step="1" unit="°C" />
      </CollapsibleSection>

      <CollapsibleSection title="Power System" icon="🔋">
        <Field label="Battery Cells" id="bc" value={inputs.batteryCells} onChange={(v: number) => updateInput("batteryCells", v)} step="1" min={1} max={16} unit="S" />
        <Field label="Capacity" id="cap" value={inputs.batteryCapacityMah} onChange={(v: number) => updateInput("batteryCapacityMah", v)} step="100" unit="mAh" />
        <Field label="Discharge Limit" id="dis" value={inputs.batteryMaxDischarge * 100} onChange={(v: number) => updateInput("batteryMaxDischarge", v / 100)} step="5" min={50} max={100} unit="%" hint="Usable capacity percentage" />
        <Field label="Resistance" id="br" value={inputs.batteryResistanceMohm} onChange={(v: number) => updateInput("batteryResistanceMohm", v)} step="1" unit="mΩ" />
      </CollapsibleSection>

      <CollapsibleSection title="Motor Specs" icon="⚙">
        <Field label="KV Rating" id="mkv" value={inputs.motorKv} onChange={(v: number) => updateInput("motorKv", v)} step="50" unit="KV" />
        <Field label="Io Current" id="mio" value={inputs.motorIo} onChange={(v: number) => updateInput("motorIo", v)} step="0.1" unit="A" />
        <Field label="Rm Resistance" id="mrm" value={inputs.motorRmMohm} onChange={(v: number) => updateInput("motorRmMohm", v)} step="1" unit="mΩ" />
        <Field label="Max Current" id="mmc" value={inputs.motorMaxCurrent} onChange={(v: number) => updateInput("motorMaxCurrent", v)} step="5" unit="A" />
      </CollapsibleSection>

      <CollapsibleSection title="EDF Unit" icon="🌀">
        <Field label="Diameter" id="fd" value={inputs.fanDiameterMm} onChange={(v: number) => updateInput("fanDiameterMm", v)} step="1" unit="mm" />
        <Field label="Blade Count" id="fb" value={inputs.fanBlades} onChange={(v: number) => updateInput("fanBlades", v)} step="1" min={3} max={18} unit="#" />
        <Field label="Efficiency" id="fe" value={inputs.fanEfficiency * 100} onChange={(v: number) => updateInput("fanEfficiency", v / 100)} step="1" min={50} max={98} unit="%" />
        <Field label="Duct Factor" id="de" value={inputs.ductEfficiency * 100} onChange={(v: number) => updateInput("ductEfficiency", v / 100)} step="1" min={60} max={98} unit="%" />
        <Field label="Exit Ratio" id="fvr" value={inputs.fvr} onChange={(v: number) => updateInput("fvr", v)} step="0.05" min={0.7} max={1.5} unit="FVR" hint="Exit area / Swept area" />
      </CollapsibleSection>
    </div>
  );

  const resultsPanel = (
    <div id="fancalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="EDF Propulsion Analysis" />
      <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 italic font-Lexend leading-tight">
            Comprehensive EDF evaluation: Thrust-to-weight, jet velocity, and flight envelope dynamics.
          </p>
        </div>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_EDF_Analysis.pdf" />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {warnings.map((w, i) => (
            <div key={i} className={`px-3 py-2 border-l-4 text-[10px] flex items-center gap-2 ${w.level === "danger" ? "border-red-500 bg-red-50 text-red-700" : "border-amber-400 bg-amber-50 text-amber-700"}`}
                 style={{ fontFamily: "Lexend, sans-serif" }}>
              <span className="text-sm">⚠</span>
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary Results */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard label="Static Thrust" value={result.staticThrustG.toFixed(0)} unit="g" sub={`TWR: ${(result.staticThrustG / inputs.modelWeightG).toFixed(2)}`} />
        <StatCard label="Max Current" value={result.motorCurrent.toFixed(1)} unit="A" type={result.motorCurrent > inputs.motorMaxCurrent ? "danger" : "normal"} />
        <StatCard label="Jet Velocity" value={result.jetVelocity.toFixed(0)} unit="m/s" sub={`${(result.jetVelocity * 3.6).toFixed(0)} km/h`} />
        <StatCard label="Flight Time" value={result.flightTimeMin.toFixed(1)} unit="min" type={result.flightTimeMin < 3 ? "warn" : "normal"} />
      </div>

      {/* ── Visual Analysis ── */}
      <div className="border border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] uppercase text-[#ffc812] tracking-[0.2em] font-bold font-Michroma">Thrust / Drag Envelope</p>
          <div className="flex items-center gap-4 text-[8px] font-Michroma uppercase font-bold">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Thrust</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Drag</span>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={speedCurveData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="speed" tick={{ fontSize: 9, fontFamily: 'Michroma' }} label={{ value: 'Airspeed (km/h)', position: 'insideBottomRight', offset: -10, font: '8px Michroma' }} />
              <YAxis tick={{ fontSize: 9, fontFamily: 'Michroma' }} label={{ value: 'Force (g)', angle: -90, position: 'insideLeft', font: '8px Michroma' }} />
              <Tooltip labelStyle={{ fontSize: 10, fontFamily: 'Michroma' }} contentStyle={{ fontSize: 10, fontFamily: 'Lexend' }} />
              <Line type="monotone" dataKey="thrust" stroke="#22c55e" strokeWidth={3} dot={false} name="Thrust" />
              <Line type="monotone" dataKey="drag" stroke="#ef4444" strokeWidth={3} dot={false} name="Drag" />
              <ReferenceLine x={result.maxSpeedKph} stroke="#000" strokeDasharray="3 3" label={{ position: 'top', value: 'Max Speed', fill: '#000', fontSize: 8 }} />
              <ReferenceLine y={inputs.modelWeightG} stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" label={{ position: 'right', value: 'Weight', fill: '#94a3b8', fontSize: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="border border-gray-200 bg-white overflow-hidden">
          <div className="bg-black px-3 py-1.5 flex items-center justify-between font-Michroma">
            <span className="text-[9px] uppercase tracking-wider text-[#ffc812] font-bold">Power Train</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-y-3">
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma leading-tight">Fan Power</p>
              <p className="text-sm font-black text-black font-Lexend">{result.fanPowerW.toFixed(0)} <span className="text-[9px] font-normal uppercase">W</span></p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma leading-tight">Total Draw</p>
              <p className="text-sm font-black text-black font-Lexend">{result.motorPowerW.toFixed(0)} <span className="text-[9px] font-normal uppercase">W</span></p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma leading-tight">Motor RPM</p>
              <p className="text-sm font-black text-black font-Lexend">{result.motorRpm.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma leading-tight">Efficiency</p>
              <p className="text-sm font-black text-green-600 font-Lexend">{result.motorEfficiency.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 bg-white overflow-hidden">
          <div className="bg-black px-3 py-1.5 flex items-center justify-between font-Michroma">
            <span className="text-[9px] uppercase tracking-wider text-[#ffc812] font-bold">Performance Envelope</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-y-3">
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma leading-tight">Max Airspeed</p>
              <p className="text-sm font-black text-black font-Lexend">{result.maxSpeedKph.toFixed(0)} <span className="text-[9px] font-normal uppercase">km/h</span></p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma leading-tight">Climb Rate</p>
              <p className="text-sm font-black text-black font-Lexend">{result.climbRateMs.toFixed(1)} <span className="text-[9px] font-normal uppercase">m/s</span></p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma leading-tight">Jet Vel (Ideal)</p>
              <p className="text-sm font-black text-black font-Lexend">{result.jetVelocity.toFixed(1)} <span className="text-[9px] font-normal uppercase">m/s</span></p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma leading-tight">Tip Velocity</p>
              <p className="text-sm font-black text-black font-Lexend">{result.fanTipSpeed.toFixed(0)} <span className="text-[9px] font-normal uppercase">m/s</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}