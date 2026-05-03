import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { num, signed } from "@/lib/format";

export type KpiCardProps = {
  label: string;
  value: number;
  delta?: number;
  deltaSuffix?: string;
  icon: LucideIcon;
  helpText?: string;
};

export function KpiCard({ label, value, delta, deltaSuffix, icon: Icon, helpText }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="num mt-2 text-3xl font-semibold tracking-tight md:text-[34px]">
              {num(value)}
            </div>
          </div>
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-[18px]" />
          </div>
        </div>

        {typeof delta === "number" ? (
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                positive
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
              )}
            >
              {positive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              <span className="num">
                {signed(delta)}
                {deltaSuffix}
              </span>
            </span>
            <span className="text-muted-foreground">{helpText ?? "vs last month"}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
