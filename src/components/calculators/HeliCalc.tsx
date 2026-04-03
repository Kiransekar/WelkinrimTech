// src/components/calculators/HeliCalc.tsx
// Electric Helicopter calculator
// Calculates main rotor, tail rotor RPM, torque, motor current, efficiency and collective pitch

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ReferenceLine,
} from "recharts";

interface Warning { level: "warn" | "danger"; message: string; }

interface HeliCalcInput {
  // Helicopter
  heliWeightG: number;
  mainRotorDiameterMm: number;
  mainRotorChordMm: number;
  mainRotorBlades: number;
  tailRotorDiameterMm: number;
  tailRotorChordMm: number;
  tailRotorBlades: number;
  gearRatio: number; // main gear / pinion
  tailGearRatio: number;

  // Environment
  elevationM: number;
  temperatureC: number;

  // Power system
  batteryCells: number;
  batteryCapacityMah: number;
  batteryMaxDischarge: number;

  // Main motor
  mainMotorKv: number;
  mainMotorIo: number;
  mainMotorRmMohm: number;
  mainMotorMaxCurrent: number;

  // Tail motor
  tailMotorKv: number;
  tailMotorIo: number;
  tailMotorRmMohm: number;
  tailMotorMaxCurrent: number;

  // Flight
  headSpeedRpm: number;
  collectivePitchDeg: number;
}

interface HeliCalcResult {
  // Main rotor
  mainRpm: number;
  mainTipSpeed: number; // m/s
  mainDiscLoading: number; // g/dm²
  mainTorque: number; // N·m
  mainPowerW: number;

  // Tail rotor
  tailRpm: number;
  tailTipSpeed: number;
  tailTorque: number;
  tailPowerW: number;

  // Motors
  mainMotorCurrent: number;
  mainMotorEfficiency: number;
  tailMotorCurrent: number;
  tailMotorEfficiency: number;

  // Performance
  hoverPowerW: number;
  climbPowerW: number;
  flightTimeMin: number;
  loadC: number;
  discLoading: number;
  bladeLoading: number;
}

const DEFAULTS: HeliCalcInput = {
  heliWeightG: 4200,
  mainRotorDiameterMm: 850,
  mainRotorChordMm: 38,
  mainRotorBlades: 3,
  tailRotorDiameterMm: 160,
  tailRotorChordMm: 12,
  tailRotorBlades: 2,
  gearRatio: 10.5,
  tailGearRatio: 4.5,
  elevationM: 0,
  temperatureC: 20,
  batteryCells: 6,
  batteryCapacityMah: 5500,
  batteryMaxDischarge: 0.75,
  mainMotorKv: 650,
  mainMotorIo: 2.5,
  mainMotorRmMohm: 10,
  mainMotorMaxCurrent: 70,
  tailMotorKv: 2200,
  tailMotorIo: 0.6,
  tailMotorRmMohm: 75,
  tailMotorMaxCurrent: 6,
  headSpeedRpm: 2000,
  collectivePitchDeg: 7,
};

function deriveWarnings(result: HeliCalcResult, inputs: HeliCalcInput): Warning[] {
  const w: Warning[] = [];

  // Disc loading
  if (result.discLoading > 18) w.push({ level: "danger", message: `Disc loading ${result.discLoading.toFixed(1)} g/dm² — extremely high, very high power needed.` });
  else if (result.discLoading > 14) w.push({ level: "warn", message: `Disc loading ${result.discLoading.toFixed(1)} g/dm² — high, sport/aggressive setup.` });

  // Tip speed
  const mainTipMach = result.mainTipSpeed / 343;
  if (mainTipMach > 0.70) w.push({ level: "danger", message: `Main rotor tip Mach ${mainTipMach.toFixed(2)} — compressibility losses.` });
  else if (mainTipMach > 0.60) w.push({ level: "warn", message: `Main rotor tip Mach ${mainTipMach.toFixed(2)} — approaching transonic.` });

  // Motor current
  const mainCurrentRatio = result.mainMotorCurrent / inputs.mainMotorMaxCurrent;
  if (mainCurrentRatio > 0.95) w.push({ level: "danger", message: `Main motor at ${(mainCurrentRatio*100).toFixed(0)}% of max current.` });
  else if (mainCurrentRatio > 0.85) w.push({ level: "warn", message: `Main motor at ${(mainCurrentRatio*100).toFixed(0)}% of max current.` });

  // Flight time
  if (result.flightTimeMin < 3) w.push({ level: "danger", message: `Flight time ${result.flightTimeMin.toFixed(1)} min — extremely short.` });
  else if (result.flightTimeMin < 5) w.push({ level: "warn", message: `Flight time ${result.flightTimeMin.toFixed(1)} min — short.` });

  return w;
}

function calculateHeli(input: HeliCalcInput): HeliCalcResult {
  // Air density
  const T = input.temperatureC + 273.15;
  const P = 101325 * Math.pow(1 - 2.25577e-5 * input.elevationM, 5.25588);
  const rho = P / (287.05 * T);

  // Main rotor geometry
  const mainRadius = input.mainRotorDiameterMm / 2000; // m
  const mainChord = input.mainRotorChordMm / 1000; // m
  const mainArea = Math.PI * mainRadius * mainRadius;
  const mainBladeArea = input.mainRotorBlades * mainChord * mainRadius;
  const mainSolidity = mainBladeArea / mainArea;

  // Tail rotor geometry
  const tailRadius = input.tailRotorDiameterMm / 2000;
  const tailChord = input.tailRotorChordMm / 1000;
  const tailArea = Math.PI * tailRadius * tailRadius;
  const tailBladeArea = input.tailRotorBlades * tailChord * tailRadius;
  const tailSolidity = tailBladeArea / tailArea;

  // Disc loading
  const discLoading = input.heliWeightG / (mainArea * 100); // g/dm²
  const bladeLoading = input.heliWeightG / (mainBladeArea * 100); // g/dm²

  // Main rotor RPM and tip speed
  const mainRpm = input.headSpeedRpm;
  const mainTipSpeed = (Math.PI * input.mainRotorDiameterMm * mainRpm) / 60000; // m/s

  // Tail rotor RPM (gear ratio from main)
  const tailRpm = mainRpm * input.gearRatio / input.tailGearRatio;
  const tailTipSpeed = (Math.PI * input.tailRotorDiameterMm * tailRpm) / 60000;

  // Hover power (momentum theory + induced power factor)
  const weightN = input.heliWeightG / 1000 * 9.81;
  const inducedPowerFactor = 1.15; // typical for helicopters
  const hoverPowerW = inducedPowerFactor * weightN * Math.sqrt(weightN / (2 * rho * mainArea));

  // Profile power (blade drag)
  const profilePowerW = 0.5 * rho * mainSolidity * mainArea * Math.pow(mainTipSpeed, 3) * 0.012; // Cd ~0.012

  // Total main rotor power
  const mainPowerW = hoverPowerW + profilePowerW;

  // Tail rotor power (approx 10-15% of main for torque compensation)
  const tailTorqueFraction = 0.12;
  const tailPowerW = mainPowerW * tailTorqueFraction;

  // Main motor calculations
  const batteryVoltage = input.batteryCells * 3.7;
  const mainMotorRpmNoLoad = input.mainMotorKv * batteryVoltage;
  const mainMotorRpmLoaded = mainRpm * input.gearRatio;

  // Estimate main motor current
  const mainTorque = mainPowerW / (mainRpm * 2 * Math.PI / 60);
  const mainMotorCurrent = (mainPowerW / batteryVoltage) + input.mainMotorIo;
  const mainMotorLossW = mainMotorCurrent * mainMotorCurrent * (input.mainMotorRmMohm / 1000);
  const mainMotorEfficiency = ((mainPowerW + mainMotorLossW) / batteryVoltage / mainMotorCurrent) * 100;

  // Tail motor calculations
  const tailMotorRpmNoLoad = input.tailMotorKv * batteryVoltage;
  const tailTorque = tailPowerW / (tailRpm * 2 * Math.PI / 60);
  const tailMotorCurrent = (tailPowerW / batteryVoltage) + input.tailMotorIo;
  const tailMotorLossW = tailMotorCurrent * tailMotorCurrent * (input.tailMotorRmMohm / 1000);
  const tailMotorEfficiency = ((tailPowerW + tailMotorLossW) / batteryVoltage / tailMotorCurrent) * 100;

  // Total current and flight time
  const totalCurrent = mainMotorCurrent + tailMotorCurrent;
  const usableCapacity = input.batteryCapacityMah * input.batteryMaxDischarge;
  const loadC = (totalCurrent * 1000) / input.batteryCapacityMah;
  const flightTimeMin = (usableCapacity / (totalCurrent * 1000)) * 60;

  // Climb power (add 30% for climb)
  const climbPowerW = mainPowerW * 1.3;

  return {
    mainRpm,
    mainTipSpeed,
    mainDiscLoading: discLoading,
    mainTorque,
    mainPowerW,
    tailRpm,
    tailTipSpeed,
    tailTorque,
    tailPowerW,
    mainMotorCurrent,
    mainMotorEfficiency,
    tailMotorCurrent,
    tailMotorEfficiency,
    hoverPowerW,
    climbPowerW,
    flightTimeMin,
    loadC,
    discLoading,
    bladeLoading,
  };
}

export default function HeliCalcPanel() {
  const [inputs, setInputs] = useState<HeliCalcInput>(DEFAULTS);
  const [showChart, setShowChart] = useState("power");

  const result = useMemo(() => calculateHeli(inputs), [inputs]);
  const warnings = useMemo(() => deriveWarnings(result, inputs), [result, inputs]);

  // Power curve vs collective pitch
  const powerCurveData = useMemo(() => {
    const data = [];
    for (let pitch = 0; pitch <= 14; pitch += 1) {
      // Simplified: power increases with pitch
      const powerFactor = 0.5 + (pitch / 14) * 0.5;
      const power = result.hoverPowerW * powerFactor;
      const current = power / (inputs.batteryCells * 3.7);

      data.push({
        pitch,
        power: power,
        current: current,
        flightTime: (inputs.batteryCapacityMah * inputs.batteryMaxDischarge) / (current * 1000) * 60,
      });
    }
    return data;
  }, [result, inputs]);

  const updateInput = (key: keyof HeliCalcInput, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const Field = ({ label, value, onChange, step = 1, min, max, unit, hint }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase text-gray-500 tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className="flex-1 border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-[#ffc914]"
          style={{ fontFamily: "Michroma, sans-serif" }}
        />
        <span className="text-xs text-gray-400 w-10">{unit}</span>
      </div>
      {hint && <p className="text-[9px] text-gray-400">{hint}</p>}
    </div>
  );

  const Section = ({ title, children }: any) => (
    <div className="border border-gray-100 mb-4">
      <div className="bg-black px-3 py-1.5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]" style={{ fontFamily: "Michroma, sans-serif" }}>
          {title}
        </p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">{children}</div>
    </div>
  );

  const StatCard = ({ label, value, unit, sub, warn }: any) => (
    <div className={`border p-3 ${warn ? "border-amber-300 bg-amber-50" : "border-gray-100"}`}>
      <p className="text-[8px] uppercase text-gray-500 tracking-wider">{label}</p>
      <p className="text-lg font-black" style={{ fontFamily: "Michroma, sans-serif" }}>
        {value} <span className="text-sm font-medium text-gray-400">{unit}</span>
      </p>
      {sub && <p className="text-[9px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className={`p-3 border-l-4 ${w.level === "danger" ? "border-red-500 bg-red-50" : "border-amber-500 bg-amber-50"}`}>
              <p className="text-sm" style={{ fontFamily: "Lexend, sans-serif" }}>{w.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Head Speed" value={(result.mainRpm / 1000).toFixed(1)} unit="kRPM" />
        <StatCard label="Main Tip" value={result.mainTipSpeed.toFixed(0)} unit="m/s" />
        <StatCard label="Disc Loading" value={result.discLoading.toFixed(1)} unit="g/dm²" />
        <StatCard label="Hover Power" value={(result.hoverPowerW / 1000).toFixed(1)} unit="kW" />
        <StatCard label="Flight Time" value={result.flightTimeMin.toFixed(1)} unit="min" warn={result.flightTimeMin < 6} />
        <StatCard label="Load C" value={result.loadC.toFixed(0)} unit="C" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Inputs */}
        <div className="lg:w-96 flex-shrink-0 space-y-4">
          <Section title="Helicopter">
            <Field label="Weight" value={inputs.heliWeightG} onChange={(v: number) => updateInput("heliWeightG", v)} step={50} unit="g" />
            <Field label="Main Diameter" value={inputs.mainRotorDiameterMm} onChange={(v: number) => updateInput("mainRotorDiameterMm", v)} step={5} unit="mm" />
            <Field label="Main Chord" value={inputs.mainRotorChordMm} onChange={(v: number) => updateInput("mainRotorChordMm", v)} step={0.5} unit="mm" />
            <Field label="Main Blades" value={inputs.mainRotorBlades} onChange={(v: number) => updateInput("mainRotorBlades", v)} step={1} min={2} max={7} unit="#" />
            <Field label="Tail Diameter" value={inputs.tailRotorDiameterMm} onChange={(v: number) => updateInput("tailRotorDiameterMm", v)} step={1} unit="mm" />
            <Field label="Tail Blades" value={inputs.tailRotorBlades} onChange={(v: number) => updateInput("tailRotorBlades", v)} step={1} min={2} max={6} unit="#" />
            <Field label="Gear Ratio" value={inputs.gearRatio} onChange={(v: number) => updateInput("gearRatio", v)} step={0.1} unit=":1" />
            <Field label="Tail Ratio" value={inputs.tailGearRatio} onChange={(v: number) => updateInput("tailGearRatio", v)} step={0.1} unit=":1" />
          </Section>

          <Section title="Power System">
            <Field label="Battery Cells" value={inputs.batteryCells} onChange={(v: number) => updateInput("batteryCells", v)} step={1} min={3} max={14} unit="S" />
            <Field label="Capacity" value={inputs.batteryCapacityMah} onChange={(v: number) => updateInput("batteryCapacityMah", v)} step={500} unit="mAh" />
            <Field label="Max Discharge" value={inputs.batteryMaxDischarge * 100} onChange={(v: number) => updateInput("batteryMaxDischarge", v / 100)} step={5} unit="%" />
          </Section>

          <Section title="Main Motor">
            <Field label="KV Rating" value={inputs.mainMotorKv} onChange={(v: number) => updateInput("mainMotorKv", v)} step={50} unit="KV" />
            <Field label="Io" value={inputs.mainMotorIo} onChange={(v: number) => updateInput("mainMotorIo", v)} step={0.1} unit="A" />
            <Field label="Rm" value={inputs.mainMotorRmMohm} onChange={(v: number) => updateInput("mainMotorRmMohm", v)} step={1} unit="mΩ" />
            <Field label="Max Current" value={inputs.mainMotorMaxCurrent} onChange={(v: number) => updateInput("mainMotorMaxCurrent", v)} step={5} unit="A" />
          </Section>

          <Section title="Tail Motor">
            <Field label="KV Rating" value={inputs.tailMotorKv} onChange={(v: number) => updateInput("tailMotorKv", v)} step={100} unit="KV" />
            <Field label="Io" value={inputs.tailMotorIo} onChange={(v: number) => updateInput("tailMotorIo", v)} step={0.1} unit="A" />
            <Field label="Rm" value={inputs.tailMotorRmMohm} onChange={(v: number) => updateInput("tailMotorRmMohm", v)} step={5} unit="mΩ" />
          </Section>

          <Section title="Flight">
            <Field label="Head Speed" value={inputs.headSpeedRpm} onChange={(v: number) => updateInput("headSpeedRpm", v)} step={50} unit="RPM" />
            <Field label="Collective" value={inputs.collectivePitchDeg} onChange={(v: number) => updateInput("collectivePitchDeg", v)} step={0.5} min={0} max={15} unit="deg" />
          </Section>
        </div>

        {/* Charts */}
        <div className="flex-1">
          {/* Power curve */}
          <div className="border border-gray-100 mb-4">
            <div className="bg-black px-3 py-1.5 flex items-center justify-between">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]" style={{ fontFamily: "Michroma, sans-serif" }}>
                Power & Current vs Collective Pitch
              </p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={powerCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="pitch" tick={{ fontSize: 9 }} unit="deg" />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} unit="W" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} unit="A" />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Line yAxisId="left" type="monotone" dataKey="power" stroke="#ef4444" strokeWidth={2} name="Power" />
                  <Line yAxisId="right" type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Current" />
                  <ReferenceLine x={inputs.collectivePitchDeg} stroke="#ffc914" strokeDasharray="3 3" label="Current" yAxisId="left" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-100">
              <div className="bg-black px-3 py-1.5">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]" style={{ fontFamily: "Michroma, sans-serif" }}>
                  Main Rotor
                </p>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">RPM</span>
                  <span className="font-bold">{result.mainRpm.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tip Speed</span>
                  <span className="font-bold">{result.mainTipSpeed.toFixed(0)} m/s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Torque</span>
                  <span className="font-bold">{result.mainTorque.toFixed(2)} N·m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Power</span>
                  <span className="font-bold">{result.mainPowerW.toFixed(0)} W</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Motor Current</span>
                  <span className="font-bold">{result.mainMotorCurrent.toFixed(1)} A</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-100">
              <div className="bg-black px-3 py-1.5">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]" style={{ fontFamily: "Michroma, sans-serif" }}>
                  Tail Rotor
                </p>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">RPM</span>
                  <span className="font-bold">{result.tailRpm.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tip Speed</span>
                  <span className="font-bold">{result.tailTipSpeed.toFixed(0)} m/s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Torque</span>
                  <span className="font-bold">{result.tailTorque.toFixed(2)} N·m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Power</span>
                  <span className="font-bold">{result.tailPowerW.toFixed(0)} W</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Motor Current</span>
                  <span className="font-bold">{result.tailMotorCurrent.toFixed(1)} A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
