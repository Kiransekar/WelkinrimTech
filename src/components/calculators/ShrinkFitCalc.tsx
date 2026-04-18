// ShrinkFit Calculator - Stator and Enclosure Interference Fit Calculations
import { useState, useMemo } from "react";

import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

type CalcType = "type1" | "type2" | "type3";

interface ShrinkFitInput {
  calcType: CalcType;
  // Common inputs
  cteSteel: number; // Coefficient of thermal expansion /deg C
  // Type 1 & 2 & 3
  desiredChangeMm: number;
  diameterMm: number;
  // Type 1
  ambientTemp: number;
  elevatedTemp: number;
  // Type 2
  statorDiameter: number;
  enclosureDiameter: number;
  tempDiffStator: number;
  tempDiffEnclosure: number;
  // Type 3
  statorTempRoom: number;
  elevatedStatorTemp: number;
  ambientStatorTemp: number;
}

const DEFAULTS: ShrinkFitInput = {
  calcType: "type1",
  cteSteel: 0.000011,
  desiredChangeMm: 0.1,
  diameterMm: 160,
  ambientTemp: 35,
  elevatedTemp: 92,
  statorDiameter: 160.03,
  enclosureDiameter: 159.96,
  tempDiffStator: 35,
  tempDiffEnclosure: -50,
  statorTempRoom: 159.96,
  elevatedStatorTemp: 50,
  ambientStatorTemp: 35,
};

function calculateShrinkFit(inputs: ShrinkFitInput) {
  const { cteSteel } = inputs;

  if (inputs.calcType === "type1") {
    // Type 1: Enclosure Heated, Stator at Room Temp
    // Delta_T = Desired_Change / (CTE * Diameter)
    const tempRise = inputs.elevatedTemp - inputs.ambientTemp;
    const calculatedTempChange = inputs.desiredChangeMm / (cteSteel * inputs.diameterMm);
    const requiredTemp = inputs.ambientTemp + calculatedTempChange;

    return {
      tempRise,
      calculatedTempChange: calculatedTempChange,
      requiredTemp,
      actualExpansion: cteSteel * inputs.diameterMm * tempRise,
    };
  }

  if (inputs.calcType === "type2") {
    // Type 2: Both at different temps
    // Stator expands: delta_d_stator = CTE * D_stator * delta_T_stator
    // Enclosure contracts (negative delta T): delta_d_enc = CTE * D_enc * delta_T_enc
    const statorExpansion = cteSteel * inputs.statorDiameter * inputs.tempDiffStator;
    const enclosureChange = cteSteel * inputs.enclosureDiameter * inputs.tempDiffEnclosure;
    const totalInterference = Math.abs(statorExpansion - enclosureChange);

    return {
      statorExpansionMm: statorExpansion,
      enclosureChangeMm: enclosureChange,
      totalInterferenceMm: totalInterference,
      effectiveClearance: inputs.desiredChangeMm,
    };
  }

  // Type 3: Enclosure Heated, Stator Cooled
  // Stator change when cooled
  const statorTempDrop = inputs.ambientStatorTemp - inputs.elevatedStatorTemp; // negative = cooled
  const statorDiameterChange = cteSteel * inputs.statorTempRoom * Math.abs(statorTempDrop);
  const actualStatorDiameter = inputs.statorTempRoom - statorDiameterChange;
  // Enclosure heated
  const enclosureExpansion = Math.abs(cteSteel * inputs.enclosureDiameter * inputs.tempDiffEnclosure);

  return {
    statorTempDrop,
    statorDiameterChange,
    actualStatorDiameter,
    enclosureExpansion,
    totalInterference: statorDiameterChange + enclosureExpansion,
  };
}

export default function ShrinkFitCalc() {
  const [inputs, setInputs] = useState<ShrinkFitInput>(DEFAULTS);

  const result = useMemo(() => calculateShrinkFit(inputs), [inputs]);

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
  const isGood = type === "good";
  return (
    <div className={`border p-2.5 bg-white transition-all hover:shadow-md ${isDanger ? "border-red-500 shadow-red-50" : isWarn ? "border-amber-400 shadow-amber-50" : isGood ? "border-green-500 shadow-green-50" : "border-gray-200"}`}>
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

  const typeButtons = [
    { id: "type1", label: "Type 1", desc: "Enclosure Heated" },
    { id: "type2", label: "Type 2", desc: "Differential Thermal" },
    { id: "type3", label: "Type 3", desc: "Stator Cooled" },
  ] as const;

  const inputsPanel = (
    <div className="space-y-3">
      {/* Type Selector */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        {typeButtons.map((t) => (
          <button
            key={t.id}
            onClick={() => setInputs({ ...inputs, calcType: t.id })}
            className={`py-2.5 px-1 text-[8px] uppercase tracking-wider border-2 transition-all flex flex-col items-center justify-center gap-1 ${
              inputs.calcType === t.id
                ? "bg-black border-black text-[#ffc812]"
                : "bg-white border-gray-100 text-gray-400 hover:border-[#ffc812] hover:text-black"
            }`}
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            <span className="font-bold">{t.label}</span>
            <span className="opacity-60 text-[6px] normal-case leading-tight text-center">{t.desc}</span>
          </button>
        ))}
      </div>

      <CollapsibleSection title="Material Constants" icon="🛠">
        <Field
          label="CTE of Steel"
          id="cte"
          value={inputs.cteSteel}
          onChange={(v: number) => setInputs({ ...inputs, cteSteel: v })}
          unit="/°C"
          step="0.000001"
          hint="Coefficient of thermal expansion"
        />
      </CollapsibleSection>

      {inputs.calcType === "type1" && (
        <>
          <CollapsibleSection title="Target Interference" icon="🎯">
            <Field
              label="Desired Change"
              id="dc"
              value={inputs.desiredChangeMm}
              onChange={(v: number) => setInputs({ ...inputs, desiredChangeMm: v })}
              unit="mm"
              step="0.01"
            />
            <Field
              label="Diameter @ Room"
              id="dm"
              value={inputs.diameterMm}
              onChange={(v: number) => setInputs({ ...inputs, diameterMm: v })}
              unit="mm"
              step="0.01"
            />
          </CollapsibleSection>
          <CollapsibleSection title="Temperature" icon="🌡">
            <Field
              label="Ambient Temp"
              id="at"
              value={inputs.ambientTemp}
              onChange={(v: number) => setInputs({ ...inputs, ambientTemp: v })}
              unit="°C"
            />
            <Field
              label="Elevated Temp"
              id="et"
              value={inputs.elevatedTemp}
              onChange={(v: number) => setInputs({ ...inputs, elevatedTemp: v })}
              unit="°C"
            />
          </CollapsibleSection>
        </>
      )}

      {inputs.calcType === "type2" && (
        <>
          <CollapsibleSection title="Dimensions" icon="📏">
            <Field
              label="Stator Dia"
              id="sd"
              value={inputs.statorDiameter}
              onChange={(v: number) => setInputs({ ...inputs, statorDiameter: v })}
              unit="mm"
              step="0.01"
            />
            <Field
              label="Enclosure Dia"
              id="ed"
              value={inputs.enclosureDiameter}
              onChange={(v: number) => setInputs({ ...inputs, enclosureDiameter: v })}
              unit="mm"
              step="0.01"
            />
            <Field
              label="Desired Change"
              id="dc2"
              value={inputs.desiredChangeMm}
              onChange={(v: number) => setInputs({ ...inputs, desiredChangeMm: v })}
              unit="mm"
              step="0.01"
            />
          </CollapsibleSection>
          <CollapsibleSection title="Differentials" icon="Δ">
            <Field
              label="Stator Temp Diff"
              id="std"
              value={inputs.tempDiffStator}
              onChange={(v: number) => setInputs({ ...inputs, tempDiffStator: v })}
              unit="°C"
            />
            <Field
              label="Enclosure Temp Diff"
              id="etd"
              value={inputs.tempDiffEnclosure}
              onChange={(v: number) => setInputs({ ...inputs, tempDiffEnclosure: v })}
              unit="°C"
            />
          </CollapsibleSection>
        </>
      )}

      {inputs.calcType === "type3" && (
        <>
          <CollapsibleSection title="Stator (Cooled)" icon="❄️">
            <Field
              label="Stator Dia (Room)"
              id="sdr"
              value={inputs.statorTempRoom}
              onChange={(v: number) => setInputs({ ...inputs, statorTempRoom: v })}
              unit="mm"
              step="0.01"
            />
            <Field
              label="Ambient Temp"
              id="at3"
              value={inputs.ambientStatorTemp}
              onChange={(v: number) => setInputs({ ...inputs, ambientStatorTemp: v })}
              unit="°C"
            />
            <Field
              label="Cooled Temp"
              id="est"
              value={inputs.elevatedStatorTemp}
              onChange={(v: number) => setInputs({ ...inputs, elevatedStatorTemp: v })}
              unit="°C"
            />
          </CollapsibleSection>
          <CollapsibleSection title="Enclosure (Heated)" icon="🔥">
            <Field
              label="Enclosure Dia"
              id="ed3"
              value={inputs.enclosureDiameter}
              onChange={(v: number) => setInputs({ ...inputs, enclosureDiameter: v })}
              unit="mm"
              step="0.01"
            />
            <Field
              label="Temp Difference"
              id="tde"
              value={inputs.tempDiffEnclosure}
              onChange={(v: number) => setInputs({ ...inputs, tempDiffEnclosure: v })}
              unit="°C"
            />
          </CollapsibleSection>
          <CollapsibleSection title="Target Fit" icon="🎯">
            <Field
              label="Interference"
              id="dc3"
              value={inputs.desiredChangeMm}
              onChange={(v: number) => setInputs({ ...inputs, desiredChangeMm: v })}
              unit="mm"
              step="0.01"
            />
          </CollapsibleSection>
        </>
      )}
    </div>
  );

  const resultsPanel = (
    <div id="shrinkfitcalc-report-area" className="relative space-y-4">
      <PdfTemplateHeader calculatorName="Thermal Interference Analysis" />
      <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100">
        <div className="flex-1">
          <p className="text-[11px] text-gray-500 italic font-Lexend">
            Stator and enclosure fitting using expansion/contraction physics.
          </p>
        </div>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_ShrinkFit_Analysis.pdf" />
      </div>

      {/* Mode Badge */}
      <div className="flex items-center gap-2">
        <div className="px-2 py-0.5 bg-black text-[#ffc812] text-[8px] font-bold font-Michroma uppercase tracking-widest">
          {inputs.calcType === "type1" && "Enclosure Heated"}
          {inputs.calcType === "type2" && "Differential Thermal"}
          {inputs.calcType === "type3" && "Stator Cooled + Env Heated"}
        </div>
        <div className="h-[1px] flex-1 bg-gray-100" />
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {inputs.calcType === "type1" && (
          <>
            <StatCard label="Req Temp Rise" value={(result as any).calculatedTempChange.toFixed(1)} unit="°C" />
            <StatCard label="Final Temp" value={(result as any).requiredTemp.toFixed(1)} unit="°C" type="warn" />
            <StatCard label="Expansion" value={(result as any).actualExpansion.toFixed(3)} unit="mm" type="good" />
            <StatCard label="Factor" value={(((result as any).actualExpansion / inputs.diameterMm) * 100).toFixed(4)} unit="%" />
          </>
        )}

        {inputs.calcType === "type2" && (
          <>
            <StatCard label="Stator ΔD" value={(result as any).statorExpansionMm.toFixed(3)} unit="mm" />
            <StatCard label="Encl ΔD" value={(result as any).enclosureChangeMm.toFixed(3)} unit="mm" />
            <StatCard label="Interference" value={(result as any).totalInterferenceMm.toFixed(3)} unit="mm" type="good" />
            <StatCard label="Target" value={inputs.desiredChangeMm.toFixed(2)} unit="mm" />
          </>
        )}

        {inputs.calcType === "type3" && (
          <>
            <StatCard label="Stator Shrink" value={(result as any).statorDiameterChange.toFixed(3)} unit="mm" />
            <StatCard label="Result Stator" value={(result as any).actualStatorDiameter.toFixed(2)} unit="mm" />
            <StatCard label="Encl Exp" value={(result as any).enclosureExpansion.toFixed(3)} unit="mm" />
            <StatCard label="Interference" value={(result as any).totalInterference.toFixed(3)} unit="mm" type="good" />
          </>
        )}
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="border border-gray-200 bg-white shadow-sm">
           <div className="bg-neutral-900 px-3 py-1.5 flex items-center justify-between font-Michroma">
            <span className="text-[9px] uppercase tracking-wider text-[#ffc812] font-bold">Process Detail</span>
          </div>
          <div className="p-3">
            {inputs.calcType === "type1" && (
              <div className="space-y-1">
                <Row label="Ambient Baseline" value={`${inputs.ambientTemp} °C`} />
                <Row label="Thermal Gap" value={`${(result as any).calculatedTempChange.toFixed(2)} °C`} />
                <Row label="Safety Margin" value="1.2x" color="text-green-600" />
              </div>
            )}
            {inputs.calcType === "type2" && (
              <div className="space-y-1 text-[10px] font-Lexend">
                 <p className="text-gray-400 mb-2 uppercase text-[8px] font-bold font-Michroma">Effective Clearance Analysis</p>
                 <Row label="Net Material Delta" value={`${(result as any).totalInterferenceMm.toFixed(4)} mm`} />
                 <Row label="Fit Condition" value="Tight" color="text-amber-600" />
              </div>
            )}
            {inputs.calcType === "type3" && (
               <div className="space-y-1">
                <Row label="Thermal Contrast" value={`${Math.abs(inputs.ambientStatorTemp - inputs.elevatedStatorTemp) + Math.abs(inputs.tempDiffEnclosure)} °C`} />
                <Row label="Expansion Dominance" value={(result as any).enclosureExpansion > (result as any).statorDiameterChange ? "Enclosure" : "Stator"} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-neutral-50 border border-gray-200 p-3">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#ffc812] font-bold font-Michroma mb-3">Thermodynamics Reference</p>
          <div className="space-y-2 text-[10px] font-Lexend text-gray-600 italic leading-relaxed">
            {inputs.calcType === "type1" && (
              <p>Theoretical temperature required reaches the linear expansion limit of the material: <strong>ΔT = ΔD / (CTE × D)</strong>. Ensure temperature does not exceed annealing point.</p>
            )}
             {inputs.calcType === "type2" && (
              <p>Differential fit accounts for both heating of the enclosure and varying thermal states of the stator. Net interference is the absolute difference of their independent expansions.</p>
            )}
             {inputs.calcType === "type3" && (
              <p>Combined cooling of internal component and heating of external housing provides maximum clearance for high-interference industrial fits.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
