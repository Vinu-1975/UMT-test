import { AppWindow, CalendarDays, Globe2, Layers, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { FilterChips } from "@/components/dashboard/FilterChips";
import { MonthlyUsage, MONTHLY_USAGE_FILTER } from "@/components/dashboard/charts/MonthlyUsage";
import {
  FluidsSealingsSplit,
  FLUIDS_SEALING_FILTER,
} from "@/components/dashboard/charts/FluidsSealingsSplit";
import { RegionBars, REGION_BARS_FILTER } from "@/components/dashboard/charts/RegionBars";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { useFilters } from "@/lib/filter-context";
import { filterRawSessions } from "@/lib/filtering";
import { num } from "@/lib/format";
import { HEADLINE } from "@/lib/mock-data";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const REGION_LABELS: Record<string, string> = {
  NA: "North America",
  EU: "Europe",
  ASIA: "Asia",
  SA: "South America",
};

/** "FLUIDS" → "Fluids", but leaves short tokens (FBD, FTS) uppercase. */
function prettyProductLine(value: string): string {
  if (value.length <= 3) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function HomePage() {
  const { global } = useFilters();

  const kpis = useMemo(() => {
    const sessions = filterRawSessions(global);
    const currentYear = new Date().getFullYear();

    // Busiest month of the current calendar year.
    const monthBuckets: number[] = new Array(12).fill(0);
    for (const s of sessions) {
      const y = parseInt(s.startTime.slice(0, 4), 10);
      if (y !== currentYear) continue;
      const m = parseInt(s.startTime.slice(5, 7), 10) - 1;
      if (m >= 0 && m < 12) monthBuckets[m]!++;
    }
    let busiestIdx = -1;
    let busiestCount = 0;
    for (let i = 0; i < 12; i++) {
      if (monthBuckets[i]! > busiestCount) {
        busiestCount = monthBuckets[i]!;
        busiestIdx = i;
      }
    }

    // Top application (+ runner-up) from filtered sessions.
    const appCounts = new Map<string, number>();
    for (const s of sessions) {
      appCounts.set(s.application, (appCounts.get(s.application) ?? 0) + 1);
    }
    const sortedApps = [...appCounts.entries()].sort((a, b) => b[1] - a[1]);

    // Top product line.
    const plCounts = new Map<string, number>();
    for (const s of sessions) {
      plCounts.set(s.productLine, (plCounts.get(s.productLine) ?? 0) + 1);
    }
    const sortedPL = [...plCounts.entries()].sort((a, b) => b[1] - a[1]);
    const totalPL = sortedPL.reduce((sum, [, n]) => sum + n, 0) || 1;

    // Top region.
    const regCounts = new Map<string, number>();
    for (const s of sessions) {
      regCounts.set(s.region, (regCounts.get(s.region) ?? 0) + 1);
    }
    const sortedReg = [...regCounts.entries()].sort((a, b) => b[1] - a[1]);
    const totalReg = sortedReg.reduce((sum, [, n]) => sum + n, 0) || 1;

    return {
      busiestMonth: busiestIdx >= 0 ? MONTH_NAMES[busiestIdx]! : "—",
      busiestCount,
      topApp: sortedApps[0]?.[0] ?? "—",
      topAppCount: sortedApps[0]?.[1] ?? 0,
      secondApp: sortedApps[1]?.[0],
      topProductLine: sortedPL[0] ? prettyProductLine(sortedPL[0][0]) : "—",
      topProductLineShare: sortedPL[0] ? Math.round((sortedPL[0][1] / totalPL) * 100) : 0,
      topRegion: sortedReg[0]?.[0] ?? "—",
      topRegionShare: sortedReg[0] ? Math.round((sortedReg[0][1] / totalReg) * 100) : 0,
      applicationsInUse: appCounts.size,
    };
  }, [global]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back, Alex"
        description="A friendly overview of how your CAD tools are being used. Pick a filter chip to narrow the whole page, or click ‘Filter’ on a card to scope just that one."
      />

      <FilterChips />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Busiest month this year"
          value={kpis.busiestMonth}
          icon={CalendarDays}
          caption={
            kpis.busiestCount > 0
              ? `${num(kpis.busiestCount)} sessions`
              : "No sessions yet"
          }
          accent="blue"
        />
        <KpiCard
          label="Most used application"
          value={kpis.topApp}
          icon={Sparkles}
          caption={kpis.secondApp ? `2nd: ${kpis.secondApp}` : `${num(kpis.topAppCount)} sessions`}
          accent="gold"
        />
        <KpiCard
          label="Applications in use"
          value={kpis.applicationsInUse}
          delta={HEADLINE.applicationsDelta}
          icon={AppWindow}
          deltaSuffix=" new"
          helpText="this month"
          accent="blue"
        />
        <KpiCard
          label="Top product line"
          value={kpis.topProductLine}
          icon={Layers}
          caption={
            kpis.topProductLineShare > 0
              ? `${kpis.topProductLineShare}% of sessions`
              : undefined
          }
          accent="gold"
        />
        <KpiCard
          label="Top region"
          value={REGION_LABELS[kpis.topRegion] ?? kpis.topRegion}
          icon={Globe2}
          caption={
            kpis.topRegionShare > 0
              ? `${kpis.topRegionShare}% of sessions`
              : undefined
          }
          accent="blue"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="How many sessions ran each month?"
          description="Total application usage per month, split by CAD platform."
          filter={MONTHLY_USAGE_FILTER}
        >
          <MonthlyUsage />
        </ChartCard>

        <ChartCard
          title="Fluids vs Sealings"
          description="How sessions split across the two main product lines."
          filter={FLUIDS_SEALING_FILTER}
        >
          <FluidsSealingsSplit />
        </ChartCard>
      </div>

      <ChartCard
        title="Where in the world is UMT used?"
        description="Sessions by region for the selected period."
        filter={REGION_BARS_FILTER}
      >
        <RegionBars />
      </ChartCard>

      <ChartCard
        title="Quick actions"
        description="Common tasks for administrators and analysts."
      >
        <QuickLinks />
      </ChartCard>
    </div>
  );
}
