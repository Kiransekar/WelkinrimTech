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

function calculateTraction(inp: TractionInput) {
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
  const result = useMemo(() => calculateTraction(inputs), [inputs]);

// ─────────────────────────────────────────────────────────────
// Shared UI Primitives
// ─────────────────────────────────────────────────────────────



interface FieldProps {
  label: string; id: string; value: number;
  onChange: (v: number) => void;
  step?: string; hint?: string; className?: string;
  unit?: string;
}

function Field({ label, id, value, onChange, step = "any", hint, className = "", unit }: FieldProps) {
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
          id={id} type="number" step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full text-[11px] px-2 py-1 focus:outline-none bg-white font-bold"
          style={{ fontFamily: "Lexend, sans-serif" }}
        />
        {unit && <span className="bg-gray-50 text-[8px] text-gray-400 px-1.5 py-1.5 border-l border-gray-100 font-Michroma uppercase">{unit}</span>}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = true, icon, action }: { title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: string; action?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 mb-2 overflow-hidden bg-white shadow-sm transition-all text-[11px]">
      <div 
        className="bg-black px-3 py-2 flex items-center justify-between cursor-pointer group hover:bg-neutral-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#ffc812] text-xs">{icon}</span>}
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#ffc812] font-bold"
             style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
        </div>
        <div className="flex items-center gap-3">
          {action}
          <span className={`text-[#ffc812] text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
        </div>
      </div>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100 p-2" : "max-h-0 opacity-0 p-0"}`}>
        <div className="space-y-1">{children}</div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, unit, sub, type = "normal" }: any) => {
  const isDanger = type === "danger";
  const isWarn = type === "warn";
  const isGood = type === "good";
  return (
    <div className={`border p-2.5 bg-white transition-all hover:shadow-md ${isDanger ? "border-red-500 shadow-red-50" : isWarn ? "border-amber-400 shadow-amber-50" : isGood ? "border-green-500 shadow-green-50" : "border-gray-200"}`}>
      <p className="text-[8px] tracking-[0.15em] uppercase text-[#808080] mb-1 font-bold font-Michroma">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-black font-Michroma">{value}</span>
        {unit && <span className="text-[9px] font-bold text-gray-400 uppercase font-Michroma">{unit}</span>}
      </div>
      {sub && <p className="text-[9px] text-gray-400 mt-1 font-Lexend italic border-t border-gray-50 pt-1 leading-tight">{sub}</p>}
    </div>
  );
};

const Row = ({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) => (
  <div className={`flex justify-between border-b border-gray-50 py-1 font-Lexend text-[10px] ${highlight ? "bg-neutral-50 px-1 border-black/10" : ""}`}>
    <span className="text-gray-400">{label}</span>
    <span className={`font-bold ${color || (highlight ? "text-black" : "text-neutral-700")}`}>{value}</span>
  </div>
);


  const inputsPanel = (
    <div className="space-y-3">
      <CollapsibleSection title="Core Mission" icon="🏁">
        <Field label="Max Speed" id="ms" value={inputs.maxSpeed} onChange={(v: number) => setInputs({...inputs, maxSpeed: v})} unit="km/h" hint="Target cruise/top speed" />
        <Field label="Slope Angle" id="sa" value={inputs.slopeAngle} onChange={(v: number) => setInputs({...inputs, slopeAngle: v})} unit="°" hint="Gradient for gradeability" />
        <Field label="Accel Time" id="at" value={inputs.accelTime} onChange={(v: number) => setInputs({ ...inputs, accelTime: Math.max(0.1, v) })} unit="s" hint="Time to reach max speed" />
      </CollapsibleSection>

      <CollapsibleSection title="Vehicle Specs" icon="🚢">
        <Field label="Gross Mass (GVM)" id="gvm" value={inputs.gvm} onChange={(v: number) => setInputs({ ...inputs, gvm: v })} unit="kg" />
        <Field label="Tyre Diameter" id="td" value={inputs.tyreDiameter} onChange={(v: number) => setInputs({ ...inputs, tyreDiameter: v })} unit="mm" />
        <Field label="Rolling Coeff" id="crr" value={inputs.crr} onChange={(v: number) => setInputs({ ...inputs, crr: v })} step="0.001" hint="Friction factor (Crr)" />
        <Field label="Frontal Area" id="fa" value={inputs.frontalArea} onChange={(v: number) => setInputs({ ...inputs, frontalArea: v })} unit="m²" step="0.01" />
      </CollapsibleSection>

      <CollapsibleSection title="Environment" icon="🌫️" defaultOpen={false}>
        <Field label="Air Density" id="ad" value={inputs.airDensity} onChange={(v: number) => setInputs({ ...inputs, airDensity: v })} unit="kg/m³" step="0.01" />
        <Field label="Drag Coeff (Cd)" id="cd" value={inputs.dragCoeff} onChange={(v: number) => setInputs({ ...inputs, dragCoeff: v })} step="0.01" />
      </CollapsibleSection>

      <CollapsibleSection title="Drive Train" icon="⚙️">
        <Field label="Gear Ratio (i)" id="gr" value={inputs.gearRatio} onChange={(v: number) => setInputs({ ...inputs, gearRatio: Math.max(0.1, v) })} step="0.1" />
        <Field label="Final Speed" id="fs" value={inputs.finalSpeed} onChange={(v: number) => setInputs({ ...inputs, finalSpeed: v })} unit="m/s" step="0.1" hint="Reference wheel speed" />
      </CollapsibleSection>

      <CollapsibleSection title="Crr Reference" icon="📜" defaultOpen={false}>
        <div className="space-y-1 text-[8px] font-Lexend leading-tight">
          {CRR_TABLE.map((row, i) => (
            <div key={i} className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-gray-400 w-2/3">{row.surface}</span>
              <span className="font-bold text-black text-right">{row.values}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );

  const forces = [
    { label: "Rolling RR", value: result.rollingResistance, color: "bg-neutral-500" },
    { label: "Accel Force", value: result.accelForce, color: "bg-[#ffc812]" },
    { label: "Aero Drag", value: result.aeroDrag, color: "bg-neutral-800" },
    { label: "Grade Res", value: result.gradeResistance, color: "bg-neutral-300" },
  ];
  const maxForce = Math.max(...forces.map(f => f.value), 100);

  const resultsPanel = (
    <div id="tractioncalc-report-area" className="relative space-y-4">
      <PdfTemplateHeader calculatorName="Traction Drive Dynamics" />
      <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 italic font-Lexend">
            Vehicle tractive effort, wheel torque, and motor requirements for EV design.
          </p>
        </div>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Traction_Drive.pdf" />
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard label="Tractive Effort" value={result.totalTractiveEffort.toFixed(1)} unit="N" sub="Total demand" type="warn" />
        <StatCard label="Wheel Torque" value={result.wheelTorque.toFixed(1)} unit="Nm" sub={`i=${inputs.gearRatio}`} />
        <StatCard label="Wheel Power" value={result.wheelPower.toFixed(2)} unit="kW" sub={`${(result.wheelPower * 1000).toFixed(0)} W`} type="good" />
        <StatCard label="Motor Speed" value={result.motorSpeed.toFixed(0)} unit="RPM" sub="At target speed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Force Analysis */}
        <div className="border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-neutral-900 px-3 py-1.5 flex items-center justify-between font-Michroma">
            <span className="text-[9px] uppercase tracking-wider text-[#ffc812] font-bold">Force Breakdown</span>
          </div>
          <div className="p-3 space-y-3">
            {forces.map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[8px] font-Michroma uppercase text-gray-400">
                  <span>{f.label}</span>
                  <span className="text-black font-bold">{f.value.toFixed(1)} N</span>
                </div>
                <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${f.color} transition-all duration-1000`} 
                    style={{ width: `${(f.value / maxForce) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2">
               <Row label="Total Demand" value={`${result.totalTractiveEffort.toFixed(2)} N`} highlight />
               <Row label="Cruising Flow" value={`${result.cruisingTractiveEffort.toFixed(2)} N`} />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-neutral-50 border border-gray-200 p-3 space-y-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#ffc812] font-bold font-Michroma mb-3 text-center">Output Requirements</p>
            <div className="space-y-1">
               <Row label="Motor Torque" value={`${result.motorTorque.toFixed(2)} Nm`} />
               <Row label="Cruising Power" value={`${result.cruisingWheelPower.toFixed(3)} kW`} />
               <Row label="Grade Limit" value={`${inputs.slopeAngle}°`} color="text-red-600" />
            </div>
          </div>
          
          <div className="p-3 bg-white border border-gray-100">
             <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma mb-2">Drive Physics</p>
             <div className="space-y-1 text-[9px] font-Lexend text-gray-600 italic leading-snug">
                <p>Grade resistance calculated at <strong>{inputs.slopeAngle}°</strong> contributes <strong>{((result.gradeResistance / result.totalTractiveEffort) * 100).toFixed(1)}%</strong> of total load.</p>
                <p>Aero drag dominates at high speeds (v² dependency).</p>
             </div>
          </div>
        </div>
      </div>

      {/* Physics Reference */}
      <div className="bg-neutral-900 border border-black p-4 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#ffc812] font-bold font-Michroma mb-3">Mathematical Model</p>
            <div className="grid grid-cols-1 gap-2 text-[10px] font-Lexend opacity-80 italic">
              <p>F_rr = m · g · C_rr <span className="text-[8px] opacity-40 ml-2">(Rolling)</span></p>
              <p>F_ad = 0.5 · ρ · C_d · A · v² <span className="text-[8px] opacity-40 ml-2">(Aero)</span></p>
              <p>F_gr = m · g · tan(α) <span className="text-[8px] opacity-40 ml-2">(Grade)</span></p>
              <p>T_wheel = F_total · r_wheel <span className="text-[8px] opacity-40 ml-2">(Torque)</span></p>
            </div>
          </div>
          <div className="pt-4 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-6">
            <p className="text-[8px] text-[#ffc812] uppercase font-bold font-Michroma mb-2">Design Note</p>
            <p className="text-[10px] leading-relaxed font-Lexend opacity-70">
              Total tractive effort (TTE) is the sum of all resistive forces. Motor selection must satisfy T_peak ≥ T_wheel/i and P_rated ≥ P_cruise.
              Source: IITM Vehicle Dynamics Framework.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
