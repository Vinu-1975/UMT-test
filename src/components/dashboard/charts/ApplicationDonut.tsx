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

// Beyond the brand palette, generate visually distinct colors by walking the
// oklch hue wheel at fixed lightness/chroma so every application gets its own
// slice color when the dataset exceeds 6 apps.
function colorAt(i: number, total: number): string {
  if (i < PALETTE.length) return PALETTE[i];
  const extras = Math.max(total - PALETTE.length, 1);
  const step = 360 / extras;
  const hue = ((i - PALETTE.length) * step + 18) % 360;
  return `oklch(0.68 0.16 ${hue.toFixed(1)})`;
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
    <div className="grid items-center gap-6 md:grid-cols-[260px_1fr]">
      <div className="relative mx-auto h-[260px] w-[260px]">
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
              innerRadius={58}
              outerRadius={110}
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
                      y={y - 7}
                      fill="#ffffff"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fontWeight={700}
                      style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.25)", strokeWidth: 2 }}
                    >
                      {num(value)}
                    </text>
                    <text
                      x={x}
                      y={y + 7}
                      fill="#ffffff"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={10}
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
          <div className="num mt-0.5 text-2xl font-semibold">{num(grand)}</div>
          <div className="text-xs text-muted-foreground">across {apps.length} apps</div>
        </div>
      </div>

      <ul className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1 text-sm">
        {apps.map((a, i) => (
          <li
            key={a.application}
            className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-2 hover:border-border hover:bg-muted/40"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span
                className="block size-3 shrink-0 rounded-full"
                style={{ background: colorAt(i, apps.length) }}
              />
              <span className="truncate font-medium">{a.application}</span>
              <span className="truncate text-xs text-muted-foreground">· {a.cad} · {a.productLine}</span>
            </div>
            <div className="num flex shrink-0 items-baseline gap-2 tabular-nums">
              <span className="font-semibold">{num(a.total)}</span>
              <span className="w-12 text-right text-xs text-muted-foreground">{pct(a.total / grand)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
