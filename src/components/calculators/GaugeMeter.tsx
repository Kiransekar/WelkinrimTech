import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

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
}

export default function GaugeMeter({
  value,
  min = 0,
  max,
  label,
  unit,
  yellowAt = 0.7,
  redAt = 0.9,
}: GaugeMeterProps) {
  // Calculate normalized value for MUI Gauge (0-100 scale)
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min))) * 100;

  // Determine color based on actual value zone
  const actualFraction = (value - min) / (max - min);
  const valueColor = actualFraction < yellowAt
    ? "#22c55e"
    : actualFraction < redAt
      ? "#ffc914"
      : "#ef4444";

  // Format the actual value for display
  const safeValue = Number.isFinite(value) ? value : 0;
  const displayValue = safeValue >= 1000
    ? (safeValue / 1000).toFixed(1) + "k"
    : safeValue >= 100
      ? safeValue.toFixed(0)
      : safeValue.toFixed(1);

  return (
    <div className="flex flex-col items-center gap-1">
      <Gauge
        width={100}
        height={100}
        value={normalizedValue}
        valueMin={0}
        valueMax={100}
        startAngle={-90}
        endAngle={90}
        innerRadius="75%"
        outerRadius="100%"
        cornerRadius="50%"
        text={() => `${displayValue}${unit}`}
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 16,
            fontFamily: "Michroma, sans-serif",
            fontWeight: 700,
            fill: valueColor,
          },
          "& .MuiGauge-referenceArc": {
            fill: "#e5e7eb",
          },
          "& .MuiGauge-valueArc": {
            fill: valueColor,
          },
          "& .MuiGauge-pointer": {
            fill: "#111",
          },
        }}
      />
      <p
        className="text-[8px] tracking-widest uppercase text-center text-[#555] leading-tight"
        style={{ fontFamily: "Michroma, sans-serif", maxWidth: 90 }}
      >
        {label}
      </p>
    </div>
  );
}
