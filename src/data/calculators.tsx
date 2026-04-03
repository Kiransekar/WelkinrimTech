// Calculator Registry - Central configuration for all calculators
// Each calculator defines its metadata, status, and category for filtering

import React from "react";

export type CalculatorStatus = "live" | "soon" | "beta";

export type CalculatorCategory =
  | "airplane"
  | "multirotor"
  | "helicopter"
  | "edf-jet"
  | "analysis"
  | "performance";

export interface CalculatorConfig {
  id: string;
  label: string;
  tag: string;
  description: string;
  status: CalculatorStatus;
  accent: string;
  textColor: string;
  category: CalculatorCategory;
  metrics: string[];
  // FIX: Store as React.FC (component function), not React.ReactNode (instantiated JSX).
  // React elements should be created during render, not at module load time.
  icon: React.FC;
  inputCount?: number;
  outputCount?: number;
  stubDescription?: string;
  popular?: boolean;
}

// Icon components for each calculator
export const CalculatorIcons = {
  propcalc: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <ellipse cx="32" cy="32" rx="28" ry="10" />
      <line x1="4" y1="32" x2="60" y2="32" />
      <ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(60 32 32)" />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
    </svg>
  ),
  xcoptercalc: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <circle cx="32" cy="32" r="5" fill="currentColor" />
      <line x1="32" y1="8" x2="32" y2="27" />
      <line x1="32" y1="37" x2="32" y2="56" />
      <line x1="8" y1="32" x2="27" y2="32" />
      <line x1="37" y1="32" x2="56" y2="32" />
      <ellipse cx="32" cy="8" rx="8" ry="3" />
      <ellipse cx="32" cy="56" rx="8" ry="3" />
      <ellipse cx="8" cy="32" rx="3" ry="8" />
      <ellipse cx="56" cy="32" rx="3" ry="8" />
    </svg>
  ),
  helicalc: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <line x1="8" y1="20" x2="56" y2="20" />
      <circle cx="32" cy="20" r="4" fill="currentColor" />
      <line x1="32" y1="20" x2="32" y2="52" />
      <line x1="44" y1="44" x2="60" y2="44" />
      <circle cx="44" cy="44" r="3" fill="currentColor" />
    </svg>
  ),
  fancalc: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <rect x="12" y="20" width="40" height="24" rx="12" />
      <circle cx="32" cy="32" r="8" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const r = (Math.PI * a) / 180;
        const x1 = 32 + 8 * Math.cos(r), y1 = 32 + 8 * Math.sin(r);
        const x2 = 32 + 12 * Math.cos(r), y2 = 32 + 12 * Math.sin(r);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </svg>
  ),
  cgcalc: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <line x1="8" y1="44" x2="56" y2="44" />
      <polygon points="32,16 8,44 56,44" />
      <circle cx="32" cy="38" r="4" fill="currentColor" />
      <line x1="32" y1="44" x2="32" y2="56" />
    </svg>
  ),
  perfcalc: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <polyline points="8,48 20,32 30,40 42,20 56,16" />
      <line x1="8" y1="48" x2="56" y2="48" />
      <line x1="8" y1="16" x2="8" y2="48" />
    </svg>
  ),
  setupfinder: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <circle cx="32" cy="32" r="24" />
      <circle cx="32" cy="32" r="8" fill="currentColor" />
      <line x1="32" y1="8" x2="32" y2="20" />
      <line x1="32" y1="44" x2="32" y2="56" />
      <line x1="8" y1="32" x2="20" y2="32" />
      <line x1="44" y1="32" x2="56" y2="32" />
    </svg>
  ),
  bladecalc: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <ellipse cx="32" cy="32" rx="26" ry="8" />
      <path d="M32 8 Q48 24 48 32 Q48 40 32 56" />
      <path d="M32 8 Q16 24 16 32 Q16 40 32 56" />
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </svg>
  ),
  wbcalc: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <rect x="12" y="16" width="40" height="32" rx="4" />
      <line x1="32" y1="16" x2="32" y2="48" />
      <line x1="12" y1="32" x2="52" y2="32" />
      <circle cx="32" cy="32" r="6" fill="currentColor" />
    </svg>
  ),
};

export type CalculatorIconName = keyof typeof CalculatorIcons;

export const CALCULATORS: CalculatorConfig[] = [
  {
    id: "propcalc",
    label: "propCalc",
    tag: "Airplane",
    description: "Propeller thrust, power, RPM, efficiency, flight time and partial-load analysis for fixed-wing RC aircraft.",
    status: "live",
    accent: "#ffc914",
    textColor: "#000",
    category: "airplane",
    metrics: ["Thrust", "Pitch Speed", "Stall Speed", "Flight Time"],
    // FIX: Store component function reference, not instantiated JSX element
    icon: CalculatorIcons.propcalc,
    inputCount: 21,
    outputCount: 24,
    popular: true,
  },
  {
    id: "xcoptercalc",
    label: "xcopterCalc",
    tag: "Multirotor",
    description: "Hover power, disc loading, TWR, flight time (hover / mixed / full) and throttle curve for multi-rotor drones.",
    status: "live",
    accent: "#ffc914",
    textColor: "#000",
    category: "multirotor",
    metrics: ["Hover RPM", "Flight Time", "TWR", "Range"],
    icon: CalculatorIcons.xcoptercalc,
    inputCount: 16,
    outputCount: 20,
    popular: true,
  },
  {
    id: "helicalc",
    label: "heliCalc",
    tag: "Helicopter",
    description: "Electric helicopter main & tail rotor RPM, torque, motor current, efficiency and collective pitch analysis.",
    status: "live",
    accent: "#22c55e",
    textColor: "#fff",
    category: "helicopter",
    metrics: ["Rotor RPM", "Torque", "Head Speed", "Collective"],
    icon: CalculatorIcons.helicalc,
    inputCount: 18,
    outputCount: 16,
  },
  {
    id: "fancalc",
    label: "fanCalc",
    tag: "EDF / Jet",
    description: "Ducted fan thrust, power and efficiency. Static and dynamic performance curves for EDF-powered jets.",
    status: "live",
    accent: "#3b82f6",
    textColor: "#fff",
    category: "edf-jet",
    metrics: ["Fan Thrust", "Fan RPM", "Efficiency", "Jet Velocity"],
    icon: CalculatorIcons.fancalc,
    inputCount: 20,
    outputCount: 15,
  },
  {
    id: "cgcalc",
    label: "cgCalc",
    tag: "CG / Stability",
    description: "Multi-component CG solver with moment arm inputs, neutral point and static stability margin analysis.",
    status: "live",
    accent: "#a855f7",
    textColor: "#fff",
    category: "analysis",
    metrics: ["CG Position", "Neutral Pt", "Stab Margin", "Moment"],
    icon: CalculatorIcons.cgcalc,
    inputCount: 12,
    outputCount: 8,
    popular: true,
  },
  {
    id: "setupfinder",
    label: "setupFinder",
    tag: "Prop Matcher",
    description: "Find optimal propeller for your motor and aircraft. Tests multiple props and ranks by thrust, efficiency and flight time.",
    status: "live",
    accent: "#22c55e",
    textColor: "#fff",
    category: "airplane",
    metrics: ["Best Prop", "Thrust Match", "Efficiency", "Score"],
    icon: CalculatorIcons.setupfinder,
    inputCount: 18,
    outputCount: 15,
    popular: true,
  },
  {
    id: "bladecalc",
    label: "bladeCalc",
    tag: "Prop Analysis",
    description: "Advanced propeller blade element analysis. Compare multiple propellers and view detailed performance maps.",
    status: "live",
    accent: "#06b6d4",
    textColor: "#fff",
    category: "analysis",
    metrics: ["Blade Load", "P-Factor", "Efficiency Map"],
    icon: CalculatorIcons.bladecalc,
    inputCount: 10,
    outputCount: 12,
  },
  {
    id: "wbcalc",
    label: "w&bCalc",
    tag: "Weight & Balance",
    description: "Aircraft weight and balance calculator with station-based component loading and CG envelope visualization.",
    status: "live",
    accent: "#f97316",
    textColor: "#fff",
    category: "analysis",
    metrics: ["Total Weight", "CG Arm", "Moment", "Envelope"],
    icon: CalculatorIcons.wbcalc,
    inputCount: 12,
    outputCount: 10,
  },
  {
    id: "perfcalc",
    label: "perfCalc",
    tag: "Performance",
    description: "Full aircraft performance analysis: power required, drag polar, range (Breguet), endurance and climb curves.",
    status: "live",
    accent: "#ef4444",
    textColor: "#fff",
    category: "performance",
    metrics: ["Range", "Endurance", "V-best", "Climb Rate"],
    icon: CalculatorIcons.perfcalc,
    inputCount: 16,
    outputCount: 18,
  },
];

// Category display labels
export const CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  "airplane": "Airplane",
  "multirotor": "Multirotor",
  "helicopter": "Helicopter",
  "edf-jet": "EDF / Jet",
  "analysis": "Analysis",
  "performance": "Performance",
};

// Helper functions
export function getCalculatorsByStatus(status: CalculatorStatus): CalculatorConfig[] {
  return CALCULATORS.filter(c => c.status === status);
}

export function getCalculatorsByCategory(category: CalculatorCategory): CalculatorConfig[] {
  return CALCULATORS.filter(c => c.category === category);
}

export function getCalculatorById(id: string): CalculatorConfig | undefined {
  return CALCULATORS.find(c => c.id === id);
}

export function getLiveCalculators(): CalculatorConfig[] {
  return CALCULATORS.filter(c => c.status === "live");
}

export function getPopularCalculators(): CalculatorConfig[] {
  return CALCULATORS.filter(c => c.popular);
}

export function searchCalculators(query: string): CalculatorConfig[] {
  const q = query.toLowerCase();
  return CALCULATORS.filter(c =>
    c.label.toLowerCase().includes(q) ||
    c.tag.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
}