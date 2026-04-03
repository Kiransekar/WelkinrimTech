// src/components/calculators/GaugeArc.tsx
//
// ROOT CAUSE OF THE BUG:
// The previous implementation drew each coloured band as a tiny isolated arc
// using a wrong angle→XY formula (missing the -90° phase shift that puts 0° at the
// top of the circle).  The large-arc-flag was also always 0, so any arc > 180°
// collapsed to the short path on the wrong side of the circle.
//
// THIS FIX: proper polar() helper with the -90° offset, correct large-arc-flag,
// and a guard against the degenerate 360° case.

interface GaugeArcProps {
  /** 0–1 fill fraction */
  value: number;
  /** Stroke colour for the value arc + needle */
  color: string;
  /** Outer SVG width px; height auto-scales to ~66% */
  size?: number;
  /** 0–1 fraction where amber zone begins */
  warnFraction?: number;
  /** 0–1 fraction where red zone begins */
  dangerFraction?: number;
  /** Reverse zone direction – low values are bad (e.g. flight time) */
  invertZones?: boolean;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, a1: number, a2: number) {
  if (Math.abs(a2 - a1) >= 360) a2 = a1 + 359.99;
  const s = polar(cx, cy, r, a1);
  const e = polar(cx, cy, r, a2);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

const START = -150;
const END = 150;
const SWEEP = END - START; // 300°

export default function GaugeArc({
  value,
  color,
  size = 88,
  warnFraction = 0.7,
  dangerFraction = 0.9,
  invertZones = false,
}: GaugeArcProps) {
  const W = size;
  const H = Math.round(size * 0.66);
  const cx = W / 2;
  const cy = H - 2;
  const r = Math.round(W * 0.37);
  const sw = Math.max(4, Math.round(W * 0.068));

  const clamped = Math.min(1, Math.max(0, value));
  const valAngle = START + clamped * SWEEP;
  const warnAngle = START + warnFraction * SWEEP;
  const dangerAngle = START + dangerFraction * SWEEP;
  const needle = polar(cx, cy, r - sw / 2, valAngle);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {/* Track */}
      <path d={arcPath(cx, cy, r, START, END)} fill="none" stroke="#e5e7eb" strokeWidth={sw} strokeLinecap="round" />

      {/* Zone bands */}
      {!invertZones ? (
        <>
          <path d={arcPath(cx, cy, r, warnAngle, dangerAngle)} fill="none" stroke="#fbbf24" strokeWidth={sw} strokeLinecap="round" opacity={0.38} />
          <path d={arcPath(cx, cy, r, dangerAngle, END)}       fill="none" stroke="#f87171" strokeWidth={sw} strokeLinecap="round" opacity={0.42} />
        </>
      ) : (
        <>
          <path d={arcPath(cx, cy, r, START, dangerAngle)}   fill="none" stroke="#f87171" strokeWidth={sw} strokeLinecap="round" opacity={0.42} />
          <path d={arcPath(cx, cy, r, dangerAngle, warnAngle)} fill="none" stroke="#fbbf24" strokeWidth={sw} strokeLinecap="round" opacity={0.38} />
        </>
      )}

      {/* Value arc */}
      {clamped > 0.005 && (
        <path d={arcPath(cx, cy, r, START, valAngle)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      )}

      {/* Needle dot */}
      <circle cx={needle.x} cy={needle.y} r={sw * 0.7}  fill={color} />
      <circle cx={needle.x} cy={needle.y} r={sw * 0.28} fill="white" />

      {/* Pivot */}
      <circle cx={cx} cy={cy} r={sw * 0.4} fill="#9ca3af" />
    </svg>
  );
}