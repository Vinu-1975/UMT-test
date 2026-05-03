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
import type { CadTool } from "@/lib/types";

const TOP_APPS = [...APPLICATION_USAGE]
  .sort((a, b) => b.total - a.total)
  .slice(0, 5)
  .map((a) => a.application);

const CAD_TOOLS: CadTool[] = ["CATIA", "NX", "Creo", "SolidWorks", "Inventor"];

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function CadVsAppMatrix() {
  // For each CAD, sum the top apps that belong to it; pad with 0 for others.
  const data = CAD_TOOLS.map((cad) => {
    const row: Record<string, number | string> = { cad };
    for (const appName of TOP_APPS) {
      const u = APPLICATION_USAGE.find(
        (a) => a.application === appName && a.cad === cad,
      );
      row[appName] = u?.total ?? 0;
    }
    return row;
  });

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
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
            formatter={(v) => num(Number(v))}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 8, fontSize: 12 }}
          />
          {TOP_APPS.map((appName, i) => (
            <Bar
              key={appName}
              dataKey={appName}
              name={appName}
              fill={PALETTE[i % PALETTE.length]}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
