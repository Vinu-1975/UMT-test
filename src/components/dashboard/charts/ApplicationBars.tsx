import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { APPLICATION_USAGE } from "@/lib/mock-data";
import { num } from "@/lib/format";

export function ApplicationBars() {
  const data = [...APPLICATION_USAGE].sort((a, b) => b.total - a.total).slice(0, 8);
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="application"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            angle={-18}
            textAnchor="end"
            height={56}
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
            }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(v) => num(Number(v))}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
          />
          <Bar dataKey="validation"    stackId="a" name="Validation"     fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="execution"     stackId="a" name="Execution"      fill="var(--chart-2)" />
          <Bar dataKey="blockCreation" stackId="a" name="Block creation" fill="var(--chart-3)" />
          <Bar dataKey="viewOps"       stackId="a" name="Viewing"        fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
