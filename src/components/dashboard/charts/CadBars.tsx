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
import { filterCadUsage } from "@/lib/filtering";
import type { FilterDim } from "@/lib/types";
import { num, pct } from "@/lib/format";

export const CAD_BARS_FILTER: { id: string; applicable: readonly FilterDim[] } = {
  id: "cadBars",
  applicable: ["range", "application", "productLine", "region", "hardware"],
};

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function CadBars() {
  const { effective } = useChartFilters(CAD_BARS_FILTER.id, CAD_BARS_FILTER.applicable);
  const data = useMemo(() => filterCadUsage(effective), [effective]);

  if (data.length === 0) {
    return (
      <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">
        No CAD usage matches the current filter.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="cad" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => num(v)} width={64} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(v, _n, item) => {
              const sessions = Number(v);
              const share = (item?.payload as { share?: number } | undefined)?.share;
              return [`${num(sessions)} sessions${share != null ? ` · ${pct(share)}` : ""}`, "Usage"];
            }}
          />
          <Bar dataKey="sessions" name="Sessions" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
            <LabelList
              dataKey="sessions"
              position="top"
              formatter={(v) => num(Number(v))}
              style={{ fill: "var(--foreground)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
