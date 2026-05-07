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
import { filterMonthlyCad } from "@/lib/filtering";
import type { FilterDim } from "@/lib/types";
import { num } from "@/lib/format";

export const MONTHLY_TOTAL_FILTER: {
  id: string;
  applicable: readonly FilterDim[];
} = {
  id: "monthlyTotal",
  applicable: [
    "range",
    "application",
    "cad",
    "productLine",
    "region",
    "domain",
    "hardware",
  ],
};

export function MonthlyUsageTotal() {
  const { effective } = useChartFilters(
    MONTHLY_TOTAL_FILTER.id,
    MONTHLY_TOTAL_FILTER.applicable,
  );

  const data = useMemo(() => filterMonthlyCad(effective), [effective]);

  const grandTotal = useMemo(
    () => data.reduce((s, d) => s + d.total, 0),
    [data],
  );

  const showCatia = effective.cad === "all" || effective.cad === "CATIA";
  const showNx = effective.cad === "all" || effective.cad === "NX";

  if (data.length === 0) {
    return (
      <div className="grid h-[300px] place-items-center text-sm text-muted-foreground">
        No usage data matches the current filter.
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 12, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="catiaBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-1)"
                stopOpacity={0.95}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-1)"
                stopOpacity={0.6}
              />
            </linearGradient>
            <linearGradient id="nxBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--chart-2)"
                stopOpacity={0.95}
              />
              <stop
                offset="100%"
                stopColor="var(--chart-2)"
                stopOpacity={0.6}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
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
              fontSize: 12,
              boxShadow: "0 8px 24px -12px rgba(0,0,0,0.15)",
            }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(v) => num(Number(v))}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 8, fontSize: 12 }}
          />
          {showCatia && (
            <Bar
              dataKey="CATIA"
              name="CATIA"
              stackId="usage"
              fill="url(#catiaBarGrad)"
              maxBarSize={48}
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;

                const shouldRoundTop =
                  !showNx || payload.NX === 0;

                const radius = shouldRoundTop ? 8 : 0;

                return (
                  <path
                    d={`
            M${x},${y + radius}
            Q${x},${y} ${x + radius},${y}
            H${x + width - radius}
            Q${x + width},${y} ${x + width},${y + radius}
            V${y + height}
            H${x}
            Z
          `}
                    fill="url(#catiaBarGrad)"
                  />
                );
              }}
            />
          )}
          {showNx && (
            <Bar
              dataKey="NX"
              name="NX"
              stackId="usage"
              fill="url(#nxBarGrad)"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            >
              <LabelList
                dataKey="total"
                position="top"
                formatter={(v) => num(Number(v))}
                style={{
                  fill: "var(--foreground)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
            </Bar>
          )}
          {/* When only CATIA is shown, put the total label on it */}
          {showCatia && !showNx && (
            <Bar
              dataKey="_hidden"
              name=""
              stackId="usage"
              fill="transparent"
              maxBarSize={48}
            >
              <LabelList
                dataKey="total"
                position="top"
                formatter={(v) => num(Number(v))}
                style={{
                  fill: "var(--foreground)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        {num(grandTotal)} total sessions across the selected window
      </div>
    </div>
  );
}
