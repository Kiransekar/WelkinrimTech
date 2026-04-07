// src/components/calculators/TorqueCalc.tsx
import { useState, useMemo } from "react";

interface Warning { level: "warn" | "danger"; message: string; }

interface TorqueCalcInput {
  requiredTorqueNcm: number;
  requiredRpm: number;
  supplyVoltageMin: number;
  supplyVoltageMax: number;

  motorKv: number;
  motorIo: number;
  motorRmMohm: number;
  motorMaxCurrent: number;
  motorWeightG: number;

  ambientTempC: number;
  thermalMode: "none" | "partial" | "full";
  controllerRmMohm: number;
  gearRatio: number;
  gearEfficiency: number;
}

const DEFAULTS: TorqueCalcInput = {
  requiredTorqueNcm: 50,
  requiredRpm: 3000,
  supplyVoltageMin: 22.2,
  supplyVoltageMax: 25.2,
  motorKv: 400,
  motorIo: 1.5,
  motorRmMohm: 45,
  motorMaxCurrent: 60,
  motorWeightG: 300,
  ambientTempC: 25,
  thermalMode: "partial",
  controllerRmMohm: 5,
  gearRatio: 1,
  gearEfficiency: 100,
};

function deriveWarnings(result: any, inputs: TorqueCalcInput): Warning[] {
  const w: Warning[] = [];
  if (result.currentA > inputs.motorMaxCurrent) {
    w.push({ level: "danger", message: `Current ${result.currentA.toFixed(1)}A exceeds motor limit of ${inputs.motorMaxCurrent}A.` });
  }
  if (result.achievableRpm < inputs.requiredRpm) {
    w.push({ level: "danger", message: `Cannot reach ${inputs.requiredRpm} RPM at minimum voltage under load.` });
  }
  if (result.motorTempC > 130) {
    w.push({ level: "danger", message: `Motor overheats: ~${result.motorTempC.toFixed(0)}°C` });
  } else if (result.motorTempC > 100) {
    w.push({ level: "warn", message: `Motor runs very hot: ~${result.motorTempC.toFixed(0)}°C` });
  }
  return w;
}

function calculateTorque(input: TorqueCalcInput) {
  // Convert inputs to SI
  const tau_req_Nm = (input.requiredTorqueNcm / 100) / (input.gearEfficiency / 100);
  const tau_motor_Nm = tau_req_Nm / input.gearRatio;
  const omega_req = (input.requiredRpm * input.gearRatio) * (2 * Math.PI) / 60;
  
  // Motor constants
  const kv_rad = input.motorKv * (2 * Math.PI) / 60;
  const kt = 1 / kv_rad; // N.m/A

  // Compute required current
  const I_req = (tau_motor_Nm / kt) + input.motorIo;

  // Thermal model for Rm
  let T_motor = input.ambientTempC;
  if (input.thermalMode === "partial") T_motor += 30;
  if (input.thermalMode === "full") {
    // Estimate steady state temp: Rth ~ 50 / mass_kg
    const Rth = 50 / (input.motorWeightG / 1000);
    // Simple iterative loop for temp
    for (let i=0; i<3; i++) {
        const Rm = (input.motorRmMohm/1000) * (1 + 0.00393 * (T_motor - 20));
        const P_loss = Math.pow(I_req, 2) * Rm + input.motorIo * input.supplyVoltageMax;
        T_motor = input.ambientTempC + Rth * P_loss;
    }
  }
  
  const Rm_hot = (input.motorRmMohm/1000) * (1 + 0.00393 * (T_motor - 20));
  const R_total = Rm_hot + (input.controllerRmMohm / 1000);

  // Achieveable RPM at min voltage
  const V_motor_min = input.supplyVoltageMin - I_req * R_total;
  const omega_max_achievable = kv_rad * V_motor_min;
  const achievableRpm = Math.max(0, (omega_max_achievable * 60 / (2 * Math.PI)) / input.gearRatio);

  // Power at required operating point (assuming supplyVmax is used and PWM drops it to required V)
  const P_mech = tau_motor_Nm * omega_req;
  const V_req_motor = omega_req / kv_rad + I_req * R_total;
  const P_elec = V_req_motor * I_req;
  const efficiency = P_elec > 0 ? (P_mech / P_elec) * 100 : 0;

  return {
    currentA: I_req,
    motorTempC: T_motor,
    achievableRpm,
    torqueNm: tau_motor_Nm,
    requiredVoltage: V_req_motor,
    electricalPowerW: P_elec,
    mechanicalPowerW: P_mech,
    efficiency,
  };
}

export default function TorqueCalc() {
  const [inputs, setInputs] = useState<TorqueCalcInput>(DEFAULTS);
  const result = useMemo(() => calculateTorque(inputs), [inputs]);
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
        <Section title="Requirements">
          <Field label="Req. Torque" value={inputs.requiredTorqueNcm} onChange={(v:any) => setInputs({...inputs, requiredTorqueNcm: v})} unit="Ncm" />
          <Field label="Req. RPM" value={inputs.requiredRpm} onChange={(v:any) => setInputs({...inputs, requiredRpm: v})} unit="RPM" />
          <Field label="Min Voltage" value={inputs.supplyVoltageMin} onChange={(v:any) => setInputs({...inputs, supplyVoltageMin: v})} unit="V" />
          <Field label="Max Voltage" value={inputs.supplyVoltageMax} onChange={(v:any) => setInputs({...inputs, supplyVoltageMax: v})} unit="V" />
        </Section>
        <Section title="Motor">
          <Field label="Motor KV" value={inputs.motorKv} onChange={(v:any) => setInputs({...inputs, motorKv: v})} unit="rpm/V" />
          <Field label="Io" value={inputs.motorIo} onChange={(v:any) => setInputs({...inputs, motorIo: v})} unit="A" />
          <Field label="Rm" value={inputs.motorRmMohm} onChange={(v:any) => setInputs({...inputs, motorRmMohm: v})} unit="mΩ" />
          <Field label="Max Current" value={inputs.motorMaxCurrent} onChange={(v:any) => setInputs({...inputs, motorMaxCurrent: v})} unit="A" />
          <Field label="Weight" value={inputs.motorWeightG} onChange={(v:any) => setInputs({...inputs, motorWeightG: v})} unit="g" />
        </Section>
        <Section title="System">
          <Field label="Ambient Temp" value={inputs.ambientTempC} onChange={(v:any) => setInputs({...inputs, ambientTempC: v})} unit="°C" />
          <div className="w-full py-0.5">
            <label className="text-[8px] uppercase text-[#808080] tracking-wider block mb-0.5" style={{ fontFamily: "Michroma, sans-serif" }}>Thermal Mode</label>
            <select value={inputs.thermalMode} onChange={e => setInputs({...inputs, thermalMode: e.target.value as any})} className="w-full border border-gray-200 text-[11px] px-2 py-1 focus:outline-none focus:border-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
              <option value="none">None (20°C)</option>
              <option value="partial">Partial (+30°C)</option>
              <option value="full">Full Calculation</option>
            </select>
          </div>
          <Field label="ESC Resistance" value={inputs.controllerRmMohm} onChange={(v:any) => setInputs({...inputs, controllerRmMohm: v})} unit="mΩ" />
          <Field label="Gear Ratio" value={inputs.gearRatio} onChange={(v:any) => setInputs({...inputs, gearRatio: v})} unit=":1" />
          <Field label="Gear Efficiency" value={inputs.gearEfficiency} onChange={(v:any) => setInputs({...inputs, gearEfficiency: v})} unit="%" />
        </Section>
      </div>

      {/* ── Results ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Current Draw" value={result.currentA.toFixed(1)} unit="A" />
        <StatCard label="Req. Voltage" value={result.requiredVoltage.toFixed(1)} unit="V" />
        <StatCard label="Achievable RPM" value={result.achievableRpm.toFixed(0)} unit="RPM" warn={result.achievableRpm < inputs.requiredRpm} />
        <StatCard label="Est. Temp" value={result.motorTempC.toFixed(0)} unit="°C" warn={result.motorTempC > 100} />
        <StatCard label="Elec Power" value={result.electricalPowerW.toFixed(0)} unit="W" />
        <StatCard label="Mech Power" value={result.mechanicalPowerW.toFixed(0)} unit="W" />
        <StatCard label="Motor Efficiency" value={result.efficiency.toFixed(1)} unit="%" />
        <StatCard label="Motor Torque" value={(result.torqueNm * 100).toFixed(1)} unit="Ncm" />
      </div>
    </div>
  );
}
