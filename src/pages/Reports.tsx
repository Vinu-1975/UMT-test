import { PageHeader } from "@/components/layout/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { MonthlyUsageTotal, MONTHLY_TOTAL_FILTER } from "@/components/dashboard/charts/MonthlyUsageTotal";
import { MonthlyHeatmap, MONTHLY_HEATMAP_FILTER } from "@/components/dashboard/charts/MonthlyHeatmap";
import { YearHeatmap, YEAR_HEATMAP_FILTER } from "@/components/dashboard/charts/YearHeatmap";
import { AppCompare, APP_COMPARE_FILTER } from "@/components/dashboard/charts/AppCompare";
import { ApplicationDonut, APP_DONUT_FILTER } from "@/components/dashboard/charts/ApplicationDonut";
import { ApplicationBars, APP_BARS_FILTER } from "@/components/dashboard/charts/ApplicationBars";
import {
  ApplicationFunctionality,
  APP_FUNCTIONALITY_FILTER,
} from "@/components/dashboard/charts/ApplicationFunctionality";
import { CadBars, CAD_BARS_FILTER } from "@/components/dashboard/charts/CadBars";
import { CadVsAppMatrix, CAD_MATRIX_FILTER } from "@/components/dashboard/charts/CadVsAppMatrix";
import { RegionBars, REGION_BARS_FILTER } from "@/components/dashboard/charts/RegionBars";
import { RegionMonthly, REGION_MONTHLY_FILTER } from "@/components/dashboard/charts/RegionMonthly";
import { DomainList, DOMAIN_LIST_FILTER } from "@/components/dashboard/charts/DomainList";
import {
  FluidsSealingsSplit,
  FLUIDS_SEALING_FILTER,
} from "@/components/dashboard/charts/FluidsSealingsSplit";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Each chart answers a single question and carries its own filter chips — tweak any card without touching the others."
      />

      <div className="space-y-4">
        <ChartCard
          title="What is the overall monthly usage?"
          description="Total sessions per month, split by CAD platform. Toggle between bar and line view to compare totals at a glance."
          filter={MONTHLY_TOTAL_FILTER}
          filterStyle="chips"
        >
          <MonthlyUsageTotal />
        </ChartCard>

        <ChartCard
          title="How does each month compare?"
          description="A single colored tile per month, scaled by total sessions. Spot the year's busy and quiet stretches at a glance."
          filter={YEAR_HEATMAP_FILTER}
          filterStyle="chips"
        >
          <YearHeatmap />
        </ChartCard>

        <ChartCard
          title="When during the year did people log in?"
          description="A day-by-month heatmap of sessions. Darker cells mark busier days; the row under each column sums the month."
          filter={MONTHLY_HEATMAP_FILTER}
          filterStyle="chips"
        >
          <MonthlyHeatmap />
        </ChartCard>

        <ChartCard
          title="How do two applications compare month by month?"
          description="Pick any two applications to plot their monthly session counts side by side."
          filter={APP_COMPARE_FILTER}
          filterStyle="chips"
        >
          <AppCompare />
        </ChartCard>

        <ChartCard
          title="Which applications are used most?"
          description="The top six applications by total sessions in the selected window."
          filter={APP_DONUT_FILTER}
          filterStyle="chips"
        >
          <ApplicationDonut />
        </ChartCard>

        <ChartCard
          title="What are people doing inside each app?"
          description="A breakdown of sessions by activity type for the busiest apps."
          filter={APP_BARS_FILTER}
          filterStyle="chips"
        >
          <ApplicationBars />
        </ChartCard>

        <ChartCard
          title="Which functionality is used most in each application?"
          description="Pick an application to see its top functionalities, ranked by session count."
          filter={APP_FUNCTIONALITY_FILTER}
          filterStyle="chips"
        >
          <ApplicationFunctionality />
        </ChartCard>

        <ChartCard
          title="Which CAD platform is used the most?"
          description="Sessions grouped by CAD tool, sorted from most-used to least-used."
          filter={CAD_BARS_FILTER}
          filterStyle="chips"
        >
          <CadBars />
        </ChartCard>

        <ChartCard
          title="How do top apps differ across CAD tools?"
          description="The five busiest applications, plotted against each CAD platform."
          filter={CAD_MATRIX_FILTER}
          filterStyle="chips"
        >
          <CadVsAppMatrix />
        </ChartCard>

        <div className="grid gap-4 lg:grid-cols-5">
          <ChartCard
            className="lg:col-span-3"
            title="Where in the world is UMT used?"
            description="Sessions by region for the selected period."
            filter={REGION_BARS_FILTER}
            filterStyle="chips"
          >
            <RegionBars />
          </ChartCard>
          <ChartCard
            className="lg:col-span-2"
            title="Which corporate group leads adoption?"
            description="Sessions grouped by domain, ranked from highest to lowest."
            filter={DOMAIN_LIST_FILTER}
            filterStyle="chips"
          >
            <DomainList />
          </ChartCard>
        </div>

        <ChartCard
          title="How does region usage trend across the year?"
          description="Monthly session counts split by region — switch between stacked totals, side-by-side bars, or trend lines."
          filter={REGION_MONTHLY_FILTER}
          filterStyle="chips"
        >
          <RegionMonthly />
        </ChartCard>

        <ChartCard
          title="Fluids vs Sealings"
          description="How sessions split across the two main product lines."
          filter={FLUIDS_SEALING_FILTER}
          filterStyle="chips"
        >
          <FluidsSealingsSplit />
        </ChartCard>
      </div>
    </div>
  );
}
