import { PageHeader } from "@/components/layout/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { FilterChips } from "@/components/dashboard/FilterChips";
import { MonthlyUsageTotal, MONTHLY_TOTAL_FILTER } from "@/components/dashboard/charts/MonthlyUsageTotal";
import { ApplicationDonut, APP_DONUT_FILTER } from "@/components/dashboard/charts/ApplicationDonut";
import { ApplicationBars, APP_BARS_FILTER } from "@/components/dashboard/charts/ApplicationBars";
import {
  ApplicationFunctionality,
  APP_FUNCTIONALITY_FILTER,
} from "@/components/dashboard/charts/ApplicationFunctionality";
import { CadBars, CAD_BARS_FILTER } from "@/components/dashboard/charts/CadBars";
import { CadVsAppMatrix, CAD_MATRIX_FILTER } from "@/components/dashboard/charts/CadVsAppMatrix";
import { RegionBars, REGION_BARS_FILTER } from "@/components/dashboard/charts/RegionBars";
import { DomainList, DOMAIN_LIST_FILTER } from "@/components/dashboard/charts/DomainList";
import { HardwareSplit, HARDWARE_SPLIT_FILTER } from "@/components/dashboard/charts/HardwareSplit";
import { ProdTestSplit, PROD_TEST_FILTER } from "@/components/dashboard/charts/ProdTestSplit";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Each chart answers a single question. Use the page filters at the top, or click 'Filter' on any card to override them just for that chart."
      />

      <FilterChips />

      <div className="space-y-4">
        <ChartCard
          title="What is the overall monthly usage?"
          description="Total sessions per month, split by CAD platform. Hover a bar to see the CATIA / NX breakdown."
          filter={MONTHLY_TOTAL_FILTER}
        >
          <MonthlyUsageTotal />
        </ChartCard>

        <ChartCard
          title="Which applications are used most?"
          description="The top six applications by total sessions in the selected window."
          filter={APP_DONUT_FILTER}
        >
          <ApplicationDonut />
        </ChartCard>

        <ChartCard
          title="What are people doing inside each app?"
          description="A breakdown of sessions by activity type for the busiest apps."
          filter={APP_BARS_FILTER}
        >
          <ApplicationBars />
        </ChartCard>

        <ChartCard
          title="Which functionality is used most in each application?"
          description="Pick an application to see its top functionalities, ranked by session count."
          filter={APP_FUNCTIONALITY_FILTER}
        >
          <ApplicationFunctionality />
        </ChartCard>

        <ChartCard
          title="Which CAD platform is used the most?"
          description="Sessions grouped by CAD tool, sorted from most-used to least-used."
          filter={CAD_BARS_FILTER}
        >
          <CadBars />
        </ChartCard>

        <ChartCard
          title="How do top apps differ across CAD tools?"
          description="The five busiest applications, plotted against each CAD platform."
          filter={CAD_MATRIX_FILTER}
        >
          <CadVsAppMatrix />
        </ChartCard>

        <div className="grid gap-4 lg:grid-cols-5">
          <ChartCard
            className="lg:col-span-3"
            title="Where in the world is UMT used?"
            description="Sessions by region for the selected period."
            filter={REGION_BARS_FILTER}
          >
            <RegionBars />
          </ChartCard>
          <ChartCard
            className="lg:col-span-2"
            title="Which corporate group leads adoption?"
            description="Sessions grouped by domain, ranked from highest to lowest."
            filter={DOMAIN_LIST_FILTER}
          >
            <DomainList />
          </ChartCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title="VDI or local hardware?"
            description="Where the work is actually being done."
            filter={HARDWARE_SPLIT_FILTER}
          >
            <HardwareSplit />
          </ChartCard>
          <ChartCard
            title="Production vs test sessions"
            description="How much of the workload is actual production vs trial runs."
            filter={PROD_TEST_FILTER}
          >
            <ProdTestSplit />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
