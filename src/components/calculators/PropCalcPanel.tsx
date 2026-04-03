import { useState } from "react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import GaugeMeter from "./GaugeMeter";
import { calcProp, PropCalcInput, PropCalcResult } from "@/lib/calculators/propCalc";

// ── Default inputs ────────────────────────────────────────────────────────────
const DEFAULTS: PropCalcInput = {
  modelWeightG:       850,
  numMotors:          1,
  wingAreaDm2:        50,
  dragCoefficient:    0.06,
  elevationM:         500,
  temperatureC:       25,
  pressureHpa:        1013,
  batteryCells:       3,
  batteryCapacityMah: 2200,
  batteryMaxDischarge: 0.85,
  batteryResistanceMohm: 15,
  motorKv:            1300,
  motorIo:            1.2,
  motorRmMohm:        45,
  motorMaxPowerW:     400,
  propDiameterInch:   10,
  propPitchInch:      4.7,
  propBlades:         2,
  pconst:             1.2,
  tconst:             1.0,
  ct:                 0.11,
  cp:                 0.045,
};

// ── Small reusable input ──────────────────────────────────────────────────────
function Field({
  label, id, value, onChange, step = "any",
}: {
  label: string; id: string; value: number;
  onChange: (v: number) => void; step?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] tracking-widest uppercase text-[#808080]"
             style={{ fontFamily: "Michroma, sans-serif" }}
             htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc914] transition-colors bg-white"
        style={{ fontFamily: "Michroma, sans-serif" }}
      />
    </div>
  );
}

// ── Section header card ───────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 mb-3">
      <div className="bg-black px-3 py-1.5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
           style={{ fontFamily: "Michroma, sans-serif" }}>
          {title}
        </p>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-1.5 pr-3 text-[10px] text-[#808080]"
          style={{ fontFamily: "Lexend, sans-serif" }}>{label}</td>
      <td className="py-1.5 text-[11px] font-bold text-black text-right"
          style={{ fontFamily: "Michroma, sans-serif" }}>{value}</td>
    </tr>
  );
}

export default function PropCalcPanel() {
  const [inputs, setInputs] = useState<PropCalcInput>(DEFAULTS);
  const [result, setResult] = useState<PropCalcResult | null>(null);
  const [activeTab, setActiveTab] = useState<"static" | "dynamic">("static");

  const set = (key: keyof PropCalcInput) => (v: number) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setResult(calcProp(inputs));
  }

  // Chart data from partial load tables
  const staticChartData = result?.partialLoadStatic.map(r => ({
    throttle:    `${r.throttlePercent.toFixed(0)}%`,
    "Power (W)": +r.powerW.toFixed(1),
    "Thrust (g)":+r.thrustG.toFixed(1),
    "Eff (%)":   +r.efficiencyPercent.toFixed(1),
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Inputs ────────────────────────────────────────────────────────── */}
      <form onSubmit={handleCalculate} className="lg:w-80 xl:w-96 flex-shrink-0">
        <Section title="General">
          <Field label="Weight (g)"    id="mw"  value={inputs.modelWeightG}    onChange={set("modelWeightG")} />
          <Field label="# Motors"      id="nm"  value={inputs.numMotors}        onChange={set("numMotors")} step="1" />
          <Field label="Wing Area dm²" id="wa"  value={inputs.wingAreaDm2}      onChange={set("wingAreaDm2")} />
          <Field label="Drag Cd"       id="cd"  value={inputs.dragCoefficient}  onChange={set("dragCoefficient")} step="0.01" />
        </Section>

        <Section title="Environment">
          <Field label="Elevation (m)" id="el" value={inputs.elevationM}    onChange={set("elevationM")} />
          <Field label="Temp (°C)"     id="tc" value={inputs.temperatureC}  onChange={set("temperatureC")} />
          <div className="col-span-2">
            <Field label="Pressure (hPa)" id="ph" value={inputs.pressureHpa} onChange={set("pressureHpa")} />
          </div>
        </Section>

        <Section title="Battery">
          <Field label="Cells (S)"      id="bc"  value={inputs.batteryCells}           onChange={set("batteryCells")} step="1" />
          <Field label="Capacity (mAh)" id="bm"  value={inputs.batteryCapacityMah}     onChange={set("batteryCapacityMah")} step="100" />
          <Field label="Max Disch (%)"  id="bd"  value={inputs.batteryMaxDischarge*100} onChange={v => set("batteryMaxDischarge")(v/100)} />
          <Field label="Resist (mΩ/cell)" id="br" value={inputs.batteryResistanceMohm} onChange={set("batteryResistanceMohm")} />
        </Section>

        <Section title="Motor">
          <Field label="KV (rpm/V)"   id="kv"  value={inputs.motorKv}       onChange={set("motorKv")} step="1" />
          <Field label="Io (A)"       id="io"  value={inputs.motorIo}       onChange={set("motorIo")} step="0.1" />
          <Field label="Rm (mΩ)"     id="rm"  value={inputs.motorRmMohm}   onChange={set("motorRmMohm")} />
          <Field label="Max Power (W)" id="mp" value={inputs.motorMaxPowerW} onChange={set("motorMaxPowerW")} />
        </Section>

        <Section title="Propeller">
          <Field label="Dia (inch)"  id="pd"  value={inputs.propDiameterInch} onChange={set("propDiameterInch")} step="0.5" />
          <Field label="Pitch (inch)" id="pp" value={inputs.propPitchInch}    onChange={set("propPitchInch")} step="0.1" />
          <Field label="Blades"      id="pb"  value={inputs.propBlades}        onChange={set("propBlades")} step="1" />
          <Field label="PConst"      id="pc"  value={inputs.pconst}            onChange={set("pconst")} step="0.05" />
          <Field label="TConst"      id="ptc" value={inputs.tconst}            onChange={set("tconst")} step="0.05" />
          <Field label="CT"          id="ct"  value={inputs.ct}                onChange={set("ct")} step="0.005" />
          <Field label="CP"          id="cp"  value={inputs.cp}                onChange={set("cp")} step="0.005" />
        </Section>

        <button
          type="submit"
          className="w-full py-3 bg-[#ffc914] text-black text-[10px] tracking-widest uppercase font-black hover:bg-[#e0b212] transition-colors duration-200"
          style={{ fontFamily: "Michroma, sans-serif", transform: "skewX(-10deg)" }}
        >
          <span style={{ display: "inline-block", transform: "skewX(10deg)" }}>
            ⚡ Calculate
          </span>
        </button>
      </form>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 text-center gap-4">
            <svg viewBox="0 0 64 64" className="w-16 h-16 text-[#ffc914]/30" fill="currentColor">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="32" cy="32" r="17" fill="none" stroke="currentColor" strokeWidth="1.5" />
              {[0,60,120,180,240,300].map(a => {
                const rad = (Math.PI * a) / 180;
                return <line key={a} x1={32+17*Math.cos(rad)} y1={32+17*Math.sin(rad)} x2={32+26*Math.cos(rad)} y2={32+26*Math.sin(rad)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
              })}
            </svg>
            <p className="text-[11px] text-[#888] tracking-widest uppercase"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Configure inputs and press Calculate
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Gauges */}
            <div className="border border-gray-100 p-4">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914] mb-4"
                 style={{ fontFamily: "Michroma, sans-serif" }}>
                Key Metrics
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 justify-items-center">
                <GaugeMeter value={result.battery.loadC}              max={150} label="Load"        unit="C"     yellowAt={0.55} redAt={0.80} />
                <GaugeMeter value={result.battery.flightTimeMin}      max={30}  label="Flight Time" unit="min"   yellowAt={0.33} redAt={0.17} />
                <GaugeMeter value={result.motorMaximum.electricPowerW} max={1000} label="El. Power"  unit="W"    yellowAt={0.65} redAt={0.85} />
                <GaugeMeter value={result.motorMaximum.temperatureC}  max={150} label="Temp"        unit="°C"   yellowAt={0.47} redAt={0.60} />
                <GaugeMeter value={result.totalDrive.thrustWeightRatio} max={3} label="Thrust:Wt"   unit=":1"   yellowAt={0.50} redAt={0.33} />
                <GaugeMeter value={result.propeller.pitchSpeedKmh}    max={250} label="Pitch Spd"   unit="km/h" yellowAt={0.60} redAt={0.80} />
              </div>
            </div>

            {/* Motor + Propeller tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100">
                <div className="bg-black px-3 py-1.5 flex items-center justify-between">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                     style={{ fontFamily: "Michroma, sans-serif" }}>Motor — Optimum</p>
                </div>
                <div className="p-3">
                  <table className="w-full">
                    <tbody>
                      <Row label="Current"    value={`${result.motorOptimum.currentA.toFixed(1)} A`} />
                      <Row label="Voltage"    value={`${result.motorOptimum.voltageV.toFixed(2)} V`} />
                      <Row label="RPM"        value={result.motorOptimum.rpm.toFixed(0)} />
                      <Row label="El. Power"  value={`${result.motorOptimum.electricPowerW.toFixed(0)} W`} />
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
                      <Row label="Current"        value={`${result.motorMaximum.currentA.toFixed(1)} A`} />
                      <Row label="Voltage"        value={`${result.motorMaximum.voltageV.toFixed(2)} V`} />
                      <Row label="RPM"            value={result.motorMaximum.rpm.toFixed(0)} />
                      <Row label="El. Power"      value={`${result.motorMaximum.electricPowerW.toFixed(0)} W`} />
                      <Row label="Efficiency"     value={`${result.motorMaximum.efficiencyPercent.toFixed(1)} %`} />
                      <Row label="Temperature"    value={`${result.motorMaximum.temperatureC.toFixed(0)} °C / ${result.motorMaximum.temperatureF.toFixed(0)} °F`} />
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
                      <Row label="Static Thrust"  value={`${result.propeller.staticThrustG.toFixed(0)} g / ${result.propeller.staticThrustOz.toFixed(2)} oz`} />
                      <Row label="RPM"            value={result.propeller.rpm.toFixed(0)} />
                      <Row label="Pitch Speed"    value={`${result.propeller.pitchSpeedKmh.toFixed(1)} km/h / ${result.propeller.pitchSpeedMph.toFixed(1)} mph`} />
                      <Row label="Specific Thrust"value={`${result.propeller.specificThrustGW.toFixed(2)} g/W`} />
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
                      <Row label="All-up Weight"  value={`${result.airplane.allUpWeightG.toFixed(0)} g`} />
                      <Row label="Wing Loading"   value={`${result.airplane.wingLoadingGdm2.toFixed(1)} g/dm²`} />
                      <Row label="Stall Speed"    value={`${result.airplane.stallSpeedKmh.toFixed(1)} km/h`} />
                      <Row label="Max Speed"      value={`${result.airplane.maxSpeedKmh.toFixed(1)} km/h`} />
                      <Row label="Climb Rate"     value={`${result.airplane.climbRateMs.toFixed(1)} m/s`} />
                      <Row label="Flight Time"    value={`${result.battery.flightTimeMin.toFixed(1)} min`} />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Partial load chart */}
            <div className="border border-gray-100">
              <div className="bg-black px-3 py-1.5">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                   style={{ fontFamily: "Michroma, sans-serif" }}>Throttle Curve</p>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={staticChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="throttle" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                    <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                    <Tooltip
                      contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif", border: "1px solid #e5e7eb" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                    <Line type="monotone" dataKey="Power (W)"  stroke="#ffc914" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Thrust (g)" stroke="#111"    strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Eff (%)"    stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Partial load tables */}
            <div className="border border-gray-100">
              <div className="bg-black px-3 py-1.5 flex items-center gap-4">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                   style={{ fontFamily: "Michroma, sans-serif" }}>Partial Load Analysis</p>
                <div className="flex gap-2 ml-auto">
                  {(["static", "dynamic"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`text-[8px] tracking-widest uppercase px-2 py-0.5 transition-colors ${
                        activeTab === t ? "bg-[#ffc914] text-black" : "text-white/50 hover:text-white"
                      }`}
                      style={{ fontFamily: "Michroma, sans-serif" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                {activeTab === "static" ? (
                  <table className="w-full text-[10px] min-w-[500px]" style={{ fontFamily: "Michroma, sans-serif" }}>
                    <thead>
                      <tr className="bg-gray-50">
                        {["Throttle %","RPM","Current A","Voltage V","Power W","Eff %","Thrust g","g/W"].map(h => (
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
                          <td className="px-3 py-2">{r.efficiencyPercent.toFixed(1)}</td>
                          <td className="px-3 py-2">{r.thrustG.toFixed(0)}</td>
                          <td className="px-3 py-2">{r.specificThrustGW.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-[10px] min-w-[500px]" style={{ fontFamily: "Michroma, sans-serif" }}>
                    <thead>
                      <tr className="bg-gray-50">
                        {["Throttle %","RPM","Speed km/h","Current A","Power W","Thrust g","Wh/km"].map(h => (
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

            {/* Environment callout */}
            <div className="flex items-center gap-3 bg-[#ffc914]/5 border border-[#ffc914]/20 px-4 py-2.5">
              <div className="w-1 h-8 bg-[#ffc914] flex-shrink-0" />
              <p className="text-[10px] text-[#555]" style={{ fontFamily: "Lexend, sans-serif" }}>
                Air density at {result.environment.elevationM} m / {result.environment.temperatureC}°C:
                &nbsp;<strong className="text-black">{result.environment.airDensityKgm3.toFixed(4)} kg/m³</strong>
                &nbsp;· Thrust:Weight =&nbsp;
                <strong className="text-black">{result.totalDrive.thrustWeightRatio.toFixed(2)}:1</strong>
                &nbsp;· Flight time ≈&nbsp;
                <strong className="text-black">{result.battery.flightTimeMin.toFixed(1)} min</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
