import { useState, useMemo } from "react";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface Warning { level: "warn" | "danger"; message: string; }

interface EvCalcInput {
  massKg: number;
  frontalAreaM2: number;
  dragCoeff: number;
  rollingResCoeff: number;
  drivetrainEfficiency: number;

  batteryCapacityKwh: number;
  usableBatteryPercent: number;

  cruiseSpeedKmh: number;
  ambientTempC: number;
  elevationChangeM: number;
  auxiliaryPowerW: number;
  regenEfficiency: number;

  chargerPowerKw: number;
  chargeStartSoc: number;
  chargeEndSoc: number;
}

const DEFAULTS: EvCalcInput = {
  massKg: 1800,
  frontalAreaM2: 2.2,
  dragCoeff: 0.23,
  rollingResCoeff: 0.010,
  drivetrainEfficiency: 90,
  batteryCapacityKwh: 75,
  usableBatteryPercent: 95,
  cruiseSpeedKmh: 110,
  ambientTempC: 20,
  elevationChangeM: 0,
  auxiliaryPowerW: 500,
  regenEfficiency: 70,
  chargerPowerKw: 150,
  chargeStartSoc: 10,
  chargeEndSoc: 80,
};

function deriveWarnings(result: any, inputs: EvCalcInput): Warning[] {
  const w: Warning[] = [];
  if (result.rangeKm < 100) w.push({ level: "warn", message: `Range is very low: ${result.rangeKm.toFixed(0)} km.` });
  if (inputs.ambientTempC < 0) w.push({ level: "warn", message: `Cold temperature negatively impacts rolling resistance and battery capacity.` });
  return w;
}

function calculateEv(input: EvCalcInput) {
  const V_ms = input.cruiseSpeedKmh / 3.6;
  const distM = 1000;
  
  // Cold temperature penalty on rolling resistance (alpha_cold ~ 0.005)
  const T_ref = 20;
  let C_rr = input.rollingResCoeff;
  if (input.ambientTempC < T_ref) {
      C_rr = C_rr * (1 + 0.005 * (T_ref - input.ambientTempC));
  }

  // Aero
  const F_aero = 0.5 * 1.225 * input.dragCoeff * input.frontalAreaM2 * Math.pow(V_ms, 2);
  const E_aero_Wh = (F_aero * distM / (input.drivetrainEfficiency / 100)) / 3600;

  // Rolling
  const F_rolling = C_rr * input.massKg * 9.81;
  const E_rolling_Wh = (F_rolling * distM / (input.drivetrainEfficiency / 100)) / 3600;

  // Elevation (distribute over 100km for "per km" normalized assuming the user means total trip elevation)
  // Or typically E_grad = m * g * h / 3600 per absolute trip.
  // We'll calculate a standard trip of 100km to normalize elevation.
  const tripDistKm = 100;
  let E_grad_trip_Wh = 0;
  if (input.elevationChangeM > 0) {
      E_grad_trip_Wh = (input.massKg * 9.81 * input.elevationChangeM / (input.drivetrainEfficiency/100)) / 3600;
  } else if (input.elevationChangeM < 0) {
      E_grad_trip_Wh = (input.massKg * 9.81 * input.elevationChangeM * (input.regenEfficiency/100) * (input.drivetrainEfficiency/100)) / 3600;
  }
  const E_grad_Wh_per_km = E_grad_trip_Wh / tripDistKm;

  // Aux
  const durationH_per_km = 1 / input.cruiseSpeedKmh;
  const E_aux_Wh = input.auxiliaryPowerW * durationH_per_km;

  // Total consumption
  const consumption_Wh_km = E_aero_Wh + E_rolling_Wh + E_grad_Wh_per_km + E_aux_Wh;

  // Range
  // Cold temp battery penalty
  let usableCap_kWh = input.batteryCapacityKwh * (input.usableBatteryPercent / 100);
  if (input.ambientTempC < 15) {
      // rough approx: -1% capacity per degree below 15C
      usableCap_kWh *= (1 - 0.01 * (15 - input.ambientTempC));
  }
  
  const rangeKm = (usableCap_kWh * 1000) / consumption_Wh_km;

  // Charging section (19)
  const chargeNeeded_kWh = input.batteryCapacityKwh * ((input.chargeEndSoc - input.chargeStartSoc) / 100);
  // Charge curve taper: assume average power is 75% of peak if going above 80%
  let avgChargePowerKw = input.chargerPowerKw;
  if (input.chargeEndSoc > 80) avgChargePowerKw *= 0.75;
  const chargeTimeMin = (chargeNeeded_kWh / avgChargePowerKw) * 60;

  return {
    consumption_Wh_km,
    rangeKm,
    usableCap_kWh,
    chargeTimeMin,
    E_aero_Wh,
    E_rolling_Wh,
    E_grad_Wh_per_km,
    E_aux_Wh,
  };
}

export default function EvCalc() {
  const [inputs, setInputs] = useState<EvCalcInput>(DEFAULTS);
  const result = useMemo(() => calculateEv(inputs), [inputs]);
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

  const inputsPanel = (
    <div className="space-y-3">
      <Section title="Vehicle Specs">
        <Field label="Mass" value={inputs.massKg} onChange={(v:any) => setInputs({...inputs, massKg: v})} unit="kg" />
        <Field label="Frontal Area" value={inputs.frontalAreaM2} onChange={(v:any) => setInputs({...inputs, frontalAreaM2: v})} unit="m²" />
        <Field label="Drag Coeff" value={inputs.dragCoeff} onChange={(v:any) => setInputs({...inputs, dragCoeff: v})} />
        <Field label="Rolling Res" value={inputs.rollingResCoeff} step={0.001} onChange={(v:any) => setInputs({...inputs, rollingResCoeff: v})} />
        <Field label="Drivetrain Eff" value={inputs.drivetrainEfficiency} onChange={(v:any) => setInputs({...inputs, drivetrainEfficiency: v})} unit="%" />
        <Field label="Regen Eff" value={inputs.regenEfficiency} onChange={(v:any) => setInputs({...inputs, regenEfficiency: v})} unit="%" />
      </Section>
      <Section title="Battery & Climate">
        <Field label="Capacity" value={inputs.batteryCapacityKwh} onChange={(v:any) => setInputs({...inputs, batteryCapacityKwh: v})} unit="kWh" />
        <Field label="Usable Cap" value={inputs.usableBatteryPercent} onChange={(v:any) => setInputs({...inputs, usableBatteryPercent: v})} unit="%" />
        <Field label="Ambient Temp" value={inputs.ambientTempC} onChange={(v:any) => setInputs({...inputs, ambientTempC: v})} unit="°C" />
        <Field label="Aux Power" value={inputs.auxiliaryPowerW} onChange={(v:any) => setInputs({...inputs, auxiliaryPowerW: v})} unit="W" />
      </Section>
      <Section title="Trip">
        <Field label="Cruise Speed" value={inputs.cruiseSpeedKmh} onChange={(v:any) => setInputs({...inputs, cruiseSpeedKmh: v})} unit="km/h" />
        <Field label="Elevation" value={inputs.elevationChangeM} onChange={(v:any) => setInputs({...inputs, elevationChangeM: v})} unit="m" />
      </Section>
      <Section title="Charging">
        <Field label="Charger Power" value={inputs.chargerPowerKw} onChange={(v:any) => setInputs({...inputs, chargerPowerKw: v})} unit="kW" />
        <Field label="Start SOC" value={inputs.chargeStartSoc} onChange={(v:any) => setInputs({...inputs, chargeStartSoc: v})} unit="%" />
        <Field label="End SOC" value={inputs.chargeEndSoc} onChange={(v:any) => setInputs({...inputs, chargeEndSoc: v})} unit="%" />
      </Section>
    </div>
  );

  const resultsPanel = (
    <div id="evcalc-report-area" className="relative space-y-4">
      <PdfTemplateHeader calculatorName="Electric Vehicle Range" />
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
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_EV_Report.pdf" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Consumption" value={result.consumption_Wh_km.toFixed(1)} unit="Wh/km" />
        <StatCard label="Est. Range" value={result.rangeKm.toFixed(0)} unit="km" warn={result.rangeKm < 100} />
        <StatCard label="True Capacity" value={result.usableCap_kWh.toFixed(1)} unit="kWh" sub="Temp adjusted" />
        <StatCard label="Charge Time" value={result.chargeTimeMin.toFixed(0)} unit="min" />
        <StatCard label="Aero Load" value={result.E_aero_Wh.toFixed(1)} unit="Wh/km" />
        <StatCard label="Rolling Load" value={result.E_rolling_Wh.toFixed(1)} unit="Wh/km" />
        <StatCard label="Gradient Load" value={result.E_grad_Wh_per_km.toFixed(1)} unit="Wh/km" />
        <StatCard label="Aux Load" value={result.E_aux_Wh.toFixed(1)} unit="Wh/km" />
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
