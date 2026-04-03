// src/components/calculators/KeyMetrics.tsx
//
// Renders a row of gauge cards.
// The parent (XcopterCalcPanel / PropCalcPanel) is responsible for the grid wrapper.
// This component just emits the individual cards as a React Fragment so it can sit
// directly inside any grid container.

import { useEffect } from "react";
import GaugeArc from "./GaugeArc";

export interface MetricConfig {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  /** 0–1 fraction where amber zone starts */
  warnFraction: number;
  /** 0–1 fraction where red zone starts */
  dangerFraction: number;
  /** Reverse zones – low values are dangerous (e.g. flight time) */
  invertZones?: boolean;
  decimals?: number;
}

interface KeyMetricsProps {
  metrics: Record<string, number>;
  configs: MetricConfig[];
}

function statusOf(val: number, cfg: MetricConfig): "good" | "warn" | "danger" {
  const frac = (val - cfg.min) / (cfg.max - cfg.min);
  if (cfg.invertZones) {
    if (frac <= cfg.dangerFraction) return "danger";
    if (frac <= cfg.warnFraction)   return "warn";
    return "good";
  }
  if (frac >= cfg.dangerFraction) return "danger";
  if (frac >= cfg.warnFraction)   return "warn";
  return "good";
}

const ARC_COLOR   = { good: "#22c55e", warn: "#f59e0b", danger: "#ef4444" } as const;
const BADGE_BG    = { good: "rgba(34,197,94,.1)", warn: "rgba(245,158,11,.1)", danger: "rgba(239,68,68,.1)" } as const;
const BADGE_TEXT  = { good: "#15803d",            warn: "#92400e",            danger: "#991b1b"             } as const;
const BADGE_LABEL = { good: "Normal", warn: "Caution", danger: "High" } as const;

const STYLE_ID = "km-anim-styles";

export default function KeyMetrics({ metrics, configs }: KeyMetricsProps) {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes km-rise {
        from { opacity:0; transform: translateY(8px); }
        to   { opacity:1; transform: translateY(0); }
      }
      .km-card {
        animation: km-rise 0.32s ease both;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .km-card:hover {
        border-color: rgba(255,201,20,0.45) !important;
        box-shadow: 0 0 0 3px rgba(255,201,20,0.07);
      }
    `;
    document.head.appendChild(s);
  }, []);

  return (
    <>
      {configs.map((cfg, i) => {
        const raw     = metrics[cfg.id] ?? cfg.min;
        const clamped = Math.min(cfg.max, Math.max(cfg.min, raw));
        const frac    = (clamped - cfg.min) / (cfg.max - cfg.min);
        const status  = statusOf(raw, cfg);
        const display = raw.toFixed(cfg.decimals ?? 0);

        return (
          <div
            key={cfg.id}
            className="km-card"
            style={{
              animationDelay: `${i * 50}ms`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "14px 8px 11px",
              background: "#fafafa",
              border: "1px solid #efefef",
              borderRadius: 10,
              gap: 0,
            }}
          >
            {/* Dial */}
            <GaugeArc
              value={frac}
              color={ARC_COLOR[status]}
              size={82}
              warnFraction={cfg.warnFraction}
              dangerFraction={cfg.dangerFraction}
              invertZones={cfg.invertZones}
            />

            {/* Numeric value */}
            <div
              style={{
                marginTop: 5,
                fontFamily: "Michroma, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: "#111",
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}
            >
              {display}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 400,
                  opacity: 0.45,
                  marginLeft: 2,
                  letterSpacing: 0,
                }}
              >
                {cfg.unit}
              </span>
            </div>

            {/* Label */}
            <div
              style={{
                marginTop: 4,
                fontFamily: "Michroma, sans-serif",
                fontSize: 7.5,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#999",
                textAlign: "center",
              }}
            >
              {cfg.label}
            </div>

            {/* Status badge */}
            <div
              style={{
                marginTop: 6,
                fontFamily: "Michroma, sans-serif",
                fontSize: 7,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: BADGE_TEXT[status],
                background: BADGE_BG[status],
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              {BADGE_LABEL[status]}
            </div>
          </div>
        );
      })}
    </>
  );
}
