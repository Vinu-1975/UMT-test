import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { num, pct } from "@/lib/format";

export type SplitItem = { name: string; value: number };

type SliceLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
  percent?: number;
};

// Two-line slice label: bold number on top, % underneath. Sits in the
// thickest part of the donut ring so it reads at a glance without hovering.
function renderSliceLabel(props: SliceLabelProps) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    value = 0,
    percent = 0,
  } = props;
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
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
        fontSize={12}
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
        fontSize={11}
        fontWeight={600}
        style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.25)", strokeWidth: 2 }}
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    </g>
  );
}

export function SplitDonut({
  data,
  colors = ["var(--chart-1)", "var(--chart-3)"],
  primaryLabel = "Total",
}: {
  data: SplitItem[];
  colors?: [string, string];
  primaryLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid items-center gap-4 md:grid-cols-[240px_1fr]">
      <div className="relative mx-auto h-[240px] w-[240px]">
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
              innerRadius={56}
              outerRadius={100}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={3}
              labelLine={false}
              label={renderSliceLabel}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {primaryLabel}
          </div>
          <div className="num mt-0.5 text-2xl font-semibold">{num(total)}</div>
        </div>
      </div>

      <ul className="space-y-3 text-base">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="block size-3 rounded-full"
                style={{ background: colors[i % colors.length] }}
              />
              <span className="font-medium">{d.name}</span>
            </div>
            <div className="num flex items-baseline gap-3 tabular-nums">
              <span className="font-semibold">{num(d.value)}</span>
              <span className="w-12 text-right text-sm text-muted-foreground">
                {pct(d.value / total)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
