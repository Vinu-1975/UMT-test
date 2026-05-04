import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartFilters } from "@/lib/filter-context";
import { filterApplicationUsage } from "@/lib/filtering";
import type { FilterDim } from "@/lib/types";
import { num } from "@/lib/format";

export const APP_BARS_FILTER: { id: string; applicable: readonly FilterDim[] } = {
  id: "appBars",
  applicable: ["range", "cad", "productLine", "region", "hardware"],
};

export function ApplicationBars() {
  const { effective } = useChartFilters(APP_BARS_FILTER.id, APP_BARS_FILTER.applicable);
  const data = useMemo(
    () => [...filterApplicationUsage(effective)].sort((a, b) => b.total - a.total).slice(0, 8),
    [effective],
  );

  if (data.length === 0) {
    return (
      <div className="grid h-[340px] place-items-center text-sm text-muted-foreground">
        No applications match the current filter.
      </div>
    );
  }

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="application"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            angle={-18}
            textAnchor="end"
            height={56}
          />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => num(v)} width={56} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(v) => num(Number(v))}
          />
          <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ paddingBottom: 12, fontSize: 12 }} />
          <Bar dataKey="validation"    stackId="a" name="Validation"     fill="var(--chart-1)" />
          <Bar dataKey="execution"     stackId="a" name="Execution"      fill="var(--chart-2)" />
          <Bar dataKey="blockCreation" stackId="a" name="Block creation" fill="var(--chart-3)" />
          <Bar dataKey="viewOps"       stackId="a" name="Viewing"        fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
