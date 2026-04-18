// src/components/calculators/BladeCalc.tsx
// BladeCalc - Propeller Blade Element Momentum Theory (BEMT) analysis
// Implements Ning 2014 guaranteed-convergence algorithm (1D phi root-finding)
// 20 radial stations, Prandtl tip/hub loss, thin-airfoil+drag-polar aerodynamics

import { useState, useMemo } from "react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { PROPELLERS } from "@/data/propellers";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

const TOOLTIP_STYLE: React.CSSProperties = {
  fontFamily: "Michroma, sans-serif",
  fontSize: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 2,
};

// ────────────────────────────────────────────────────────────────
// Thin-airfoil / flat-plate aerodynamics (no external table needed)
// Cl = 2*pi*alpha  (capped at stall)
// Cd = Cd0 + k*Cl^2  (parabolic polar)
// ────────────────────────────────────────────────────────────────
function airfoilPolar(alphaDeg: number): { Cl: number; Cd: number } {
  const CD0 = 0.011;
  const K   = 0.028;
  const STALL_DEG = 14;
  const alphaRad  = (alphaDeg * Math.PI) / 180;
  let Cl = 2 * Math.PI * alphaRad;
  // Progressive stall softening beyond stall angle
  if (Math.abs(alphaDeg) > STALL_DEG) {
    const excess = (Math.abs(alphaDeg) - STALL_DEG) / STALL_DEG;
    Cl *= Math.max(0.2, 1 - excess * 0.8);
  }
  const Cd = CD0 + K * Cl * Cl;
  return { Cl, Cd };
}

// ────────────────────────────────────────────────────────────────
// Brent's method scalar root finder (guaranteed convergence with bracket)
// Returns the root of f in [a, b] to within tol
// ────────────────────────────────────────────────────────────────
function brent(
  f: (x: number) => number,
  a: number,
  b: number,
  tol = 1e-6,
  maxIter = 60,
): number {
  let fa = f(a), fb = f(b);
  if (fa * fb > 0) return (a + b) / 2; // no sign change – fallback midpoint
  let c = a, fc = fa, d = b - a, e = d;
  for (let i = 0; i < maxIter; i++) {
    if (fb * fc > 0) { c = a; fc = fa; d = e = b - a; }
    if (Math.abs(fc) < Math.abs(fb)) { a = b; b = c; c = a; fa = fb; fb = fc; fc = fa; }
    const tol1 = 2 * 1.2e-16 * Math.abs(b) + 0.5 * tol;
    const xm   = 0.5 * (c - b);
    if (Math.abs(xm) <= tol1 || fb === 0) return b;
    if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
      let p: number, q: number, r: number;
      const s = fb / fa;
      if (a === c) { p = 2 * xm * s; q = 1 - s; }
      else {
        q = fa / fc; r = fb / fc;
        p = s * (2 * xm * q * (q - r) - (b - a) * (r - 1));
        q = (q - 1) * (r - 1) * (s - 1);
      }
      if (p > 0) q = -q; else p = -p;
      if (2 * p < Math.min(3 * xm * q - Math.abs(tol1 * q), Math.abs(e * q))) {
        e = d; d = p / q;
      } else { d = xm; e = d; }
    } else { d = xm; e = d; }
    a = b; fa = fb;
    b += (Math.abs(d) > tol1 ? d : (xm > 0 ? tol1 : -tol1));
    fb = f(b);
  }
  return b;
}

// ────────────────────────────────────────────────────────────────
// BEMT station solver — Ning (2014) 1D residual in phi
// Returns { thrust_dN, torque_dNm, converged }
// ────────────────────────────────────────────────────────────────
function solveBEMTStation(params: {
  omega: number;     // rad/s
  r: number;         // station radius m
  R: number;         // tip radius m
  rHub: number;      // hub radius m
  chord: number;     // chord m
  twistRad: number;  // local pitch angle rad
  B: number;         // blade count
  Uinf: number;      // axial inflow (0 for static)
  rho: number;       // kg/m³
  dr: number;        // station width m
}): { dT: number; dQ: number; converged: boolean; phi: number; Cl: number; Cd: number; aoa: number } {
  const { omega, r, R, rHub, chord, twistRad, B, Uinf, rho, dr } = params;
  const lambdaR  = omega * r / Math.max(Uinf, 0.1); // local-speed ratio (avoid /0 in static)
  const sigmaP   = (B * chord) / (2 * Math.PI * r);

  function residual(phi: number): number {
    const sinP = Math.sin(phi), cosP = Math.cos(phi);
    if (Math.abs(sinP) < 1e-8) return -1; // degenerate
    const alphaDeg = (twistRad - phi) * 180 / Math.PI;
    const { Cl, Cd } = airfoilPolar(alphaDeg);
    const Cn     = Cl * cosP + Cd * sinP;
    const Ct_val = Cl * sinP - Cd * cosP;

    // Prandtl tip/hub loss
    const fTip = Math.max(1e-6,
      (2 / Math.PI) * Math.acos(Math.min(1, Math.exp(-B * (R - r) / (2 * r * Math.abs(sinP) + 1e-12)))));
    const fHub = Math.max(1e-6,
      (2 / Math.PI) * Math.acos(Math.min(1, Math.exp(-B * (r - rHub) / (2 * r * Math.abs(sinP) + 1e-12)))));
    const F = Math.min(1, fTip * fHub);

    const kappa  = (sigmaP * Cn) / (4 * F * sinP * sinP + 1e-12);
    const kappaP = (sigmaP * Ct_val) / (4 * F * sinP * cosP + 1e-12);
    // Axial induction (piecewise — Buhl correction for high induction)
    let a: number;
    if (kappa <= 2 / 3) {
      a = kappa / (1 + kappa);
    } else {
      const g1 = 2 * F * kappa - (10 / 9 - F);
      const g2 = 2 * F * kappa - F * (4 / 3 - F);
      const g3 = 2 * F * kappa - (25 / 9 - 2 * F);
      const denom = g3 !== 0 ? g3 : 1e-10;
      a = (g1 - Math.sqrt(Math.max(0, g2))) / denom;
    }
    return sinP / (1 - a) - cosP * (1 - kappaP) / (lambdaR + 1e-12);
  }

  // Bracket finding (Theorems 1-5, Ning 2014)
  let phiLow = 1e-6, phiHigh = Math.PI / 2;
  let converged = true;
  if (residual(phiHigh) < 0) {
    // Try propeller-brake region
    if (residual(-Math.PI / 4) < 0 && residual(-1e-6) > 0) {
      phiLow = -Math.PI / 4; phiHigh = -1e-6;
    } else {
      // Reverse flow
      phiLow = Math.PI / 2; phiHigh = Math.PI - 1e-6;
      converged = false;
    }
  }

  const phi      = brent(residual, phiLow, phiHigh, 1e-7);
  const sinP     = Math.sin(phi), cosP = Math.cos(phi);
  const alphaDeg = (twistRad - phi) * 180 / Math.PI;
  const { Cl, Cd } = airfoilPolar(alphaDeg);

  const W2   = Math.pow(omega * r, 2) + Math.pow(Math.max(Uinf, 0.1), 2);
  const dL   = 0.5 * rho * W2 * chord * Cl * dr;
  const dD   = 0.5 * rho * W2 * chord * Cd * dr;
  const dT   = B * (dL * cosP - dD * sinP);
  const dQ   = B * r * (dL * sinP + dD * cosP);

  return { dT, dQ, converged, phi, Cl, Cd, aoa: alphaDeg };
}

// ────────────────────────────────────────────────────────────────
// Run full BEMT over 20 radial stations for one propeller
// ────────────────────────────────────────────────────────────────
interface BEMTResult {
  totalThrustN: number;
  totalPowerW: number;
  totalTorqueNm: number;
  specificThrustGW: number;
  convergedCount: number;
  stations: {
    r: number; station: number; chordCm: number;
    twistDeg: number; aoa: number; Cl: number; Cd: number;
    dThrustN: number; dPowerW: number;
  }[];
}

function runBEMT(
  diameterInch: number,
  pitchInch: number,
  blades: number,
  rpmIn: number,
  rho: number,
  Uinf = 0,
  N = 20,
): BEMTResult {
  const R    = (diameterInch * 0.0254) / 2;
  const rHub = R * 0.12;
  const omega = (rpmIn * 2 * Math.PI) / 60;
  const dr   = (R - rHub) / N;
  let totalThrustN = 0, totalTorqueNm = 0;
  const stations = [];
  let convergedCount = 0;

  for (let i = 0; i < N; i++) {
    const r      = rHub + (i + 0.5) * dr;
    const station = (r - rHub) / (R - rHub);
    // Chord: linear taper from 22% at root to 10% at tip
    const chord   = R * (0.22 - 0.12 * station);
    // Blade twist from actuator disk geometry: atan(pitch / (2*pi*r))
    const twistRad = Math.atan2(pitchInch * 0.0254, 2 * Math.PI * r);

    const res = solveBEMTStation({
      omega, r, R, rHub, chord, twistRad,
      B: blades, Uinf, rho, dr,
    });
    if (res.converged) convergedCount++;
    totalThrustN  += res.dT;
    totalTorqueNm += res.dQ;

    stations.push({
      r, station,
      chordCm: chord * 100,
      twistDeg: twistRad * 180 / Math.PI,
      aoa: res.aoa,
      Cl: res.Cl,
      Cd: res.Cd,
      dThrustN: res.dT,
      dPowerW: res.dQ * omega,
    });
  }

  const totalPowerW = totalTorqueNm * omega;
  return {
    totalThrustN: Math.max(0, totalThrustN),
    totalPowerW: Math.max(0, totalPowerW),
    totalTorqueNm: Math.max(0, totalTorqueNm),
    specificThrustGW: totalPowerW > 0 ? (totalThrustN / 9.80665 * 1000) / totalPowerW : 0,
    convergedCount,
    stations,
  };
}

// ────────────────────────────────────────────────────────────────
// UI helpers
// ────────────────────────────────────────────────────────────────
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

function StatCard({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className={`border p-3 text-center ${warn ? "border-amber-300 bg-amber-50/50" : "border-gray-100"}`}>
      <p className="text-[8px] tracking-widest uppercase text-[#808080] mb-1"
         style={{ fontFamily: "Michroma, sans-serif" }}>{label}</p>
      <p className={`text-base font-black ${warn ? "text-amber-600" : "text-black"}`}
         style={{ fontFamily: "Michroma, sans-serif" }}>{value}</p>
      {sub && <p className="text-[9px] text-[#808080] mt-0.5" style={{ fontFamily: "Lexend, sans-serif" }}>{sub}</p>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────
export default function BladeCalc() {
  const [selectedProp1, setSelectedProp1] = useState("apc-1047");
  const [selectedProp2, setSelectedProp2] = useState("apc-1147");
  const [rpm, setRpm]               = useState(8000);
  const [rho, setRho]               = useState(1.225);
  const [windMs, setWindMs]         = useState(0);
  const [activeChart, setActiveChart] = useState<"thrust" | "power" | "cl" | "aoa">("thrust");

  const bemt1 = useMemo(() => {
    const p = PROPELLERS.find(x => x.id === selectedProp1);
    if (!p) return null;
    return { data: runBEMT(p.diameterInch, p.pitchInch, p.blades, rpm, rho, windMs), prop: p };
  }, [selectedProp1, rpm, rho, windMs]);

  const bemt2 = useMemo(() => {
    const p = PROPELLERS.find(x => x.id === selectedProp2);
    if (!p) return null;
    return { data: runBEMT(p.diameterInch, p.pitchInch, p.blades, rpm, rho, windMs), prop: p };
  }, [selectedProp2, rpm, rho, windMs]);

  const label1 = bemt1 ? `${bemt1.prop.type} ${bemt1.prop.diameterInch}x${bemt1.prop.pitchInch}` : "Prop 1";
  const label2 = bemt2 ? `${bemt2.prop.type} ${bemt2.prop.diameterInch}x${bemt2.prop.pitchInch}` : "Prop 2";

  const chartData = useMemo(() => {
    if (!bemt1 || !bemt2) return [];
    return bemt1.data.stations.map((s1, i) => {
      const s2 = bemt2.data.stations[i];
      return {
        r: `${(s1.station * 100).toFixed(0)}%`,
        [`${label1} Thrust`]: +s1.dThrustN.toFixed(4),
        [`${label2} Thrust`]: +s2.dThrustN.toFixed(4),
        [`${label1} Power`]: +s1.dPowerW.toFixed(2),
        [`${label2} Power`]: +s2.dPowerW.toFixed(2),
        [`${label1} Cl`]: +s1.Cl.toFixed(3),
        [`${label2} Cl`]: +s2.Cl.toFixed(3),
        [`${label1} AoA`]: +s1.aoa.toFixed(2),
        [`${label2} AoA`]: +s2.aoa.toFixed(2),
      };
    });
  }, [bemt1, bemt2, label1, label2]);

  const propOptions = PROPELLERS.filter(p => p.application === "airplane" || p.application === "both");

  const inputsPanel = (
    <div className="space-y-3">
      <Section title="Operating Conditions">
        <Field label="RPM" id="rpm" value={rpm} onChange={setRpm} step="100"
               hint="Propeller rotational speed" />
        <Field label="Air Density (kg/m³)" id="rho" value={rho} onChange={setRho} step="0.001"
               hint="ISA standard = 1.225 kg/m³ at sea level" />
        <Field label="Headwind (m/s)" id="wind" value={windMs} onChange={setWindMs} step="0.5"
               hint="Axial inflow — use 0 for static hover analysis" />
      </Section>

      <Section title="Propeller 1">
        <select
          value={selectedProp1}
          onChange={e => setSelectedProp1(e.target.value)}
          className="w-full border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc812] transition-colors bg-white"
          style={{ fontFamily: "Michroma, sans-serif" }}
        >
          {propOptions.map(p => (
            <option key={p.id} value={p.id}>{p.type} {p.diameterInch}x{p.pitchInch} {p.blades}B</option>
          ))}
        </select>
        {bemt1 && (
          <div className="text-[10px] text-gray-400 px-1" style={{ fontFamily: "Michroma, sans-serif" }}>
            {bemt1.data.convergedCount}/20 stations converged
          </div>
        )}
      </Section>

      <Section title="Propeller 2">
        <select
          value={selectedProp2}
          onChange={e => setSelectedProp2(e.target.value)}
          className="w-full border border-gray-200 text-[11px] px-2 py-1.5 focus:outline-none focus:border-[#ffc812] transition-colors bg-white"
          style={{ fontFamily: "Michroma, sans-serif" }}
        >
          {propOptions.map(p => (
            <option key={p.id} value={p.id}>{p.type} {p.diameterInch}x{p.pitchInch} {p.blades}B</option>
          ))}
        </select>
        {bemt2 && (
          <div className="text-[10px] text-gray-400 px-1" style={{ fontFamily: "Michroma, sans-serif" }}>
            {bemt2.data.convergedCount}/20 stations converged
          </div>
        )}
      </Section>
    </div>
  );

  const resultsPanel = (
    <div id="bladecalc-report-area" className="relative space-y-4">
      <PdfTemplateHeader calculatorName="Blade Element Momentum Theory" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500 border-l-2 border-[#ffc812] pl-3 py-1" style={{ fontFamily: "Lexend, sans-serif" }}>
          BEMT analysis using Ning (2014) guaranteed-convergence algorithm — 20 radial stations,
          Prandtl tip/hub loss, parabolic drag polar.
        </p>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_BEMT_Report.pdf" />
      </div>

      {/* Stat cards */}
      {bemt1 && bemt2 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          <StatCard label={`${label1} Thrust`}
                    value={`${(bemt1.data.totalThrustN / 9.80665 * 1000).toFixed(1)} g`}
                    sub={`${bemt1.data.totalThrustN.toFixed(3)} N`} />
          <StatCard label={`${label2} Thrust`}
                    value={`${(bemt2.data.totalThrustN / 9.80665 * 1000).toFixed(1)} g`}
                    sub={`${bemt2.data.totalThrustN.toFixed(3)} N`} />
          <StatCard label={`${label1} Power`}
                    value={`${bemt1.data.totalPowerW.toFixed(1)} W`}
                    sub={`${bemt1.data.specificThrustGW.toFixed(2)} g/W`} />
          <StatCard label={`${label2} Power`}
                    value={`${bemt2.data.totalPowerW.toFixed(1)} W`}
                    sub={`${bemt2.data.specificThrustGW.toFixed(2)} g/W`} />
        </div>
      )}

      {/* Chart */}
      <div className="border border-gray-100">
        <div className="bg-black px-3 py-1 flex items-center gap-4">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
             style={{ fontFamily: "Michroma, sans-serif" }}>Blade Distribution</p>
          <div className="flex gap-1 ml-auto">
            {(["thrust", "power", "cl", "aoa"] as const).map(t => (
              <button key={t} onClick={() => setActiveChart(t)}
                className={`text-[8px] tracking-widest uppercase px-2 py-0.5 transition-colors ${
                  activeChart === t ? "bg-[#ffc812] text-black" : "text-white/50 hover:text-white"
                }`}
                style={{ fontFamily: "Michroma, sans-serif" }}>
                {t === "cl" ? "Cl" : t === "aoa" ? "AoA" : t}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="r" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
              <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
              {activeChart === "thrust" && <>
                <Area type="monotone" dataKey={`${label1} Thrust`} stroke="#ffc812" fill="#ffc81230" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey={`${label2} Thrust`} stroke="#22c55e" fill="#22c55e20" strokeWidth={2} dot={false} />
              </>}
              {activeChart === "power" && <>
                <Area type="monotone" dataKey={`${label1} Power`} stroke="#ffc812" fill="#ffc81230" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey={`${label2} Power`} stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} dot={false} />
              </>}
              {activeChart === "cl" && <>
                <Area type="monotone" dataKey={`${label1} Cl`} stroke="#ffc812" fill="#ffc81230" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey={`${label2} Cl`} stroke="#22c55e" fill="#22c55e20" strokeWidth={2} dot={false} />
              </>}
              {activeChart === "aoa" && <>
                <Area type="monotone" dataKey={`${label1} AoA`} stroke="#ffc812" fill="#ffc81230" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey={`${label2} AoA`} stroke="#ef4444" fill="#ef444420" strokeWidth={2} dot={false} />
              </>}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Station table for Prop 1 */}
      {bemt1 && (
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]"
               style={{ fontFamily: "Michroma, sans-serif" }}>Station Data — {label1}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
              <thead>
                <tr className="bg-gray-50">
                  {["r%", "Chord(cm)", "Twist°", "AoA°", "Cl", "Cd", "dT(N)", "dP(W)"].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left text-[8px] tracking-wider text-[#808080] font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bemt1.data.stations.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-2 py-1.5">{(s.station * 100).toFixed(0)}</td>
                    <td className="px-2 py-1.5">{s.chordCm.toFixed(2)}</td>
                    <td className="px-2 py-1.5">{s.twistDeg.toFixed(1)}</td>
                    <td className={`px-2 py-1.5 ${Math.abs(s.aoa) > 12 ? "text-amber-500 font-bold" : ""}`}>{s.aoa.toFixed(1)}</td>
                    <td className="px-2 py-1.5">{s.Cl.toFixed(3)}</td>
                    <td className="px-2 py-1.5">{s.Cd.toFixed(4)}</td>
                    <td className={`px-2 py-1.5 ${s.dThrustN < 0 ? "text-red-500" : "text-green-600"}`}>{s.dThrustN.toFixed(4)}</td>
                    <td className="px-2 py-1.5">{s.dPowerW.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
