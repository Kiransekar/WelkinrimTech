// src/components/calculators/WbCalc.tsx
// Weight & Balance Calculator - Station-based component loading
// Inspired by ecalc.ch w&bCalc - calculates CG envelope and station loading

import { useState, useMemo } from "react";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea, ZAxis, Cell,
} from "recharts";

interface Station {
  id: number;
  name: string;
  armCm: number; // distance from datum
  minWeightG: number;
  maxWeightG: number;
  currentWeightG: number;
  type: "fuel" | "payload" | "equipment" | "structure" | "other";
}

interface FlightCondition {
  id: number;
  name: string;
  fuelPercent: number;
  payloadPercent: number;
}

const DEFAULT_STATIONS: Station[] = [
  { id: 1, name: "Nose Equipment", armCm: 5, minWeightG: 0, maxWeightG: 150, currentWeightG: 80, type: "equipment" },
  { id: 2, name: "Battery Bay", armCm: 15, minWeightG: 0, maxWeightG: 600, currentWeightG: 500, type: "equipment" },
  { id: 3, name: "Wing", armCm: 25, minWeightG: 0, maxWeightG: 800, currentWeightG: 400, type: "structure" },
  { id: 4, name: "Motor", armCm: 80, minWeightG: 0, maxWeightG: 250, currentWeightG: 120, type: "structure" },
  { id: 5, name: "Payload", armCm: 20, minWeightG: 0, maxWeightG: 300, currentWeightG: 100, type: "payload" },
];

const FLIGHT_CONDITIONS: FlightCondition[] = [
  { id: 1, name: "Empty", fuelPercent: 0, payloadPercent: 0 },
  { id: 2, name: "Takeoff", fuelPercent: 100, payloadPercent: 100 },
  { id: 3, name: "Landing", fuelPercent: 10, payloadPercent: 0 },
  { id: 4, name: "Cruise", fuelPercent: 50, payloadPercent: 100 },
];

function Field({
  label, id, value, onChange, step = "any", hint, className = "",
}: {
  label: string; id: string; value: number;
  onChange: (v: number) => void; step?: string; hint?: string; className?: string;
}) {
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
      <input
        id={id} type="number" step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-200 text-[11px] px-2 py-1 focus:outline-none focus:border-[#ffc812] transition-colors bg-white"
        style={{ fontFamily: "Michroma, sans-serif" }}
      />
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="border border-gray-100 mb-3">
      <div className="bg-black px-3 py-1.5 flex items-center justify-between">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
           style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
        {action}
      </div>
      <div className="p-2 space-y-0.5">{children}</div>
    </div>
  );
}

export default function WbCalc() {
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
  const [cgLimits, setCgLimits] = useState({ forwardCm: 18, aftCm: 28 });
  const [maxGrossWeightG, setMaxGrossWeightG] = useState(3500);
  const [emptyWeightG, setEmptyWeightG] = useState(1500);
  const [emptyCgCm, setEmptyCgCm] = useState(22);

  const updateStation = (id: number, field: keyof Station, value: number | string) => {
    setStations(stations.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addStation = () => {
    const newId = Math.max(0, ...stations.map(s => s.id)) + 1;
    setStations([...stations, {
      id: newId, name: `Station ${newId}`, armCm: 20, minWeightG: 0, maxWeightG: 300, currentWeightG: 100, type: "other",
    }]);
  };

  const removeStation = (id: number) => {
    if (stations.length > 1) setStations(stations.filter(s => s.id !== id));
  };

  // Calculate current weight and balance
  const currentWandB = useMemo(() => {
    let totalWeight = emptyWeightG;
    let totalMoment = emptyWeightG * emptyCgCm;

    stations.forEach(station => {
      const weight = Math.min(station.maxWeightG, Math.max(station.minWeightG, station.currentWeightG));
      totalWeight += weight;
      totalMoment += weight * station.armCm;
    });

    const cgArm = totalWeight > 0 ? totalMoment / totalWeight : 0;
    const cgPercentMAC = cgLimits.forwardCm > 0
      ? ((cgArm - cgLimits.forwardCm) / (cgLimits.aftCm - cgLimits.forwardCm)) * 100
      : 50;

    return {
      totalWeight,
      totalMoment,
      cgArm,
      cgPercentMAC,
      weightOverMax: totalWeight > maxGrossWeightG,
      cgTooForward: cgArm < cgLimits.forwardCm,
      cgTooAft: cgArm > cgLimits.aftCm,
      inEnvelope: totalWeight <= maxGrossWeightG && cgArm >= cgLimits.forwardCm && cgArm <= cgLimits.aftCm,
    };
  }, [stations, emptyWeightG, emptyCgCm, cgLimits, maxGrossWeightG]);

  // Calculate flight conditions
  const flightConditions = useMemo(() => {
    return FLIGHT_CONDITIONS.map(condition => {
      let weight = emptyWeightG;
      let moment = emptyWeightG * emptyCgCm;

      stations.forEach(station => {
        let stationWeight = 0;
        if (station.type === "fuel") {
          stationWeight = station.maxWeightG * (condition.fuelPercent / 100);
        } else if (station.type === "payload") {
          stationWeight = station.maxWeightG * (condition.payloadPercent / 100);
        } else {
          stationWeight = station.currentWeightG;
        }
        weight += stationWeight;
        moment += stationWeight * station.armCm;
      });

      const cgArm = weight > 0 ? moment / weight : 0;
      return {
        ...condition,
        weight,
        cgArm,
        moment,
        inEnvelope: weight <= maxGrossWeightG && cgArm >= cgLimits.forwardCm && cgArm <= cgLimits.aftCm,
      };
    });
  }, [stations, emptyWeightG, emptyCgCm, cgLimits, maxGrossWeightG]);


  // Station breakdown for table
  const stationBreakdown = useMemo(() => {
    return stations.map(station => {
      const weight = Math.min(station.maxWeightG, Math.max(station.minWeightG, station.currentWeightG));
      const moment = weight * station.armCm;
      const percentTotal = currentWandB.totalWeight > 0 ? (weight / currentWandB.totalWeight) * 100 : 0;
      const percentMax = station.maxWeightG > 0 ? (weight / station.maxWeightG) * 100 : 0;
      return {
        ...station,
        currentWeightG: weight,
        moment,
        percentTotal,
        percentMax,
      };
    });
  }, [stations, currentWandB.totalWeight]);

  const getStatusColor = () => {
    if (currentWandB.weightOverMax) return "border-red-500 bg-red-50";
    if (currentWandB.cgTooForward || currentWandB.cgTooAft) return "border-amber-500 bg-amber-50";
    return "border-green-500 bg-green-50";
  };

  const getStatusIcon = () => {
    if (currentWandB.weightOverMax) return { icon: "", text: "Over Max Gross Weight" };
    if (currentWandB.cgTooForward) return { icon: "", text: "CG Too Forward" };
    if (currentWandB.cgTooAft) return { icon: "", text: "CG Too Aft" };
    return { icon: "", text: "Within Envelope" };
  };

  const status = getStatusIcon();

  return (
    <div className="space-y-4">
      {/* ── Compact Inputs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Aircraft Basics */}
        <Section title="Aircraft Basics">
          <Field label="Empty Wt (g)" id="ew" value={emptyWeightG} onChange={setEmptyWeightG}
                 hint="Basic empty weight including unusable fuel" />
          <Field label="Empty CG (cm)" id="ecg" value={emptyCgCm} onChange={setEmptyCgCm}
                 hint="CG location at empty weight" />
          <Field label="Max Gross (g)" id="mgw" value={maxGrossWeightG} onChange={setMaxGrossWeightG}
                 hint="Maximum tested takeoff weight" />
          <Field label="Fwd Limit (cm)" id="cgf" value={cgLimits.forwardCm} onChange={v => setCgLimits({ ...cgLimits, forwardCm: v })}
                 hint="Most forward allowable CG" />
          <Field label="Aft Limit (cm)" id="cga" value={cgLimits.aftCm} onChange={v => setCgLimits({ ...cgLimits, aftCm: v })}
                 hint="Most aft allowable CG" />
        </Section>

        {/* Stations */}
        <div className="border border-gray-100 md:col-span-2">
          <div className="bg-black px-3 py-1.5 flex items-center justify-between">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Loading Stations</p>
            <button onClick={addStation} className="text-[9px] bg-[#ffc812] text-black px-2 py-0.5 font-bold"
                    style={{ fontFamily: "Michroma, sans-serif" }}>+ Add</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 max-h-72 overflow-y-auto">
            {stations.map((station) => (
              <div key={station.id} className="p-2 border-b border-r border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-1">
                  <input type="text" value={station.name}
                    onChange={e => updateStation(station.id, "name", e.target.value)}
                    className="text-[10px] font-bold border-none bg-transparent focus:outline-none flex-1"
                    style={{ fontFamily: "Michroma, sans-serif" }} />
                  <select value={station.type}
                    onChange={e => updateStation(station.id, "type", e.target.value)}
                    className="text-[9px] border border-gray-300 px-1 py-0.5 bg-white"
                    style={{ fontFamily: "Michroma, sans-serif" }}>
                    <option value="equipment">Equipment</option>
                    <option value="payload">Payload</option>
                    <option value="fuel">Fuel</option>
                    <option value="structure">Structure</option>
                    <option value="other">Other</option>
                  </select>
                  <button onClick={() => removeStation(station.id)} className="text-red-500 text-xs hover:text-red-700 ml-1">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Field label="Arm (cm)" id={`sta-${station.id}`} value={station.armCm} onChange={v => updateStation(station.id, "armCm", v)}
                         hint="Distance from datum" />
                  <Field label="Current (g)" id={`stw-${station.id}`} value={station.currentWeightG} onChange={v => updateStation(station.id, "currentWeightG", v)} />
                  <Field label="Min (g)" id={`stn-${station.id}`} value={station.minWeightG} onChange={v => updateStation(station.id, "minWeightG", v)} />
                  <Field label="Max (g)" id={`stm-${station.id}`} value={station.maxWeightG} onChange={v => updateStation(station.id, "maxWeightG", v)} />
                </div>
                <div className="mt-1">
                  <input type="range" min={station.minWeightG} max={station.maxWeightG} value={station.currentWeightG}
                    onChange={e => updateStation(station.id, "currentWeightG", parseFloat(e.target.value))}
                    className="w-full accent-[#ffc812] h-1" />
                  <div className="flex justify-between text-[7px] text-gray-400">
                    <span>{station.minWeightG}g</span>
                    <span>{station.maxWeightG}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Total Weight</p>
            <p className={`text-xl font-black ${currentWandB.weightOverMax ? "text-red-500" : "text-black"}`}
               style={{ fontFamily: "Michroma, sans-serif" }}>{currentWandB.totalWeight.toFixed(0)} g</p>
            <p className="text-[8px] text-gray-400">Max: {maxGrossWeightG}g</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>CG Position</p>
            <p className={`text-xl font-black ${currentWandB.cgTooForward || currentWandB.cgTooAft ? "text-amber-500" : "text-black"}`}
               style={{ fontFamily: "Michroma, sans-serif" }}>{currentWandB.cgArm.toFixed(1)} cm</p>
            <p className="text-[8px] text-gray-400">{cgLimits.forwardCm}-{cgLimits.aftCm}cm</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>CG %MAC</p>
            <p className={`text-xl font-black ${currentWandB.inEnvelope ? "text-green-500" : "text-amber-500"}`}
               style={{ fontFamily: "Michroma, sans-serif" }}>{currentWandB.cgPercentMAC.toFixed(1)}%</p>
            <p className="text-[8px] text-gray-400">0-100% = in range</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Total Moment</p>
            <p className="text-xl font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{(currentWandB.totalMoment / 1000).toFixed(1)} kg·cm</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`border-2 p-4 mb-5 ${getStatusColor()}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{status.icon}</span>
            <div>
              <p className="font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                {currentWandB.inEnvelope ? "Weight & Balance OK" : "Weight & Balance Alert"}
              </p>
              <p className="text-sm text-gray-600" style={{ fontFamily: "Lexend, sans-serif" }}>{status.text}</p>
            </div>
          </div>
        </div>

        {/* CG Envelope Chart */}
        <div className="border border-gray-100 mb-5">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>CG Envelope</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="cg" name="CG Position" unit="cm"
                       domain={[cgLimits.forwardCm - 5, cgLimits.aftCm + 5]}
                       tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                <YAxis type="number" dataKey="weight" name="Weight" unit="g"
                       domain={[emptyWeightG - 100, maxGrossWeightG + 100]}
                       tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                <ZAxis type="number" range={[50, 100]} />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif" }}
                         cursor={{ strokeDasharray: "3 3" }} />

                {/* Envelope area */}
                <ReferenceArea x1={cgLimits.forwardCm} x2={cgLimits.aftCm} y1={emptyWeightG} y2={maxGrossWeightG}
                               fill="#22c55e" fillOpacity={0.1} />

                {/* CG limits */}
                <ReferenceLine x={cgLimits.forwardCm} stroke="#ef4444" strokeWidth={2} label={{ value: "FWD", angle: -90, fontSize: 8, fill: "#ef4444" }} />
                <ReferenceLine x={cgLimits.aftCm} stroke="#ef4444" strokeWidth={2} label={{ value: "AFT", angle: 90, fontSize: 8, fill: "#ef4444" }} />

                {/* Max weight line */}
                <ReferenceLine y={maxGrossWeightG} stroke="#ef4444" strokeWidth={2} label={{ value: "MAX WEIGHT", position: "insideTopRight", fontSize: 8, fill: "#ef4444" }} />

                {/* Flight conditions */}
                <Scatter name="Conditions" data={flightConditions} fill="#ffc812">
                  {flightConditions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.inEnvelope ? "#22c55e" : "#ef4444"} />
                  ))}
                </Scatter>

                {/* Current loading */}
                <Scatter name="Current" data={[{ cg: currentWandB.cgArm, weight: currentWandB.totalWeight }]}
                         fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-[9px] text-center text-gray-500 mt-2" style={{ fontFamily: "Lexend, sans-serif" }}>
              Green area = safe envelope · Blue = current loading · Green dots = valid conditions · Red dots = invalid
            </p>
          </div>
        </div>

        {/* Flight Conditions Table */}
        <div className="border border-gray-100 mb-5">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Flight Conditions Summary</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left">Condition</th>
                  <th className="px-3 py-2 text-right">Weight (g)</th>
                  <th className="px-3 py-2 text-right">CG (cm)</th>
                  <th className="px-3 py-2 text-right">%MAC</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {flightConditions.map((fc, i) => (
                  <tr key={fc.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-2 font-bold">{fc.name}</td>
                    <td className="px-3 py-2 text-right">{fc.weight.toFixed(0)}</td>
                    <td className="px-3 py-2 text-right">{fc.cgArm.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right">
                      {(((fc.cgArm - cgLimits.forwardCm) / (cgLimits.aftCm - cgLimits.forwardCm)) * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right">
                      {fc.inEnvelope ? (
                        <span className="text-green-500 font-bold">OK</span>
                      ) : (
                        <span className="text-red-500 font-bold">OUT</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Station Breakdown */}
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Station Loading Detail</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left">Station</th>
                  <th className="px-3 py-2 text-right">Type</th>
                  <th className="px-3 py-2 text-right">Arm (cm)</th>
                  <th className="px-3 py-2 text-right">Current (g)</th>
                  <th className="px-3 py-2 text-right">Min-Max (g)</th>
                  <th className="px-3 py-2 text-right">Moment (g·cm)</th>
                  <th className="px-3 py-2 text-right">Fill</th>
                  <th className="px-3 py-2 text-right">% Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Empty aircraft row */}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-3 py-2">Empty Aircraft</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">{emptyCgCm.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">{emptyWeightG.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">{(emptyWeightG * emptyCgCm).toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">{((emptyWeightG / currentWandB.totalWeight) * 100).toFixed(1)}%</td>
                </tr>
                {stationBreakdown.map((station, i) => (
                  <tr key={station.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-2">
                        {station.name}
                    </td>
                    <td className="px-3 py-2 text-right capitalize">{station.type}</td>
                    <td className="px-3 py-2 text-right">{station.armCm.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right font-bold">{station.currentWeightG.toFixed(0)}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{station.minWeightG} - {station.maxWeightG}</td>
                    <td className="px-3 py-2 text-right">{station.moment.toFixed(0)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ffc812]" style={{ width: `${station.percentMax}%` }} />
                        </div>
                        <span className="text-[8px] text-gray-500 w-8">{station.percentMax.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">{station.percentTotal.toFixed(1)}%</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-black text-[#ffc812] font-bold">
                  <td className="px-3 py-2">TOTAL</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">{currentWandB.cgArm.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">{currentWandB.totalWeight.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">{currentWandB.totalMoment.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">100%</td>
                  <td className="px-3 py-2 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
