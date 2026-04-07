import { useState, useMemo } from "react";

interface Warning { level: "warn" | "danger"; message: string; }

interface CarCalcInput {
  carWeightWeightG: number;
  wheelDiameterMm: number;
  pinionTeeth: number;
  spurTeeth: number;
  internalGearRatio: number;
  drivetrainEfficiency: number;

  batteryCapacityMah: number;
  batteryCells: number;
  
  motorKv: number;
  motorIo: number;
  motorRmMohm: number;

  accelerationTargetTimeS: number;
  rollingResistanceCoeff: number;
  frontalAreaDm2: number;
  dragCoeff: number;
}

const DEFAULTS: CarCalcInput = {
  carWeightWeightG: 3000,
  wheelDiameterMm: 110,
  pinionTeeth: 18,
  spurTeeth: 54,
  internalGearRatio: 2.5,
  drivetrainEfficiency: 85,
  batteryCapacityMah: 5000,
  batteryCells: 4,
  motorKv: 2200,
  motorIo: 2.5,
  motorRmMohm: 8,
  accelerationTargetTimeS: 3,
  rollingResistanceCoeff: 0.015,
  frontalAreaDm2: 4,
  dragCoeff: 0.45,
};

function deriveWarnings(result: any, _inputs: CarCalcInput): Warning[] {
  const w: Warning[] = [];
  if (result.topSpeedKmh > 120) w.push({ level: "warn", message: `Top speed ${result.topSpeedKmh.toFixed(0)} km/h is extremely high, aero drag will be massive.` });
  if (result.driveTimeMin < 5) w.push({ level: "danger", message: `Drive time is very short: ${result.driveTimeMin.toFixed(1)} mins.` });
  return w;
}

function calculateCar(input: CarCalcInput) {
  const weightKg = input.carWeightWeightG / 1000;
  const wheelDiamM = input.wheelDiameterMm / 1000;
  const V_batt = input.batteryCells * 3.7;

  // Transmission
  const gearRatio = (input.spurTeeth / input.pinionTeeth) * input.internalGearRatio;
  const rolloutMm = Math.PI * input.wheelDiameterMm / gearRatio;

  // Max Speed (Theoretical)
  const noLoadRpm = V_batt * input.motorKv;
  const loadedRpm = noLoadRpm * 0.8; // Approximate load factor
  const wheelRpm = loadedRpm / gearRatio;
  const maxSpeedMs = wheelRpm * Math.PI * wheelDiamM / 60;
  const maxSpeedKmh = maxSpeedMs * 3.6;

  // Drag and Resistance at max speed
  const F_rolling = input.rollingResistanceCoeff * weightKg * 9.81;
  const F_aero = 0.5 * 1.225 * Math.pow(maxSpeedMs, 2) * (input.frontalAreaDm2 / 100) * input.dragCoeff;
  const F_total = F_rolling + F_aero;

  // Power required to maintain top speed
  const P_cruise_mech = F_total * maxSpeedMs;
  const P_cruise_elec = P_cruise_mech / (input.drivetrainEfficiency / 100) / 0.8; // assume 80% motor eff
  const I_cruise = P_cruise_elec / V_batt;

  // Acceleration Phase (Energy approach)
  // Kinetic Energy + Energy lost to drag/rolling during acceleration
  const E_kinetic = 0.5 * weightKg * Math.pow(maxSpeedMs, 2);
  // Average speed during accel is roughly maxSpeed / 2
  const F_aero_avg = 0.5 * 1.225 * Math.pow(maxSpeedMs / 2, 2) * (input.frontalAreaDm2 / 100) * input.dragCoeff;
  const E_drag = (F_aero_avg + F_rolling) * (maxSpeedMs / 2 * input.accelerationTargetTimeS);
  const P_accel_req = (E_kinetic + E_drag) / input.accelerationTargetTimeS;
  const I_avg_accel = (P_accel_req / (input.drivetrainEfficiency / 100)) / V_batt;

  // Drive time (assumes 85% usable battery, mixed driving meaning geometric mean of max and cruise)
  const usableCapacityAh = (input.batteryCapacityMah / 1000) * 0.85;
  const I_geometric_mean = Math.sqrt(I_avg_accel * I_cruise);
  const driveTimeMin = (usableCapacityAh / I_geometric_mean) * 60;

  return {
    gearRatio,
    rolloutMm,
    loadedRpm,
    wheelRpm,
    topSpeedKmh: maxSpeedKmh,
    forceDragN: F_aero,
    forceRollingN: F_rolling,
    powerCruiseW: P_cruise_elec,
    currentCruiseA: I_cruise,
    powerAccelW: P_accel_req,
    currentAccelA: I_avg_accel,
    driveTimeMin,
  };
}

export default function CarCalc() {
  const [inputs, setInputs] = useState<CarCalcInput>(DEFAULTS);
  const result = useMemo(() => calculateCar(inputs), [inputs]);
  const warnings = useMemo(() => deriveWarnings(result, inputs), [result, inputs]);

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

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {warnings.map((w, i) => (
            <div key={i} className={`px-3 py-1.5 border-l-2 text-[10px] ${w.level === "danger" ? "border-red-500 bg-red-50 text-red-700" : "border-amber-400 bg-amber-50 text-amber-700"}`}
                 style={{ fontFamily: "Lexend, sans-serif" }}>{w.message}</div>
          ))}
        </div>
      )}

      {/* ── Compact Inputs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Section title="Vehicle">
          <Field label="Weight" value={inputs.carWeightWeightG} onChange={(v:any) => setInputs({...inputs, carWeightWeightG: v})} unit="g" />
          <Field label="Wheel Diam" value={inputs.wheelDiameterMm} onChange={(v:any) => setInputs({...inputs, wheelDiameterMm: v})} unit="mm" />
          <Field label="Frontal Area" value={inputs.frontalAreaDm2} onChange={(v:any) => setInputs({...inputs, frontalAreaDm2: v})} unit="dm²" />
          <Field label="Drag Coeff" value={inputs.dragCoeff} onChange={(v:any) => setInputs({...inputs, dragCoeff: v})} />
          <Field label="Rolling Res" value={inputs.rollingResistanceCoeff} step={0.001} onChange={(v:any) => setInputs({...inputs, rollingResistanceCoeff: v})} />
        </Section>
        <Section title="Drivetrain">
          <Field label="Pinion Teeth" value={inputs.pinionTeeth} onChange={(v:any) => setInputs({...inputs, pinionTeeth: v})} />
          <Field label="Spur Teeth" value={inputs.spurTeeth} onChange={(v:any) => setInputs({...inputs, spurTeeth: v})} />
          <Field label="Internal Ratio" value={inputs.internalGearRatio} onChange={(v:any) => setInputs({...inputs, internalGearRatio: v})} unit=":1" />
          <Field label="Efficiency" value={inputs.drivetrainEfficiency} onChange={(v:any) => setInputs({...inputs, drivetrainEfficiency: v})} unit="%" />
        </Section>
        <Section title="Motor & Battery">
          <Field label="Cells (S)" value={inputs.batteryCells} onChange={(v:any) => setInputs({...inputs, batteryCells: v})} />
          <Field label="Capacity" value={inputs.batteryCapacityMah} onChange={(v:any) => setInputs({...inputs, batteryCapacityMah: v})} unit="mAh" />
          <Field label="Motor KV" value={inputs.motorKv} onChange={(v:any) => setInputs({...inputs, motorKv: v})} unit="rpm/V" />
          <Field label="Target Accel" value={inputs.accelerationTargetTimeS} onChange={(v:any) => setInputs({...inputs, accelerationTargetTimeS: v})} unit="s" />
        </Section>
      </div>

      {/* ── Results ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Top Speed" value={result.topSpeedKmh.toFixed(1)} unit="km/h" />
        <StatCard label="Total Gear Ratio" value={result.gearRatio.toFixed(2)} unit=":1" />
        <StatCard label="Rollout" value={result.rolloutMm.toFixed(1)} unit="mm/rev" />
        <StatCard label="Drive Time" value={result.driveTimeMin.toFixed(1)} unit="min" warn={result.driveTimeMin < 5} />
        <StatCard label="Accel Power" value={result.powerAccelW.toFixed(0)} unit="W" />
        <StatCard label="Accel Current" value={result.currentAccelA.toFixed(1)} unit="A" />
        <StatCard label="Cruise Power" value={result.powerCruiseW.toFixed(0)} unit="W" />
        <StatCard label="Cruise Current" value={result.currentCruiseA.toFixed(1)} unit="A" />
      </div>
    </div>
  );
}
