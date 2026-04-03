// ── WelkinRim Drone Calculator ──────────────────────────────────────────────
// Base physics constants and helpers shared by all calculator engines

export const G           = 9.80665;   // m/s²
export const RHO_0       = 1.225;     // kg/m³  sea-level air density
export const T_0         = 288.15;    // K       sea-level ISA temp
export const P_0         = 101325;    // Pa      sea-level pressure

/** Calculate air density using the International Standard Atmosphere model */
export function airDensity(
  elevationM: number,
  temperatureC: number,
  pressureHpa: number,
): number {
  const T = temperatureC + 273.15;                                 // K
  const P_elev = pressureHpa !== 1013.25
    ? pressureHpa * 100                                            // user-supplied Pa
    : P_0 * Math.pow(1 - 0.0065 * elevationM / T_0, 5.25588);    // ISA Pa
  return P_elev / (287.05 * T);                                    // kg/m³
}

export const rpmToRads  = (rpm: number) => (rpm * 2 * Math.PI) / 60;
export const radsToRpm  = (rads: number) => (rads * 60) / (2 * Math.PI);
export const wattsToHp  = (w: number) => w / 745.7;
export const kgToLbs    = (kg: number) => kg * 2.20462;
export const mToFt      = (m: number) => m * 3.28084;
export const inToM      = (inch: number) => inch * 0.0254;
export const kphToMph   = (kph: number) => kph * 0.621371;
