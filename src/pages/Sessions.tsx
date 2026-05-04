import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterChips } from "@/components/dashboard/FilterChips";
import { ChartFilterPopover } from "@/components/dashboard/ChartFilterPopover";
import { SessionsTable, SESSIONS_FILTER } from "@/components/dashboard/SessionsTable";

export default function SessionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Sessions"
        description="A detailed log of every CAD session. Filter at the page level, or click ‘Filter’ above the table to override just here."
        action={
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={() => toast.info("CSV export — coming soon.")}
          >
            <Download className="size-4" />
            Export to CSV
          </Button>
        }
      />

      <FilterChips />

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Session log</h3>
              <p className="text-xs text-muted-foreground">
                Showing rows that match the page filters above and any local override.
              </p>
            </div>
            <ChartFilterPopover
              chartId={SESSIONS_FILTER.id}
              applicable={SESSIONS_FILTER.applicable}
            />
          </div>
          <SessionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
