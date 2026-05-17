import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { useChartFilters } from "@/lib/filter-context";
import { filterRegionUsage } from "@/lib/filtering";
import type { FilterDim } from "@/lib/types";
import { num } from "@/lib/format";

export const REGION_BARS_FILTER: { id: string; applicable: readonly FilterDim[] } = {
  id: "regionBars",
  applicable: [
    "range",
    "application",
    "cad",
    "productLine",
    "region",
    "domain",
    "hardware",
    "status",
  ],
};

const REGION_LABEL: Record<string, string> = {
  NA: "North America",
  EU: "Europe",
  ASIA: "Asia",
  SA: "South America",
};

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-6)",
];

export function RegionBars() {
  const { effective } = useChartFilters(REGION_BARS_FILTER.id, REGION_BARS_FILTER.applicable);
  const raw = useMemo(() => filterRegionUsage(effective), [effective]);

  // Use full region names on the chart so older readers don't have to decode
  // two-letter codes; keep the original key as `code` for tooltips.
  const data = useMemo(
    () =>
      [...raw]
        .sort((a, b) => b.sessions - a.sessions)
        .map((r) => ({
          ...r,
          code: r.region,
          regionLabel: REGION_LABEL[r.region] ?? r.region,
        })),
    [raw],
  );

  const average = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((s, d) => s + d.sessions, 0) / data.length;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">
        No regions match the current filter.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 64, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            stroke="var(--muted-foreground)"
            fontSize={13}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => num(v)}
          />
          <YAxis
            type="category"
            dataKey="regionLabel"
            stroke="var(--muted-foreground)"
            fontSize={13}
            tickLine={false}
            axisLine={false}
            width={140}
            tick={{ fill: "var(--foreground)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 13,
              padding: "10px 12px",
            }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(v) => [`${num(Number(v))} sessions`, "Usage"]}
          />
          {average > 0 && data.length > 1 ? (
            <ReferenceLine
              x={average}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: `Avg ${num(Math.round(average))}`,
                position: "top",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
          ) : null}
          <Bar dataKey="sessions" name="Sessions" radius={[0, 8, 8, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
            <LabelList
              dataKey="sessions"
              position="right"
              formatter={(v) => num(Number(v))}
              style={{ fill: "var(--foreground)", fontSize: 13, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
