import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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

// Render a segment value inside the stack, but only when there's room for it.
// Older readers can scan each bar without hovering.
const renderStackLabel = (fill: string) => (props: any) => {
  const { x, y, width, height, value } = props;
  const w = Number(width);
  const h = Number(height);
  const v = Number(value);
  if (!isFinite(v) || v <= 0) return null;
  if (h < 18 || w < 28) return null;
  return (
    <text
      x={Number(x) + w / 2}
      y={Number(y) + h / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fill={fill}
      fontSize={11}
      fontWeight={700}
    >
      {num(v)}
    </text>
  );
};

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
        <BarChart data={data} margin={{ top: 28, right: 12, left: -8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="application"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-18}
            textAnchor="end"
            height={56}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={13}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => num(v)}
            width={56}
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
            formatter={(v, name) => [`${num(Number(v))} sessions`, name as string]}
          />
          <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ paddingBottom: 12, fontSize: 13 }} />
          <Bar dataKey="validation" stackId="a" name="Validation" fill="var(--chart-1)">
            <LabelList dataKey="validation" content={renderStackLabel("#ffffff")} />
          </Bar>
          <Bar dataKey="execution" stackId="a" name="Execution" fill="var(--chart-2)">
            <LabelList dataKey="execution" content={renderStackLabel("var(--foreground)")} />
          </Bar>
          <Bar dataKey="blockCreation" stackId="a" name="Block creation" fill="var(--chart-3)">
            <LabelList dataKey="blockCreation" content={renderStackLabel("#ffffff")} />
          </Bar>
          <Bar dataKey="viewOps" stackId="a" name="Viewing" fill="var(--chart-4)" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="viewOps" content={renderStackLabel("var(--foreground)")} />
            <LabelList
              dataKey="total"
              position="top"
              formatter={(v) => num(Number(v))}
              style={{ fill: "var(--foreground)", fontSize: 13, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
