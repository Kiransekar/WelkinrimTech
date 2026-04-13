// EV Traction Motor Calculator
// Based on Roy Motor class at IITM - Vehicle dynamics & motor sizing
import { useState, useMemo } from "react";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface TractionInput {
  // Vehicle
  gvm: number;          // kg (Gross Vehicle Mass)
  maxSpeed: number;     // km/h
  tyreDiameter: number; // mm
  crr: number;          // rolling coefficient
  frontalArea: number;  // m²
  // Environment
  airDensity: number;   // kg/m³
  dragCoeff: number;    // Cd
  slopeAngle: number;   // degrees
  // Acceleration
  accelTime: number;    // s (time to reach final speed)
  finalSpeed: number;   // m/s (target speed for wheel calcs)
  // Transmission
  gearRatio: number;    // i
}

const DEFAULTS: TractionInput = {
  gvm: 200,
  maxSpeed: 80,
  tyreDiameter: 450,
  crr: 0.15,
  frontalArea: 0.4,
  airDensity: 1.2,
  dragCoeff: 0.2,
  slopeAngle: 15,
  accelTime: 1,
  finalSpeed: 5,
  gearRatio: 1,
};

const CRR_TABLE = [
  { surface: "Concrete (good/fair/poor)", values: "0.010 / 0.015 / 0.020" },
  { surface: "Asphalt (good/fair/poor)", values: "0.012 / 0.017 / 0.022" },
  { surface: "Macadam (good/fair/poor)", values: "0.015 / 0.022 / 0.037" },
  { surface: "Snow (2 in / 4 in)", values: "0.025 / 0.037" },
  { surface: "Dirt (smooth / sandy)", values: "0.025 / 0.037" },
  { surface: "Mud (firm / medium / soft)", values: "0.037 / 0.090 / 0.150" },
  { surface: "Grass (firm / soft)", values: "0.055 / 0.075" },
  { surface: "Sand (firm / soft / dune)", values: "0.060 / 0.150 / 0.300" },
];

const G = 9.81;

function calculate(inp: TractionInput) {
  const { gvm, maxSpeed, tyreDiameter, crr, frontalArea, airDensity, dragCoeff, slopeAngle, accelTime, finalSpeed, gearRatio } = inp;

  const vMs = maxSpeed / 3.6; // max speed in m/s
  const dwM = tyreDiameter / 1000; // tyre diameter in meters
  const slopeRad = (slopeAngle * Math.PI) / 180;

  // ── Traction Forces ──
  const rollingResistance = gvm * G * crr;
  const accelForce = gvm * (vMs / accelTime); // acceleration to reach max speed in accelTime
  const aeroDrag = 0.5 * airDensity * dragCoeff * frontalArea * vMs * vMs;
  const gradeResistance = gvm * G * Math.tan(slopeRad);
  const totalTractiveEffort = rollingResistance + accelForce + aeroDrag + gradeResistance;
  const cruisingTractiveEffort = rollingResistance + aeroDrag;

  // ── Wheel Calculations ──
  const wheelTorque = totalTractiveEffort * (dwM / 2);
  const wheelRpm = (finalSpeed * 60) / (Math.PI * dwM);
  const wheelPower = (wheelRpm * wheelTorque) / 9550; // kW
  const cruisingWheelTorque = cruisingTractiveEffort * (dwM / 2);
  const cruisingWheelPower = (wheelRpm * cruisingWheelTorque) / 9550;

  // ── Motor (via transmission) ──
  const motorTorque = wheelTorque / gearRatio;
  const motorSpeed = wheelRpm * gearRatio;
  const motorPower = (motorTorque * motorSpeed) / 9550; // should equal wheel power ideally

  return {
    vMs,
    rollingResistance,
    accelForce,
    aeroDrag,
    gradeResistance,
    totalTractiveEffort,
    cruisingTractiveEffort,
    wheelTorque,
    wheelRpm,
    wheelPower,
    cruisingWheelTorque,
    cruisingWheelPower,
    motorTorque,
    motorSpeed,
    motorPower,
  };
}

export default function TractionCalc() {
  const [inputs, setInputs] = useState<TractionInput>(DEFAULTS);
  const result = useMemo(() => calculate(inputs), [inputs]);

  const Field = ({ label, value, onChange, unit, step = 1 }: any) => (
    <div className="w-full py-0.5">
      <label className="text-[8px] uppercase text-[#808080] tracking-wider block mb-0.5" style={{ fontFamily: "Michroma, sans-serif" }}>
        {label}
      </label>
      <div className="flex items-center border border-gray-200 focus-within:border-[#ffc812] transition-colors">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 text-[11px] outline-none"
          style={{ fontFamily: "Lexend, sans-serif" }}
        />
        {unit && <span className="text-[9px] text-gray-400 px-2 whitespace-nowrap" style={{ fontFamily: "Lexend, sans-serif" }}>{unit}</span>}
      </div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border border-gray-100 p-2 bg-gray-50/30">
      <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2 border-b border-gray-100 pb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );

  const StatCard = ({ label, value, unit, sub, warn }: any) => (
    <div className={`border p-2 bg-white ${warn ? "border-amber-400 bg-amber-50" : "border-gray-200"}`}>
      <p className="text-[8px] uppercase text-[#ffc812] tracking-wider">{label}</p>
      <p className="text-base font-black" style={{ fontFamily: "Michroma, sans-serif" }}>
        {value} <span className="text-xs font-medium text-gray-400">{unit}</span>
      </p>
      {sub && <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className={`flex justify-between border-b border-gray-200 py-0.5 ${highlight ? "font-semibold text-gray-800" : ""}`}>
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  const inputsPanel = (
    <div className="space-y-3">
      <Section title="Vehicle Parameters">
        <Field label="Gross Vehicle Mass (GVM)" value={inputs.gvm} onChange={(v: number) => setInputs({ ...inputs, gvm: v })} unit="kg" />
        <Field label="Max Speed" value={inputs.maxSpeed} onChange={(v: number) => setInputs({ ...inputs, maxSpeed: v })} unit="km/h" />
        <Field label="Tyre Diameter" value={inputs.tyreDiameter} onChange={(v: number) => setInputs({ ...inputs, tyreDiameter: v })} unit="mm" />
        <Field label="Rolling Coefficient (Crr)" value={inputs.crr} onChange={(v: number) => setInputs({ ...inputs, crr: v })} step={0.001} />
        <Field label="Frontal Area" value={inputs.frontalArea} onChange={(v: number) => setInputs({ ...inputs, frontalArea: v })} unit="m²" step={0.01} />
      </Section>

      <Section title="Environment">
        <Field label="Air Density" value={inputs.airDensity} onChange={(v: number) => setInputs({ ...inputs, airDensity: v })} unit="kg/m³" step={0.01} />
        <Field label="Drag Coefficient (Cd)" value={inputs.dragCoeff} onChange={(v: number) => setInputs({ ...inputs, dragCoeff: v })} step={0.01} />
        <Field label="Slope Angle" value={inputs.slopeAngle} onChange={(v: number) => setInputs({ ...inputs, slopeAngle: v })} unit="°" step={0.5} />
      </Section>

      <Section title="Acceleration & Speed">
        <Field label="Acceleration Time" value={inputs.accelTime} onChange={(v: number) => setInputs({ ...inputs, accelTime: Math.max(0.1, v) })} unit="s" step={0.1} />
        <Field label="Final Speed (for wheel calc)" value={inputs.finalSpeed} onChange={(v: number) => setInputs({ ...inputs, finalSpeed: v })} unit="m/s" step={0.1} />
      </Section>

      <Section title="Transmission">
        <Field label="Gear Ratio (i)" value={inputs.gearRatio} onChange={(v: number) => setInputs({ ...inputs, gearRatio: Math.max(0.1, v) })} step={0.1} />
      </Section>

      {/* Crr Reference Table */}
      <Section title="Crr Reference">
        <div className="space-y-0.5 text-[9px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          {CRR_TABLE.map((row, i) => (
            <div key={i} className="flex justify-between border-b border-gray-100 py-0.5">
              <span className="text-gray-500 text-[8px]">{row.surface}</span>
              <span className="font-medium text-gray-700 text-[8px]">{row.values}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );

  // Force breakdown for bar visualization
  const forces = [
    { label: "Rolling Resistance", value: result.rollingResistance, color: "bg-blue-400" },
    { label: "Acceleration Force", value: result.accelForce, color: "bg-amber-400" },
    { label: "Aerodynamic Drag", value: result.aeroDrag, color: "bg-green-400" },
    { label: "Grade Resistance", value: result.gradeResistance, color: "bg-red-400" },
  ];
  const maxForce = result.totalTractiveEffort;

  const resultsPanel = (
    <div id="tractioncalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="EV Traction Motor Calculator" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500 border-l-2 border-[#ffc812] pl-3 py-1 pdf-no-hide" style={{ fontFamily: "Lexend, sans-serif" }}>
          EV traction motor sizing — vehicle dynamics, wheel torque, and motor requirements.
        </p>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Traction_Motor_Report.pdf" />
      </div>

      {/* Speed Badge */}
      <div className="inline-flex gap-2">
        <div className="px-3 py-1 bg-[#ffc812]/10 border border-[#ffc812]/30">
          <span className="text-[10px] uppercase tracking-wider text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
            {inputs.maxSpeed} km/h · {result.vMs.toFixed(2)} m/s
          </span>
        </div>
        <div className="px-3 py-1 bg-gray-50 border border-gray-200">
          <span className="text-[10px] tracking-wider text-gray-600" style={{ fontFamily: "Michroma, sans-serif" }}>
            {inputs.gvm} kg · {inputs.slopeAngle}° grade
          </span>
        </div>
      </div>

      {/* ── Traction Force Breakdown ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Traction Force Breakdown
        </p>
        <div className="space-y-1.5">
          {forces.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px]" style={{ fontFamily: "Lexend, sans-serif" }}>
              <span className="w-28 text-gray-500 shrink-0 text-[8px]">{f.label}</span>
              <div className="flex-1 h-4 bg-gray-100 border border-gray-200 relative overflow-hidden">
                <div className={`absolute inset-y-0 left-0 ${f.color}/60`} style={{ width: `${maxForce > 0 ? (f.value / maxForce) * 100 : 0}%` }} />
              </div>
              <span className="w-16 text-right font-medium shrink-0">{f.value.toFixed(1)} N</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tractive Effort ── */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Tractive Effort" value={result.totalTractiveEffort.toFixed(2)} unit="N" sub="RR + FA + AD + GR" />
        <StatCard label="Cruising Effort" value={result.cruisingTractiveEffort.toFixed(2)} unit="N" sub="RR + AD (no accel/grade)" />
      </div>

      {/* ── Force Details ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Individual Forces
        </p>
        <div className="space-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <Row label="Rolling Resistance (M×g×Crr)" value={`${result.rollingResistance.toFixed(2)} N`} />
          <Row label="Acceleration Force (M×a)" value={`${result.accelForce.toFixed(2)} N`} />
          <Row label="Aerodynamic Drag (½ρCdAv²)" value={`${result.aeroDrag.toFixed(2)} N`} />
          <Row label="Grade Resistance (Mg·tanα)" value={`${result.gradeResistance.toFixed(2)} N`} />
          <Row label="Total Tractive Effort" value={`${result.totalTractiveEffort.toFixed(2)} N`} highlight />
          <Row label="Cruising Tractive Effort" value={`${result.cruisingTractiveEffort.toFixed(2)} N`} />
        </div>
      </div>

      {/* ── Wheel Output ── */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Wheel Torque" value={result.wheelTorque.toFixed(2)} unit="Nm" sub={`TTE × dw/2`} />
        <StatCard label="Wheel RPM" value={result.wheelRpm.toFixed(2)} unit="RPM" sub={`@ ${inputs.finalSpeed} m/s`} />
        <StatCard label="Wheel Power" value={result.wheelPower.toFixed(3)} unit="kW" sub={`${(result.wheelPower * 1000).toFixed(1)} W`} />
        <StatCard label="Cruising Power" value={result.cruisingWheelPower.toFixed(3)} unit="kW" sub={`${(result.cruisingWheelPower * 1000).toFixed(1)} W`} />
      </div>

      {/* ── Motor Requirements ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Motor Requirements (i = {inputs.gearRatio})
        </p>
        <div className="space-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <Row label="Motor Torque (Tw / i)" value={`${result.motorTorque.toFixed(2)} Nm`} />
          <Row label="Motor Speed (nw × i)" value={`${result.motorSpeed.toFixed(2)} RPM`} />
          <Row label="Motor Power (Tm × nm / 9550)" value={`${result.motorPower.toFixed(3)} kW`} />
        </div>
      </div>

      {/* ── Formulas ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Formula Reference
        </p>
        <div className="space-y-1 text-[10px] text-gray-600" style={{ fontFamily: "Lexend, sans-serif" }}>
          <p>RR = M × g × C<sub>rr</sub></p>
          <p>FA = M × (v / t<sub>a</sub>)</p>
          <p>AD = ½ × ρ × C<sub>d</sub> × A × v²</p>
          <p>GR = M × g × tan(α)</p>
          <p>TTE = RR + FA + AD + GR</p>
          <p>T<sub>w</sub> = TTE × d<sub>w</sub> / 2</p>
          <p>n<sub>w</sub> = v<sub>f</sub> × 60 / (π × d<sub>w</sub>)</p>
          <p>P<sub>w</sub> = n<sub>w</sub> × T<sub>w</sub> / 9550</p>
          <p className="text-[9px] text-gray-400 mt-1 italic">Ref: Roy Motor class — IITM</p>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
