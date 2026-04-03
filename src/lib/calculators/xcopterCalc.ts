import { airDensity, G, inToM } from "./baseCalc";

export interface XcopterCalcInput {
  // Multirotor setup
  numRotors: number;
  auwG: number;           // all-up weight grams
  payloadG: number;
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
  motorIo: number;
  motorRmMohm: number;
  motorMaxCurrentA: number;
  // Propeller
  propDiameterInch: number;
  propPitchInch: number;
  ct: number;
  cp: number;
}

export interface XcopterCalcResult {
  hover: {
    currentA: number;
    voltageV: number;
    discLoadingNm2: number;
    powerW: number;
    efficiencyPercent: number;
    throttlePercent: number;
    rpm: number;
  };
  maximum: {
    currentA: number;
    rpm: number;
    thrustG: number;
    thrustOz: number;
    temperatureC: number;
    efficiencyPercent: number;
  };
  flightTime: {
    hoverMin: number;
    mixedMin: number;
    fullThrottleMin: number;
  };
  performance: {
    thrustWeightRatio: number;
    specificThrustGW: number;
    totalThrustG: number;
    estimatedRangeKm: number;
  };
  battery: {
    totalCurrentHoverA: number;
    totalCurrentMaxA: number;
    usableCapacityAh: number;
  };
  temperature: {
    estimatedHoverC: number;
    estimatedMaxC: number;
  };
  environment: {
    airDensityKgm3: number;
    elevationM: number;
    temperatureC: number;
  };
  // For chart
  throttleCurve: { throttle: number; thrustG: number; powerW: number; currentA: number; rpm: number }[];
}

export function calcXcopter(p: XcopterCalcInput): XcopterCalcResult {
  const rho         = airDensity(p.elevationM, p.temperatureC, p.pressureHpa);
  const auwKg       = p.auwG / 1000;
  const propDiamM   = inToM(p.propDiameterInch);
  const battVolt    = p.batteryCells * 3.7;
  const battResOhm  = (p.batteryResistanceMohm / 1000) * p.batteryCells;
  const motorRmOhm  = p.motorRmMohm / 1000;
  const diskArea    = Math.PI * Math.pow(propDiamM / 2, 2);

  // ── Hover point ───────────────────────────────────────────────────────────
  const thrustPerMotorN = (auwKg * G) / p.numRotors;
  // Initial guess from ideal momentum theory
  const nRpsInit = Math.sqrt(Math.max(0, thrustPerMotorN / (p.ct * rho * Math.pow(propDiamM, 4))));
  let nRpsHover = nRpsInit;
  let voltHover = battVolt;
  let curHover  = 0;

  for (let i = 0; i < 12; i++) {
    const pProp     = p.cp * rho * Math.pow(nRpsHover, 3) * Math.pow(propDiamM, 5);
    const estCur    = Math.max(0, pProp / Math.max(voltHover, 1) + p.motorIo);
    const newVolt   = Math.max(1, battVolt - estCur * battResOhm);          // clamp > 1V
    const rpmLoaded = p.motorKv * newVolt
                      - Math.max(0, estCur - p.motorIo) * motorRmOhm * p.motorKv * 60 / (2 * Math.PI);
    const newNRps   = Math.max(0, rpmLoaded / 60);
    if (Math.abs(newNRps - nRpsHover) < 0.1) { nRpsHover = newNRps; voltHover = newVolt; curHover = estCur; break; }
    nRpsHover = newNRps;
    voltHover = newVolt;
    curHover  = estCur;
  }

  const rpmHover       = nRpsHover * 60;

  const powerHoverW    = p.cp * rho * Math.pow(nRpsHover, 3) * Math.pow(propDiamM, 5);
  const discLoading    = (auwKg * G) / (p.numRotors * diskArea);
  const hoverThrottle  = Math.min(100, Math.sqrt(thrustPerMotorN / ((p.ct * rho * Math.pow(propDiamM, 4)) * (p.motorKv * battVolt * 0.9 / 60) ** 2)) * 100);

  // ── Maximum (full throttle) ───────────────────────────────────────────────
  const rpmMax    = p.motorKv * battVolt * 0.9;
  const nRpsMax   = rpmMax / 60;
  const thrustMaxN = p.ct * rho * Math.pow(nRpsMax, 2) * Math.pow(propDiamM, 4);
  const thrustMaxG = (thrustMaxN / G) * 1000;
  const powerMaxW  = p.cp * rho * Math.pow(nRpsMax, 3) * Math.pow(propDiamM, 5);
  const curMax     = powerMaxW / battVolt + p.motorIo;
  const totalThrustG = thrustMaxG * p.numRotors;
  const twr          = totalThrustG / p.auwG;

  // ── Flight times ──────────────────────────────────────────────────────────
  const usableCapAh      = (p.batteryCapacityMah / 1000) * p.batteryMaxDischarge;
  const totalCurHover    = curHover * p.numRotors;
  const flightHoverMin   = totalCurHover > 0 ? (usableCapAh / totalCurHover) * 60 : 0;
  const curMixed         = curHover * 1.3;
  const flightMixedMin   = (usableCapAh / (curMixed * p.numRotors)) * 60;
  const totalCurMax      = curMax * p.numRotors;
  const flightFullMin    = totalCurMax > 0 ? (usableCapAh / totalCurMax) * 60 : 0;

  // ── Temperature ───────────────────────────────────────────────────────────
  const powerLossHover   = Math.pow(curHover, 2) * motorRmOhm;
  const estTempHoverC    = p.temperatureC + powerLossHover * 3;
  const estTempMaxC      = p.temperatureC + Math.pow(curMax, 2) * motorRmOhm * 5;

  // ── Range estimate ────────────────────────────────────────────────────────
  const avgSpeedMs       = 10;
  const estRangeKm       = avgSpeedMs * (flightMixedMin / 60) * 3.6 * 0.8;

  // ── Throttle curve for chart (8 points for smooth curve) ──────────────────
  const throttleCurve = [0, 0.15, 0.30, 0.45, 0.60, 0.75, 0.85, 1.00].map(t => {
    const rpmAtThrottle = rpmMax * t;
    const nRps   = rpmAtThrottle / 60;
    const thrust = p.ct  * rho * Math.pow(nRps, 2) * Math.pow(propDiamM, 4);
    const power  = p.cp  * rho * Math.pow(nRps, 3) * Math.pow(propDiamM, 5);
    const cur    = power / battVolt + p.motorIo;
    return {
      throttle: t * 100,
      thrustG:  (thrust / G) * 1000,
      powerW:   power,
      currentA: cur,
      rpm:      rpmAtThrottle,
    };
  });

  return {
    hover: {
      currentA:          curHover,
      voltageV:          voltHover,
      discLoadingNm2:    discLoading,
      powerW:            powerHoverW,
      efficiencyPercent: 75,
      throttlePercent:   Math.min(100, hoverThrottle),
      rpm:               rpmHover,
    },
    maximum: {
      currentA:          curMax,
      rpm:               rpmMax,
      thrustG:           thrustMaxG,
      thrustOz:          thrustMaxG / 28.3495,
      temperatureC:      estTempMaxC,
      efficiencyPercent: 65,
    },
    flightTime: {
      hoverMin:         flightHoverMin,
      mixedMin:         flightMixedMin,
      fullThrottleMin:  flightFullMin,
    },
    performance: {
      thrustWeightRatio: twr,
      specificThrustGW:  powerMaxW > 0 ? thrustMaxG / powerMaxW : 0,
      totalThrustG,
      estimatedRangeKm:  estRangeKm,
    },
    battery: {
      totalCurrentHoverA: totalCurHover,
      totalCurrentMaxA:   totalCurMax,
      usableCapacityAh:   usableCapAh,
    },
    temperature: {
      estimatedHoverC: estTempHoverC,
      estimatedMaxC:   estTempMaxC,
    },
    environment: {
      airDensityKgm3: rho,
      elevationM:     p.elevationM,
      temperatureC:   p.temperatureC,
    },
    throttleCurve,
  };
}
