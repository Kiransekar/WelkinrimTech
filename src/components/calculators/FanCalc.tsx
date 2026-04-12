// src/components/calculators/FanCalc.tsx
// EDF (Electric Ducted Fan) / Jet calculator
// Calculates thrust, power, RPM, efficiency and jet velocity for EDF-powered RC jets

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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

function calculateFan(input: FanCalcInput): FanCalcResult {
  // Air density (ISA with corrections)
  const T = input.temperatureC + 273.15;
  const P = input.pressureHpa * 100;
  const rho = P / (287.05 * T); // kg/m³

  const nominalCellV = 3.7;
  const batteryVoltage = input.batteryCells * nominalCellV;

  const D_fan = input.fanDiameterMm / 1000;
  const pitch_ratio = input.fanPitchMm / input.fanDiameterMm;

  // Approximate EDF coefficients based on blades and pitch
  const C_T_EDF = 0.05 * input.fanBlades * pitch_ratio * input.ductEfficiency;
  const C_P_EDF = 0.05 * input.fanBlades * Math.pow(pitch_ratio, 1.2) / input.fanEfficiency;

  let currentA = input.motorMaxCurrent * 0.5;
  let rpm = 0;
  let motorVoltage = batteryVoltage;
  let fanPowerW = 0;

  // Iterative solver for motor RPM and Power matching Fan load
  for (let iter = 0; iter < 15; iter++) {
    motorVoltage = batteryVoltage - currentA * (input.batteryResistanceMohm / 1000);
    rpm = input.motorKv * (motorVoltage - (currentA - input.motorIo) * (input.motorRmMohm / 1000));
    if (rpm < 0) rpm = 0;
    const n = rpm / 60;
    fanPowerW = C_P_EDF * rho * Math.pow(n, 3) * Math.pow(D_fan, 5);
    
    // Mechanical power required = fanPowerW
    // P_mech = (V - I*R)*I - V*I0 => approximation for iterative step
    const i_new = (fanPowerW / Math.max(1, motorVoltage)) + input.motorIo;
    currentA += 0.3 * (i_new - currentA); // damped update
  }

  const motorCurrent = currentA;
  const motorRpm = rpm;
  const motorPowerW = motorVoltage * motorCurrent;
  const motorLossW = (motorCurrent * motorCurrent * (input.motorRmMohm / 1000)) + (motorVoltage * input.motorIo);
  const motorEfficiency = ((motorPowerW - motorLossW) / motorPowerW) * 100;

  // Fan calculations
  const fanTipSpeed = (Math.PI * input.fanDiameterMm * motorRpm) / 60000; // m/s
  const n = motorRpm / 60;
  const staticThrustN = C_T_EDF * rho * Math.pow(n, 2) * Math.pow(D_fan, 4);
  const staticThrustG = staticThrustN * 101.97;

  // Mass flow rate & jet velocity derived back
  const fanArea = Math.PI * Math.pow(D_fan / 2, 2);
  const massFlowRate = rho * fanArea * input.fvr * fanTipSpeed * input.fanEfficiency;
  const jetVelocity = massFlowRate > 0 ? staticThrustN / massFlowRate : 0;

  // Max speed where thrust = drag
  const cruiseSpeedMs = 25;
  const dynamicThrustN = staticThrustN * (1 - cruiseSpeedMs / Math.max(1, jetVelocity));
  const dynamicThrustG = dynamicThrustN * 101.97;

  const wingAreaM2 = input.wingAreaDm2 / 100;
  const dragAt100Kph = 0.5 * rho * (27.78 * 27.78) * wingAreaM2 * input.dragCoefficient;
  const maxSpeedMs = Math.sqrt((2 * dynamicThrustN) / (rho * wingAreaM2 * input.dragCoefficient));
  const maxSpeedKph = maxSpeedMs * 3.6;
  const cruiseSpeedKph = maxSpeedKph * 0.7;

  const excessPowerW = fanPowerW - (dragAt100Kph * cruiseSpeedMs);
  const climbRateMs = excessPowerW / (input.modelWeightG / 1000 * 9.81);

  const usableCapacityMah = input.batteryCapacityMah * input.batteryMaxDischarge;
  const loadC = (motorCurrent * 1000) / input.batteryCapacityMah;
  const flightTimeMin = (usableCapacityMah / (motorCurrent * 1000)) * 60;

  return {
    motorRpm,
    motorCurrent,
    motorPowerW,
    motorEfficiency,
    fanTipSpeed,
    fanPowerW,
    staticThrustG,
    dynamicThrustG,
    jetVelocity,
    massFlowRate,
    maxSpeedKph,
    cruiseSpeedKph,
    climbRateMs,
    flightTimeMin,
    loadC,
  };
}

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
      <p className="text-xl font-black" style={{ fontFamily: "Michroma, sans-serif" }}>
        {value} <span className="text-sm font-medium text-gray-400">{unit}</span>
      </p>
      {sub && <p className="text-[9px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  const inputsPanel = (
    <div className="space-y-3">
      <Section title="Aircraft">
        <Field label="Weight" value={inputs.modelWeightG} onChange={(v: number) => updateInput("modelWeightG", v)} step={10} unit="g" />
        <Field label="Wing Area" value={inputs.wingAreaDm2} onChange={(v: number) => updateInput("wingAreaDm2", v)} step={0.5} unit="dm²" />
        <Field label="Drag Coeff" value={inputs.dragCoefficient} onChange={(v: number) => updateInput("dragCoefficient", v)} step={0.005} min={0.01} max={0.2} unit="Cd" />
      </Section>

      <Section title="Power System">
        <Field label="Cells" value={inputs.batteryCells} onChange={(v: number) => updateInput("batteryCells", v)} step={1} min={1} max={12} unit="S" />
        <Field label="Capacity" value={inputs.batteryCapacityMah} onChange={(v: number) => updateInput("batteryCapacityMah", v)} step={100} unit="mAh" />
        <Field label="Max Disch" value={inputs.batteryMaxDischarge * 100} onChange={(v: number) => updateInput("batteryMaxDischarge", v / 100)} step={5} min={50} max={100} unit="%" />
      </Section>

      <Section title="Motor">
        <Field label="KV" value={inputs.motorKv} onChange={(v: number) => updateInput("motorKv", v)} step={50} unit="KV" />
        <Field label="Io" value={inputs.motorIo} onChange={(v: number) => updateInput("motorIo", v)} step={0.1} unit="A" />
        <Field label="Rm" value={inputs.motorRmMohm} onChange={(v: number) => updateInput("motorRmMohm", v)} step={1} unit="mΩ" />
        <Field label="Max Power" value={inputs.motorMaxPowerW} onChange={(v: number) => updateInput("motorMaxPowerW", v)} step={10} unit="W" />
        <Field label="Max Current" value={inputs.motorMaxCurrent} onChange={(v: number) => updateInput("motorMaxCurrent", v)} step={1} unit="A" />
      </Section>

      <Section title="EDF Fan">
        <Field label="Diameter" value={inputs.fanDiameterMm} onChange={(v: number) => updateInput("fanDiameterMm", v)} step={1} unit="mm" />
        <Field label="Blades" value={inputs.fanBlades} onChange={(v: number) => updateInput("fanBlades", v)} step={1} min={3} max={12} unit="#" />
        <Field label="Fan Eff" value={inputs.fanEfficiency * 100} onChange={(v: number) => updateInput("fanEfficiency", v / 100)} step={1} min={50} max={95} unit="%" />
        <Field label="Duct Eff" value={inputs.ductEfficiency * 100} onChange={(v: number) => updateInput("ductEfficiency", v / 100)} step={1} min={60} max={95} unit="%" />
        <Field label="FVR" value={inputs.fvr} onChange={(v: number) => updateInput("fvr", v)} step={0.05} min={0.8} max={1.5} unit="" hint="Fan Velocity Ratio" />
      </Section>
    </div>
  );

  const resultsPanel = (
    <div id="fancalc-report-area" className="relative space-y-4">
      <PdfTemplateHeader calculatorName="EDF Jet Analysis" />
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
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_EDF_Report.pdf" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Static Thrust" value={result.staticThrustG.toFixed(0)} unit="g" />
        <StatCard label="Dynamic Thrust" value={result.dynamicThrustG.toFixed(0)} unit="g" />
        <StatCard label="Motor RPM" value={(result.motorRpm / 1000).toFixed(1)} unit="kRPM" />
        <StatCard label="Jet Velocity" value={result.jetVelocity.toFixed(0)} unit="m/s" />
        <StatCard label="Max Speed" value={result.maxSpeedKph.toFixed(0)} unit="km/h" />
        <StatCard label="Flight Time" value={result.flightTimeMin.toFixed(1)} unit="min" warn={result.flightTimeMin < 5} />
      </div>

      {/* ── Chart ── */}
      <div className="border border-gray-100">
        <div className="bg-black px-3 py-1.5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
            Thrust & Drag vs Speed
          </p>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={speedCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="speed" tick={{ fontSize: 9 }} unit="km/h" />
              <YAxis tick={{ fontSize: 9 }} unit="g" />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Line type="monotone" dataKey="thrust" stroke="#22c55e" strokeWidth={2} name="Thrust" dot={false} />
              <Line type="monotone" dataKey="drag" stroke="#ef4444" strokeWidth={2} name="Drag" dot={false} />
              <Line type="monotone" dataKey="excess" stroke="#3b82f6" strokeWidth={2} name="Excess" dot={false} />
              <ReferenceLine x={result.cruiseSpeedKph} stroke="#ffc812" strokeDasharray="3 3" label="Cruise" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Detail Tables ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
              Motor Performance
            </p>
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">RPM</span><span className="font-bold">{result.motorRpm.toFixed(0)}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Current</span><span className="font-bold">{result.motorCurrent.toFixed(1)} A</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Power</span><span className="font-bold">{result.motorPowerW.toFixed(0)} W</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Efficiency</span><span className="font-bold">{result.motorEfficiency.toFixed(1)}%</span></div>
          </div>
        </div>

        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
              Flight Performance
            </p>
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Cruise Speed</span><span className="font-bold">{result.cruiseSpeedKph.toFixed(0)} km/h</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Max Speed</span><span className="font-bold">{result.maxSpeedKph.toFixed(0)} km/h</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Climb Rate</span><span className="font-bold">{result.climbRateMs.toFixed(1)} m/s</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Load C</span><span className="font-bold">{result.loadC.toFixed(0)}C</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}