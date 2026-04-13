// src/data/escs.ts
// Welkinrim / Haemng ESC database — only our own ESCs are suggested

export interface ESC {
  id: string;
  brand: string;
  model: string;
  continuousA: number;
  burstA: number;
  minCells: number;
  maxCells: number;
  bec: boolean;
  weight: number; // grams
  protocols: string;
  application: "airplane" | "multicopter" | "both";
}

export const ESCS: ESC[] = [
  { id: "wr-f30-6s",     brand: "Welkinrim", model: "F30 6S",      continuousA: 30,  burstA: 35,  minCells: 3,  maxCells: 6,  bec: false, weight: 65,  protocols: "PWM", application: "both" },
  { id: "wr-e40v2-12s",  brand: "Welkinrim", model: "E40 V2 12S",  continuousA: 40,  burstA: 60,  minCells: 6,  maxCells: 12, bec: false, weight: 57,  protocols: "PWM", application: "both" },
  { id: "wr-e60-12s",    brand: "Welkinrim", model: "E60 12S",     continuousA: 60,  burstA: 72,  minCells: 6,  maxCells: 12, bec: false, weight: 108, protocols: "PWM", application: "both" },
  { id: "wr-e120-12s",   brand: "Welkinrim", model: "E120 12S",    continuousA: 120, burstA: 120, minCells: 6,  maxCells: 12, bec: false, weight: 215, protocols: "PWM", application: "both" },
  { id: "wr-f120a-12s",  brand: "Welkinrim", model: "F120A 12S",   continuousA: 150, burstA: 150, minCells: 6,  maxCells: 14, bec: false, weight: 248, protocols: "PWM", application: "both" },
  { id: "wr-e150-14s",   brand: "Welkinrim", model: "E150 14S",    continuousA: 150, burstA: 150, minCells: 6,  maxCells: 14, bec: false, weight: 357, protocols: "PWM", application: "both" },
  { id: "wr-e200-14s",   brand: "Welkinrim", model: "E200 14S",    continuousA: 200, burstA: 200, minCells: 6,  maxCells: 14, bec: false, weight: 320, protocols: "PWM", application: "both" },
  { id: "wr-eh200-24s",  brand: "Welkinrim", model: "EH200 24S",   continuousA: 200, burstA: 200, minCells: 12, maxCells: 24, bec: true,  weight: 725, protocols: "PWM", application: "both" },
  { id: "wr-e260-14s",   brand: "Welkinrim", model: "E260 14S",    continuousA: 260, burstA: 260, minCells: 6,  maxCells: 14, bec: true,  weight: 537, protocols: "PWM", application: "both" },
];

// Suggest ESCs compatible with a given motor's peak current and battery cells
export function suggestESCs(
  peakCurrentA: number,
  cells: number,
  application?: "airplane" | "multicopter" | "both"
): ESC[] {
  return ESCS
    .filter(e =>
      e.continuousA >= peakCurrentA * 0.8 &&         // ESC should handle at least 80% of peak
      e.minCells <= cells && e.maxCells >= cells &&   // voltage range match
      (application ? (e.application === application || e.application === "both") : true)
    )
    .sort((a, b) => {
      // Prefer ESCs closest to required current (not too oversized)
      const aMargin = a.continuousA - peakCurrentA;
      const bMargin = b.continuousA - peakCurrentA;
      return aMargin - bMargin;
    })
    .slice(0, 5);
}
