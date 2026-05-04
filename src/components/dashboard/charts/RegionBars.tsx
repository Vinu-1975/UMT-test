import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  applicable: ["range", "application", "cad", "productLine", "hardware"],
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
  const data = useMemo(() => filterRegionUsage(effective), [effective]);

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
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 56, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => num(v)} />
          <YAxis type="category" dataKey="region" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={120} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(v) => num(Number(v))}
          />
          <Bar dataKey="sessions" name="Sessions" radius={[0, 8, 8, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
            <LabelList
              dataKey="sessions"
              position="right"
              formatter={(v) => num(Number(v))}
              style={{ fill: "var(--foreground)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
