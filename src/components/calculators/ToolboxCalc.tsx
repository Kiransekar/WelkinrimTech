import { useState, useMemo } from "react";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

// --- Sub-calculator State Interfaces ---

interface TSPState {
  solveFor: "power" | "torque" | "speed";
  torqueNm: number;
  speedRpm: number;
  powerW: number;
}

interface SVKState {
  solveFor: "ke" | "speed" | "voltage";
  ke: number;
  speed: number;
  voltage: number;
}

interface TCKState {
  solveFor: "kt" | "torque" | "current";
  kt: number;
  torque: number;
  current: number;
}

interface KmState {
  kt: number;
  resistanceOmh: number;
}

interface KeKtKvState {
  inputMode: "ke" | "kt" | "kv";
  val: number;
}

interface RPMState {
  rpm: number;
}

interface ERPState {
  rpm: number;
  poles: number;
  solveFor: "rpm" | "erpm" | "freq";
  erpm: number;
  freq: number;
}

interface AngleState {
  degrees: number;
}

interface EncoderState {
  bits: number;
}

interface AWGState {
  awg: number;
}

// UI Helpers
const SectionHeader = ({ title }: { title: string }) => (
  <div className="bg-black px-3 py-1 mb-1.5 mt-3">
    <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
      {title}
    </p>
  </div>
);

const FieldDef = ({ label, value, onChange, unit, disabled = false, hint }: any) => (
  <div className="w-full py-0">
    <label className="text-[8px] uppercase text-[#808080] tracking-wider block mb-0.5" style={{ fontFamily: "Michroma, sans-serif" }} title={hint}>{label}</label>
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={(e: any) => onChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        className={`flex-1 w-full min-w-0 border px-2 py-0.5 text-[11px] focus:outline-none focus:border-[#ffc812] ${disabled ? "bg-gray-50 border-gray-100 text-gray-500" : "border-gray-200 bg-white"}`}
        style={{ fontFamily: "Michroma, sans-serif" }}
      />
      {unit && <span className="text-[10px] text-gray-400 w-8 flex-shrink-0">{unit}</span>}
    </div>
  </div>
);

const RadioTarget = ({ options, selected, onChange }: any) => (
  <div className="w-full pt-0.5 pb-0.5 mb-0.5">
    <label className="text-[8px] uppercase text-[#808080] tracking-wider block mb-0.5" style={{ fontFamily: "Michroma, sans-serif" }}>Solve For:</label>
    <div className="flex gap-2">
      {options.map((opt: any) => (
        <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
          <input type="radio" checked={selected === opt.value} onChange={() => onChange(opt.value)} className="accent-[#ffc812]" />
          <span className="text-[10px] text-gray-600 font-bold tracking-wider uppercase" style={{ fontFamily: "Michroma, sans-serif" }}>{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default function ToolboxCalc() {
  // 1. Torque-Speed-Power
  const [tsp, setTsp] = useState<TSPState>({ solveFor: "power", torqueNm: 1, speedRpm: 1000, powerW: 104.72 });
  const tspRes = useMemo(() => {
    let t = tsp.torqueNm, s = tsp.speedRpm, p = tsp.powerW;
    if (tsp.solveFor === "power") p = (t * s * 2 * Math.PI) / 60;
    else if (tsp.solveFor === "torque") t = s > 0 ? (p * 60) / (s * 2 * Math.PI) : 0;
    else if (tsp.solveFor === "speed") s = t > 0 ? (p * 60) / (t * 2 * Math.PI) : 0;
    return { torqueNm: t, speedRpm: s, powerW: p };
  }, [tsp]);

  // 2. Speed-Voltage-Ke
  const [svk, setSvk] = useState<SVKState>({ solveFor: "ke", ke: 10, speed: 1000, voltage: 10 });
  const svkRes = useMemo(() => {
    let k = svk.ke, s = svk.speed, v = svk.voltage;
    if (svk.solveFor === "ke") k = s > 0 ? (v * 1000) / s : 0;
    else if (svk.solveFor === "speed") s = k > 0 ? (v * 1000) / k : 0;
    else if (svk.solveFor === "voltage") v = (k * s) / 1000;
    return { ke: k, speed: s, voltage: v };
  }, [svk]);

  // 3. Torque-Current-Kt
  const [tck, setTck] = useState<TCKState>({ solveFor: "kt", kt: 0.1, torque: 1, current: 10 });
  const tckRes = useMemo(() => {
    let k = tck.kt, t = tck.torque, c = tck.current;
    if (tck.solveFor === "kt") k = c > 0 ? t / c : 0;
    else if (tck.solveFor === "torque") t = k * c;
    else if (tck.solveFor === "current") c = k > 0 ? t / k : 0;
    return { kt: k, torque: t, current: c };
  }, [tck]);

  // 4. Motor Constant
  const [kmState, setKmState] = useState<KmState>({ kt: 0.1, resistanceOmh: 0.5 });
  const kmRes = useMemo(() => {
    const km = kmState.resistanceOmh > 0 ? kmState.kt / Math.sqrt(kmState.resistanceOmh * 1.5) : 0;
    return km;
  }, [kmState]);

  // 5. Ke-Kt-Kv
  const [kkk, setKkk] = useState<KeKtKvState>({ inputMode: "kv", val: 100 });
  const kkkRes = useMemo(() => {
    let kv = 0, kt = 0, ke = 0;
    if (kkk.inputMode === "kv") {
      kv = kkk.val;
      ke = kv > 0 ? 1000 / kv : 0;
      kt = ke / 85.6;
    } else if (kkk.inputMode === "ke") {
      ke = kkk.val;
      kv = ke > 0 ? 1000 / ke : 0;
      kt = ke / 85.6;
    } else if (kkk.inputMode === "kt") {
      kt = kkk.val;
      ke = kt * 85.6;
      kv = ke > 0 ? 1000 / ke : 0;
    }
    return { kv, kt, ke };
  }, [kkk]);

  // 6. RPM
  const [rpmVal, setRpmVal] = useState<RPMState>({ rpm: 1000 });
  const rpmRes = useMemo(() => {
    return {
      rad: rpmVal.rpm * 2 * Math.PI / 60,
      deg: rpmVal.rpm * 360 / 60,
    }
  }, [rpmVal]);

  // 7. eRPM
  const [erp, setErp] = useState<ERPState>({ solveFor: "erpm", rpm: 1000, poles: 14, erpm: 7000, freq: 116.67 });
  const erpRes = useMemo(() => {
    let r = erp.rpm, p = erp.poles, e = erp.erpm, f = erp.freq;
    if (erp.solveFor === "erpm" || erp.solveFor === "freq") {
      e = r * p / 2;
      f = r * p / 60;
    } else { // solve for RPM
      r = p > 0 ? e * 2 / p : 0;
      f = r * p / 60;
    }
    return { rpm: r, erpm: e, freq: f };
  }, [erp]);

  // 8. Angles
  const [angle, setAngle] = useState<AngleState>({ degrees: 1 });
  const angleRes = useMemo(() => {
    return {
      rad: angle.degrees * Math.PI / 180,
      urad: angle.degrees * Math.PI * 1e6 / 180,
      arcsec: angle.degrees * 3600
    }
  }, [angle]);

  // 9. Encoder
  const [enc, setEnc] = useState<EncoderState>({ bits: 12 });
  const encRes = useMemo(() => {
    const cpr = Math.pow(2, enc.bits);
    return {
      cpr,
      deg: 360 / cpr,
      rad: (2 * Math.PI) / cpr,
      arcsec: 1296000 / cpr
    }
  }, [enc]);

  // 10. AWG
  const [awg, setAwg] = useState<AWGState>({ awg: 14 });
  const awgRes = useMemo(() => {
    const d = 0.127 * Math.pow(92, (36 - awg.awg)/39);
    const a = Math.PI * Math.pow(d/2, 2);
    return { dia: d, area: a };
  }, [awg]);

  const inputsPanel = (
    <div className="space-y-4">
      <SectionHeader title="1. Torque – Speed – Power" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <RadioTarget options={[{label: "Power", value:"power"}, {label: "Torque", value:"torque"}, {label: "Speed", value:"speed"}]} selected={tsp.solveFor} onChange={(v:any) => setTsp({...tsp, solveFor: v})} />
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <FieldDef label="Torque" value={tsp.solveFor === "torque" ? tspRes.torqueNm.toFixed(4) : tsp.torqueNm} disabled={tsp.solveFor === "torque"} onChange={(v:any) => setTsp({...tsp, torqueNm: v})} unit="Nm" />
          <FieldDef label="Speed" value={tsp.solveFor === "speed" ? tspRes.speedRpm.toFixed(1) : tsp.speedRpm} disabled={tsp.solveFor === "speed"} onChange={(v:any) => setTsp({...tsp, speedRpm: v})} unit="RPM" />
          <FieldDef label="Mech Power" value={tsp.solveFor === "power" ? tspRes.powerW.toFixed(2) : tsp.powerW} disabled={tsp.solveFor === "power"} onChange={(v:any) => setTsp({...tsp, powerW: v})} unit="W" />
        </div>
      </div>

      <SectionHeader title="2. Speed – Voltage – Ke" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <RadioTarget options={[{label: "Ke", value:"ke"}, {label: "Speed", value:"speed"}, {label: "Voltage", value:"voltage"}]} selected={svk.solveFor} onChange={(v:any) => setSvk({...svk, solveFor: v})} />
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <FieldDef label="Voltage (L-L)" value={svk.solveFor === "voltage" ? svkRes.voltage.toFixed(2) : svk.voltage} disabled={svk.solveFor === "voltage"} onChange={(v:any) => setSvk({...svk, voltage: v})} unit="V" />
          <FieldDef label="Speed" value={svk.solveFor === "speed" ? svkRes.speed.toFixed(1) : svk.speed} disabled={svk.solveFor === "speed"} onChange={(v:any) => setSvk({...svk, speed: v})} unit="RPM" />
          <FieldDef label="Ke" value={svk.solveFor === "ke" ? svkRes.ke.toFixed(4) : svk.ke} disabled={svk.solveFor === "ke"} onChange={(v:any) => setSvk({...svk, ke: v})} unit="V/kRPM" />
        </div>
      </div>

      <SectionHeader title="3. Torque – Current – Kt" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <RadioTarget options={[{label: "Kt", value:"kt"}, {label: "Torque", value:"torque"}, {label: "Current", value:"current"}]} selected={tck.solveFor} onChange={(v:any) => setTck({...tck, solveFor: v})} />
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <FieldDef label="Torque" value={tck.solveFor === "torque" ? tckRes.torque.toFixed(4) : tck.torque} disabled={tck.solveFor === "torque"} onChange={(v:any) => setTck({...tck, torque: v})} unit="Nm" />
          <FieldDef label="Current (Iq)" value={tck.solveFor === "current" ? tckRes.current.toFixed(2) : tck.current} disabled={tck.solveFor === "current"} onChange={(v:any) => setTck({...tck, current: v})} unit="Arms" />
          <FieldDef label="Kt" value={tck.solveFor === "kt" ? tckRes.kt.toFixed(4) : tck.kt} disabled={tck.solveFor === "kt"} onChange={(v:any) => setTck({...tck, kt: v})} unit="Nm/A" />
        </div>
      </div>

      <SectionHeader title="4. Motor Constant (Km)" />
      <div className="p-2 border border-gray-100 bg-gray-50/30 grid grid-cols-2 gap-1.5">
        <FieldDef label="Kt" value={kmState.kt} onChange={(v:any) => setKmState({...kmState, kt: v})} unit="Nm/A" />
        <FieldDef label="Resistance (L-L)" value={kmState.resistanceOmh} onChange={(v:any) => setKmState({...kmState, resistanceOmh: v})} unit="Ω" />
      </div>

      <SectionHeader title="5. Constant Relationships" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <RadioTarget options={[{label: "Kv (RPM/V)", value:"kv"}, {label: "Ke (V/kRPM)", value:"ke"}, {label: "Kt (Nm/A)", value:"kt"}]} selected={kkk.inputMode} onChange={(v:any) => setKkk({...kkk, inputMode: v})} />
        <div className="mt-1">
          <FieldDef label={`Input ${kkk.inputMode.toUpperCase()}`} value={kkk.val} onChange={(v:any) => setKkk({...kkk, val: v})} />
        </div>
      </div>

      <SectionHeader title="6. RPM Conversions" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <FieldDef label="Speed" value={rpmVal.rpm} onChange={(v:any) => setRpmVal({rpm: v})} unit="RPM" />
      </div>

      <SectionHeader title="7. eRPM & Frequency" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <RadioTarget options={[{label: "Mech RPM", value:"rpm"}, {label: "eRPM", value:"erpm"}]} selected={erp.solveFor === "rpm" ? "rpm" : "erpm"} onChange={(v:any) => setErp({...erp, solveFor: v})} />
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <FieldDef label="Stator Poles" value={erp.poles} onChange={(v:any) => setErp({...erp, poles: v})} />
          <FieldDef label="Mech RPM" value={erp.solveFor === "rpm" ? erpRes.rpm.toFixed(0) : erp.rpm} disabled={erp.solveFor === "rpm"} onChange={(v:any) => setErp({...erp, rpm: v})} unit="RPM" />
          <FieldDef label="eRPM" value={erp.solveFor !== "rpm" ? erpRes.erpm.toFixed(0) : erp.erpm} disabled={erp.solveFor !== "rpm"} onChange={(v:any) => setErp({...erp, erpm: v})} unit="RPM" />
        </div>
      </div>

      <SectionHeader title="8. Angle Conversions" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <FieldDef label="Angle" value={angle.degrees} onChange={(v:any) => setAngle({degrees: v})} unit="°" />
      </div>

      <SectionHeader title="9. Encoder Resolution" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <FieldDef label="Encoder Bits" value={enc.bits} onChange={(v:any) => setEnc({...enc, bits: v})} unit="Bits" />
      </div>

      <SectionHeader title="10. AWG Wire Size" />
      <div className="p-2 border border-gray-100 bg-gray-50/30">
        <FieldDef label="Gauge" value={awg.awg} onChange={(v:any) => setAwg({awg: v})} unit="AWG" />
      </div>
    </div>
  );

  const resultsPanel = (
    <div id="toolboxcalc-report-area" className="relative space-y-6">
      <PdfTemplateHeader calculatorName="Engineering Toolbox" />

      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] text-gray-500 border-l-2 border-[#ffc812] pl-3 py-1 pdf-no-hide" style={{ fontFamily: "Lexend, sans-serif" }}>
          Complete reference of standard electric motor relations.
        </p>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_Toolbox_Report.pdf" />
      </div>

      <div className="border border-gray-100 p-4 bg-white shadow-sm">
        <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] mb-4 border-b pb-2" style={{ fontFamily: "Michroma, sans-serif" }}>Reference Summary & Formulas</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] text-[#ffc812] uppercase font-bold">1. Power Relation</p>
              <p className="text-[10px] italic text-gray-400">P = τ · ω</p>
              <p className="text-xs font-bold">{tspRes.powerW.toFixed(2)} W</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-[#ffc812] uppercase font-bold">2. Speed/Voltage</p>
              <p className="text-[10px] italic text-gray-400">ω = V / Ke</p>
              <p className="text-xs font-bold">{svkRes.speed.toFixed(0)} RPM</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-[#ffc812] uppercase font-bold">3. Torque/Current</p>
              <p className="text-[10px] italic text-gray-400">τ = Kt · I</p>
              <p className="text-xs font-bold">{tckRes.torque.toFixed(4)} Nm</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-[#ffc812] uppercase font-bold">4. Motor Constant</p>
              <p className="text-[10px] italic text-gray-400">Km = Kt / √R</p>
              <p className="text-xs font-bold">{kmRes.toFixed(5)} Nm/√W</p>
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <p className="text-[9px] text-[#ffc812] uppercase font-bold">5. Constants</p>
               <div className="text-[10px] space-y-0.5">
                  <p>Kv: {kkkRes.kv.toFixed(1)}</p>
                  <p>Ke: {kkkRes.ke.toFixed(4)}</p>
                  <p>Kt: {kkkRes.kt.toFixed(4)}</p>
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] text-[#ffc812] uppercase font-bold">6/7. Speed</p>
               <div className="text-[10px] space-y-0.5">
                  <p>ω: {rpmRes.rad.toFixed(2)} rad/s</p>
                  <p>eRPM: {erpRes.erpm.toFixed(0)}</p>
                  <p>Freq: {erpRes.freq.toFixed(2)} Hz</p>
               </div>
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <p className="text-[9px] text-[#ffc812] uppercase font-bold">8/9. Precision</p>
               <div className="text-[10px] space-y-0.5">
                  <p>Arcsec: {angleRes.arcsec.toFixed(0)}</p>
                  <p>Res: {encRes.deg.toFixed(6)}°</p>
                  <p>CPR: {encRes.cpr.toLocaleString()}</p>
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] text-[#ffc812] uppercase font-bold">10. Wire</p>
               <div className="text-[10px] space-y-0.5">
                  <p>Dia: {awgRes.dia.toFixed(3)} mm</p>
                  <p>Area: {awgRes.area.toFixed(3)} mm²</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
