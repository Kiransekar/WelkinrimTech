import { useMemo } from "react";

interface GaugeMeterProps {
  value: number;
  min?: number;
  max: number;
  label: string;
  unit: string;
  /** Fraction (0–1) where green ends / yellow starts */
  yellowAt?: number;
  /** Fraction (0–1) where yellow ends / red starts */
  redAt?: number;
  size?: number;
}

export default function GaugeMeter({
  value,
  min = 0,
  max,
  label,
  unit,
  yellowAt = 0.70,
  redAt = 0.90,
  size = 140,
}: GaugeMeterProps) {
  const cx    = size / 2;
  const cy    = size / 2;
  const r     = size * 0.38;
  const SW    = size * 0.095;            // stroke width
  const start = Math.PI;                 // 9 o'clock

  const raw   = (value - min) / (max - min);
  const norm  = Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0;

  // Arc helpers ── draws from fraction a → b on the semicircle
  function arcPath(a: number, b: number) {
    const aRad  = start + a * Math.PI;
    const bRad  = start + b * Math.PI;
    const x1    = cx + r * Math.cos(aRad);
    const y1    = cy + r * Math.sin(aRad);
    const x2    = cx + r * Math.cos(bRad);
    const y2    = cy + r * Math.sin(bRad);
    const large = (b - a) > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  const zones = useMemo(() => [
    { a: 0,       b: yellowAt, color: "#22c55e" },
    { a: yellowAt, b: redAt,   color: "#ffc914" },
    { a: redAt,   b: 1,        color: "#ef4444" },
  ], [yellowAt, redAt]);

  const needleAngle = start + norm * Math.PI;
  const needleLen   = r - SW / 2 - 4;
  const nx          = cx + needleLen * Math.cos(needleAngle);
  const ny          = cy + needleLen * Math.sin(needleAngle);

  // Zone color for the value readout
  const readoutColor = norm < yellowAt ? "#22c55e" : norm < redAt ? "#ffc914" : "#ef4444";

  // Display value nicely
  const safeValue = Number.isFinite(value) ? value : 0;
  const display = safeValue >= 1000
    ? (safeValue / 1000).toFixed(1) + "k"
    : safeValue >= 100
    ? safeValue.toFixed(0)
    : safeValue.toFixed(1);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size * 0.60 + 20} viewBox={`0 0 ${size} ${size * 0.55 + 20}`}>
        {/* Track */}
        <path
          d={arcPath(0, 1)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={SW}
          strokeLinecap="round"
        />
        {/* Colored zones */}
        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(z.a, z.b)}
            fill="none"
            stroke={z.color}
            strokeWidth={SW}
            strokeLinecap="round"
            opacity={0.35}
          />
        ))}
        {/* Value fill arc */}
        {norm > 0 && (
          <path
            d={arcPath(0, norm)}
            fill="none"
            stroke={readoutColor}
            strokeWidth={SW}
            strokeLinecap="round"
          />
        )}
        {/* Needle */}
        <line
          x1={cx}  y1={cy}
          x2={nx}  y2={ny}
          stroke="#111"
          strokeWidth={size * 0.018}
          strokeLinecap="round"
        />
        {/* Center pivot */}
        <circle cx={cx} cy={cy} r={size * 0.045} fill="#111" />
        <circle cx={cx} cy={cy} r={size * 0.022} fill="#fff" />

        {/* Value text */}
        <text
          x={cx}
          y={cy * 0.82 + size * 0.55 + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={readoutColor}
          fontSize={size * 0.155}
          fontFamily="Michroma, sans-serif"
          fontWeight="700"
        >
          {display}
        </text>
        {/* Unit */}
        <text
          x={cx}
          y={cy * 0.82 + size * 0.55 + 4 + size * 0.14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#888"
          fontSize={size * 0.09}
          fontFamily="Michroma, sans-serif"
        >
          {unit}
        </text>
      </svg>
      <p
        className="text-[9px] tracking-widest uppercase text-center text-[#555] leading-tight"
        style={{ fontFamily: "Michroma, sans-serif", maxWidth: size }}
      >
        {label}
      </p>
    </div>
  );
}
