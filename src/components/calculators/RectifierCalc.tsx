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

  const Field = ({ label, value, onChange, unit, step = 1 }: any) => (
    <div className="w-full py-0.5">
      <label className="text-[8px] uppercase text-[#808080] tracking-wider block mb-0.5" style={{ fontFamily: "Michroma, sans-serif" }}>
        {label}
      </label>
      <div className="flex items-center border border-gray-200 focus-within:border-[#ffc812] transition-colors">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 text-[11px] outline-none"
          style={{ fontFamily: "Lexend, sans-serif" }}
        />
        {unit && <span className="text-[9px] text-gray-400 px-2 whitespace-nowrap" style={{ fontFamily: "Lexend, sans-serif" }}>{unit}</span>}
      </div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border border-gray-100 p-2 bg-gray-50/30">
      <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2 border-b border-gray-100 pb-1" style={{ fontFamily: "Michroma, sans-serif" }}>
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );

  const StatCard = ({ label, value, unit, sub, warn }: any) => (
    <div className={`border p-2 bg-white ${warn ? "border-amber-400 bg-amber-50" : "border-gray-200"}`}>
      <p className="text-[8px] uppercase text-[#ffc812] tracking-wider">{label}</p>
      <p className="text-base font-black" style={{ fontFamily: "Michroma, sans-serif" }}>
        {value} <span className="text-xs font-medium text-gray-400">{unit}</span>
      </p>
      {sub && <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between border-b border-gray-200 py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  const inputsPanel = (
    <div className="space-y-3">
      <Section title="Input Electrical">
        <Field label="Input Voltage (RMS)" value={inputs.vinRms} onChange={(v: number) => setInputs({ ...inputs, vinRms: v })} unit="V" step={0.1} />
        <Field label="Input Power" value={inputs.inputPower} onChange={(v: number) => setInputs({ ...inputs, inputPower: v })} unit="W" />
        <Field label="Output Power" value={inputs.outputPower} onChange={(v: number) => setInputs({ ...inputs, outputPower: v })} unit="W" />
        <Field label="Line Frequency" value={inputs.frequency} onChange={(v: number) => setInputs({ ...inputs, frequency: v })} unit="Hz" />
        <Field label="Voltage Ripple Factor" value={inputs.rippleFactor} onChange={(v: number) => setInputs({ ...inputs, rippleFactor: v })} unit="%" step={0.1} />
        <Field label="Switching Frequency" value={inputs.switchFreqMHz} onChange={(v: number) => setInputs({ ...inputs, switchFreqMHz: v })} unit="MHz" step={0.1} />
      </Section>

      <Section title="Thermal Parameters">
        <Field label="Max Junction Temp" value={inputs.tjMax} onChange={(v: number) => setInputs({ ...inputs, tjMax: v })} unit="°C" />
        <Field label="R (Junction→Case)" value={inputs.rjc} onChange={(v: number) => setInputs({ ...inputs, rjc: v })} unit="K/W" step={0.1} />
        <Field label="R (Case→Heatsink)" value={inputs.rch} onChange={(v: number) => setInputs({ ...inputs, rch: v })} unit="K/W" step={0.1} />
        <Field label="Ambient Temperature" value={inputs.ambientTemp} onChange={(v: number) => setInputs({ ...inputs, ambientTemp: v })} unit="°C" />
      </Section>

      <Section title="Capacitor Bank">
        <Field label="Chosen Capacitance" value={inputs.chosenCapF} onChange={(v: number) => setInputs({ ...inputs, chosenCapF: v })} unit="F" step={0.0001} />
        <Field label="No. of Capacitors" value={inputs.numCaps} onChange={(v: number) => setInputs({ ...inputs, numCaps: Math.max(1, v) })} />
        <Field label="ESR @ 20kHz" value={inputs.esrOhm} onChange={(v: number) => setInputs({ ...inputs, esrOhm: v })} unit="Ω" step={0.001} />
      </Section>

      <Section title="LC Filter">
        <Field label="Harmonic Current" value={inputs.harmonics} onChange={(v: number) => setInputs({ ...inputs, harmonics: v })} unit="A" step={0.1} />
      </Section>
    </div>
  );

  const resultsPanel = (
    <div id="rectifiercalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="Rectifier Design Calculator" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500 border-l-2 border-[#ffc812] pl-3 py-1 pdf-no-hide" style={{ fontFamily: "Lexend, sans-serif" }}>
          SEC design tool with bridge rectifier, capacitor bank, and LC filter calculations.
        </p>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Rectifier_Report.pdf" />
      </div>

      {/* ── Waveform Conversions ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Sinusoidal Waveform Conversions
        </p>
        <div className="space-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <Row label="Input RMS" value={`${inputs.vinRms.toFixed(2)} V`} />
          <Row label="Peak Voltage" value={`${result.vinPeak.toFixed(2)} V`} />
          <Row label="Peak-to-Peak" value={`${result.vinPkPk.toFixed(2)} V`} />
          <Row label="Average Voltage" value={`${result.vinAvg.toFixed(2)} V`} />
        </div>
      </div>

      {/* ── Rectifier I/O ── */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Input Current" value={result.inputCurrent.toFixed(2)} unit="A" />
        <StatCard label="Output Voltage" value={result.vout.toFixed(2)} unit="V" />
        <StatCard label="Output Current" value={result.iout.toFixed(2)} unit="A" />
        <StatCard label="Ripple Voltage" value={result.rippleVoltage.toFixed(2)} unit="V" />
      </div>

      {/* ── Bridge Rectifier ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Bridge Rectifier
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <Row label="Full Bridge DC" value={`${result.fbDc.toFixed(2)} V`} />
          <Row label="Half Bridge DC" value={`${result.hbDc.toFixed(2)} V`} />
          <Row label="FB Vac" value={`${result.fbVac.toFixed(2)} V`} />
          <Row label="Iac (from Idc)" value={`${result.iac.toFixed(2)} A`} />
          <Row label="Pac (from Pdc)" value={`${result.pac.toFixed(1)} W`} />
          <Row label="Fuse Rating" value={`${result.fuseRating.toFixed(1)} A`} />
        </div>
      </div>

      {/* ── Thermal / Heat Sink ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Heat Sink Thermal
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <Row label="Power Dissipation" value={`${result.pdTotal.toFixed(2)} W`} />
          <Row label="Required Rsa" value={`${result.rsaRequired.toFixed(2)} K/W`} />
          <Row label="Loss %" value={`${result.powerLossPercent.toFixed(2)}%`} />
        </div>
      </div>

      {/* ── Capacitor Bank ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Capacitor Bank Sizing
        </p>
        <div className="space-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <Row label="Avg DC Value" value={`${result.vavg.toFixed(2)} V`} />
          <Row label="Min Voltage (${inputs.rippleFactor}%)" value={`${result.vmin.toFixed(2)} V`} />
          <Row label="Ripple Voltage" value={`${result.rippleV.toFixed(2)} V`} />
          <Row label="Half-cycle Time" value={eng(result.fon, "s")} />
          <div className="border-t border-gray-300 mt-1 pt-1">
            <p className="text-[8px] uppercase text-[#808080] tracking-wider mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Calculated Capacitance (3 Methods)</p>
          </div>
          <Row label="Method 1 (I×t/ΔV)" value={eng(result.ocap1, "F")} />
          <Row label="Method 2 (Energy)" value={eng(result.ocap2, "F")} />
          <Row label="Method 3 (Simplified)" value={eng(result.ocap3, "F")} />
        </div>
      </div>

      {/* ── Energy & Power ── */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Energy / Cap" value={result.eCap.toFixed(2)} unit="J" />
        <StatCard label="Total Energy" value={result.eTotal.toFixed(2)} unit="J" sub={`${inputs.numCaps} caps`} />
        <StatCard label="Charge / Cap" value={result.qStored.toFixed(3)} unit="C" />
        <StatCard label="Total Charge" value={result.qTotal.toFixed(3)} unit="C" />
      </div>

      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Load & Dissipation
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <Row label="Load Resistance" value={`${result.rLoad.toFixed(2)} Ω`} />
          <Row label="I @ Full Load" value={`${result.iLoadFull.toFixed(2)} A`} />
          <Row label="I @ 50% Load" value={`${result.iLoad50.toFixed(2)} A`} />
          <Row label="I @ 10% Load" value={`${result.iLoad10.toFixed(2)} A`} />
          <div className="col-span-2 border-t border-gray-300 mt-1 pt-1">
            <p className="text-[8px] uppercase text-[#808080] tracking-wider mb-1" style={{ fontFamily: "Michroma, sans-serif" }}>Power Dissipation (ESR)</p>
          </div>
          <Row label="P @ Full Load" value={`${result.pCapFull.toFixed(3)} W`} />
          <Row label="P @ 50% Load" value={`${result.pCap50.toFixed(3)} W`} />
          <Row label="P @ 10% Load" value={`${result.pCap10.toFixed(3)} W`} />
          <Row label="Total P Dissipation" value={`${result.pCapTotal.toFixed(3)} W`} />
        </div>
      </div>

      {/* ── LC Filter ── */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          LC Filter Design
        </p>
        <div className="space-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <Row label="Load Resistance" value={`${result.rLoadLC.toFixed(2)} Ω`} />
          <Row label="Load Inductance" value={eng(result.lLoad, "H")} />
          <Row label="Filter Capacitor" value={eng(result.cFilter, "F")} />
          <Row label="Filter Inductor" value={eng(result.lFilter, "H")} />
          <Row label="Ripple Factor (γ)" value={`${(result.gammaRipple * 100).toFixed(3)}%`} />
        </div>
      </div>

      {/* Formulas */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Key Formulas
        </p>
        <div className="space-y-1 text-[10px] text-gray-600" style={{ fontFamily: "Lexend, sans-serif" }}>
          <p>V<sub>peak</sub> = V<sub>rms</sub> × √2</p>
          <p>V<sub>avg</sub> = V<sub>peak</sub> × 2/π</p>
          <p>FB: V<sub>dc</sub> = V<sub>peak</sub> × 0.637</p>
          <p>R<sub>sa</sub> = (T<sub>j</sub> - T<sub>a</sub>) / P<sub>d</sub> - R<sub>jc</sub> - R<sub>ch</sub></p>
          <p>C = I<sub>out</sub> × t / ΔV</p>
          <p>γ = 1 / (4√2 × π² × f² × L × C)</p>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
