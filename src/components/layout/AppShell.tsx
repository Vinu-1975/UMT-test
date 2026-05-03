import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-8 md:py-10">
            <Outlet />
          </main>
          <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
            UMT — Usage Monitoring Tool · Internal use only
          </footer>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </TooltipProvider>
  );
}
