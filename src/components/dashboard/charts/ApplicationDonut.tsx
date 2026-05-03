import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { APPLICATION_USAGE } from "@/lib/mock-data";
import { num, pct } from "@/lib/format";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export function ApplicationDonut() {
  const top = [...APPLICATION_USAGE].sort((a, b) => b.total - a.total).slice(0, 6);
  const grand = top.reduce((s, a) => s + a.total, 0);
  const data = top.map((a) => ({ name: a.application, value: a.total }));

  return (
    <div className="grid items-center gap-6 md:grid-cols-[260px_1fr]">
      <div className="relative mx-auto h-[240px] w-[240px]">
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
              innerRadius={62}
              outerRadius={100}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Total sessions
          </div>
          <div className="num mt-0.5 text-2xl font-semibold">{num(grand)}</div>
          <div className="text-[11px] text-muted-foreground">across top 6 apps</div>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {top.map((a, i) => (
          <li
            key={a.application}
            className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-1.5 hover:border-border hover:bg-muted/40"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span
                className="block size-2.5 shrink-0 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="truncate font-medium">{a.application}</span>
              <span className="text-xs text-muted-foreground">· {a.cad}</span>
            </div>
            <div className="num flex shrink-0 items-baseline gap-2 tabular-nums">
              <span className="font-medium">{num(a.total)}</span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {pct(a.total / grand)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
