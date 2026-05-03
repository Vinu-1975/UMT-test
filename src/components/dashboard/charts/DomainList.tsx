import { DOMAIN_USAGE } from "@/lib/mock-data";
import { num, pct } from "@/lib/format";

/**
 * Plain progress-bar list — much friendlier than another bar chart.
 */
export function DomainList() {
  const max = Math.max(...DOMAIN_USAGE.map((d) => d.sessions));
  const total = DOMAIN_USAGE.reduce((s, d) => s + d.sessions, 0);

  return (
    <ul className="space-y-3.5">
      {DOMAIN_USAGE.map((d, i) => {
        const widthPct = (d.sessions / max) * 100;
        return (
          <li key={d.domain}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 truncate">
                <span className="num w-5 text-right text-xs text-muted-foreground">
                  {i + 1}
                </span>
                <span className="truncate font-medium">{d.domain}</span>
              </div>
              <div className="num flex shrink-0 items-baseline gap-3 tabular-nums">
                <span className="font-medium">{num(d.sessions)}</span>
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {pct(d.sessions / total)}
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80 transition-[width] duration-500"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
