// src/components/calculators/BladeCalc.tsx
// BladeCalc - Propeller blade element analysis
// Inspired by ecalc.ch bladeCalc - detailed propeller performance

import { useState, useMemo } from "react";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { PROPELLERS } from "@/data/propellers";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface BladeElement {
  station: number; // 0-1 (percentage of radius)
  chordCm: number;
  twistDeg: number;
  liftCoeff: number;
  dragCoeff: number;
  localThrust: number;
  localPower: number;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 mb-3">
      <div className="bg-black px-3 py-1.5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
           style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
      </div>
      <div className="p-2 space-y-0.5">{children}</div>
    </div>
  );
}

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

export default function BladeCalc() {
  const [selectedProp1, setSelectedProp1] = useState("apc-1047");
  const [selectedProp2, setSelectedProp2] = useState("apc-1147");
  const [rpm, setRpm] = useState(8000);
  const [airDensity, setAirDensity] = useState(1.225);

  // Calculate blade element data for a propeller
  const calcBladeElements = useMemo(() => {
    const prop1 = PROPELLERS.find(p => p.id === selectedProp1);
    const prop2 = PROPELLERS.find(p => p.id === selectedProp2);
    if (!prop1 || !prop2) return null;

    const numElements = 20;
    const elements1: BladeElement[] = [];
    const elements2: BladeElement[] = [];

    for (let i = 1; i <= numElements; i++) {
      const station = i / numElements; // 0.05 to 1.0
      
      // Prop1 BET integration
      const r_tip1 = prop1.diameterInch * 0.0254 / 2;
      const radiusM1 = r_tip1 * station;
      const dr1 = r_tip1 / numElements;
      const chordM1 = (r_tip1 * 0.2) * (1 - station * 0.3); // Tapering
      
      const theta1 = Math.atan2(prop1.pitchInch * 0.0254, 2 * Math.PI * radiusM1);
      const localSpeed1 = (rpm / 60) * 2 * Math.PI * radiusM1;
      const V_axial = 0; // Static hover analysis
      const phi1 = Math.atan2(V_axial, localSpeed1);
      const aoa1 = theta1 - phi1;
      
      const liftCoeff1 = 2 * Math.PI * aoa1;
      const dragCoeff1 = 0.01 + 0.05 * Math.pow(liftCoeff1, 2);
      
      const dL1 = 0.5 * airDensity * Math.pow(localSpeed1, 2) * chordM1 * liftCoeff1 * dr1;
      const dD1 = 0.5 * airDensity * Math.pow(localSpeed1, 2) * chordM1 * dragCoeff1 * dr1;
      
      const dT1 = prop1.blades * (dL1 * Math.cos(phi1) - dD1 * Math.sin(phi1));
      const dQ1 = prop1.blades * radiusM1 * (dL1 * Math.sin(phi1) + dD1 * Math.cos(phi1));
      const localPower1 = dQ1 * (rpm / 60 * 2 * Math.PI);

      elements1.push({
        station,
        chordCm: chordM1 * 100,
        twistDeg: theta1 * 180 / Math.PI,
        liftCoeff: liftCoeff1,
        dragCoeff: dragCoeff1,
        localThrust: dT1 * 101.97, // g
        localPower: localPower1,
      });

      // Prop2 BET integration
      const r_tip2 = prop2.diameterInch * 0.0254 / 2;
      const radiusM2 = r_tip2 * station;
      const dr2 = r_tip2 / numElements;
      const chordM2 = (r_tip2 * 0.2) * (1 - station * 0.3);
      
      const theta2 = Math.atan2(prop2.pitchInch * 0.0254, 2 * Math.PI * radiusM2);
      const localSpeed2 = (rpm / 60) * 2 * Math.PI * radiusM2;
      const phi2 = Math.atan2(V_axial, localSpeed2);
      const aoa2 = theta2 - phi2;
      
      const liftCoeff2 = 2 * Math.PI * aoa2;
      const dragCoeff2 = 0.01 + 0.05 * Math.pow(liftCoeff2, 2);
      
      const dL2 = 0.5 * airDensity * Math.pow(localSpeed2, 2) * chordM2 * liftCoeff2 * dr2;
      const dD2 = 0.5 * airDensity * Math.pow(localSpeed2, 2) * chordM2 * dragCoeff2 * dr2;
      
      const dT2 = prop2.blades * (dL2 * Math.cos(phi2) - dD2 * Math.sin(phi2));
      const dQ2 = prop2.blades * radiusM2 * (dL2 * Math.sin(phi2) + dD2 * Math.cos(phi2));
      const localPower2 = dQ2 * (rpm / 60 * 2 * Math.PI);

      elements2.push({
        station,
        chordCm: chordM2 * 100,
        twistDeg: theta2 * 180 / Math.PI,
        liftCoeff: liftCoeff2,
        dragCoeff: dragCoeff2,
        localThrust: dT2 * 101.97, // g
        localPower: localPower2,
      });
    }

    return { elements1, elements2, prop1, prop2 };
  }, [selectedProp1, selectedProp2, rpm, airDensity]);

  // Thrust distribution chart data
  const thrustChartData = useMemo(() => {
    if (!calcBladeElements) return [];
    return calcBladeElements.elements1.map((e1, i) => ({
      station: `${(e1.station * 100).toFixed(0)}%`,
      [`${calcBladeElements.prop1.brand} ${calcBladeElements.prop1.model}`]: e1.localThrust,
      [`${calcBladeElements.prop2.brand} ${calcBladeElements.prop2.model}`]: calcBladeElements.elements2[i].localThrust,
    }));
  }, [calcBladeElements]);

  // Power distribution chart data
  const powerChartData = useMemo(() => {
    if (!calcBladeElements) return [];
    return calcBladeElements.elements1.map((e1, i) => ({
      station: `${(e1.station * 100).toFixed(0)}%`,
      [`${calcBladeElements.prop1.brand} ${calcBladeElements.prop1.model}`]: e1.localPower,
      [`${calcBladeElements.prop2.brand} ${calcBladeElements.prop2.model}`]: calcBladeElements.elements2[i].localPower,
    }));
  }, [calcBladeElements]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    if (!calcBladeElements) return null;
    const totalThrust1 = calcBladeElements.elements1.reduce((sum, e) => sum + e.localThrust, 0);
    const totalThrust2 = calcBladeElements.elements2.reduce((sum, e) => sum + e.localThrust, 0);
    const totalPower1 = calcBladeElements.elements1.reduce((sum, e) => sum + e.localPower, 0);
    const totalPower2 = calcBladeElements.elements2.reduce((sum, e) => sum + e.localPower, 0);

    return {
      thrust1: totalThrust1,
      thrust2: totalThrust2,
      power1: totalPower1,
      power2: totalPower2,
      eff1: totalThrust1 > 0 ? totalThrust1 / totalPower1 : 0,
      eff2: totalThrust2 > 0 ? totalThrust2 / totalPower2 : 0,
    };
  }, [calcBladeElements]);
  const inputsPanel = (
    <div className="space-y-3">
      <Section title="Operating Conditions">
        <Field label="RPM" id="rpm" value={rpm} onChange={setRpm} step="100"
               hint="Propeller rotational speed" />
        <Field label="Air Density" id="rho" value={airDensity} onChange={setAirDensity} step="0.01"
               hint="ISA standard = 1.225 kg/m³" />
      </Section>

      <Section title="Propeller 1">
        <div className="col-span-2">
          <label className="text-[9px] tracking-widest uppercase text-[#808080] block mb-1"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Select Propeller</label>
          <select
            value={selectedProp1}
            onChange={e => setSelectedProp1(e.target.value)}
            className="w-full border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc812] transition-colors bg-white"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            {PROPELLERS.filter(p => p.application === "airplane" || p.application === "both").map(p => (
              <option key={p.id} value={p.id}>{p.brand} {p.model} ({p.diameterInch}×{p.pitchInch})</option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Propeller 2">
        <div className="col-span-2">
          <label className="text-[9px] tracking-widest uppercase text-[#808080] block mb-1"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Select Propeller</label>
          <select
            value={selectedProp2}
            onChange={e => setSelectedProp2(e.target.value)}
            className="w-full border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc812] transition-colors bg-white"
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            {PROPELLERS.filter(p => p.application === "airplane" || p.application === "both").map(p => (
              <option key={p.id} value={p.id}>{p.brand} {p.model} ({p.diameterInch}×{p.pitchInch})</option>
            ))}
          </select>
        </div>
      </Section>

      {calcBladeElements && (
        <Section title="Propeller Specs">
          <div className="col-span-2 space-y-2 text-xs" style={{ fontFamily: "Michroma, sans-serif" }}>
            <div className="flex justify-between">
              <span className="text-gray-500">{calcBladeElements.prop1.brand} {calcBladeElements.prop1.model}</span>
              <span className="font-bold">CT: {calcBladeElements.prop1.ct}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{calcBladeElements.prop2.brand} {calcBladeElements.prop2.model}</span>
              <span className="font-bold">CT: {calcBladeElements.prop2.ct}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-500">Efficiency</span>
              <span className="font-bold">{calcBladeElements.prop1.efficiency > calcBladeElements.prop2.efficiency ? "Prop 1" : "Prop 2"} better</span>
            </div>
          </div>
        </Section>
      )}
    </div>
  );

  const resultsPanel = (

  <div id="bladecalc-report-area" className="relative space-y-4">
      <PdfTemplateHeader calculatorName="Rotor Blade Element" />
      <div className="flex items-center justify-between mb-3 mt-0 border-t border-gray-100 pt-0">
        <h3 className="text-xs uppercase font-bold tracking-widest pdf-no-hide" style={{ fontFamily: "Michroma, sans-serif" }}>Analysis Results</h3>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Blade_Report.pdf" />
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Thrust (Prop 1)</p>
            <p className="text-lg font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{metrics.thrust1.toFixed(1)} N</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Thrust (Prop 2)</p>
            <p className="text-lg font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{metrics.thrust2.toFixed(1)} N</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Power (Prop 1)</p>
            <p className="text-lg font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{metrics.power1.toFixed(0)} W</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Power (Prop 2)</p>
            <p className="text-lg font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{metrics.power2.toFixed(0)} W</p>
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      {calcBladeElements && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Thrust Distribution Along Blade</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={thrustChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="station" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} unit=" N" />
                  <Tooltip contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif" }} />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Bar dataKey={`${calcBladeElements.prop1.brand} ${calcBladeElements.prop1.model}`} fill="#ffc812" radius={[2, 2, 0, 0]} />
                  <Bar dataKey={`${calcBladeElements.prop2.brand} ${calcBladeElements.prop2.model}`} fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border border-gray-100">
            <div className="bg-black px-3 py-1.5">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
                 style={{ fontFamily: "Michroma, sans-serif" }}>Power Distribution Along Blade</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={powerChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="station" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} unit=" W" />
                  <Tooltip contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif" }} />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                  <Bar dataKey={`${calcBladeElements.prop1.brand} ${calcBladeElements.prop1.model}`} fill="#ffc812" radius={[2, 2, 0, 0]} />
                  <Bar dataKey={`${calcBladeElements.prop2.brand} ${calcBladeElements.prop2.model}`} fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
