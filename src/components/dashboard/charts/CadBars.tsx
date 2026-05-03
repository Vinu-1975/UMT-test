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
import { CAD_USAGE } from "@/lib/mock-data";
import { num, pct } from "@/lib/format";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function CadBars() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={CAD_USAGE} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="cad"
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
            width={64}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 12,
            }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(v, _n, item) => {
              const sessions = Number(v);
              const share = (item?.payload as { share?: number } | undefined)?.share;
              return [`${num(sessions)} sessions${share != null ? ` · ${pct(share)}` : ""}`, "Usage"];
            }}
          />
          <Bar dataKey="sessions" name="Sessions" radius={[8, 8, 0, 0]}>
            {CAD_USAGE.map((_, i) => (
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
