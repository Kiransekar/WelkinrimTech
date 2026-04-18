// ── WelkinRim Drone Calculator ──────────────────────────────────────────────
// Base physics constants and helpers shared by all calculator engines

export const G           = 9.80665;   // m/s²
export const RHO_0       = 1.225;     // kg/m³  sea-level air density
export const T_0         = 288.15;    // K       sea-level ISA temp
export const P_0         = 101325;    // Pa      sea-level pressure

/**
 * Air density using the Standard Atmosphere exponential model.
 * rho(h) = rho0 * (1 - 2.2558e-5 * h)^4.2559
 * Falls back to user-supplied pressure when pressureHpa != 1013.25.
 */
export function airDensity(
  elevationM: number,
  temperatureC: number,
  pressureHpa: number,
): number {
  const T = temperatureC + 273.15;
  if (pressureHpa !== 1013.25) {
    return (pressureHpa * 100) / (287.05 * T);
  }
  const rho = RHO_0 * Math.pow(Math.max(0, 1 - 2.2558e-5 * elevationM), 4.2559);
  // Correct for non-standard temperature (density altitude adjustment)
  return rho * (T_0 / T);
}

/**
 * Dynamic thrust with altitude correction and headwind boost.
 * T(h) = T0 * (rho(h) / rho0)
 * T_wind = T(h) * sqrt(1 + (V_wind / V_induced)^2)
 * V_induced = sqrt(T0 / (2 * rho * diskAreaM2))
 */
export function dynamicThrust(
  staticThrustN: number,
  rho: number,
  windSpeedMs: number,
  diskAreaM2: number,
): number {
  const altCorrectedN = staticThrustN * (rho / RHO_0);
  if (windSpeedMs <= 0 || diskAreaM2 <= 0) return altCorrectedN;
  const vInduced = Math.sqrt(Math.max(0, staticThrustN / (2 * RHO_0 * diskAreaM2)));
  if (vInduced < 0.01) return altCorrectedN;
  const windFactor = Math.sqrt(1 + Math.pow(windSpeedMs / vInduced, 2));
  return altCorrectedN * windFactor;
}

export const rpmToRads  = (rpm: number) => (rpm * 2 * Math.PI) / 60;
export const radsToRpm  = (rads: number) => (rads * 60) / (2 * Math.PI);
export const wattsToHp  = (w: number) => w / 745.7;
export const kgToLbs    = (kg: number) => kg * 2.20462;
export const mToFt      = (m: number) => m * 3.28084;
export const inToM      = (inch: number) => inch * 0.0254;
export const kphToMph   = (kph: number) => kph * 0.621371;
