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
  | "performance"
  | "surface"
  | "industrial";

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

// Icon component for all calculators (standardized branding)
export const FaviconIcon = () => (
  <svg viewBox="635 234 604 508" fill="none" className="w-full h-full">
    <polygon fill="#FFC812" points="635.82,663.83 726.42,347.72 1009.67,347.72 917.63,663.17 "/>
    <polygon fill="currentColor" points="718.93,411.01 660.91,611.87 928.93,611.65 987.19,411.88 928.45,411.88 886.12,561.76 838.56,561.76 881.6,411.66 
      825.24,411.66 781.24,559.8 732.01,559.8 776.01,411.66 "/>
    <polygon fill="#FFC812" points="915.49,663.83 1040.34,234 1049.86,234 925.24,664.05 "/>
    <polygon fill="currentColor" points="966.74,607.95 1021.44,607.95 1064.96,462.42 1224.54,462.42 1238.8,411.23 1028.62,411.23 "/>
    <polygon fill="#FFC812" points="923.58,741.17 1019.42,411.55 1028.93,411.55 933.33,741.38 "/>
  </svg>
);

export const CALCULATORS: CalculatorConfig[] = [
  {
    id: "propcalc",
    label: "propCalc",
    tag: "Airplane",
    description: "Propeller thrust, power, RPM, efficiency, flight time and partial-load analysis for fixed-wing RC aircraft.",
    status: "live",
    accent: "#ffc812",
    textColor: "#000",
    category: "airplane",
    metrics: ["Thrust", "Pitch Speed", "Stall Speed", "Flight Time"],
    icon: FaviconIcon,
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
    accent: "#ffc812",
    textColor: "#000",
    category: "multirotor",
    metrics: ["Hover RPM", "Flight Time", "TWR", "Range"],
    icon: FaviconIcon,
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
    accent: "#ffc812",
    textColor: "#000",
    category: "helicopter",
    metrics: ["Rotor RPM", "Torque", "Head Speed", "Collective"],
    icon: FaviconIcon,
    inputCount: 18,
    outputCount: 16,
  },
  {
    id: "fancalc",
    label: "fanCalc",
    tag: "EDF / Jet",
    description: "Ducted fan thrust, power and efficiency. Static and dynamic performance curves for EDF-powered jets.",
    status: "live",
    accent: "#ffc812",
    textColor: "#000",
    category: "edf-jet",
    metrics: ["Fan Thrust", "Fan RPM", "Efficiency", "Jet Velocity"],
    icon: FaviconIcon,
    inputCount: 20,
    outputCount: 15,
  },
  {
    id: "cgcalc",
    label: "cgCalc",
    tag: "CG / Stability",
    description: "Multi-component CG solver with moment arm inputs, neutral point and static stability margin analysis.",
    status: "live",
    accent: "#ffc812",
    textColor: "#000",
    category: "analysis",
    metrics: ["CG Position", "Neutral Pt", "Stab Margin", "Moment"],
    icon: FaviconIcon,
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
    accent: "#ffc812",
    textColor: "#000",
    category: "airplane",
    metrics: ["Best Prop", "Thrust Match", "Efficiency", "Score"],
    icon: FaviconIcon,
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
    accent: "#ffc812",
    textColor: "#000",
    category: "analysis",
    metrics: ["Blade Load", "P-Factor", "Efficiency Map"],
    icon: FaviconIcon,
    inputCount: 10,
    outputCount: 12,
  },
  {
    id: "wbcalc",
    label: "w&bCalc",
    tag: "Weight & Balance",
    description: "Aircraft weight and balance calculator with station-based component loading and CG envelope visualization.",
    status: "live",
    accent: "#ffc812",
    textColor: "#000",
    category: "analysis",
    metrics: ["Total Weight", "CG Arm", "Moment", "Envelope"],
    icon: FaviconIcon,
    inputCount: 12,
    outputCount: 10,
  },
  {
    id: "perfcalc",
    label: "perfCalc",
    tag: "Performance",
    description: "Full aircraft performance analysis: power required, drag polar, range (Breguet), endurance and climb curves.",
    status: "live",
    accent: "#ffc812",
    textColor: "#000",
    category: "performance",
    metrics: ["Range", "Endurance", "V-best", "Climb Rate"],
    icon: FaviconIcon,
    inputCount: 16,
    outputCount: 18,
  },
  {
    id: "torquecalc",
    label: "torqueCalc",
    tag: "Industrial",
    description: "Industrial motor finder. Iterative BLDC motor model isolating required torque, RPM, and motor thermal resistance limits.",
    status: "live",
    accent: "#ffc812",
    textColor: "#000",
    category: "industrial",
    metrics: ["Torque", "Achievable RPM", "Req. Voltage", "Efficiency"],
    icon: FaviconIcon,
    inputCount: 14,
    outputCount: 8,
  },
  {
    id: "carcalc",
    label: "carCalc",
    tag: "RC Cars",
    description: "RC Car physics model factoring transmission rollout, Rolling Resistance, Drag, and Acceleration force limits.",
    status: "live",
    accent: "#ffc812",
    textColor: "#000",
    category: "surface",
    metrics: ["Top Speed", "Rollout", "Drive Time", "Accel Power"],
    icon: FaviconIcon,
    inputCount: 15,
    outputCount: 12,
  },
  {
    id: "evcalc",
    label: "evCalc",
    tag: "EV Range & Charge",
    description: "Electric Vehicle Range and Charging simulation. Models Aero and Drag loads, Elevation gradient energy, and Battery charging curves.",
    status: "live",
    accent: "#ffc812",
    textColor: "#000",
    category: "surface",
    metrics: ["Consumption", "Range", "Charge Time", "Aero Load"],
    icon: FaviconIcon,
    inputCount: 15,
    outputCount: 8,
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
  "surface": "Surface / Cars",
  "industrial": "Industrial",
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