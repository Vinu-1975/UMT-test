import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartFilterPopover } from "./ChartFilterPopover";
import { cn } from "@/lib/utils";
import type { FilterDim } from "@/lib/types";

export type ChartCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /**
   * If provided, ChartCard renders a per-chart filter popover into the action
   * slot. The same `id` and `applicable` should be used by the chart's
   * `useChartFilters(id, applicable)` call.
   */
  filter?: { id: string; applicable: readonly FilterDim[] };
};

/**
 * One question, one card. The title is phrased as a plain-English question,
 * the description gives the user a one-line guide for what the chart shows.
 */
export function ChartCard({
  title,
  description,
  action,
  children,
  className,
  filter,
}: ChartCardProps) {
  const right =
    action ??
    (filter ? (
      <ChartFilterPopover chartId={filter.id} applicable={filter.applicable} />
    ) : null);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="gap-1.5 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {right}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
