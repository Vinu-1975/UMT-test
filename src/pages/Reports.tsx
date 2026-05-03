import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { FilterChips } from "@/components/dashboard/FilterChips";
import { TrendChart } from "@/components/dashboard/charts/TrendChart";
import { ApplicationDonut } from "@/components/dashboard/charts/ApplicationDonut";
import { ApplicationBars } from "@/components/dashboard/charts/ApplicationBars";
import { CadBars } from "@/components/dashboard/charts/CadBars";
import { CadVsAppMatrix } from "@/components/dashboard/charts/CadVsAppMatrix";
import { RegionBars } from "@/components/dashboard/charts/RegionBars";
import { DomainList } from "@/components/dashboard/charts/DomainList";
import { SplitDonut } from "@/components/dashboard/charts/SplitDonut";
import { HARDWARE_SPLIT, PROD_TEST_SPLIT } from "@/lib/mock-data";

const TABS = [
  { id: "trend",        label: "Usage over time" },
  { id: "applications", label: "Applications" },
  { id: "cad",          label: "CAD tools" },
  { id: "geography",    label: "Regions & domains" },
  { id: "infra",        label: "Infrastructure" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ReportsPage() {
  const [params, setParams] = useSearchParams();
  const initial = (params.get("tab") as TabId) ?? "trend";

  function setTab(next: string) {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("tab", next);
      return p;
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Each chart answers a single question. Pick a tab to drill into a topic."
      />

      <FilterChips />

      <Tabs defaultValue={initial} onValueChange={setTab} className="w-full">
        <TabsList className="h-auto flex-wrap gap-1 rounded-xl bg-muted p-1">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="trend" className="mt-6">
          <ChartCard
            title="How is usage trending this year?"
            description="Total sessions per month, broken down into production and test runs."
          >
            <TrendChart />
          </ChartCard>
        </TabsContent>

        <TabsContent value="applications" className="mt-6 space-y-4">
          <ChartCard
            title="Which applications are used most?"
            description="The top six applications by total sessions this year."
          >
            <ApplicationDonut />
          </ChartCard>
          <ChartCard
            title="What are people doing inside each app?"
            description="A breakdown of sessions by activity type for the busiest apps."
          >
            <ApplicationBars />
          </ChartCard>
        </TabsContent>

        <TabsContent value="cad" className="mt-6 space-y-4">
          <ChartCard
            title="Which CAD platform is used the most?"
            description="Sessions grouped by CAD tool, sorted from most-used to least-used."
          >
            <CadBars />
          </ChartCard>
          <ChartCard
            title="How do top apps differ across CAD tools?"
            description="The five busiest applications, plotted against each CAD platform."
          >
            <CadVsAppMatrix />
          </ChartCard>
        </TabsContent>

        <TabsContent value="geography" className="mt-6 space-y-4">
          <div className="grid gap-4 lg:grid-cols-5">
            <ChartCard
              className="lg:col-span-3"
              title="Where in the world is UMT used?"
              description="Sessions by region for the selected period."
            >
              <RegionBars />
            </ChartCard>
            <ChartCard
              className="lg:col-span-2"
              title="Which corporate group leads adoption?"
              description="Sessions grouped by domain, ranked from highest to lowest."
            >
              <DomainList />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="infra" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard
              title="VDI or local hardware?"
              description="Where the work is actually being done."
            >
              <SplitDonut data={HARDWARE_SPLIT} primaryLabel="Sessions" />
            </ChartCard>
            <ChartCard
              title="Production vs test sessions"
              description="How much of the workload is actual production vs trial runs."
            >
              <SplitDonut
                data={PROD_TEST_SPLIT}
                primaryLabel="Sessions"
                colors={["var(--chart-1)", "var(--chart-4)"]}
              />
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
