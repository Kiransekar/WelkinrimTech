// AWG Motor Winding Length & Weight Calculator
// Combines AWG wire reference (Sheet 1) with motor winding geometry (Sheet 2)
import { useState, useMemo } from "react";
import { DownloadReportButton, PdfTemplateHeader } from "./PdfExport";
import SplitLayout from "./SplitLayout";

interface AwgData {
  awg: number;
  diameterMm: number;
  areaMm2: number;
  ohmsPerKm: number;
  maxAmpsChassis: number;
  maxAmpsPower: number;
  maxFreq: number;
  breakingForceLbs: number;
}

// Extended AWG table: gauges 0–26 (covers heavy bus bar to fine motor winding wire)
const AWG_TABLE: AwgData[] = [
  { awg: 0,  diameterMm: 8.251,  areaMm2: 53.48,   ohmsPerKm: 0.3224,  maxAmpsChassis: 245, maxAmpsPower: 150, maxFreq: 250,   breakingForceLbs: 3060 },
  { awg: 1,  diameterMm: 7.348,  areaMm2: 42.39,   ohmsPerKm: 0.4064,  maxAmpsChassis: 211, maxAmpsPower: 119, maxFreq: 325,   breakingForceLbs: 2430 },
  { awg: 2,  diameterMm: 6.544,  areaMm2: 33.63,   ohmsPerKm: 0.5127,  maxAmpsChassis: 181, maxAmpsPower: 94,  maxFreq: 410,   breakingForceLbs: 1930 },
  { awg: 3,  diameterMm: 5.827,  areaMm2: 26.67,   ohmsPerKm: 0.6462,  maxAmpsChassis: 158, maxAmpsPower: 75,  maxFreq: 500,   breakingForceLbs: 1530 },
  { awg: 4,  diameterMm: 5.189,  areaMm2: 21.15,   ohmsPerKm: 0.8152,  maxAmpsChassis: 135, maxAmpsPower: 60,  maxFreq: 650,   breakingForceLbs: 1210 },
  { awg: 5,  diameterMm: 4.621,  areaMm2: 16.77,   ohmsPerKm: 1.028,   maxAmpsChassis: 118, maxAmpsPower: 47,  maxFreq: 810,   breakingForceLbs: 960 },
  { awg: 6,  diameterMm: 4.115,  areaMm2: 13.30,   ohmsPerKm: 1.296,   maxAmpsChassis: 101, maxAmpsPower: 37,  maxFreq: 1100,  breakingForceLbs: 760 },
  { awg: 7,  diameterMm: 3.665,  areaMm2: 10.55,   ohmsPerKm: 1.634,   maxAmpsChassis: 89,  maxAmpsPower: 30,  maxFreq: 1300,  breakingForceLbs: 605 },
  { awg: 8,  diameterMm: 3.264,  areaMm2: 8.366,   ohmsPerKm: 2.061,   maxAmpsChassis: 73,  maxAmpsPower: 24,  maxFreq: 1650,  breakingForceLbs: 480 },
  { awg: 9,  diameterMm: 2.906,  areaMm2: 6.631,   ohmsPerKm: 2.599,   maxAmpsChassis: 64,  maxAmpsPower: 19,  maxFreq: 2050,  breakingForceLbs: 380 },
  { awg: 10, diameterMm: 2.588,  areaMm2: 5.261,   ohmsPerKm: 3.277,   maxAmpsChassis: 55,  maxAmpsPower: 15,  maxFreq: 2600,  breakingForceLbs: 314 },
  { awg: 11, diameterMm: 2.305,  areaMm2: 4.172,   ohmsPerKm: 4.132,   maxAmpsChassis: 47,  maxAmpsPower: 12,  maxFreq: 3200,  breakingForceLbs: 249 },
  { awg: 12, diameterMm: 2.053,  areaMm2: 3.309,   ohmsPerKm: 5.211,   maxAmpsChassis: 41,  maxAmpsPower: 9.3, maxFreq: 4150,  breakingForceLbs: 197 },
  { awg: 13, diameterMm: 1.828,  areaMm2: 2.624,   ohmsPerKm: 6.571,   maxAmpsChassis: 35,  maxAmpsPower: 7.4, maxFreq: 5300,  breakingForceLbs: 150 },
  { awg: 14, diameterMm: 1.628,  areaMm2: 2.081,   ohmsPerKm: 8.286,   maxAmpsChassis: 32,  maxAmpsPower: 5.9, maxFreq: 6700,  breakingForceLbs: 119 },
  { awg: 15, diameterMm: 1.450,  areaMm2: 1.650,   ohmsPerKm: 10.45,   maxAmpsChassis: 28,  maxAmpsPower: 4.7, maxFreq: 8250,  breakingForceLbs: 94 },
  { awg: 16, diameterMm: 1.291,  areaMm2: 1.309,   ohmsPerKm: 13.17,   maxAmpsChassis: 22,  maxAmpsPower: 3.7, maxFreq: 11000, breakingForceLbs: 75 },
  { awg: 17, diameterMm: 1.150,  areaMm2: 1.039,   ohmsPerKm: 16.61,   maxAmpsChassis: 19,  maxAmpsPower: 2.9, maxFreq: 13000, breakingForceLbs: 59 },
  { awg: 18, diameterMm: 1.024,  areaMm2: 0.8231,  ohmsPerKm: 20.95,   maxAmpsChassis: 16,  maxAmpsPower: 2.3, maxFreq: 17000, breakingForceLbs: 47 },
  { awg: 19, diameterMm: 0.912,  areaMm2: 0.6531,  ohmsPerKm: 26.42,   maxAmpsChassis: 14,  maxAmpsPower: 1.8, maxFreq: 21000, breakingForceLbs: 37 },
  { awg: 20, diameterMm: 0.812,  areaMm2: 0.5176,  ohmsPerKm: 33.31,   maxAmpsChassis: 11,  maxAmpsPower: 1.5, maxFreq: 27000, breakingForceLbs: 29 },
  { awg: 21, diameterMm: 0.723,  areaMm2: 0.4105,  ohmsPerKm: 42.00,   maxAmpsChassis: 9,   maxAmpsPower: 1.2, maxFreq: 33000, breakingForceLbs: 23 },
  { awg: 22, diameterMm: 0.644,  areaMm2: 0.3255,  ohmsPerKm: 52.96,   maxAmpsChassis: 7,   maxAmpsPower: 0.92,maxFreq: 42000, breakingForceLbs: 18 },
  { awg: 23, diameterMm: 0.573,  areaMm2: 0.2582,  ohmsPerKm: 66.79,   maxAmpsChassis: 6,   maxAmpsPower: 0.73,maxFreq: 53000, breakingForceLbs: 15 },
  { awg: 24, diameterMm: 0.511,  areaMm2: 0.2047,  ohmsPerKm: 84.22,   maxAmpsChassis: 3.5, maxAmpsPower: 0.58,maxFreq: 68000, breakingForceLbs: 12 },
  { awg: 25, diameterMm: 0.455,  areaMm2: 0.1624,  ohmsPerKm: 106.2,   maxAmpsChassis: 2.7, maxAmpsPower: 0.46,maxFreq: 85000, breakingForceLbs: 9 },
  { awg: 26, diameterMm: 0.405,  areaMm2: 0.1288,  ohmsPerKm: 133.9,   maxAmpsChassis: 2.2, maxAmpsPower: 0.36,maxFreq: 107000,breakingForceLbs: 7 },
];

interface AwgCalcInput {
  selectedAwg: number;
  // Motor geometry (from Weight sheet)
  stackLengthMm: number;
  statorDiameterMm: number;
  windingOverhangDiameterMm: number;
  coilsPerPhase: number;
  numPhases: number;
  parallelPaths: number;
  wireTerminationMm: number;
  // Material
  copperDensityGPerCuMm: number;
}

const DEFAULTS: AwgCalcInput = {
  selectedAwg: 18,
  stackLengthMm: 25,
  statorDiameterMm: 140,
  windingOverhangDiameterMm: 25,
  coilsPerPhase: 9,
  numPhases: 3,
  parallelPaths: 1,
  wireTerminationMm: 600,
  copperDensityGPerCuMm: 0.00896,
};

function calculateWinding(inputs: AwgCalcInput, awgData: AwgData) {
  const {
    stackLengthMm, statorDiameterMm, windingOverhangDiameterMm,
    coilsPerPhase, numPhases, parallelPaths,
    wireTerminationMm, copperDensityGPerCuMm,
  } = inputs;

  // Winding overhang length = 2π × overhang diameter (both end turns)
  const windingOverhangLengthMm = 2 * Math.PI * windingOverhangDiameterMm;

  // Length per coil = 2 × stack length + winding overhang length
  const lengthPerCoilMm = 2 * stackLengthMm + windingOverhangLengthMm;

  // Star connection length = π × stator diameter
  const starConnectionMm = Math.PI * statorDiameterMm;

  // Inter-coil wiring ≈ π × stator diameter (total routing between coils in one phase)
  const interCoilWiringMm = Math.PI * statorDiameterMm;

  // Total length per phase = (coils × coil length) + termination + inter-coil wiring + star connection
  const lengthPerPhaseMm = (coilsPerPhase * lengthPerCoilMm) + wireTerminationMm + interCoilWiringMm + starConnectionMm;
  const lengthPerPhaseM = lengthPerPhaseMm / 1000;

  // Total length (all phases)
  const totalLengthM = lengthPerPhaseM * numPhases;

  // Volume per phase (cu.mm)
  const volumePerPhaseCuMm = awgData.areaMm2 * lengthPerPhaseMm;

  // Weight per phase (g)
  const weightPerPhaseG = volumePerPhaseCuMm * copperDensityGPerCuMm;

  // Total copper weight (g)
  const totalCopperWeightG = weightPerPhaseG * numPhases;

  // DC Resistance per phase at 20°C
  const dcResistancePerPhase = awgData.ohmsPerKm * lengthPerPhaseM / parallelPaths;

  // Resistance at 80°C (copper temp coeff 0.00393/°C)
  const resistanceAt80C = dcResistancePerPhase * (1 + 0.00393 * 60);

  return {
    windingOverhangLengthMm,
    lengthPerCoilMm,
    starConnectionMm,
    interCoilWiringMm,
    lengthPerPhaseMm,
    lengthPerPhaseM,
    totalLengthM,
    volumePerPhaseCuMm,
    weightPerPhaseG,
    totalCopperWeightG,
    dcResistancePerPhase,
    resistanceAt80C,
  };
}

export default function AwgCalc() {
  const [inputs, setInputs] = useState<AwgCalcInput>(DEFAULTS);

  const selectedAwgData = useMemo(() => {
    return AWG_TABLE.find(a => a.awg === inputs.selectedAwg) || AWG_TABLE[0];
  }, [inputs.selectedAwg]);

  const result = useMemo(() => calculateWinding(inputs, selectedAwgData), [inputs, selectedAwgData]);

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

  const inputsPanel = (
    <div className="space-y-3">
      {/* AWG Selector */}
      <Section title="Wire Gauge (AWG)">
        <div className="grid grid-cols-9 gap-0.5">
          {AWG_TABLE.map((awg) => (
            <button
              key={awg.awg}
              onClick={() => setInputs({ ...inputs, selectedAwg: awg.awg })}
              className={`py-1 text-[8px] tracking-wider border transition-all ${
                inputs.selectedAwg === awg.awg
                  ? "bg-[#ffc812] border-[#ffc812] text-black font-bold"
                  : "bg-white border-gray-200 text-gray-500 hover:border-[#ffc812]"
              }`}
              style={{ fontFamily: "Michroma, sans-serif" }}
            >
              {awg.awg}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-gray-500 bg-gray-50 px-2 py-1 border border-gray-100" style={{ fontFamily: "Lexend, sans-serif" }}>
          AWG {inputs.selectedAwg}: Ø {selectedAwgData.diameterMm.toFixed(3)} mm · {selectedAwgData.areaMm2.toFixed(4)} mm² · {selectedAwgData.ohmsPerKm.toFixed(3)} Ω/km
        </div>
      </Section>

      <Section title="Motor Geometry">
        <Field label="Stack Length" value={inputs.stackLengthMm} onChange={(v: number) => setInputs({ ...inputs, stackLengthMm: v })} unit="mm" step={0.1} />
        <Field label="Stator Diameter" value={inputs.statorDiameterMm} onChange={(v: number) => setInputs({ ...inputs, statorDiameterMm: v })} unit="mm" step={0.1} />
        <Field label="Winding Overhang Dia" value={inputs.windingOverhangDiameterMm} onChange={(v: number) => setInputs({ ...inputs, windingOverhangDiameterMm: v })} unit="mm" step={0.1} />
      </Section>

      <Section title="Winding Configuration">
        <Field label="Coils per Phase" value={inputs.coilsPerPhase} onChange={(v: number) => setInputs({ ...inputs, coilsPerPhase: Math.max(1, v) })} unit="coils" />
        <Field label="No. of Phases" value={inputs.numPhases} onChange={(v: number) => setInputs({ ...inputs, numPhases: Math.max(1, v) })} unit="phases" />
        <Field label="Parallel Paths" value={inputs.parallelPaths} onChange={(v: number) => setInputs({ ...inputs, parallelPaths: Math.max(1, v) })} unit="paths" />
        <Field label="Wire Termination Length" value={inputs.wireTerminationMm} onChange={(v: number) => setInputs({ ...inputs, wireTerminationMm: v })} unit="mm" />
      </Section>

      <Section title="Material">
        <Field label="Copper Density" value={inputs.copperDensityGPerCuMm} onChange={(v: number) => setInputs({ ...inputs, copperDensityGPerCuMm: v })} unit="g/mm³" step={0.00001} />
      </Section>
    </div>
  );

  const resultsPanel = (
    <div id="awgcalc-report-area" className="relative space-y-3">
      <PdfTemplateHeader calculatorName="AWG Winding Calculator" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500 border-l-2 border-[#ffc812] pl-3 py-1 pdf-no-hide" style={{ fontFamily: "Lexend, sans-serif" }}>
          Motor winding length and copper weight calculation.
        </p>
        <DownloadReportButton targetElementId="calculator-capture-area" filename="WelkinRim_AWG_Winding_Report.pdf" />
      </div>

      {/* AWG Badge */}
      <div className="inline-flex gap-2">
        <div className="px-3 py-1 bg-[#ffc812]/10 border border-[#ffc812]/30">
          <span className="text-[10px] uppercase tracking-wider text-[#ffc812]" style={{ fontFamily: "Michroma, sans-serif" }}>
            AWG {inputs.selectedAwg}
          </span>
        </div>
        <div className="px-3 py-1 bg-gray-50 border border-gray-200">
          <span className="text-[10px] tracking-wider text-gray-600" style={{ fontFamily: "Michroma, sans-serif" }}>
            Ø {selectedAwgData.diameterMm.toFixed(3)} mm · {selectedAwgData.areaMm2.toFixed(4)} mm²
          </span>
        </div>
      </div>

      {/* Winding Geometry Breakdown */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Winding Geometry
        </p>
        <div className="space-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Winding Overhang Length</span>
            <span className="font-medium">{result.windingOverhangLengthMm.toFixed(2)} mm</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Length per Coil</span>
            <span className="font-medium">{result.lengthPerCoilMm.toFixed(2)} mm</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Star Connection Length</span>
            <span className="font-medium">{result.starConnectionMm.toFixed(2)} mm</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Inter-Coil Wiring</span>
            <span className="font-medium">{result.interCoilWiringMm.toFixed(2)} mm</span>
          </div>
        </div>
      </div>

      {/* Key Results */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Length per Phase" value={result.lengthPerPhaseM.toFixed(2)} unit="m" sub={`${result.lengthPerPhaseMm.toFixed(2)} mm`} />
        <StatCard label="Total Length" value={result.totalLengthM.toFixed(2)} unit="m" sub={`${inputs.numPhases} phases`} />
        <StatCard label="Weight per Phase" value={result.weightPerPhaseG.toFixed(2)} unit="g" sub={`${(result.weightPerPhaseG / 1000).toFixed(3)} Kg`} />
        <StatCard label="Total Copper Weight" value={result.totalCopperWeightG.toFixed(2)} unit="g" sub={`${(result.totalCopperWeightG / 1000).toFixed(3)} Kg`} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Volume per Phase" value={result.volumePerPhaseCuMm.toFixed(2)} unit="mm³" />
        <StatCard label="DC Resistance / Phase" value={result.dcResistancePerPhase.toFixed(4)} unit="Ω" sub={`@ 80°C: ${result.resistanceAt80C.toFixed(4)} Ω`} />
      </div>

      {/* AWG Specs */}
      <div className="border border-gray-100 p-3 bg-gray-50/30 mt-2">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          AWG {inputs.selectedAwg} Wire Specifications
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Diameter</span>
            <span className="font-medium">{selectedAwgData.diameterMm.toFixed(3)} mm</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Cross-Section Area</span>
            <span className="font-medium">{selectedAwgData.areaMm2.toFixed(4)} mm²</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Resistance</span>
            <span className="font-medium">{selectedAwgData.ohmsPerKm.toFixed(3)} Ω/km</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Max Current (Chassis)</span>
            <span className="font-medium">{selectedAwgData.maxAmpsChassis} A</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Max Current (Power)</span>
            <span className="font-medium">{selectedAwgData.maxAmpsPower} A</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Max Frequency (100% skin)</span>
            <span className="font-medium">{selectedAwgData.maxFreq.toLocaleString()} Hz</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-0.5">
            <span className="text-gray-500">Breaking Force</span>
            <span className="font-medium">{selectedAwgData.breakingForceLbs} lbs</span>
          </div>
        </div>
      </div>

      {/* Formulas */}
      <div className="border border-gray-100 p-3 bg-gray-50/30">
        <p className="text-[9px] uppercase text-[#ffc812] tracking-wider mb-2" style={{ fontFamily: "Michroma, sans-serif" }}>
          Formula Reference
        </p>
        <div className="space-y-1 text-[10px] text-gray-600" style={{ fontFamily: "Lexend, sans-serif" }}>
          <p>Overhang Length = 2π × D<sub>overhang</sub></p>
          <p>Length/Coil = 2 × L<sub>stack</sub> + Overhang Length</p>
          <p>Star Connection = π × D<sub>stator</sub></p>
          <p>L<sub>phase</sub> = (N<sub>coils</sub> × L<sub>coil</sub>) + L<sub>term</sub> + L<sub>inter-coil</sub> + L<sub>star</sub></p>
          <p>Volume = Area × L<sub>phase</sub></p>
          <p>Weight = Volume × ρ<sub>Cu</sub></p>
        </div>
      </div>
    </div>
  );

  return <SplitLayout inputs={inputsPanel} results={resultsPanel} />;
}
