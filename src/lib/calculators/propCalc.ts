import { airDensity, G, inToM, kphToMph } from "./baseCalc";

export interface PropCalcInput {
  // General
  modelWeightG: number;
  numMotors: number;
  wingAreaDm2: number;
  dragCoefficient: number;
  // Environment
  elevationM: number;
  temperatureC: number;
  pressureHpa: number;
  // Battery
  batteryCells: number;
  batteryCapacityMah: number;
  batteryMaxDischarge: number; // 0–1
  batteryResistanceMohm: number;
  // Motor
  motorKv: number;
  motorIo: number;        // no-load current A
  motorRmMohm: number;    // winding resistance mΩ
  motorMaxPowerW: number;
  // Propeller
  propDiameterInch: number;
  propPitchInch: number;
  propBlades: number;
  pconst: number;
  tconst: number;
  ct: number;
  cp: number;
}

export interface PartialLoadRow {
  throttlePercent: number;
  rpm: number;
  currentA: number;
  voltageV: number;
  powerW: number;
  efficiencyPercent: number;
  thrustG: number;
  specificThrustGW: number;
}

export interface DynamicLoadRow {
  throttlePercent: number;
  rpm: number;
  speedKmh: number;
  currentA: number;
  powerW: number;
  thrustG: number;
  energyWhKm: number;
}

export interface PropCalcResult {
  battery: {
    loadC: number;
    voltageV: number;
    energyWh: number;
    capacityMah: number;
    flightTimeMin: number;
  };
  motorOptimum: {
    currentA: number;
    voltageV: number;
    rpm: number;
    electricPowerW: number;
    mechanicalPowerW: number;
    efficiencyPercent: number;
  };
  motorMaximum: {
    currentA: number;
    voltageV: number;
    rpm: number;
    electricPowerW: number;
    mechanicalPowerW: number;
    efficiencyPercent: number;
    temperatureC: number;
    temperatureF: number;
  };
  propeller: {
    staticThrustG: number;
    staticThrustOz: number;
    rpm: number;
    pitchSpeedKmh: number;
    pitchSpeedMph: number;
    specificThrustGW: number;
  };
  totalDrive: {
    powerWeightWKg: number;
    thrustWeightRatio: number;
    currentA: number;
    efficiencyPercent: number;
  };
  airplane: {
    allUpWeightG: number;
    wingLoadingGdm2: number;
    stallSpeedKmh: number;
    maxSpeedKmh: number;
    climbRateMs: number;
  };
  environment: {
    airDensityKgm3: number;
    elevationM: number;
    temperatureC: number;
  };
  partialLoadStatic: PartialLoadRow[];
  partialLoadDynamic: DynamicLoadRow[];
}

export function calcProp(p: PropCalcInput): PropCalcResult {
  const rho = airDensity(p.elevationM, p.temperatureC, p.pressureHpa);

  const modelWeightKg   = p.modelWeightG / 1000;
  const propDiamM       = inToM(p.propDiameterInch);
  const propPitchM      = inToM(p.propPitchInch);
  const wingAreaM2      = p.wingAreaDm2 / 100;

  const battVoltNominal = p.batteryCells * 3.7;
  const battResOhm      = (p.batteryResistanceMohm / 1000) * p.batteryCells;
  const motorRmOhm      = p.motorRmMohm / 1000;

  const ct = p.ct * p.tconst;
  const cp = p.cp * p.pconst;

  // ── Iterative convergence ─────────────────────────────────────────────────
  let rpm = p.motorKv * battVoltNominal * 0.8;

  for (let i = 0; i < 15; i++) {
    const nRps         = rpm / 60;
    const powerPropW   = cp * rho * Math.pow(nRps, 3) * Math.pow(propDiamM, 5);
    const currentEst   = Math.max(0, powerPropW / Math.max(battVoltNominal, 1) + p.motorIo);
    const voltageSag   = currentEst * battResOhm;
    const voltAtMotor  = Math.max(1, battVoltNominal - voltageSag);          // clamp > 1V
    const rpmLoaded    = p.motorKv * voltAtMotor
                         - Math.max(0, currentEst - p.motorIo) * motorRmOhm * p.motorKv * 60 / (2 * Math.PI);
    const rpmClamped   = Math.max(0, rpmLoaded);
    if (Math.abs(rpmClamped - rpm) < 5) { rpm = rpmClamped; break; }
    rpm = rpmClamped;
  }

  // ── Final values ──────────────────────────────────────────────────────────
  const nRps           = rpm / 60;
  const thrustN        = ct  * rho * Math.pow(nRps, 2) * Math.pow(propDiamM, 4);
  const thrustG        = (thrustN / G) * 1000;
  const thrustOz       = thrustG / 28.3495;
  const powerPropW     = cp  * rho * Math.pow(nRps, 3) * Math.pow(propDiamM, 5);
  const currentMotor   = powerPropW / battVoltNominal + p.motorIo;
  const voltageSag     = currentMotor * battResOhm;
  const voltAtMotor    = battVoltNominal - voltageSag;
  const electricPowerW = voltAtMotor * currentMotor;
  const motorEff       = electricPowerW > 0 ? (powerPropW / electricPowerW) * 100 : 0;

  const diskArea       = Math.PI * Math.pow(propDiamM / 2, 2);
  const propEffStatic  = powerPropW > 0
    ? (Math.pow(thrustN, 1.5) / (powerPropW * Math.sqrt(2 * rho * diskArea))) * 100
    : 0;

  const pitchSpeedMps  = propPitchM * nRps;
  const pitchSpeedKmh  = pitchSpeedMps * 3.6;

  const usableCapAh    = (p.batteryCapacityMah / 1000) * p.batteryMaxDischarge;
  const flightTimeMin  = currentMotor > 0 ? (usableCapAh / currentMotor) * 60 : 0;
  const loadC          = currentMotor / (p.batteryCapacityMah / 1000);
  const twr            = thrustG * p.numMotors > 0 ? (thrustG * p.numMotors) / p.modelWeightG : 0;
  const pwrWKg         = (powerPropW * p.numMotors) / modelWeightKg;

  const wingLoadingGdm2 = p.wingAreaDm2 > 0 ? p.modelWeightG / p.wingAreaDm2 : 0;
  const clMax           = 1.2;
  const stallSpeedMs    = p.wingAreaDm2 > 0
    ? Math.sqrt((2 * modelWeightKg * G) / (rho * wingAreaM2 * clMax))
    : 0;
  const stallSpeedKmh   = stallSpeedMs * 3.6;
  const maxSpeedKmh     = pitchSpeedKmh * 0.85;

  const powerLossW      = electricPowerW - powerPropW;
  const tempRiseC       = powerLossW * 2.5;
  const estTempC        = p.temperatureC + tempRiseC;
  const climbRateMs     = pwrWKg > 150 ? (pwrWKg - 150) / 10 : 0;

  // ── Optimum point (70% load approximation) ────────────────────────────────
  const motorOptimum = {
    currentA:         currentMotor * 0.70,
    voltageV:         voltAtMotor,
    rpm:              rpm * 0.85,
    electricPowerW:   electricPowerW * 0.70,
    mechanicalPowerW: powerPropW * 0.70,
    efficiencyPercent: Math.min(motorEff * 1.05, 99),
  };

  // ── Partial load tables ───────────────────────────────────────────────────
  const throttlePoints = [0, 0.15, 0.30, 0.45, 0.60, 0.75, 0.85, 1.00];

  const partialLoadStatic: PartialLoadRow[] = throttlePoints.map(t => {
    const thrustPartial  = thrustG * t;
    const currentPartial = currentMotor * t;
    const powerPartial   = electricPowerW * t;
    return {
      throttlePercent:    t * 100,
      rpm:                rpm * Math.sqrt(t),
      currentA:           currentPartial,
      voltageV:           voltAtMotor,
      powerW:             powerPartial,
      efficiencyPercent:  motorEff * (0.7 + 0.3 * t),
      thrustG:            thrustPartial,
      specificThrustGW:   powerPartial > 0 ? thrustPartial / powerPartial : 0,
    };
  });

  const partialLoadDynamic: DynamicLoadRow[] = throttlePoints.map(t => {
    const currentPartial = currentMotor * t * 0.9;
    const powerPartial   = electricPowerW * t * 0.9;
    const speedKmh       = maxSpeedKmh * t * 0.8;
    return {
      throttlePercent: t * 100,
      rpm:             rpm * Math.sqrt(t),
      speedKmh,
      currentA:        currentPartial,
      powerW:          powerPartial,
      thrustG:         thrustG * t * 0.85,
      energyWhKm:      speedKmh > 0 ? powerPartial / speedKmh : 0,
    };
  });

  return {
    battery: {
      loadC,
      voltageV:       voltAtMotor,
      energyWh:       battVoltNominal * (p.batteryCapacityMah / 1000),
      capacityMah:    p.batteryCapacityMah,
      flightTimeMin,
    },
    motorOptimum,
    motorMaximum: {
      currentA:         currentMotor,
      voltageV:         voltAtMotor,
      rpm,
      electricPowerW,
      mechanicalPowerW: powerPropW,
      efficiencyPercent: motorEff,
      temperatureC:     estTempC,
      temperatureF:     estTempC * 9 / 5 + 32,
    },
    propeller: {
      staticThrustG:   thrustG,
      staticThrustOz:  thrustOz,
      rpm,
      pitchSpeedKmh,
      pitchSpeedMph:   kphToMph(pitchSpeedKmh),
      specificThrustGW: powerPropW > 0 ? thrustG / powerPropW : 0,
    },
    totalDrive: {
      powerWeightWKg:     pwrWKg,
      thrustWeightRatio:  twr,
      currentA:           currentMotor * p.numMotors,
      efficiencyPercent:  motorEff * propEffStatic / 100,
    },
    airplane: {
      allUpWeightG:    p.modelWeightG,
      wingLoadingGdm2,
      stallSpeedKmh,
      maxSpeedKmh,
      climbRateMs,
    },
    environment: {
      airDensityKgm3: rho,
      elevationM:     p.elevationM,
      temperatureC:   p.temperatureC,
    },
    partialLoadStatic,
    partialLoadDynamic,
  };
}
