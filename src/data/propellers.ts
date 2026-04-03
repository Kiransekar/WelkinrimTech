// src/data/propellers.ts
// Propeller database with CT/CP coefficients for eCalc-style calculations

export interface Propeller {
  id: string;
  brand: string;
  model: string;
  diameterInch: number;
  pitchInch: number;
  blades: number;
  ct: number;      // Thrust coefficient
  cp: number;      // Power coefficient
  efficiency: number; // Peak efficiency (0-1)
  type: "prop" | "fold" | "carbon" | "wood";
  application: "airplane" | "multicopter" | "both";
}

// Coefficients based on APC, Graupner, T-Motor datasheets and eCalc reference values
// CT and CP are for 10x4.7 style prop at typical RC RPM (6000-12000)
export const PROPELLERS: Propeller[] = [
  // ─────────────────────────────────────────────────────────────
  // APC Propellers (most common, well-documented)
  // ─────────────────────────────────────────────────────────────
  { id: "apc-1047", brand: "APC", model: "10×4.7", diameterInch: 10, pitchInch: 4.7, blades: 2, ct: 0.11, cp: 0.045, efficiency: 0.72, type: "prop", application: "both" },
  { id: "apc-1147", brand: "APC", model: "11×4.7", diameterInch: 11, pitchInch: 4.7, blades: 2, ct: 0.115, cp: 0.048, efficiency: 0.73, type: "prop", application: "airplane" },
  { id: "apc-1238", brand: "APC", model: "12×3.8", diameterInch: 12, pitchInch: 3.8, blades: 2, ct: 0.12, cp: 0.042, efficiency: 0.75, type: "prop", application: "multicopter" },
  { id: "apc-1260", brand: "APC", model: "12×6.0", diameterInch: 12, pitchInch: 6, blades: 2, ct: 0.11, cp: 0.052, efficiency: 0.70, type: "prop", application: "airplane" },
  { id: "apc-1340", brand: "APC", model: "13×4.0", diameterInch: 13, pitchInch: 4, blades: 2, ct: 0.125, cp: 0.045, efficiency: 0.76, type: "prop", application: "multicopter" },
  { id: "apc-1365", brand: "APC", model: "13×6.5", diameterInch: 13, pitchInch: 6.5, blades: 2, ct: 0.115, cp: 0.055, efficiency: 0.71, type: "prop", application: "airplane" },
  { id: "apc-1440", brand: "APC", model: "14×4.0", diameterInch: 14, pitchInch: 4, blades: 2, ct: 0.13, cp: 0.048, efficiency: 0.77, type: "prop", application: "multicopter" },
  { id: "apc-1470", brand: "APC", model: "14×7.0", diameterInch: 14, pitchInch: 7, blades: 2, ct: 0.12, cp: 0.058, efficiency: 0.69, type: "prop", application: "airplane" },
  { id: "apc-1550", brand: "APC", model: "15×5.0", diameterInch: 15, pitchInch: 5, blades: 2, ct: 0.135, cp: 0.052, efficiency: 0.75, type: "prop", application: "multicopter" },
  { id: "apc-1655", brand: "APC", model: "16×5.5", diameterInch: 16, pitchInch: 5.5, blades: 2, ct: 0.14, cp: 0.055, efficiency: 0.74, type: "prop", application: "multicopter" },
  { id: "apc-1755", brand: "APC", model: "17×5.5", diameterInch: 17, pitchInch: 5.5, blades: 2, ct: 0.145, cp: 0.058, efficiency: 0.73, type: "prop", application: "multicopter" },
  { id: "apc-1855", brand: "APC", model: "18×5.5", diameterInch: 18, pitchInch: 5.5, blades: 2, ct: 0.15, cp: 0.062, efficiency: 0.72, type: "prop", application: "multicopter" },
  { id: "apc-1880", brand: "APC", model: "18×8.0", diameterInch: 18, pitchInch: 8, blades: 2, ct: 0.13, cp: 0.072, efficiency: 0.68, type: "prop", application: "airplane" },
  { id: "apc-1980", brand: "APC", model: "19×8.0", diameterInch: 19, pitchInch: 8, blades: 2, ct: 0.135, cp: 0.075, efficiency: 0.67, type: "prop", application: "airplane" },
  { id: "apc-2080", brand: "APC", model: "20×8.0", diameterInch: 20, pitchInch: 8, blades: 2, ct: 0.14, cp: 0.078, efficiency: 0.66, type: "prop", application: "airplane" },
  { id: "apc-2170", brand: "APC", model: "21×7.0", diameterInch: 21, pitchInch: 7, blades: 2, ct: 0.155, cp: 0.072, efficiency: 0.70, type: "prop", application: "multicopter" },
  { id: "apc-2260", brand: "APC", model: "22×6.0", diameterInch: 22, pitchInch: 6, blades: 2, ct: 0.16, cp: 0.068, efficiency: 0.72, type: "prop", application: "multicopter" },
  { id: "apc-2460", brand: "APC", model: "24×6.0", diameterInch: 24, pitchInch: 6, blades: 2, ct: 0.165, cp: 0.072, efficiency: 0.71, type: "prop", application: "multicopter" },
  { id: "apc-2480", brand: "APC", model: "24×8.0", diameterInch: 24, pitchInch: 8, blades: 2, ct: 0.15, cp: 0.082, efficiency: 0.68, type: "prop", application: "airplane" },
  { id: "apc-2660", brand: "APC", model: "26×6.0", diameterInch: 26, pitchInch: 6, blades: 2, ct: 0.17, cp: 0.075, efficiency: 0.70, type: "prop", application: "multicopter" },
  { id: "apc-2860", brand: "APC", model: "28×6.0", diameterInch: 28, pitchInch: 6, blades: 2, ct: 0.175, cp: 0.078, efficiency: 0.69, type: "prop", application: "multicopter" },
  { id: "apc-2890", brand: "APC", model: "28×9.0", diameterInch: 28, pitchInch: 9, blades: 2, ct: 0.155, cp: 0.088, efficiency: 0.65, type: "prop", application: "airplane" },
  { id: "apc-3060", brand: "APC", model: "30×6.0", diameterInch: 30, pitchInch: 6, blades: 2, ct: 0.18, cp: 0.082, efficiency: 0.68, type: "prop", application: "multicopter" },
  { id: "apc-3010", brand: "APC", model: "30×10.0", diameterInch: 30, pitchInch: 10, blades: 2, ct: 0.16, cp: 0.092, efficiency: 0.64, type: "prop", application: "airplane" },
  { id: "apc-3260", brand: "APC", model: "32×6.0", diameterInch: 32, pitchInch: 6, blades: 2, ct: 0.185, cp: 0.085, efficiency: 0.67, type: "prop", application: "multicopter" },
  { id: "apc-3410", brand: "APC", model: "34×10.0", diameterInch: 34, pitchInch: 10, blades: 2, ct: 0.165, cp: 0.098, efficiency: 0.62, type: "prop", application: "airplane" },
  { id: "apc-3612", brand: "APC", model: "36×12.0", diameterInch: 36, pitchInch: 12, blades: 2, ct: 0.17, cp: 0.105, efficiency: 0.60, type: "prop", application: "airplane" },
  { id: "apc-4013", brand: "APC", model: "40×13.0", diameterInch: 40, pitchInch: 13, blades: 2, ct: 0.175, cp: 0.115, efficiency: 0.58, type: "prop", application: "airplane" },
  { id: "apc-4220", brand: "APC", model: "42×20.0", diameterInch: 42, pitchInch: 20, blades: 2, ct: 0.155, cp: 0.135, efficiency: 0.52, type: "prop", application: "airplane" },
  { id: "apc-4420", brand: "APC", model: "44×20.0", diameterInch: 44, pitchInch: 20, blades: 2, ct: 0.16, cp: 0.14, efficiency: 0.50, type: "prop", application: "airplane" },
  { id: "apc-4817", brand: "APC", model: "48×17.0", diameterInch: 48, pitchInch: 17, blades: 2, ct: 0.18, cp: 0.125, efficiency: 0.55, type: "prop", application: "multicopter" },

  // ─────────────────────────────────────────────────────────────
  // T-Motor Propellers (carbon fiber, high performance)
  // ─────────────────────────────────────────────────────────────
  { id: "tm-1240", brand: "T-Motor", model: "12×4.0 CF", diameterInch: 12, pitchInch: 4, blades: 2, ct: 0.125, cp: 0.048, efficiency: 0.78, type: "carbon", application: "multicopter" },
  { id: "tm-1345", brand: "T-Motor", model: "13×4.5 CF", diameterInch: 13, pitchInch: 4.5, blades: 2, ct: 0.13, cp: 0.05, efficiency: 0.77, type: "carbon", application: "multicopter" },
  { id: "tm-1445", brand: "T-Motor", model: "14×4.5 CF", diameterInch: 14, pitchInch: 4.5, blades: 2, ct: 0.135, cp: 0.052, efficiency: 0.76, type: "carbon", application: "multicopter" },
  { id: "tm-1550", brand: "T-Motor", model: "15×5.0 CF", diameterInch: 15, pitchInch: 5, blades: 2, ct: 0.14, cp: 0.055, efficiency: 0.75, type: "carbon", application: "multicopter" },
  { id: "tm-1655", brand: "T-Motor", model: "16×5.5 CF", diameterInch: 16, pitchInch: 5.5, blades: 2, ct: 0.145, cp: 0.058, efficiency: 0.74, type: "carbon", application: "multicopter" },
  { id: "tm-1755", brand: "T-Motor", model: "17×5.5 CF", diameterInch: 17, pitchInch: 5.5, blades: 2, ct: 0.15, cp: 0.062, efficiency: 0.73, type: "carbon", application: "multicopter" },
  { id: "tm-1855", brand: "T-Motor", model: "18×5.5 CF", diameterInch: 18, pitchInch: 5.5, blades: 2, ct: 0.155, cp: 0.065, efficiency: 0.72, type: "carbon", application: "multicopter" },
  { id: "tm-1870", brand: "T-Motor", model: "18×7.0 CF", diameterInch: 18, pitchInch: 7, blades: 2, ct: 0.14, cp: 0.072, efficiency: 0.68, type: "carbon", application: "airplane" },
  { id: "tm-2060", brand: "T-Motor", model: "20×6.0 CF", diameterInch: 20, pitchInch: 6, blades: 2, ct: 0.16, cp: 0.068, efficiency: 0.71, type: "carbon", application: "multicopter" },
  { id: "tm-2170", brand: "T-Motor", model: "21×7.0 CF", diameterInch: 21, pitchInch: 7, blades: 2, ct: 0.165, cp: 0.075, efficiency: 0.69, type: "carbon", application: "multicopter" },
  { id: "tm-2260", brand: "T-Motor", model: "22×6.0 CF", diameterInch: 22, pitchInch: 6, blades: 2, ct: 0.17, cp: 0.072, efficiency: 0.70, type: "carbon", application: "multicopter" },
  { id: "tm-2460", brand: "T-Motor", model: "24×6.0 CF", diameterInch: 24, pitchInch: 6, blades: 2, ct: 0.175, cp: 0.078, efficiency: 0.68, type: "carbon", application: "multicopter" },
  { id: "tm-2480", brand: "T-Motor", model: "24×8.0 CF", diameterInch: 24, pitchInch: 8, blades: 2, ct: 0.16, cp: 0.088, efficiency: 0.64, type: "carbon", application: "airplane" },
  { id: "tm-2660", brand: "T-Motor", model: "26×6.0 CF", diameterInch: 26, pitchInch: 6, blades: 2, ct: 0.18, cp: 0.082, efficiency: 0.66, type: "carbon", application: "multicopter" },
  { id: "tm-2890", brand: "T-Motor", model: "28×9.0 CF", diameterInch: 28, pitchInch: 9, blades: 2, ct: 0.165, cp: 0.095, efficiency: 0.62, type: "carbon", application: "airplane" },
  { id: "tm-3010", brand: "T-Motor", model: "30×10.0 CF", diameterInch: 30, pitchInch: 10, blades: 2, ct: 0.17, cp: 0.102, efficiency: 0.60, type: "carbon", application: "airplane" },
  { id: "tm-4013", brand: "T-Motor", model: "40×13.0 CF", diameterInch: 40, pitchInch: 13, blades: 2, ct: 0.185, cp: 0.12, efficiency: 0.55, type: "carbon", application: "airplane" },

  // ─────────────────────────────────────────────────────────────
  // Master Airscrew (MAS) - Popular for larger props
  // ─────────────────────────────────────────────────────────────
  { id: "mas-1060", brand: "MAS", model: "10×6.0", diameterInch: 10, pitchInch: 6, blades: 2, ct: 0.115, cp: 0.052, efficiency: 0.68, type: "prop", application: "airplane" },
  { id: "mas-1175", brand: "MAS", model: "11×7.5", diameterInch: 11, pitchInch: 7.5, blades: 2, ct: 0.11, cp: 0.058, efficiency: 0.65, type: "prop", application: "airplane" },
  { id: "mas-1275", brand: "MAS", model: "12×7.5", diameterInch: 12, pitchInch: 7.5, blades: 2, ct: 0.115, cp: 0.062, efficiency: 0.63, type: "prop", application: "airplane" },
  { id: "mas-1365", brand: "MAS", model: "13×6.5", diameterInch: 13, pitchInch: 6.5, blades: 2, ct: 0.125, cp: 0.058, efficiency: 0.67, type: "prop", application: "airplane" },
  { id: "mas-1470", brand: "MAS", model: "14×7.0", diameterInch: 14, pitchInch: 7, blades: 2, ct: 0.13, cp: 0.062, efficiency: 0.65, type: "prop", application: "airplane" },

  // ─────────────────────────────────────────────────────────────
  // Gemfan (Popular for multicopters)
  // ─────────────────────────────────────────────────────────────
  { id: "gf-5040", brand: "Gemfan", model: "5×4.0", diameterInch: 5, pitchInch: 4, blades: 2, ct: 0.085, cp: 0.035, efficiency: 0.68, type: "prop", application: "multicopter" },
  { id: "gf-5043", brand: "Gemfan", model: "5×4.3", diameterInch: 5, pitchInch: 4.3, blades: 3, ct: 0.09, cp: 0.042, efficiency: 0.65, type: "prop", application: "multicopter" },
  { id: "gf-6045", brand: "Gemfan", model: "6×4.5", diameterInch: 6, pitchInch: 4.5, blades: 2, ct: 0.09, cp: 0.038, efficiency: 0.67, type: "prop", application: "multicopter" },
  { id: "gf-7040", brand: "Gemfan", model: "7×4.0", diameterInch: 7, pitchInch: 4, blades: 2, ct: 0.095, cp: 0.04, efficiency: 0.68, type: "prop", application: "multicopter" },
  { id: "gf-8045", brand: "Gemfan", model: "8×4.5", diameterInch: 8, pitchInch: 4.5, blades: 2, ct: 0.1, cp: 0.042, efficiency: 0.69, type: "prop", application: "multicopter" },
  { id: "gf-9050", brand: "Gemfan", model: "9×5.0", diameterInch: 9, pitchInch: 5, blades: 2, ct: 0.105, cp: 0.045, efficiency: 0.68, type: "prop", application: "multicopter" },
  { id: "gf-1045", brand: "Gemfan", model: "10×4.5", diameterInch: 10, pitchInch: 4.5, blades: 3, ct: 0.12, cp: 0.052, efficiency: 0.65, type: "prop", application: "multicopter" },
  { id: "gf-1145", brand: "Gemfan", model: "11×4.5", diameterInch: 11, pitchInch: 4.5, blades: 3, ct: 0.125, cp: 0.055, efficiency: 0.64, type: "prop", application: "multicopter" },

  // ─────────────────────────────────────────────────────────────
  // HQ Prop (Racing and freestyle)
  // ─────────────────────────────────────────────────────────────
  { id: "hq-5040", brand: "HQ Prop", model: "5×4.0 V2S", diameterInch: 5, pitchInch: 4, blades: 2, ct: 0.088, cp: 0.036, efficiency: 0.67, type: "prop", application: "multicopter" },
  { id: "hq-5043", brand: "HQ Prop", model: "5×4.3 V2S", diameterInch: 5, pitchInch: 4.3, blades: 3, ct: 0.092, cp: 0.044, efficiency: 0.64, type: "prop", application: "multicopter" },
  { id: "hq-6045", brand: "HQ Prop", model: "6×4.5 V2S", diameterInch: 6, pitchInch: 4.5, blades: 2, ct: 0.093, cp: 0.04, efficiency: 0.66, type: "prop", application: "multicopter" },
  { id: "hq-7035", brand: "HQ Prop", model: "7×3.5", diameterInch: 7, pitchInch: 3.5, blades: 3, ct: 0.105, cp: 0.045, efficiency: 0.65, type: "prop", application: "multicopter" },
  { id: "hq-8040", brand: "HQ Prop", model: "8×4.0", diameterInch: 8, pitchInch: 4, blades: 3, ct: 0.108, cp: 0.048, efficiency: 0.64, type: "prop", application: "multicopter" },
  { id: "hq-9050", brand: "HQ Prop", model: "9×5.0", diameterInch: 9, pitchInch: 5, blades: 2, ct: 0.108, cp: 0.046, efficiency: 0.67, type: "prop", application: "multicopter" },

  // ─────────────────────────────────────────────────────────────
  // Folding Props (for larger aircraft)
  // ─────────────────────────────────────────────────────────────
  { id: "fp-1680", brand: "CAM Carbon", model: "16×8.0 Fold", diameterInch: 16, pitchInch: 8, blades: 2, ct: 0.125, cp: 0.065, efficiency: 0.72, type: "fold", application: "airplane" },
  { id: "fp-1880", brand: "CAM Carbon", model: "18×8.0 Fold", diameterInch: 18, pitchInch: 8, blades: 2, ct: 0.13, cp: 0.07, efficiency: 0.7, type: "fold", application: "airplane" },
  { id: "fp-2080", brand: "CAM Carbon", model: "20×8.0 Fold", diameterInch: 20, pitchInch: 8, blades: 2, ct: 0.135, cp: 0.075, efficiency: 0.68, type: "fold", application: "airplane" },
  { id: "fp-2280", brand: "CAM Carbon", model: "22×8.0 Fold", diameterInch: 22, pitchInch: 8, blades: 2, ct: 0.14, cp: 0.08, efficiency: 0.66, type: "fold", application: "airplane" },
  { id: "fp-2480", brand: "CAM Carbon", model: "24×8.0 Fold", diameterInch: 24, pitchInch: 8, blades: 2, ct: 0.145, cp: 0.085, efficiency: 0.64, type: "fold", application: "airplane" },
  { id: "fp-2680", brand: "CAM Carbon", model: "26×8.0 Fold", diameterInch: 26, pitchInch: 8, blades: 2, ct: 0.15, cp: 0.09, efficiency: 0.62, type: "fold", application: "airplane" },
  { id: "fp-2880", brand: "CAM Carbon", model: "28×8.0 Fold", diameterInch: 28, pitchInch: 8, blades: 2, ct: 0.155, cp: 0.095, efficiency: 0.6, type: "fold", application: "airplane" },
  { id: "fp-3010", brand: "CAM Carbon", model: "30×10.0 Fold", diameterInch: 30, pitchInch: 10, blades: 2, ct: 0.16, cp: 0.105, efficiency: 0.58, type: "fold", application: "airplane" },
];

// Helper functions
export function getPropellerById(id: string): Propeller | null {
  return PROPELLERS.find(p => p.id === id) || null;
}

export function getPropellersByApplication(app: "airplane" | "multicopter" | "both"): Propeller[] {
  if (app === "both") return PROPELLERS;
  return PROPELLERS.filter(p => p.application === app || p.application === "both");
}

export function searchPropellers(query: string): Propeller[] {
  const q = query.toLowerCase();
  return PROPELLERS.filter(p =>
    p.brand.toLowerCase().includes(q) ||
    p.model.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q)
  );
}

export function getPropellerRange(diameterMin: number, diameterMax: number): Propeller[] {
  return PROPELLERS.filter(p => p.diameterInch >= diameterMin && p.diameterInch <= diameterMax);
}
