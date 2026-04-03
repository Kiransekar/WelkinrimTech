// src/components/calculators/CgCalc.tsx
// Center of Gravity Calculator for RC aircraft
// Inspired by ecalc.ch cgCalc - calculates CG, Neutral Point, and Aerodynamic Center

import { useState, useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

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

function Field({
  label, id, value, onChange, step = "any", hint, className = "",
}: {
  label: string; id: string; value: number;
  onChange: (v: number) => void; step?: string; hint?: string; className?: string;
}) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className={`flex flex-col gap-0.5 relative ${className}`}>
      <div className="flex items-center gap-1">
        <label className="text-[9px] tracking-widest uppercase text-[#808080]"
               style={{ fontFamily: "Michroma, sans-serif" }} htmlFor={id}>
          {label}
        </label>
        {hint && (
          <button
            type="button"
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
            className="w-3 h-3 rounded-full bg-gray-200 text-[7px] text-gray-500 flex items-center justify-center flex-shrink-0 hover:bg-[#ffc914] hover:text-black transition-colors"
          >?</button>
        )}
      </div>
      {showHint && hint && (
        <div className="absolute top-5 left-0 z-50 bg-black text-[#ffc914] text-[9px] px-2 py-1.5 w-48 leading-relaxed"
             style={{ fontFamily: "Lexend, sans-serif" }}>
          {hint}
        </div>
      )}
      <input
        id={id} type="number" step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc914] transition-colors bg-white"
        style={{ fontFamily: "Michroma, sans-serif" }}
      />
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="border border-gray-100 mb-3">
      <div className="bg-black px-3 py-1.5 flex items-center justify-between">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
           style={{ fontFamily: "Michroma, sans-serif" }}>{title}</p>
        {action}
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Inputs */}
      <div className="lg:w-96 flex-shrink-0">
        {/* Wing Panels */}
        <div className="border border-gray-100 mb-3">
          <div className="bg-black px-3 py-1.5 flex items-center justify-between">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Wing Panels</p>
            <button onClick={addWingPanel} className="text-[9px] bg-[#ffc914] text-black px-2 py-0.5 font-bold"
                    style={{ fontFamily: "Michroma, sans-serif" }}>+ Add</button>
          </div>
          {wingPanels.map((panel, idx) => (
            <div key={panel.id} className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={panel.name}
                  onChange={e => {
                    const newPanels = [...wingPanels];
                    newPanels[idx].name = e.target.value;
                    setWingPanels(newPanels);
                  }}
                  className="text-[10px] font-bold border-none bg-transparent focus:outline-none"
                  style={{ fontFamily: "Michroma, sans-serif" }}
                />
                <button onClick={() => removeWingPanel(panel.id)} className="text-red-500 text-xs hover:text-red-700">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Root Chord (cm)" id={`wrc-${panel.id}`} value={panel.rootChordCm} onChange={v => { const p = [...wingPanels]; p[idx].rootChordCm = v; setWingPanels(p); }} />
                <Field label="Tip Chord (cm)" id={`wtc-${panel.id}`} value={panel.tipChordCm} onChange={v => { const p = [...wingPanels]; p[idx].tipChordCm = v; setWingPanels(p); }} />
                <Field label="Span (cm)" id={`ws-${panel.id}`} value={panel.spanCm} onChange={v => { const p = [...wingPanels]; p[idx].spanCm = v; setWingPanels(p); }} />
                <Field label="Sweep (cm)" id={`wsw-${panel.id}`} value={panel.sweepCm} onChange={v => { const p = [...wingPanels]; p[idx].sweepCm = v; setWingPanels(p); }} />
                <Field label="Distance (cm)" id={`wd-${panel.id}`} value={panel.distanceFuselageCm} onChange={v => { const p = [...wingPanels]; p[idx].distanceFuselageCm = v; setWingPanels(p); }} hint="From datum to root LE" />
                <Field label="Weight (g)" id={`ww-${panel.id}`} value={panel.weightG} onChange={v => { const p = [...wingPanels]; p[idx].weightG = v; setWingPanels(p); }} />
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal Tail */}
        <Section title="Horizontal Tail">
          <Field label="Span (cm)" id="hts" value={htSpanCm} onChange={setHtSpanCm} />
          <Field label="Root Chord (cm)" id="htr" value={htRootChordCm} onChange={setHtRootChordCm} />
          <Field label="Tip Chord (cm)" id="htt" value={htTipChordCm} onChange={setHtTipChordCm} />
          <Field label="Sweep (cm)" id="htsw" value={htSweepCm} onChange={setHtSweepCm} />
          <Field label="Tail Arm (cm)" id="hta" value={tailArmCm} onChange={setTailArmCm} className="col-span-2" hint="Wing AC to HT AC" />
        </Section>

        {/* Components */}
        <div className="border border-gray-100 mb-3">
          <div className="bg-black px-3 py-1.5 flex items-center justify-between">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Components</p>
            <button onClick={addComponent} className="text-[9px] bg-[#ffc914] text-black px-2 py-0.5 font-bold"
                    style={{ fontFamily: "Michroma, sans-serif" }}>+ Add</button>
          </div>
          {components.map((comp, idx) => (
            <div key={comp.id} className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={comp.name}
                  onChange={e => {
                    const newComps = [...components];
                    newComps[idx].name = e.target.value;
                    setComponents(newComps);
                  }}
                  className="text-[10px] font-bold border-none bg-transparent focus:outline-none"
                  style={{ fontFamily: "Michroma, sans-serif" }}
                />
                <button onClick={() => removeComponent(comp.id)} className="text-red-500 text-xs hover:text-red-700">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Weight (g)" id={`cw-${comp.id}`} value={comp.weightG} onChange={v => { const c = [...components]; c[idx].weightG = v; setComponents(c); }} />
                <Field label="Arm (cm)" id={`ca-${comp.id}`} value={comp.armCm} onChange={v => { const c = [...components]; c[idx].armCm = v; setComponents(c); }} hint="From datum (+ forward)" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Total Weight</p>
            <p className="text-xl font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{cgCalculation.totalWeight.toFixed(0)} g</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>CG Position</p>
            <p className="text-xl font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{cgCalculation.cgArm.toFixed(1)} cm</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Neutral Point</p>
            <p className="text-xl font-black text-black" style={{ fontFamily: "Michroma, sans-serif" }}>{neutralPoint.npX.toFixed(1)} cm</p>
          </div>
          <div className="border border-gray-100 p-3 text-center">
            <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Static Margin</p>
            <p className={`text-xl font-black ${neutralPoint.staticMarginPercent >= 10 && neutralPoint.staticMarginPercent <= 25 ? "text-green-500" : "text-red-500"}`}
               style={{ fontFamily: "Michroma, sans-serif" }}>{neutralPoint.staticMarginPercent.toFixed(1)}%</p>
          </div>
        </div>

        {/* Wing Geometry */}
        <div className="border border-gray-100 mb-5">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]" style={{ fontFamily: "Michroma, sans-serif" }}>Wing Geometry</p>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[9px] uppercase text-gray-400" style={{ fontFamily: "Michroma, sans-serif" }}>Wing Area</p>
              <p className="text-lg font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>{wingGeometry.wingAreaDm2.toFixed(1)} dm²</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-gray-400" style={{ fontFamily: "Michroma, sans-serif" }}>Mean Aero Chord</p>
              <p className="text-lg font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>{wingGeometry.mac.toFixed(1)} cm</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-gray-400" style={{ fontFamily: "Michroma, sans-serif" }}>Aerodynamic Center</p>
              <p className="text-lg font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>{wingGeometry.acX.toFixed(1)} cm</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-gray-400" style={{ fontFamily: "Michroma, sans-serif" }}>Tail Volume</p>
              <p className="text-lg font-bold" style={{ fontFamily: "Michroma, sans-serif" }}>{neutralPoint.tailVolume.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* CG Status */}
        <div className={`border-2 p-4 mb-5 ${
          cgStatus.status === "good" ? "border-green-400 bg-green-50" :
          cgStatus.status === "warn" ? "border-amber-400 bg-amber-50" :
          "border-red-400 bg-red-50"
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${
              cgStatus.status === "good" ? "text-green-500" :
              cgStatus.status === "warn" ? "text-amber-500" : "text-red-500"
            }`}>{cgStatus.status === "good" ? "✓" : "⚠"}</span>
            <div>
              <p className="font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
                {cgStatus.status === "good" ? "CG in Optimal Range" :
                 cgStatus.status === "warn" ? "CG Warning" : "CG Critical"}
              </p>
              <p className="text-sm text-gray-600" style={{ fontFamily: "Lexend, sans-serif" }}>{cgStatus.message}</p>
            </div>
          </div>
        </div>

        {/* CG Envelope Chart */}
        <div className="border border-gray-100 mb-5">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]" style={{ fontFamily: "Michroma, sans-serif" }}>CG Envelope</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={envelopeData} layout="vertical" margin={{ top: 4, right: 16, left: 60, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} width={100} />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif" }} />
                <ReferenceLine x={neutralPoint.staticMarginPercent} stroke="#22c55e" strokeWidth={2} label="Current CG" />
                <ReferenceLine x={10} stroke="#ffc914" strokeWidth={1} strokeDasharray="3 3" />
                <ReferenceLine x={25} stroke="#ffc914" strokeWidth={1} strokeDasharray="3 3" />
                <Bar dataKey="cg" fill="#e5e7eb" radius={[2, 2, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[9px] text-center text-gray-500 mt-2" style={{ fontFamily: "Lexend, sans-serif" }}>
              Optimal CG range: 10-25% MAC (between dashed lines) · Current: {neutralPoint.staticMarginPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]" style={{ fontFamily: "Michroma, sans-serif" }}>Weight Breakdown</p>
          </div>
          <table className="w-full text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">Component</th>
                <th className="px-3 py-2 text-right">Weight (g)</th>
                <th className="px-3 py-2 text-right">Arm (cm)</th>
                <th className="px-3 py-2 text-right">Moment (g·cm)</th>
                <th className="px-3 py-2 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {wingPanels.map((panel, i) => (
                <tr key={panel.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-3 py-2">🛩️ {panel.name}</td>
                  <td className="px-3 py-2 text-right">{panel.weightG.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">—</td>
                  <td className="px-3 py-2 text-right">{((panel.weightG / cgCalculation.totalWeight) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              {components.map((comp, i) => (
                <tr key={comp.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-3 py-2">{comp.type === "motor" ? "⚡" : comp.type === "battery" ? "🔋" : "📦"} {comp.name}</td>
                  <td className="px-3 py-2 text-right">{comp.weightG.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">{comp.armCm.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">{(comp.weightG * comp.armCm).toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">{((comp.weightG / cgCalculation.totalWeight) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="bg-black text-[#ffc914] font-bold">
                <td className="px-3 py-2">TOTAL</td>
                <td className="px-3 py-2 text-right">{cgCalculation.totalWeight.toFixed(0)}</td>
                <td className="px-3 py-2 text-right">—</td>
                <td className="px-3 py-2 text-right">{cgCalculation.totalMoment.toFixed(0)}</td>
                <td className="px-3 py-2 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
