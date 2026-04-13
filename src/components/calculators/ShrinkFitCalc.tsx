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

  const Field = ({ label, value, onChange, unit, step = 0.001 }: any) => (
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
        {unit && <span className="text-[9px] text-gray-400 px-2" style={{ fontFamily: "Lexend, sans-serif" }}>{unit}</span>}
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

  const StatCard = ({ label, value, unit, sub }: any) => (
    <div className="border border-gray-200 p-2 bg-white">
      <p className="text-[8px] uppercase text-[#ffc812] tracking-wider">{label}</p>
      <p className="text-base font-black" style={{ fontFamily: "Michroma, sans-serif" }}>
        {value} <span className="text-xs font-medium text-gray-400">{unit}</span>
      </p>
      {sub && <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>}
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
      <div className="flex gap-1">
        {typeButtons.map((t) => (
          <button
            key={t.id}
            onClick={() => setInputs({ ...inputs, calcType: t.id })}
            className={`flex-1 py-2 px-1 text-[9px] uppercase tracking-wider border transition-all ${
              inputs.calcType === t.id
                ? "bg-[#ffc812] border-[#ffc812] text-black"
                : "bg-white border-gray-200 text-gray-500 hover:border-[#ffc812]"
            }`}
            style={{ fontFamily: "Michroma, sans-serif" }}
          >
            <div>{t.label}</div>
            <div className="text-[7px] opacity-70 normal-case">{t.desc}</div>
          </button>
        ))}
      </div>

      <Section title="Material Properties">
        <Field
          label="CTE of Steel"
          value={inputs.cteSteel}
          onChange={(v: number) => setInputs({ ...inputs, cteSteel: v })}
          unit="/°C"
          step={0.000001}
        />
      </Section>

      {inputs.calcType === "type1" && (
        <>
          <Section title="Target Interference">
            <Field
              label="Desired Diameter Change"
              value={inputs.desiredChangeMm}
              onChange={(v: number) => setInputs({ ...inputs, desiredChangeMm: v })}
              unit="mm"
              step={0.01}
            />
            <Field
              label="Diameter at Room Temp"
              value={inputs.diameterMm}
              onChange={(v: number) => setInputs({ ...inputs, diameterMm: v })}
              unit="mm"
              step={0.01}
            />
          </Section>
          <Section title="Temperature">
            <Field
              label="Ambient Temp"
              value={inputs.ambientTemp}
              onChange={(v: number) => setInputs({ ...inputs, ambientTemp: v })}
              unit="°C"
            />
            <Field
              label="Elevated Temp"
              value={inputs.elevatedTemp}
              onChange={(v: number) => setInputs({ ...inputs, elevatedTemp: v })}
              unit="°C"
            />
          </Section>
        </>
      )}

      {inputs.calcType === "type2" && (
        <>
          <Section title="Dimensions">
            <Field
              label="Stator Diameter"
              value={inputs.statorDiameter}
              onChange={(v: number) => setInputs({ ...inputs, statorDiameter: v })}
              unit="mm"
              step={0.01}
            />
            <Field
              label="Enclosure Diameter"
              value={inputs.enclosureDiameter}
              onChange={(v: number) => setInputs({ ...inputs, enclosureDiameter: v })}
              unit="mm"
              step={0.01}
            />
            <Field
              label="Desired Change"
              value={inputs.desiredChangeMm}
              onChange={(v: number) => setInputs({ ...inputs, desiredChangeMm: v })}
              unit="mm"
              step={0.01}
            />
          </Section>
          <Section title="Temperature Differentials">
            <Field
              label="Stator Temp Diff"
              value={inputs.tempDiffStator}
              onChange={(v: number) => setInputs({ ...inputs, tempDiffStator: v })}
              unit="°C"
            />
            <Field
              label="Enclosure Temp Diff"
              value={inputs.tempDiffEnclosure}
              onChange={(v: number) => setInputs({ ...inputs, tempDiffEnclosure: v })}
              unit="°C"
            />
          </Section>
        </>
      )}

      {inputs.calcType === "type3" && (
        <>
          <Section title="Stator (Cooled)">
            <Field
              label="Stator Diameter (Room)"
              value={inputs.statorTempRoom}
              onChange={(v: number) => setInputs({ ...inputs, statorTempRoom: v })}
              unit="mm"
              step={0.01}
            />
            <Field
              label="Ambient Temp"
              value={inputs.ambientStatorTemp}
              onChange={(v: number) => setInputs({ ...inputs, ambientStatorTemp: v })}
              unit="°C"
            />
            <Field
              label="Elevated Temp"
              value={inputs.elevatedStatorTemp}
              onChange={(v: number) => setInputs({ ...inputs, elevatedStatorTemp: v })}
              unit="°C"
            />
          </Section>
          <Section title="Enclosure (Heated)">
            <Field
              label="Enclosure Diameter"
              value={inputs.enclosureDiameter}
              onChange={(v: number) => setInputs({ ...inputs, enclosureDiameter: v })}
              unit="mm"
              step={0.01}
            />
            <Field
              label="Temp Difference"
              value={inputs.tempDiffEnclosure}
              onChange={(v: number) => setInputs({ ...inputs, tempDiffEnclosure: v })}
              unit="°C"
            />
          </Section>
          <Section title="Target">
            <Field
              label="Desired Interference"
              value={inputs.desiredChangeMm}
              onChange={(v: number) => setInputs({ ...inputs, desiredChangeMm: v })}
              unit="mm"
              step={0.01}
            />
          </Section>
        </>
      )}
    </div>
  );

  const resultsPanel = (
    <div id="shrinkfitcalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="Shrink Fit Calculator" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500 border-l-2 border-[#ffc812] pl-3 py-1 pdf-no-hide" style={{ fontFamily: "Lexend, sans-serif" }}>
          Thermal interference fit calculations for stator and enclosure assembly.
        </p>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_ShrinkFit_Report.pdf" />
      </div>

      {/* Type Badge */}
      <div className="inline-block px-3 py-1 bg-[#ffc812]/10 border border-[#ffc812]/30">
        <span className="text-[10px] uppercase tracking-wider text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
          {inputs.calcType === "type1" && "Type 1: Enclosure Heated"}
          {inputs.calcType === "type2" && "Type 2: Differential Thermal"}
          {inputs.calcType === "type3" && "Type 3: Stator Cooled"}
        </span>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-2">
        {inputs.calcType === "type1" && (
          <>
            <StatCard label="Temp Rise Required" value={(result as any).calculatedTempChange.toFixed(1)} unit="°C" />
            <StatCard label="Required Temp" value={(result as any).requiredTemp.toFixed(1)} unit="°C" />
            <StatCard label="Actual Expansion" value={(result as any).actualExpansion.toFixed(3)} unit="mm" />
            <StatCard label="Expansion %" value={(((result as any).actualExpansion / inputs.diameterMm) * 100).toFixed(4)} unit="%" />
          </>
        )}

        {inputs.calcType === "type2" && (
          <>
            <StatCard label="Stator Expansion" value={(result as any).statorExpansionMm.toFixed(3)} unit="mm" />
            <StatCard label="Enclosure Change" value={(result as any).enclosureChangeMm.toFixed(3)} unit="mm" />
            <StatCard label="Total Interference" value={(result as any).totalInterferenceMm.toFixed(3)} unit="mm" />
            <StatCard label="Target Clearance" value={inputs.desiredChangeMm.toFixed(3)} unit="mm" />
          </>
        )}

        {inputs.calcType === "type3" && (
          <>
            <StatCard label="Stator Shrinkage" value={(result as any).statorDiameterChange.toFixed(3)} unit="mm" />
            <StatCard label="Result Stator Dia" value={(result as any).actualStatorDiameter.toFixed(2)} unit="mm" />
            <StatCard label="Enclosure Expansion" value={(result as any).enclosureExpansion.toFixed(3)} unit="mm" />
            <StatCard label="Total Interference" value={(result as any).totalInterference.toFixed(3)} unit="mm" />
          </>
        )}
      </div>

      {/* Formula Reference */}
      <div className="border border-gray-100 p-3 bg-gray-50/30 mt-4">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Formula Reference
        </p>
        <div className="space-y-1 text-[10px] text-gray-600" style={{ fontFamily: "Lexend, sans-serif" }}>
          {inputs.calcType === "type1" && (
            <>
              <p>ΔT = ΔD / (CTE × D)</p>
              <p>Where: ΔT = Temperature change, ΔD = Diameter change, CTE = Thermal expansion coefficient</p>
            </>
          )}
          {inputs.calcType === "type2" && (
            <>
              <p>ΔDₛₜₐₜₒᵣ = CTE × Dₛₜₐₜₒᵣ × ΔTₛₜₐₜₒᵣ</p>
              <p>ΔDₑₙ꜀ = CTE × Dₑₙ꜀ × ΔTₑₙ꜀</p>
              <p>Total Interference = |ΔDₛₜₐₜₒᵣ - ΔDₑₙ꜀|</p>
            </>
          )}
          {inputs.calcType === "type3" && (
            <>
              <p>ΔDₛₜₐₜₒᵣ = CTE × Dᵣₒₒₘ × |ΔT|</p>
              <p>ΔDₑₙ꜀ = CTE × Dₑₙ꜀ × ΔTₑₙ꜀</p>
              <p>Total Interference = ΔDₛₜₐₜₒᵣ + ΔDₑₙ꜀</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
