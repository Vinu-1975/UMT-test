import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { FilterProvider } from "@/lib/filter-context";
import { AdminDataProvider } from "@/lib/admin-data";

export function AppShell() {
  return (
    <FilterProvider>
      <AdminDataProvider>
        <TooltipProvider delayDuration={250}>
          {/* Brand hairline — the only place blue + gold meet, echoing
              the swoosh in the Cooper Standard mark. */}
          <div
            aria-hidden
            className="brand-hairline fixed inset-x-0 top-0 z-50 h-[2px]"
          />

          <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />
              <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-8 md:py-10">
                <Outlet />
              </main>
              <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
                <span className="font-medium text-foreground/70">CooperStandard</span>
                <span className="mx-2 text-border">·</span>
                UMT — Usage Monitoring Tool
                <span className="mx-2 text-border">·</span>
                Internal use only
              </footer>
            </div>
          </div>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AdminDataProvider>
    </FilterProvider>
  );
}
