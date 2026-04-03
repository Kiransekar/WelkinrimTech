// src/components/calculators/CompareResults.tsx
// Side-by-side comparison tool for calculator results
// Allows users to compare two propeller/motor configurations

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

export interface CompareData {
  id: string;
  name: string;
  values: Record<string, { value: number; unit: string; better: "high" | "low" }>;
  color: string;
}

interface MetricRow {
  key: string;
  label: string;
  value1: number;
  value2: number;
  unit: string;
  better: "high" | "low";
  diff: number;
  diffPercent: number;
  winner: 1 | 2 | "tie";
}

export default function CompareResults({ data1, data2 }: { data1: CompareData; data2: CompareData }) {
  const metrics: MetricRow[] = useMemo(() => {
    const rows: MetricRow[] = [];
    const keys = Object.keys(data1.values);

    keys.forEach(key => {
      const v1 = data1.values[key];
      const v2 = data2.values[key];
      if (!v1 || !v2) return;

      const diff = v2.value - v1.value;
      const diffPercent = v1.value !== 0 ? (diff / Math.abs(v1.value)) * 100 : 0;

      let winner: 1 | 2 | "tie" = "tie";
      if (Math.abs(diffPercent) > 0.1) {
        if (v1.better === "high") {
          winner = diff > 0 ? 2 : 1;
        } else {
          winner = diff < 0 ? 2 : 1;
        }
      }

      rows.push({
        key,
        label: key.replace(/([A-Z])/g, " $1").trim(),
        value1: v1.value,
        value2: v2.value,
        unit: v1.unit,
        better: v1.better,
        diff: Math.abs(diff),
        diffPercent: Math.abs(diffPercent),
        winner,
      });
    });

    return rows;
  }, [data1, data2]);

  // Bar chart data
  const barChartData = useMemo(() => {
    return metrics.map(m => ({
      name: m.label,
      [data1.name]: m.value1,
      [data2.name]: m.value2,
    }));
  }, [metrics, data1, data2]);

  // Radar chart data
  const radarData = useMemo(() => {
    // Normalize values to 0-100 scale for radar chart
    const maxValues: Record<string, number> = {};
    metrics.forEach(m => {
      maxValues[m.key] = Math.max(m.value1, m.value2) * 1.1;
    });

    return [
      {
        subject: "Overall",
        [data1.name]: metrics.reduce((sum, m) => sum + (m.value1 / maxValues[m.key]) * 100, 0) / metrics.length,
        [data2.name]: metrics.reduce((sum, m) => sum + (m.value2 / maxValues[m.key]) * 100, 0) / metrics.length,
        fullMark: 100,
      },
    ];
  }, [metrics, data1, data2]);

  // Calculate overall winner
  const score1 = metrics.filter(m => m.winner === 1).length;
  const score2 = metrics.filter(m => m.winner === 2).length;
  const ties = metrics.filter(m => m.winner === "tie").length;

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className={`border-2 p-4 ${
        score1 > score2 ? "border-[#ffc914] bg-[#fffbe6]" :
        score2 > score1 ? "border-blue-400 bg-blue-50" :
        "border-gray-300 bg-gray-50"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] tracking-widest uppercase text-gray-500"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Comparison Result
            </p>
            <p className="text-lg font-bold text-black" style={{ fontFamily: "Michroma, sans-serif" }}>
              {score1 > score2 ? `${data1.name} wins` :
               score2 > score1 ? `${data2.name} wins` :
               "It's a tie!"}
            </p>
            <p className="text-sm text-gray-600" style={{ fontFamily: "Lexend, sans-serif" }}>
              {data1.name}: {score1} metrics · {data2.name}: {score2} metrics · Tied: {ties}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: data1.color }}>{score1}</p>
              <p className="text-[8px] uppercase tracking-wider text-gray-500">{data1.name}</p>
            </div>
            <div className="text-gray-300 text-xl">vs</div>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: data2.color }}>{score2}</p>
              <p className="text-[8px] uppercase tracking-wider text-gray-500">{data2.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border border-gray-100">
        <div className="bg-black px-3 py-1.5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
             style={{ fontFamily: "Michroma, sans-serif" }}>
            Detailed Comparison
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]" style={{ fontFamily: "Michroma, sans-serif" }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">Metric</th>
                <th className="px-3 py-2 text-right" style={{ color: data1.color }}>{data1.name}</th>
                <th className="px-3 py-2 text-right" style={{ color: data2.color }}>{data2.name}</th>
                <th className="px-3 py-2 text-right">Difference</th>
                <th className="px-3 py-2 text-center">Winner</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={m.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-3 py-2">
                    <span className="font-bold">{m.label}</span>
                    <span className="text-gray-400 ml-1">({m.better === "high" ? "↑" : "↓"} better)</span>
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${m.winner === 1 ? "text-green-500" : ""}`}
                      style={{ color: m.winner === 1 ? data1.color : undefined }}>
                    {m.value1.toFixed(1)} {m.unit}
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${m.winner === 2 ? "text-green-500" : ""}`}
                      style={{ color: m.winner === 2 ? data2.color : undefined }}>
                    {m.value2.toFixed(1)} {m.unit}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={m.diffPercent > 10 ? "text-red-500 font-bold" : "text-gray-500"}>
                      {m.diff > 0 ? "+" : ""}{m.diff.toFixed(1)} {m.unit} ({m.diffPercent > 0 ? "+" : ""}{m.diffPercent.toFixed(1)}%)
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {m.winner === 1 && <span className="text-green-500">✓ {data1.name}</span>}
                    {m.winner === 2 && <span className="text-green-500">✓ {data2.name}</span>}
                    {m.winner === "tie" && <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Metric Comparison
            </p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 8, fontFamily: "Michroma, sans-serif" }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: "Michroma, sans-serif" }} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                <Bar dataKey={data1.name} fill={data1.color} radius={[2, 2, 0, 0]} />
                <Bar dataKey={data2.name} fill={data2.color} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="border border-gray-100">
          <div className="bg-black px-3 py-1.5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffc914]"
               style={{ fontFamily: "Michroma, sans-serif" }}>
              Performance Radar
            </p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fontFamily: "Michroma, sans-serif" }} />
                <Radar name={data1.name} dataKey={data1.name} stroke={data1.color} fill={data1.color} fillOpacity={0.4} />
                <Radar name={data2.name} dataKey={data2.name} stroke={data2.color} fill={data2.color} fillOpacity={0.4} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Michroma, sans-serif" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
