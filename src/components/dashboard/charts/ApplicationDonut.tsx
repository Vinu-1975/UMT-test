import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useChartFilters } from "@/lib/filter-context";
import { filterApplicationUsage } from "@/lib/filtering";
import type { FilterDim } from "@/lib/types";
import { num, pct } from "@/lib/format";

export const APP_DONUT_FILTER: { id: string; applicable: readonly FilterDim[] } = {
  id: "appDonut",
  applicable: ["range", "cad", "productLine", "region", "hardware"],
};

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

// Beyond the brand palette, stay on-brand by alternating between
// Cooper Standard blue (~250°) and gold (~80°) hues and stepping
// lightness so every slice past index 5 remains visually distinct
// without leaving the company colour story.
function colorAt(i: number, total: number): string {
  if (i < PALETTE.length) return PALETTE[i];
  const k = i - PALETTE.length;
  const extras = Math.max(total - PALETTE.length, 1);
  const hue = k % 2 === 0 ? 250 : 80;
  const steps = Math.max(Math.ceil(extras / 2), 1);
  const t = steps === 1 ? 0 : Math.floor(k / 2) / (steps - 1);
  const L = 0.50 + t * 0.32;
  const C = k % 2 === 0 ? 0.15 : 0.16;
  return `oklch(${L.toFixed(2)} ${C} ${hue})`;
}

export function ApplicationDonut() {
  const { effective } = useChartFilters(APP_DONUT_FILTER.id, APP_DONUT_FILTER.applicable);

  const apps = useMemo(
    () => [...filterApplicationUsage(effective)].sort((a, b) => b.total - a.total),
    [effective],
  );

  const grand = apps.reduce((s, a) => s + a.total, 0) || 0;
  const data = apps.map((a) => ({ name: a.application, value: a.total }));

  if (apps.length === 0) {
    return (
      <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">
        No applications match the current filter.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-evenly gap-6 md:flex-row md:gap-0">
      <div className="relative aspect-square w-full max-w-[440px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(v, name) => [`${num(Number(v))} sessions`, name as string]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: 13,
                padding: "10px 12px",
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="50%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={3}
              labelLine={false}
              label={(props: any) => {
                const RADIAN = Math.PI / 180;
                const { cx, cy, midAngle, innerRadius, outerRadius, value, percent } = props;
                if (percent < 0.04) return null;
                const r = (innerRadius + outerRadius) / 2;
                const x = cx + r * Math.cos(-midAngle * RADIAN);
                const y = cy + r * Math.sin(-midAngle * RADIAN);
                return (
                  <g>
                    <text
                      x={x}
                      y={y - 8}
                      fill="#ffffff"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={13}
                      fontWeight={700}
                      style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.25)", strokeWidth: 2 }}
                    >
                      {num(value)}
                    </text>
                    <text
                      x={x}
                      y={y + 8}
                      fill="#ffffff"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fontWeight={600}
                      style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.25)", strokeWidth: 2 }}
                    >
                      {`${Math.round(percent * 100)}%`}
                    </text>
                  </g>
                );
              }}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colorAt(i, data.length)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Total sessions</div>
          <div className="num mt-0.5 text-3xl font-semibold">{num(grand)}</div>
          <div className="text-xs text-muted-foreground">across {apps.length} apps</div>
        </div>
      </div>

      <ul className="w-full max-w-[260px] shrink-0 space-y-0.5 overflow-y-auto pr-1 md:w-[220px] md:max-h-[440px]">
        {apps.map((a, i) => (
          <li
            key={a.application}
            className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 hover:bg-muted/40"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="block size-2.5 shrink-0 rounded-full"
                style={{ background: colorAt(i, apps.length) }}
              />
              <div className="min-w-0">
                <div
                  className="truncate text-[13px] font-medium leading-tight"
                  title={a.application}
                >
                  {a.application}
                </div>
                <div className="truncate text-[10px] leading-tight text-muted-foreground">
                  {a.cad} · {a.productLine}
                </div>
              </div>
            </div>
            <div className="num flex shrink-0 items-baseline gap-1.5 tabular-nums">
              <span className="text-[13px] font-semibold">{num(a.total)}</span>
              <span className="w-9 text-right text-[10px] text-muted-foreground">
                {pct(a.total / grand)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
