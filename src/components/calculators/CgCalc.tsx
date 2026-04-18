// src/components/calculators/CgCalc.tsx
// Center of Gravity Calculator for RC aircraft
// Inspired by ecalc.ch cgCalc - calculates CG, Neutral Point, and Aerodynamic Center

import { useState, useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface WingPanel {
  id: number;
  name: string;
  rootChordCm: number;
  tipChordCm: number;
  spanCm: number;
  sweepCm: number; // sweep at root leading edge
  dihedralCm: number;
  distanceFuselageCm: number; // from datum to root LE at fuselage
  incidenceDeg: number;
  weightG: number;
}

interface Component {
  id: number;
  name: string;
  weightG: number;
  armCm: number; // distance from datum (positive = forward)
  type: "wing" | "fuselage" | "tail" | "motor" | "battery" | "payload" | "other";
}

const DEFAULT_WING_PANELS: WingPanel[] = [
  { id: 1, name: "Main Wing", rootChordCm: 30, tipChordCm: 25, spanCm: 150, sweepCm: 5, dihedralCm: 0, distanceFuselageCm: 20, incidenceDeg: 0, weightG: 500 },
];

const DEFAULT_COMPONENTS: Component[] = [
  { id: 1, name: "Motor", weightG: 150, armCm: 80, type: "motor" },
  { id: 2, name: "Battery", weightG: 400, armCm: 15, type: "battery" },
  { id: 3, name: "Fuselage", weightG: 600, armCm: 25, type: "fuselage" },
];

// ─────────────────────────────────────────────────────────────
// Shared UI primitives
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
    <div className="border border-gray-100 mb-2 overflow-hidden bg-white shadow-sm transition-all">
      <div 
        className="bg-black px-3 py-2 flex items-center justify-between cursor-pointer group hover:bg-neutral-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#ffc812] text-xs">{icon}</span>}
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#ffc812] font-bold"
             style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
        </div>
        <div className="flex items-center gap-2">
            {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
            <span className={`text-[#ffc812] text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
        </div>
      </div>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100 p-2" : "max-h-0 opacity-0 p-0"}`}>
        <div className="space-y-1">{children}</div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, unit, sub, type = "normal" }: any) => {
  const isDanger = type === "danger";
  const isGood = type === "good";
  const isWarn = type === "warn";

  return (
    <div className={`border p-2.5 bg-white transition-all hover:shadow-md ${
      isDanger ? "border-red-500 shadow-red-50" : 
      isGood ? "border-green-500 shadow-green-50" : 
      isWarn ? "border-amber-400 shadow-amber-50" : "border-gray-200"
    }`}>
      <p className="text-[8px] tracking-[0.15em] uppercase text-[#808080] mb-1 font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{value}</span>
        {unit && <span className="text-[9px] font-bold text-gray-400 uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>{unit}</span>}
      </div>
      {sub && <p className="text-[9px] text-gray-400 mt-1 font-medium italic border-t border-gray-50 pt-1" style={{ fontFamily: "Lexend, sans-serif" }}>{sub}</p>}
    </div>
  );
};

export default function CgCalc() {
  const [wingPanels, setWingPanels] = useState<WingPanel[]>(DEFAULT_WING_PANELS);
  const [components, setComponents] = useState<Component[]>(DEFAULT_COMPONENTS);
  const [tailArmCm, setTailArmCm] = useState(70);
  const [htSpanCm, setHtSpanCm] = useState(60);
  const [htRootChordCm, setHtRootChordCm] = useState(12);
  const [htTipChordCm, setHtTipChordCm] = useState(10);
  const [htSweepCm, setHtSweepCm] = useState(2);

  // Calculate wing geometry
  const wingGeometry = useMemo(() => {
    let totalArea = 0;
    let totalMoment = 0;
    let macTotal = 0;
    let macMomentTotal = 0;

    wingPanels.forEach(panel => {
      // Area of trapezoidal panel (one side)
      const panelArea = (panel.rootChordCm + panel.tipChordCm) / 2 * panel.spanCm;
      const doublePanelArea = panelArea * 2; // both sides

      // Mean Aerodynamic Chord (MAC) for trapezoidal wing
      const taper = panel.tipChordCm / panel.rootChordCm;
      const mac = (2 / 3) * panel.rootChordCm * (1 + taper + taper * taper) / (1 + taper);

      // MAC location from root LE
      const macY = (panel.spanCm / 6) * (1 + 2 * taper) / (1 + taper);

      // MAC x-position (including sweep)
      const macX = panel.distanceFuselageCm + panel.sweepCm * (macY / panel.spanCm);

      totalArea += doublePanelArea;
      totalMoment += doublePanelArea * macX;
      macTotal += mac * doublePanelArea;
      macMomentTotal += mac * macX * doublePanelArea;
    });

    const wingAreaCm2 = totalArea;
    const cgX = totalMoment / totalArea; // X location of wing CG
    const mac = macTotal / totalArea; // Average MAC
    const acX = cgX + 0.25 * mac; // Aerodynamic center at 25% MAC

    return {
      wingAreaCm2,
      wingAreaDm2: wingAreaCm2 / 100,
      cgX,
      mac,
      acX,
    };
  }, [wingPanels]);

  // Calculate CG
  const cgCalculation = useMemo(() => {
    let totalWeight = 0;
    let totalMoment = 0;

    // Wing contribution
    wingPanels.forEach(panel => {
      const taper = panel.tipChordCm / panel.rootChordCm;
      const macY = (panel.spanCm / 6) * (1 + 2 * taper) / (1 + taper);
      const macX = panel.distanceFuselageCm + panel.sweepCm * (macY / panel.spanCm);
      totalWeight += panel.weightG;
      totalMoment += panel.weightG * macX;
    });

    // Components contribution
    components.forEach(comp => {
      totalWeight += comp.weightG;
      totalMoment += comp.weightG * comp.armCm;
    });

    const cgArm = totalWeight > 0 ? totalMoment / totalWeight : 0;
    return { totalWeight, totalMoment, cgArm };
  }, [wingPanels, components]);

  // Calculate Neutral Point
  const neutralPoint = useMemo(() => {
    // Horizontal tail volume coefficient
    const htArea = (htRootChordCm + htTipChordCm) / 2 * htSpanCm;
    const tailVolume = (htArea * tailArmCm) / (wingGeometry.wingAreaCm2 * wingGeometry.mac);

    // Neutral point location (simplified)
    // NP = AC_wing + (Vh * (S_h/S) * (l_h/MAC))
    const npX = wingGeometry.acX + tailVolume * wingGeometry.mac * 0.5;

    // Static margin
    const staticMarginCm = npX - cgCalculation.cgArm;
    const staticMarginPercent = wingGeometry.mac > 0 ? (staticMarginCm / wingGeometry.mac) * 100 : 0;

    return {
      htArea,
      tailVolume,
      npX,
      staticMarginCm,
      staticMarginPercent,
    };
  }, [wingGeometry, tailArmCm, htRootChordCm, htTipChordCm, htSpanCm, cgCalculation]);

  // Determine CG status
  const cgStatus = useMemo(() => {
    const sm = neutralPoint.staticMarginPercent;
    if (sm < 5) return { status: "danger", message: "CG too far aft - unstable!" };
    if (sm < 10) return { status: "warn", message: "CG near aft limit - reduced stability" };
    if (sm > 25) return { status: "warn", message: "CG too far forward - very stable but sluggish" };
    if (sm > 35) return { status: "danger", message: "CG too far forward - may not rotate!" };
    return { status: "good", message: "CG in optimal range (10-25% MAC)" };
  }, [neutralPoint.staticMarginPercent]);

  const addWingPanel = () => {
    const newId = Math.max(0, ...wingPanels.map(p => p.id)) + 1;
    setWingPanels([...wingPanels, { id: newId, name: `Wing ${newId}`, rootChordCm: 25, tipChordCm: 20, spanCm: 50, sweepCm: 3, dihedralCm: 0, distanceFuselageCm: 15, incidenceDeg: 0, weightG: 200 }]);
  };

  const removeWingPanel = (id: number) => {
    if (wingPanels.length > 1) setWingPanels(wingPanels.filter(p => p.id !== id));
  };

  const addComponent = () => {
    const newId = Math.max(0, ...components.map(c => c.id)) + 1;
    setComponents([...components, { id: newId, name: `Component ${newId}`, weightG: 100, armCm: 20, type: "other" }]);
  };

  const removeComponent = (id: number) => {
    if (components.length > 1) setComponents(components.filter(c => c.id !== id));
  };

  // Chart data for CG envelope
  const envelopeData = [
    { name: "Leading Edge", cg: 0, limit: 0 },
    { name: "10% MAC", cg: 10, limit: 10 },
    { name: "20% MAC (Ideal)", cg: 20, limit: 20 },
    { name: "25% MAC", cg: 25, limit: 25 },
    { name: "30% MAC", cg: 30, limit: 30 },
    { name: "Trailing Edge", cg: 100, limit: 100 },
  ];
  const inputsPanel = (
    <div className="space-y-3">
      {/* Wing Panels */}
      <CollapsibleSection 
        title="Wing Panels" 
        icon="✈"
        action={
          <button onClick={addWingPanel} className="pdf-hide text-[9px] bg-[#ffc812] text-black px-2 py-0.5 font-bold hover:bg-[#ffe082] transition-colors"
                  style={{ fontFamily: "Michroma, sans-serif" }}>+ Add Panel</button>
        }
      >
        {wingPanels.map((panel, idx) => (
          <div key={panel.id} className="p-2 border border-gray-100 bg-gray-50/50 mb-2 rounded-sm last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <input type="text" value={panel.name}
                onChange={e => { const newPanels = [...wingPanels]; newPanels[idx].name = e.target.value; setWingPanels(newPanels); }}
                className="text-[10px] font-bold border-none bg-transparent focus:outline-none uppercase text-[#ffc812]"
                style={{ fontFamily: "Michroma, sans-serif" }} />
              <button onClick={() => removeWingPanel(panel.id)} className="pdf-hide text-red-500 text-xs hover:text-red-700 transition-colors">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <Field label="Root Chord" id={`wrc-${panel.id}`} value={panel.rootChordCm} onChange={v => { const p = [...wingPanels]; p[idx].rootChordCm = v; setWingPanels(p); }} unit="cm" />
              <Field label="Tip Chord" id={`wtc-${panel.id}`} value={panel.tipChordCm} onChange={v => { const p = [...wingPanels]; p[idx].tipChordCm = v; setWingPanels(p); }} unit="cm" />
              <Field label="Panel Span" id={`ws-${panel.id}`} value={panel.spanCm} onChange={v => { const p = [...wingPanels]; p[idx].spanCm = v; setWingPanels(p); }} unit="cm" />
              <Field label="Sweep" id={`wsw-${panel.id}`} value={panel.sweepCm} onChange={v => { const p = [...wingPanels]; p[idx].sweepCm = v; setWingPanels(p); }} unit="cm" hint="LE sweep offset from root to tip" />
              <Field label="Datum Distance" id={`wd-${panel.id}`} value={panel.distanceFuselageCm} onChange={v => { const p = [...wingPanels]; p[idx].distanceFuselageCm = v; setWingPanels(p); }} unit="cm" hint="Distance from Datum to root LE (+ = fwd)" />
              <Field label="Panel Weight" id={`ww-${panel.id}`} value={panel.weightG} onChange={v => { const p = [...wingPanels]; p[idx].weightG = v; setWingPanels(p); }} unit="g" />
            </div>
          </div>
        ))}
      </CollapsibleSection>

      {/* Horizontal Tail */}
      <CollapsibleSection title="Horizontal Tail" icon="⛯" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Field label="Tail Span" id="hts" value={htSpanCm} onChange={setHtSpanCm} unit="cm" />
          <Field label="Tail Arm" id="hta" value={tailArmCm} onChange={setTailArmCm} unit="cm" hint="Distance from Wing AC to HT AC" />
          <Field label="Root Chord" id="htr" value={htRootChordCm} onChange={setHtRootChordCm} unit="cm" />
          <Field label="Tip Chord" id="htt" value={htTipChordCm} onChange={setHtTipChordCm} unit="cm" />
          <Field label="Sweep" id="htsw" value={htSweepCm} onChange={setHtSweepCm} unit="cm" />
        </div>
      </CollapsibleSection>

      {/* Components */}
      <CollapsibleSection 
        title="Weights & Components" 
        icon="⚖"
        action={
          <button onClick={addComponent} className="pdf-hide text-[9px] bg-[#ffc812] text-black px-2 py-0.5 font-bold hover:bg-[#ffe082] transition-colors"
                  style={{ fontFamily: "Michroma, sans-serif" }}>+ Add Comp</button>
        }
      >
        {components.map((comp, idx) => (
          <div key={comp.id} className="p-2 border border-gray-100 bg-gray-50/50 mb-2 rounded-sm last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <input type="text" value={comp.name}
                onChange={e => { const newComps = [...components]; newComps[idx].name = e.target.value; setComponents(newComps); }}
                className="text-[10px] font-bold border-none bg-transparent focus:outline-none text-gray-700"
                style={{ fontFamily: "Michroma, sans-serif" }} />
              <button onClick={() => removeComponent(comp.id)} className="pdf-hide text-red-500 text-xs hover:text-red-700 transition-colors">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <Field label="Weight" id={`cw-${comp.id}`} value={comp.weightG} onChange={v => { const c = [...components]; c[idx].weightG = v; setComponents(c); }} unit="g" />
              <Field label="Arm" id={`ca-${comp.id}`} value={comp.armCm} onChange={v => { const c = [...components]; c[idx].armCm = v; setComponents(c); }} unit="cm" hint="Distance from Datum (+ fwd)" />
            </div>
          </div>
        ))}
      </CollapsibleSection>
    </div>
  );

  const resultsPanel = (
    <div id="cgcalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="Center of Gravity Calculator" />
      <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 italic" style={{ fontFamily: "Lexend, sans-serif" }}>
            Neutral Point, Static Margin, and Weight Balance analytics.
          </p>
        </div>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_CG_Analysis.pdf" />
      </div>

      {/* Primary KPI Results */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard label="Total Weight" value={cgCalculation.totalWeight.toFixed(0)} unit="g" sub={`${(cgCalculation.totalWeight / 1000).toFixed(3)} kg`} />
        <StatCard label="CG Position" value={cgCalculation.cgArm.toFixed(1)} unit="cm" sub="Relative to Datum" />
        <StatCard label="Neutral Point" value={neutralPoint.npX.toFixed(1)} unit="cm" sub="Stability Limit" />
        <StatCard 
          label="Static Margin" 
          value={`${neutralPoint.staticMarginPercent.toFixed(1)}%`} 
          type={cgStatus.status}
          sub={cgStatus.message}
        />
      </div>

      {/* Status Warning Badge */}
      <div className={`p-3 border-l-4 flex items-center gap-3 ${
        cgStatus.status === "good" ? "bg-green-50 border-green-500 text-green-700" :
        cgStatus.status === "warn" ? "bg-amber-50 border-amber-400 text-amber-700" :
        "bg-red-50 border-red-500 text-red-700"
      }`}>
        <div className="text-xl">{cgStatus.status === "good" ? "✓" : "⚠"}</div>
        <div style={{ fontFamily: "Lexend, sans-serif" }}>
          <p className="font-bold text-xs uppercase tracking-wider">{cgStatus.status === "good" ? "STABLE CONFIGURATION" : "STABILITY WARNING"}</p>
          <p className="text-[10px] opacity-80">{cgStatus.message}</p>
        </div>
      </div>

      {/* Geometry & Envelope Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Detail Specs */}
        <div className="border border-gray-200 p-3 bg-white">
          <p className="text-[9px] uppercase text-[#ffc812] tracking-[0.2em] mb-3 font-bold border-b border-gray-50 pb-1"
             style={{ fontFamily: "Michroma, sans-serif" }}>Aero Detail</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>Wing Area</p>
              <p className="text-xs font-bold text-gray-800">{wingGeometry.wingAreaDm2.toFixed(1)} <span className="text-[10px] font-normal text-gray-400 font-Lexend tracking-tighter">dm²</span></p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>MAC</p>
              <p className="text-xs font-bold text-gray-800">{wingGeometry.mac.toFixed(1)} <span className="text-[10px] font-normal text-gray-400 font-Lexend tracking-tighter">cm</span></p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>AC X-Pos</p>
              <p className="text-xs font-bold text-gray-800">{wingGeometry.acX.toFixed(1)} <span className="text-[10px] font-normal text-gray-400 font-Lexend tracking-tighter">cm</span></p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-gray-400 font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>V-Tail Vol</p>
              <p className="text-xs font-bold text-gray-800">{neutralPoint.tailVolume.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Envelope Chart */}
        <div className="border border-gray-200 p-3 bg-white">
          <p className="text-[9px] uppercase text-[#ffc812] tracking-[0.2em] mb-3 font-bold border-b border-gray-50 pb-1"
             style={{ fontFamily: "Michroma, sans-serif" }}>Stability Envelope</p>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={envelopeData} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 7, fontFamily: "Michroma, sans-serif" }} width={60} />
                <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ fontSize: 9, fontFamily: "Lexend, sans-serif" }} />
                <ReferenceLine x={neutralPoint.staticMarginPercent} stroke="#000" strokeWidth={2} label={{ value: "CG", fill: "#000", fontSize: 8, position: "top" }} />
                <ReferenceLine x={10} stroke="#22c55e" strokeWidth={1} strokeDasharray="3 3" />
                <ReferenceLine x={25} stroke="#22c55e" strokeWidth={1} strokeDasharray="3 3" />
                <Bar dataKey="cg" fill="#ffc812" opacity={0.3} radius={[0, 2, 2, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mass Breakdown Table */}
      <div className="border border-gray-200 overflow-hidden">
        <div className="bg-black px-3 py-1.5 border-b border-gray-700">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#ffc812] font-bold" 
             style={{ fontFamily: "Michroma, sans-serif" }}>Weight & Balance Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-tighter">
              <tr>
                <th className="px-3 py-2">Component</th>
                <th className="px-3 py-2 text-right">Mass (g)</th>
                <th className="px-3 py-2 text-right">Arm (cm)</th>
                <th className="px-3 py-2 text-right">Moment</th>
                <th className="px-3 py-2 text-right">% Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {wingPanels.map((panel) => (
                <tr key={panel.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-1.5 font-medium text-gray-700 italic">{panel.name}</td>
                  <td className="px-3 py-1.5 text-right text-gray-600">{panel.weightG.toFixed(0)}</td>
                  <td className="px-3 py-1.5 text-right text-gray-400">—</td>
                  <td className="px-3 py-1.5 text-right text-gray-400">—</td>
                  <td className="px-3 py-1.5 text-right font-bold text-gray-800">
                    {((panel.weightG / cgCalculation.totalWeight) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              {components.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-1.5 font-medium text-gray-700 whitespace-nowrap">{comp.name}</td>
                  <td className="px-3 py-1.5 text-right text-gray-600">{comp.weightG.toFixed(0)}</td>
                  <td className="px-3 py-1.5 text-right text-gray-600">{comp.armCm.toFixed(1)}</td>
                  <td className="px-3 py-1.5 text-right text-gray-500">{(comp.weightG * comp.armCm).toFixed(0)}</td>
                  <td className="px-3 py-1.5 text-right font-bold text-gray-800">
                    {((comp.weightG / cgCalculation.totalWeight) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-900 text-[#ffc812] font-black uppercase text-[11px]">
                <td className="px-3 py-2">Total System</td>
                <td className="px-3 py-2 text-right">{cgCalculation.totalWeight.toFixed(0)}</td>
                <td className="px-3 py-2 text-right">—</td>
                <td className="px-3 py-2 text-right">{cgCalculation.totalMoment.toFixed(0)}</td>
                <td className="px-3 py-2 text-right">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
