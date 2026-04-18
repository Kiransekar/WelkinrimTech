// Rectifier Design Calculator
// SEC Design Tool + Sinusoidal Waveform Conversions + Bridge Rectifier + Capacitor Bank + LC Filter
import { useState, useMemo } from "react";

import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface RectifierInput {
  // Input electrical
  vinRms: number;        // V
  inputPower: number;    // W
  outputPower: number;   // W
  frequency: number;     // Hz
  rippleFactor: number;  // % (e.g. 3)
  switchFreqMHz: number; // MHz

  // Thermal
  tjMax: number;         // °C junction temp
  rjc: number;           // K/W junction-to-case
  rch: number;           // K/W case-to-heatsink
  ambientTemp: number;   // °C

  // Capacitor bank
  chosenCapF: number;    // F (single cap)
  numCaps: number;       // number of capacitors
  esrOhm: number;       // ESR of chosen cap

  // LC Filter
  harmonics: number;     // harmonic current multiplier
}

const DEFAULTS: RectifierInput = {
  vinRms: 230,
  inputPower: 5700,
  outputPower: 5000,
  frequency: 50,
  rippleFactor: 3,
  switchFreqMHz: 1,

  tjMax: 175,
  rjc: 1,
  rch: 0.4,
  ambientTemp: 25,

  chosenCapF: 0.001,
  numCaps: 8,
  esrOhm: 0.081,

  harmonics: 2,
};

function calculate(inp: RectifierInput) {
  const { vinRms, inputPower, outputPower, frequency, rippleFactor, switchFreqMHz } = inp;

  // ── Waveform conversions ──
  const vinPeak = vinRms * Math.SQRT2;
  const vinPkPk = vinPeak * 2;
  const vinAvg = vinPeak * (2 / Math.PI); // 0.637 × peak

  // ── Rectifier I/O ──
  const inputCurrent = inputPower / vinRms;
  const vout = vinPeak; // ideal rectified DC ≈ peak
  const rippleVoltage = vout * (rippleFactor / 100);
  const iout = outputPower / vout;

  // Bridge rectifier conversions (Sheet 2)
  const fbVac = vout * 0.71;       // Full bridge: Vac = Vdc × 0.71
  const fbDc = vinPeak * 0.637;    // Full bridge DC = peak × 0.637
  const hbDc = vinPeak * 0.637 / 2; // Half bridge DC
  const iac = iout * 1.61;          // Iac = Idc × 1.61
  const pac = outputPower * 1.14;   // Pac = Pdc × 1.14

  // ── Fuse selection ──
  const fuseRating = inputCurrent * 0.8; // 80% derating

  // ── Switching parameters ──
  const fSwitch = switchFreqMHz * 1e6;
  const tSwitch = 1 / fSwitch;
  const dutyCycle = tSwitch / 2;
  const finNatural = frequency * 3;

  // ── Thermal / Heat sink ──
  const tjK = inp.tjMax + 273.15;
  const taK = inp.ambientTemp + 273.15;
  // Total power dissipation in rectifier (approx: 2 × Vf × Iout for full bridge, Vf ≈ 0.9V)
  const vfDiode = 0.9;
  const pdTotal = 2 * vfDiode * iout + (iout * iout * 0.01); // conduction + switching approx
  const rsaRequired = (tjK - taK) / pdTotal - inp.rjc - inp.rch;
  const powerLossPercent = (pdTotal / outputPower) * 100;

  // ── Capacitor bank ──
  const vavg = vinPeak * (2 / Math.PI); // average DC
  const vmin = vout * (1 - rippleFactor / 100);
  const fon = 1 / (2 * frequency); // half-cycle time
  const pDiff = inputPower - outputPower; // power difference
  const rippleV = vout - vmin;

  // Capacitor bank sizing (3 methods from spreadsheet)
  const ocap1 = (iout * fon) / rippleV; // C = I × t / ΔV
  const ocap2 = pDiff / (2 * frequency * rippleV * vout); // energy method
  const ocap3 = iout / (2 * frequency * rippleV); // simplified

  // Energy storage
  const eCap = 0.5 * inp.chosenCapF * vout * vout;
  const eTotal = eCap * inp.numCaps;
  const qStored = inp.chosenCapF * vout;
  const qTotal = qStored * inp.numCaps;

  // Load resistance
  const rLoad = vout * vout / outputPower;
  const iLoadFull = outputPower / vout;
  const iLoad50 = (outputPower * 0.5) / vout;
  const iLoad10 = (outputPower * 0.1) / vout;

  // Energy dissipation per cycle
  const eDissFull = inp.esrOhm * iLoadFull * iLoadFull * fon;
  const eDiss50 = inp.esrOhm * iLoad50 * iLoad50 * fon;
  const eDiss10 = inp.esrOhm * iLoad10 * iLoad10 * fon;

  // Power dissipation
  const pCapFull = inp.esrOhm * iLoadFull * iLoadFull;
  const pCap50 = inp.esrOhm * iLoad50 * iLoad50;
  const pCap10 = inp.esrOhm * iLoad10 * iLoad10;
  const pCapTotal = pCapFull + pCap50 + pCap10;

  // ── LC Filter design ──
  const rLoadLC = vout * vout / outputPower;
  const lLoad = rLoadLC / (2 * Math.PI * fSwitch);
  const cFilter = inp.harmonics / (4 * Math.PI * Math.PI * (finNatural * finNatural) * rLoadLC);
  const lFilter = 1 / (4 * Math.PI * Math.PI * (finNatural * finNatural) * cFilter);
  const gammaRipple = 1 / (4 * Math.SQRT2 * Math.PI * Math.PI * finNatural * finNatural * lFilter * cFilter);

  return {
    // Waveform
    vinPeak, vinPkPk, vinAvg,
    // I/O
    inputCurrent, vout, rippleVoltage, iout,
    // Bridge
    fbVac, fbDc, hbDc, iac, pac,
    // Fuse
    fuseRating,
    // Switching
    fSwitch, tSwitch, dutyCycle, finNatural,
    // Thermal
    pdTotal, rsaRequired, powerLossPercent,
    // Capacitor
    vavg, vmin, fon, pDiff, rippleV,
    ocap1, ocap2, ocap3,
    eCap, eTotal, qStored, qTotal,
    rLoad, iLoadFull, iLoad50, iLoad10,
    eDissFull, eDiss50, eDiss10,
    pCapFull, pCap50, pCap10, pCapTotal,
    // LC Filter
    rLoadLC, lLoad, cFilter, lFilter, gammaRipple,
  };
}

// Format engineering values
function eng(v: number, unit: string, decimals = 3): string {
  if (Math.abs(v) === 0) return `0 ${unit}`;
  const abs = Math.abs(v);
  if (abs >= 1e6) return `${(v / 1e6).toFixed(decimals)} M${unit}`;
  if (abs >= 1e3) return `${(v / 1e3).toFixed(decimals)} k${unit}`;
  if (abs >= 1) return `${v.toFixed(decimals)} ${unit}`;
  if (abs >= 1e-3) return `${(v * 1e3).toFixed(decimals)} m${unit}`;
  if (abs >= 1e-6) return `${(v * 1e6).toFixed(decimals)} µ${unit}`;
  if (abs >= 1e-9) return `${(v * 1e9).toFixed(decimals)} n${unit}`;
  return `${v.toExponential(2)} ${unit}`;
}

export default function RectifierCalc() {
  const [inputs, setInputs] = useState<RectifierInput>(DEFAULTS);
  const result = useMemo(() => calculate(inputs), [inputs]);

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

function CollapsibleSection({ title, children, defaultOpen = true, icon }: { title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: string }) {
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
        <span className={`text-[#ffc812] text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
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
  return (
    <div className={`border p-2.5 bg-white transition-all hover:shadow-md ${isDanger ? "border-red-500 shadow-red-50" : isWarn ? "border-amber-400 shadow-amber-50" : "border-gray-200"}`}>
      <p className="text-[8px] tracking-[0.15em] uppercase text-[#808080] mb-1 font-bold font-Michroma">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-black font-Michroma">{value}</span>
        {unit && <span className="text-[9px] font-bold text-gray-400 uppercase font-Michroma">{unit}</span>}
      </div>
      {sub && <p className="text-[9px] text-gray-400 mt-1 font-Lexend italic border-t border-gray-50 pt-1">{sub}</p>}
    </div>
  );
};

const Row = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div className="flex justify-between border-b border-gray-50 py-1 font-Lexend text-[10px]">
    <span className="text-gray-400">{label}</span>
    <span className={`font-bold ${color || "text-black"}`}>{value}</span>
  </div>
);

  const inputsPanel = (
    <div className="space-y-3">
  const inputsPanel = (
    <div className="space-y-3">
      <CollapsibleSection title="Input Electrical" icon="🔌">
        <Field label="Input RMS" id="irms" value={inputs.vinRms} onChange={(v: number) => setInputs({ ...inputs, vinRms: v })} unit="V" step="0.1" hint="AC line voltage (e.g. 230V)" />
        <Field label="Input Power" id="ip" value={inputs.inputPower} onChange={(v: number) => setInputs({ ...inputs, inputPower: v })} unit="W" />
        <Field label="Output Power" id="op" value={inputs.outputPower} onChange={(v: number) => setInputs({ ...inputs, outputPower: v })} unit="W" />
        <Field label="Frequency" id="fr" value={inputs.frequency} onChange={(v: number) => setInputs({ ...inputs, frequency: v })} unit="Hz" />
        <Field label="Voltage Ripple" id="vr" value={inputs.rippleFactor} onChange={(v: number) => setInputs({ ...inputs, rippleFactor: v })} unit="%" step="0.1" hint="Allowable ripple percentage" />
        <Field label="Switch Freq" id="sf" value={inputs.switchFreqMHz} onChange={(v: number) => setInputs({ ...inputs, switchFreqMHz: v })} unit="MHz" step="0.1" />
      </CollapsibleSection>

      <CollapsibleSection title="Thermal Parameters" icon="🌡" defaultOpen={false}>
        <Field label="Max Junction" id="tj" value={inputs.tjMax} onChange={(v: number) => setInputs({ ...inputs, tjMax: v })} unit="°C" />
        <Field label="R (J→C)" id="rjc" value={inputs.rjc} onChange={(v: number) => setInputs({ ...inputs, rjc: v })} unit="K/W" step="0.1" />
        <Field label="R (C→H)" id="rch" value={inputs.rch} onChange={(v: number) => setInputs({ ...inputs, rch: v })} unit="K/W" step="0.1" />
        <Field label="Ambient" id="at" value={inputs.ambientTemp} onChange={(v: number) => setInputs({ ...inputs, ambientTemp: v })} unit="°C" />
      </CollapsibleSection>

      <CollapsibleSection title="Capacitor Bank" icon="🔋">
        <Field label="Capacitance" id="cf" value={inputs.chosenCapF} onChange={(v: number) => setInputs({ ...inputs, chosenCapF: v })} unit="F" step="0.0001" />
        <Field label="Count" id="nc" value={inputs.numCaps} onChange={(v: number) => setInputs({ ...inputs, numCaps: Math.max(1, v) })} />
        <Field label="ESR" id="esr" value={inputs.esrOhm} onChange={(v: number) => setInputs({ ...inputs, esrOhm: v })} unit="Ω" step="0.001" hint="Resistance @ 20kHz" />
      </CollapsibleSection>

      <CollapsibleSection title="Filter Config" icon="🛡" defaultOpen={false}>
        <Field label="Harmonic Curr" id="hc" value={inputs.harmonics} onChange={(v: number) => setInputs({ ...inputs, harmonics: v })} unit="A" step="0.1" />
      </CollapsibleSection>
    </div>
  );
    </div>
  );

  const resultsPanel = (
    <div id="rectifiercalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="Power Rectifier Analysis" />
      <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 italic font-Lexend">
            AC-DC conversion efficiency, thermal management, and output filtration metrics.
          </p>
        </div>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Rectifier_Analysis.pdf" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard label="DC Output" value={result.vout.toFixed(1)} unit="V" sub={`Pk-Pk: ${result.vinPkPk.toFixed(0)} V`} />
        <StatCard label="Load Current" value={result.iout.toFixed(2)} unit="A" sub={`Avg: ${result.vinAvg.toFixed(1)} V`} />
        <StatCard label="Efficiency" value={((result.vout * result.iout) / inputs.inputPower * 100).toFixed(1)} unit="%" type="good" />
        <StatCard label="Ripple" value={result.rippleVoltage.toFixed(2)} unit="V" type={inputs.rippleFactor > 5 ? "warn" : "normal"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Bridge & Waveform */}
        <div className="border border-gray-200 bg-white overflow-hidden">
          <div className="bg-neutral-900 px-3 py-1.5 flex items-center justify-between font-Michroma">
            <span className="text-[9px] uppercase tracking-wider text-[#ffc812] font-bold">Rectifier Topology</span>
          </div>
          <div className="p-3 space-y-1">
            <Row label="Full Bridge DC" value={`${result.fbDc.toFixed(2)} V`} />
            <Row label="Half Bridge DC" value={`${result.hbDc.toFixed(2)} V`} />
            <Row label="FB Vac Equivalent" value={`${result.fbVac.toFixed(2)} V`} />
            <Row label="AC Current (Idc)" value={`${result.iac.toFixed(2)} A`} />
            <Row label="AC Power (Pdc)" value={`${result.pac.toFixed(0)} W`} />
            <div className="pt-2 border-t border-gray-50 mt-1">
               <Row label="Fuse Rating (80%)" value={`${result.fuseRating.toFixed(1)} A`} color="text-[#ffc812]" />
            </div>
          </div>
        </div>

        {/* Thermal */}
        <div className="bg-neutral-50 border border-gray-200 p-3">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#ffc812] font-bold font-Michroma mb-3">Thermal Analysis</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-2 border-black pl-3 pt-1">
                <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma">Dissipation</p>
                <p className="text-xl font-black text-black font-Michroma">{result.pdTotal.toFixed(2)} <span className="text-[10px] uppercase font-normal">W</span></p>
              </div>
              <div className="border-l-2 border-amber-400 pl-3 pt-1">
                <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma">Heatsink Req</p>
                <p className="text-xl font-black text-black font-Michroma">{result.rsaRequired.toFixed(2)} <span className="text-[10px] uppercase font-normal">K/W</span></p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] font-Lexend">
               <span className="text-gray-500 italic">Total thermal loss factor:</span>
               <span className="font-bold text-red-600">{result.powerLossPercent.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacitor Bank */}
      <div className="border border-gray-200 bg-white">
        <div className="bg-neutral-900 px-3 py-1.5 flex items-center justify-between font-Michroma">
          <span className="text-[9px] uppercase tracking-wider text-[#ffc812] font-bold">Capacitance Strategy</span>
          <span className="text-[8px] text-gray-400 italic font-Lexend tracking-tighter">(T₀ = {eng(result.fon, "s")})</span>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma mb-2">Estimation Methods</p>
              <Row label="Time Const (I·t/ΔV)" value={eng(result.ocap1, "F")} />
              <Row label="Energy Balance" value={eng(result.ocap2, "F")} />
              <Row label="Simplified Idc/f" value={eng(result.ocap3, "F")} />
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma mb-2">Energy Storage</p>
              <Row label="U per Cap" value={`${result.eCap.toFixed(2)} J`} />
              <Row label="Total Bank Energy" value={`${result.eTotal.toFixed(1)} J`} />
              <Row label="Total Charge (Q)" value={`${result.qTotal.toFixed(3)} C`} />
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase text-gray-400 font-bold font-Michroma mb-2">Inrush / ESR Loss</p>
              <Row label="Load R" value={`${result.rLoad.toFixed(2)} Ω`} />
              <Row label="P @ 100% Load" value={`${result.pCapFull.toFixed(3)} W`} />
              <Row label="Total ESR P Loss" value={`${result.pCapTotal.toFixed(3)} W`} />
            </div>
          </div>
        </div>
      </div>

      {/* LC Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <div className="border border-gray-200 p-3 bg-white">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#ffc812] font-bold font-Michroma mb-3">Harmonic Filtration</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Capacitor (Cf)" value={eng(result.cFilter, "F").split(" ")[0]} unit={eng(result.cFilter, "F").split(" ")[1]} />
            <StatCard label="Inductor (Lf)" value={eng(result.lFilter, "H").split(" ")[0]} unit={eng(result.lFilter, "H").split(" ")[1]} />
            <StatCard label="Filter Ripple" value={(result.gammaRipple * 100).toFixed(4)} unit="%" sub="Residual Factor" />
            <StatCard label="Load Induct" value={eng(result.lLoad, "H").split(" ")[0]} unit={eng(result.lLoad, "H").split(" ")[1]} />
          </div>
        </div>

        <div className="bg-neutral-900 border border-black p-3 text-white">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#ffc812] font-bold font-Michroma mb-3">Process Physics</p>
          <div className="space-y-2 text-[10px] font-Lexend opacity-80 leading-relaxed italic">
            <p>Vₚₑₐₖ = Vᵣₘₛ × √2 <span className="text-[8px] opacity-40 ml-2">(Peak to peak)</span></p>
            <p>Vₐᵥₑ = Vₚₑₐₖ × 2/π <span className="text-[8px] opacity-40 ml-2">(Mean DC value)</span></p>
            <p>Rₛₐ = (Tⱼ - Tₐ)/P - Rⱼ꜀ - R꜀ₕ <span className="text-[8px] opacity-40 ml-2">(Thermal sink)</span></p>
            <div className="pt-2 border-t border-white/10 mt-2 not-italic">
              <p className="text-[8px] text-[#ffc812] uppercase font-bold font-Michroma mb-1">Filter Law</p>
              <p className="text-[9px] leading-tight">γ = 1 / (4√2 π² f² L C). Ensure resonant frequency is well below switching threshold.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
