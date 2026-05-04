import { Activity, AppWindow, Clock, Users } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { FilterChips } from "@/components/dashboard/FilterChips";
import { TrendChart, TREND_FILTER } from "@/components/dashboard/charts/TrendChart";
import { HardwareSplit, HARDWARE_SPLIT_FILTER } from "@/components/dashboard/charts/HardwareSplit";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { useFilters } from "@/lib/filter-context";
import { filterRawSessions } from "@/lib/filtering";
import { HEADLINE } from "@/lib/mock-data";

export default function HomePage() {
  const { global } = useFilters();

  const kpis = useMemo(() => {
    // When the user picks a global filter we want the KPIs to *feel* alive.
    // Real backend would aggregate against the same predicate; here we re-derive
    // a session count from the filtered raw rows and scale the rest accordingly.
    const sessions = filterRawSessions(global);
    if (sessions.length === RAW_COUNT) return HEADLINE;

    const ratio = sessions.length / RAW_COUNT;
    return {
      ...HEADLINE,
      totalSessions: Math.max(0, Math.round(HEADLINE.totalSessions * ratio)),
      activeUsers:   Math.max(0, Math.round(HEADLINE.activeUsers   * ratio)),
      averageSessionMin: HEADLINE.averageSessionMin,
    };
  }, [global]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back, Alex"
        description="A friendly overview of how your CAD tools are being used. Pick a filter chip to narrow the whole page, or click ‘Filter’ on a card to scope just that one."
      />

      <FilterChips />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total sessions"
          value={kpis.totalSessions}
          delta={HEADLINE.sessionsDelta}
          icon={Activity}
        />
        <KpiCard
          label="Active users"
          value={kpis.activeUsers}
          delta={HEADLINE.activeUsersDelta}
          icon={Users}
          helpText="vs last week"
        />
        <KpiCard
          label="Applications in use"
          value={HEADLINE.applications}
          delta={HEADLINE.applicationsDelta}
          icon={AppWindow}
          deltaSuffix=" new"
          helpText="this month"
        />
        <KpiCard
          label="Avg. session length"
          value={kpis.averageSessionMin}
          delta={HEADLINE.averageSessionDelta}
          icon={Clock}
          deltaSuffix=" min"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="How is usage trending this year?"
          description="Production and test sessions, by month."
          filter={TREND_FILTER}
        >
          <TrendChart />
        </ChartCard>

        <ChartCard
          title="VDI vs Non-VDI"
          description="Where are sessions actually running?"
          filter={HARDWARE_SPLIT_FILTER}
        >
          <HardwareSplit />
        </ChartCard>
      </div>

      <ChartCard
        title="Quick actions"
        description="Common tasks for administrators and analysts."
      >
        <QuickLinks />
      </ChartCard>
    </div>
  );
}

// Total raw rows we generate; used to compute filter ratios for KPIs above.
const RAW_COUNT = 96;
