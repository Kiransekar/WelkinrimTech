// src/hooks/useMotorPresets.ts
// Hook to load Welkinrim motor product data as calculator presets

import { useMemo } from "react";
import { PRODUCTS } from "@/data/products";

export interface MotorPreset {
  id: string;
  name: string;
  series: string;
  kv: number;
  recommendedVoltage: number; // cells (S)
  peakCurrent: number; // A
  recommendedPropMin: number; // diameter in inches
  recommendedPropMax: number; // diameter in inches
  estimatedIo: number; // no-load current (A)
  estimatedRmMohm: number; // winding resistance (mΩ)
}

function parseKVFromSpec(specs: { label: string; value: string }[]): number {
  const kvSpec = specs.find(s => s.label === "KV Rating");
  if (!kvSpec) return 1000;
  const match = kvSpec.value.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1000;
}

function parseVoltageFromSpec(specs: { label: string; value: string }[]): number {
  const voltSpec = specs.find(s => s.label === "Rated Voltage");
  if (!voltSpec) return 6;
  // Handle voltage ranges like "6S–12S" or "24–28S" - use the higher value
  const matches = voltSpec.value.match(/(\d+)S/g);
  if (matches && matches.length > 0) {
    const voltages = matches.map(m => parseInt(m, 10));
    return Math.max(...voltages); // Use higher voltage for safety margin
  }
  return 6;
}

function parseCurrentFromSpec(specs: { label: string; value: string }[]): number {
  const currSpec = specs.find(s => s.label === "Peak Current");
  if (!currSpec) return 30;
  const match = currSpec.value.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
}

function parsePropFromSpec(specs: { label: string; value: string }[]): [number, number] {
  const propSpec = specs.find(s => s.label === "Recommended Propeller");
  if (!propSpec) return [10, 15];
  const match = propSpec.value.match(/(\d+)×/);
  const diam = match ? parseInt(match[1], 10) : 12;
  return [diam, diam + 5];
}

// Estimate motor no-load current (Io) based on motor size
// Based on typical RC brushless motor characteristics:
// - Small motors (<20A): 0.5-1.5A
// - Medium motors (20-50A): 1-2.5A
// - Large motors (50-100A): 1.5-3.5A
// - Very large (100A+): 2.5-5A
function estimateMotorIo(_kv: number, peakCurrent: number): number {
  if (peakCurrent <= 15) return 0.8;
  if (peakCurrent <= 30) return 1.2;
  if (peakCurrent <= 60) return 1.8;
  if (peakCurrent <= 100) return 2.5;
  return 3.5;
}

// Estimate motor winding resistance (Rm) based on current capacity
// Higher current motors use thicker wire = lower resistance
// Based on typical RC motor data:
// - 10A class: 40-80 mΩ
// - 25A class: 20-40 mΩ
// - 50A class: 10-25 mΩ
// - 100A+ class: 5-15 mΩ
function estimateMotorRmMohm(_kv: number, _voltage: number, peakCurrent: number): number {
  if (peakCurrent <= 15) return 60;
  if (peakCurrent <= 30) return 35;
  if (peakCurrent <= 60) return 20;
  if (peakCurrent <= 100) return 12;
  return 8;
}

export function useMotorPresets(seriesFilter?: string) {
  const presets = useMemo(() => {
    const haemngMotors = PRODUCTS.filter(p => p.series === "haemng");

    if (seriesFilter && seriesFilter !== "all") {
      return haemngMotors
        .filter(p => p.series === seriesFilter)
        .map(p => {
          const [propMin, propMax] = parsePropFromSpec(p.allSpecs);
          const kv = parseKVFromSpec(p.allSpecs);
          const voltage = parseVoltageFromSpec(p.allSpecs);
          const current = parseCurrentFromSpec(p.allSpecs);
          return {
            id: p.id,
            name: `${p.model}`,
            series: p.seriesLabel,
            kv,
            recommendedVoltage: voltage,
            peakCurrent: current,
            recommendedPropMin: propMin,
            recommendedPropMax: propMax,
            estimatedIo: estimateMotorIo(kv, current),
            estimatedRmMohm: estimateMotorRmMohm(kv, voltage, current),
          } as MotorPreset;
        });
    }

    return haemngMotors.map(p => {
      const [propMin, propMax] = parsePropFromSpec(p.allSpecs);
      const kv = parseKVFromSpec(p.allSpecs);
      const voltage = parseVoltageFromSpec(p.allSpecs);
      const current = parseCurrentFromSpec(p.allSpecs);
      return {
        id: p.id,
        name: `${p.model}`,
        series: p.seriesLabel,
        kv,
        recommendedVoltage: voltage,
        peakCurrent: current,
        recommendedPropMin: propMin,
        recommendedPropMax: propMax,
        estimatedIo: estimateMotorIo(kv, current),
        estimatedRmMohm: estimateMotorRmMohm(kv, voltage, current),
      } as MotorPreset;
    });
  }, [seriesFilter]);

  return presets;
}

export function getPresetById(id: string): MotorPreset | null {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return null;

  const [propMin, propMax] = parsePropFromSpec(product.allSpecs);
  const kv = parseKVFromSpec(product.allSpecs);
  const voltage = parseVoltageFromSpec(product.allSpecs);
  const current = parseCurrentFromSpec(product.allSpecs);

  return {
    id: product.id,
    name: product.model,
    series: product.seriesLabel,
    kv,
    recommendedVoltage: voltage,
    peakCurrent: current,
    recommendedPropMin: propMin,
    recommendedPropMax: propMax,
    estimatedIo: estimateMotorIo(kv, current),
    estimatedRmMohm: estimateMotorRmMohm(kv, voltage, current),
  };
}
