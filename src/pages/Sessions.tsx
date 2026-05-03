import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SessionsTable } from "@/components/dashboard/SessionsTable";

export default function SessionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Sessions"
        description="A detailed log of every CAD session. Use the search box to find a specific user, application, or machine."
        action={
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download className="size-4" />
            Export to CSV
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <SessionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
