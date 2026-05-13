import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartFilters } from "@/lib/filter-context";
import { filterMonthlyCad } from "@/lib/filtering";
import type { FilterDim } from "@/lib/types";
import { num } from "@/lib/format";

// Stack-segment label that only renders when the segment is tall enough to fit
// readable text. Keeps the bar from getting noisy at small values.
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

  const showCatia = effective.cad.length === 0 || effective.cad.includes("CATIA");
  const showNx    = effective.cad.length === 0 || effective.cad.includes("NX");

  const average = useMemo(() => {
    if (data.length === 0) return 0;
    const total = data.reduce((s, d) => s + d.total, 0);
    return total / data.length;
  }, [data]);

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
          margin={{ top: 24, right: 12, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="catiaBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.95} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="nxBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.95} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.6} />
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
            fontSize={13}
            tickLine={false}
            axisLine={false}
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
              boxShadow: "0 8px 24px -12px rgba(0,0,0,0.15)",
            }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(v, name) => [`${num(Number(v))} sessions`, name as string]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 8, fontSize: 13 }}
          />
          {average > 0 ? (
            <ReferenceLine
              y={average}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: `Avg ${num(Math.round(average))}`,
                position: "insideTopRight",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
          ) : null}
          {showCatia && (
            <Bar
              dataKey="CATIA"
              name="CATIA"
              stackId="usage"
              fill="url(#catiaBarGrad)"
              maxBarSize={48}
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                const shouldRoundTop = !showNx || payload.NX === 0;
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
            >
              <LabelList
                dataKey="CATIA"
                content={renderStackLabel("#ffffff")}
              />
            </Bar>
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
                dataKey="NX"
                content={renderStackLabel("var(--foreground)")}
              />
              <LabelList
                dataKey="total"
                position="top"
                formatter={(v) => num(Number(v))}
                style={{
                  fill: "var(--foreground)",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              />
            </Bar>
          )}
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
                  fontSize: 13,
                  fontWeight: 700,
                }}
              />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
