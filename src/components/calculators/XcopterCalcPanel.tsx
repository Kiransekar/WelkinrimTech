import { useState } from "react";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import GaugeMeter from "./GaugeMeter";
import { calcXcopter, XcopterCalcInput, XcopterCalcResult } from "@/lib/calculators/xcopterCalc";

const DEFAULTS: XcopterCalcInput = {
  numRotors:             4,
  auwG:                  1500,
  payloadG:              0,
  elevationM:            0,
  temperatureC:          25,
  pressureHpa:           1013,
  batteryCells:          4,
  batteryCapacityMah:    5000,
  batteryMaxDischarge:   0.80,
  batteryResistanceMohm: 12,
  motorKv:               900,
  motorIo:               1.5,
  motorRmMohm:           35,
  motorMaxCurrentA:      30,
  propDiameterInch:      12,
  propPitchInch:         4.5,
  ct:                    0.12,
  cp:                    0.05,
};

function Field({
  label, id, value, onChange, step = "any",
}: {
  label: string; id: string; value: number;
  onChange: (v: number) => void; step?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] tracking-widest uppercase text-[#808080]"
             style={{ fontFamily: "Michroma, sans-serif" }} htmlFor={id}>
        {label}
      </label>
      <input
        id={id} type="number" step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc914] transition-colors bg-white"
        style={{ fontFamily: "Michroma, sans-serif" }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 mb-3">
      <div className="bg-black px-3 py-1.5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
           style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-1.5 pr-3 text-[10px] text-[#808080]" style={{ fontFamily: "Lexend, sans-serif" }}>{label}</td>
      <td className="py-1.5 text-[11px] font-bold text-black text-right" style={{ fontFamily: "Michroma, sans-serif" }}>{value}</td>
    </tr>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-gray-100 p-3 text-center">
      <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1"
         style={{ fontFamily: "Michroma, sans-serif" }}>{label}</p>
      <p className="text-base font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{value}</p>
      {sub && <p className="text-[9px] text-[#808080] mt-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>{sub}</p>}
    </div>
  );
}

export default function XcopterCalcPanel() {
  const [inputs, setInputs] = useState<XcopterCalcInput>(DEFAULTS);
  const [result, setResult] = useState<XcopterCalcResult | null>(null);

  const set = (key: keyof XcopterCalcInput) => (v: number) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setResult(calcXcopter(inputs));
  }

  const flightTimeData = result ? [
    { mode: "Hover",    minutes: +result.flightTime.hoverMin.toFixed(1) },
    { mode: "Mixed",    minutes: +result.flightTime.mixedMin.toFixed(1) },
    { mode: "Full Thr", minutes: +result.flightTime.fullThrottleMin.toFixed(1) },
  ] : [];

  const throttleData = result?.throttleCurve.map(r => ({
    throttle:    `${r.throttle.toFixed(0)}%`,
    "Thrust (g)": +r.thrustG.toFixed(1),
    "Power (W)":  +r.powerW.toFixed(1),
    "Current (A)": +r.currentA.toFixed(1),
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Inputs */}
      <form onSubmit={handleCalculate} className="lg:w-80 xl:w-96 flex-shrink-0">
        <Section title="Multirotor Configuration">
          <Field label="# Rotors"    id="xnr" value={inputs.numRotors}  onChange={set("numRotors")} step="1" />
          <Field label="AUW (g)"     id="xaw" value={inputs.auwG}        onChange={set("auwG")} />
          <Field label="Payload (g)" id="xpg" value={inputs.payloadG}    onChange={set("payloadG")} />
        </Section>

        <Section title="Environment">
          <Field label="Elevation (m)" id="xel" value={inputs.elevationM}   onChange={set("elevationM")} />
          <Field label="Temp (°C)"     id="xtc" value={inputs.temperatureC} onChange={set("temperatureC")} />
          <div className="col-span-2">
            <Field label="Pressure (hPa)" id="xph" value={inputs.pressureHpa} onChange={set("pressureHpa")} />
          </div>
        </Section>

        <Section title="Battery">
          <Field label="Cells (S)"       id="xbc"  value={inputs.batteryCells}           onChange={set("batteryCells")} step="1" />
          <Field label="Capacity (mAh)"  id="xbm"  value={inputs.batteryCapacityMah}     onChange={set("batteryCapacityMah")} step="100" />
          <Field label="Max Disch (%)"   id="xbd"  value={inputs.batteryMaxDischarge*100} onChange={v => set("batteryMaxDischarge")(v/100)} />
          <Field label="Resist (mΩ/cell)"id="xbr"  value={inputs.batteryResistanceMohm}  onChange={set("batteryResistanceMohm")} />
        </Section>

        <Section title="Motor">
          <Field label="KV (rpm/V)"      id="xkv"  value={inputs.motorKv}          onChange={set("motorKv")} step="1" />
          <Field label="Io (A)"          id="xio"  value={inputs.motorIo}          onChange={set("motorIo")} step="0.1" />
          <Field label="Rm (mΩ)"        id="xrm"  value={inputs.motorRmMohm}      onChange={set("motorRmMohm")} />
          <Field label="Max Current (A)" id="xmc"  value={inputs.motorMaxCurrentA} onChange={set("motorMaxCurrentA")} />
        </Section>

        <Section title="Propeller">
          <Field label="Dia (inch)"   id="xpd"  value={inputs.propDiameterInch} onChange={set("propDiameterInch")} step="0.5" />
          <Field label="Pitch (inch)" id="xpp"  value={inputs.propPitchInch}    onChange={set("propPitchInch")} step="0.1" />
          <Field label="CT"           id="xct"  value={inputs.ct}               onChange={set("ct")} step="0.005" />
          <Field label="CP"           id="xcp"  value={inputs.cp}               onChange={set("cp")} step="0.005" />
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

      {/* Results */}
      <div className="flex-1 min-w-0">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 text-center gap-4">
            <svg viewBox="0 0 64 64" className="w-16 h-16 text-[#ffc914]/30" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="32" cy="32" r="6" fill="currentColor" />
              <line x1="32" y1="4"  x2="32" y2="18" />
              <line x1="32" y1="46" x2="32" y2="60" />
              <line x1="4"  y1="32" x2="18" y2="32" />
              <line x1="46" y1="32" x2="60" y2="32" />
              <circle cx="32" cy="32" r="24" strokeDasharray="4 3" />
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
                 style={{ fontFamily: "Michroma, sans-serif" }}>Key Metrics</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 justify-items-center">
                <GaugeMeter value={result.hover.rpm}                     max={20000} label="Hover RPM"   unit="rpm"    yellowAt={0.60} redAt={0.80} />
                <GaugeMeter value={result.hover.currentA}                max={50}    label="Hover Curr"  unit="A"      yellowAt={0.60} redAt={0.80} />
                <GaugeMeter value={result.hover.powerW}                  max={1500}  label="Hover Pwr"   unit="W"      yellowAt={0.60} redAt={0.80} />
                <GaugeMeter value={result.performance.thrustWeightRatio} max={4}     label="TWR"          unit=":1"     yellowAt={0.50} redAt={0.30} />
                <GaugeMeter value={result.flightTime.hoverMin}           max={30}    label="Hover Time"   unit="min"    yellowAt={0.33} redAt={0.17} />
                <GaugeMeter value={result.temperature.estimatedHoverC}   max={120}   label="Motor Temp"   unit="°C"     yellowAt={0.50} redAt={0.70} />
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Thrust"   value={`${result.performance.totalThrustG.toFixed(0)} g`}  sub={`${result.performance.thrustWeightRatio.toFixed(2)}:1 TWR`} />
              <StatCard label="Hover Throttle" value={`${result.hover.throttlePercent.toFixed(1)} %`}     sub="of max throttle" />
              <StatCard label="Est. Range"     value={`${result.performance.estimatedRangeKm.toFixed(1)} km`} sub="at 10 m/s avg" />
              <StatCard label="Disc Loading"   value={`${result.hover.discLoadingNm2.toFixed(1)} N/m²`}   sub="per rotor" />
            </div>

            {/* Detail tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100">
                <div className="bg-black px-3 py-1.5">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                     style={{ fontFamily: "Michroma, sans-serif" }}>Hover Point</p>
                </div>
                <div className="p-3">
                  <table className="w-full">
                    <tbody>
                      <Row label="RPM"         value={result.hover.rpm.toFixed(0)} />
                      <Row label="Current"     value={`${result.hover.currentA.toFixed(1)} A`} />
                      <Row label="Voltage"     value={`${result.hover.voltageV.toFixed(2)} V`} />
                      <Row label="Power"       value={`${result.hover.powerW.toFixed(0)} W`} />
                      <Row label="Throttle"    value={`${result.hover.throttlePercent.toFixed(1)} %`} />
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border border-gray-100">
                <div className="bg-black px-3 py-1.5">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                     style={{ fontFamily: "Michroma, sans-serif" }}>Maximum</p>
                </div>
                <div className="p-3">
                  <table className="w-full">
                    <tbody>
                      <Row label="RPM per rotor"  value={result.maximum.rpm.toFixed(0)} />
                      <Row label="Current"        value={`${result.maximum.currentA.toFixed(1)} A`} />
                      <Row label="Thrust (each)"  value={`${result.maximum.thrustG.toFixed(0)} g`} />
                      <Row label="Total Thrust"   value={`${result.performance.totalThrustG.toFixed(0)} g`} />
                      <Row label="Est. Motor Temp"value={`${result.maximum.temperatureC.toFixed(0)} °C`} />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Flight time bar chart */}
            <div className="border border-gray-100">
              <div className="bg-black px-3 py-1.5">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                   style={{ fontFamily: "Michroma, sans-serif" }}>Flight Time by Mode</p>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={flightTimeData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mode" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                    <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} unit=" min" />
                    <Tooltip
                      formatter={(v: number) => [`${v} min`, "Flight Time"]}
                      contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif", border: "1px solid #e5e7eb" }}
                    />
                    <Bar dataKey="minutes" fill="#ffc914" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Throttle curve */}
            <div className="border border-gray-100">
              <div className="bg-black px-3 py-1.5">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
                   style={{ fontFamily: "Michroma, sans-serif" }}>Throttle Curve (per rotor)</p>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={throttleData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="throttle" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                    <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                    <Tooltip contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif", border: "1px solid #e5e7eb" }} />
                    <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                    <Line type="monotone" dataKey="Thrust (g)"  stroke="#ffc914" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Power (W)"   stroke="#111"    strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Current (A)" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
