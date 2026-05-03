import { Activity, AppWindow, Clock, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { FilterChips } from "@/components/dashboard/FilterChips";
import { TrendChart } from "@/components/dashboard/charts/TrendChart";
import { SplitDonut } from "@/components/dashboard/charts/SplitDonut";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { HEADLINE, HARDWARE_SPLIT } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back, Alex"
        description="A friendly overview of how your CAD tools are being used. All numbers refresh automatically every few minutes."
      />

      <FilterChips />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total sessions this month"
          value={HEADLINE.totalSessions}
          delta={HEADLINE.sessionsDelta}
          icon={Activity}
        />
        <KpiCard
          label="Active users"
          value={HEADLINE.activeUsers}
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
          value={HEADLINE.averageSessionMin}
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
        >
          <TrendChart />
        </ChartCard>

        <ChartCard
          title="VDI vs Non-VDI"
          description="Where are sessions actually running?"
        >
          <SplitDonut data={HARDWARE_SPLIT} primaryLabel="Sessions" />
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
