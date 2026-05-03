import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { num, pct } from "@/lib/format";

export type SplitItem = { name: string; value: number };

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
    <div className="grid items-center gap-4 md:grid-cols-[200px_1fr]">
      <div className="relative mx-auto h-[200px] w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(v) => num(Number(v))}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: 12,
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={86}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {primaryLabel}
          </div>
          <div className="num mt-0.5 text-xl font-semibold">{num(total)}</div>
        </div>
      </div>

      <ul className="space-y-2.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="block size-2.5 rounded-full"
                style={{ background: colors[i % colors.length] }}
              />
              <span className="font-medium">{d.name}</span>
            </div>
            <div className="num flex items-baseline gap-3">
              <span className="font-medium">{num(d.value)}</span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {pct(d.value / total)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
