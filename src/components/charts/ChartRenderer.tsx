// src/components/charts/ChartRenderer.tsx
"use client";

import type { ChartSpec } from "@/lib/charts/spec";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

function toNumber(v: any): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function buildSeries(
  rows: any[],
  spec: ChartSpec
): { data: any[]; seriesKeys: string[] } {
  const maxPoints = Math.max(10, Math.min(spec.maxPoints ?? 120, 500));

  // Basic projection: keep x + y keys (+ seriesBy if present)
  const projected = rows
    .slice(0, maxPoints)
    .map((r) => {
      const o: any = {};
      o[spec.x] = r?.[spec.x];
      if (spec.seriesBy) o[spec.seriesBy] = r?.[spec.seriesBy];

      for (const k of spec.y) o[k] = toNumber(r?.[k]);
      return o;
    });

  return { data: projected, seriesKeys: spec.y };
}

export default function ChartRenderer(props: {
  spec: ChartSpec;
  rows: any[];
  theme?: "light" | "dark";
}) {
  const { spec, rows } = props;

  const { data, seriesKeys } = buildSeries(rows ?? [], spec);

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-sm opacity-80">No data available for this chart.</div>
      </div>
    );
  }

  const Title = spec.title ? (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="text-sm font-black tracking-[0.14em] uppercase opacity-90">
        {spec.title}
      </div>
      {spec.note ? (
        <div className="text-xs opacity-70">{spec.note}</div>
      ) : null}
    </div>
  ) : null;

  const Common = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={spec.x} />
      <YAxis />
      <Tooltip />
      <Legend />
    </>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {Title}

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === "line" ? (
            <LineChart data={data}>
              {Common}
              {seriesKeys.map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  dot={false}
                  connectNulls={!!spec.connectNulls}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              {Common}
              {seriesKeys.map((k) => (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId={spec.type === "stacked_bar" ? "stack" : undefined}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {spec.note ? (
        <div className="mt-3 text-xs opacity-70">{spec.note}</div>
      ) : null}
    </div>
  );
}
