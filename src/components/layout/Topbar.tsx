import { Bell, Moon, Search, ShieldCheck, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { BrandMark } from "./BrandMark";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search sessions, users, applications…"
          className="h-10 rounded-xl pl-9"
          aria-label="Search"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Cooper Standard brand chip — small CS mark + secured-tenant label.
            Echoes the logo in the header and signals the internal tenant
            without competing with the wordmark in the sidebar. */}
        <div
          className="mr-2 hidden items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1.5 lg:flex"
          aria-label="Cooper Standard tenant"
        >
          <span className="grid size-6 place-items-center rounded-full bg-primary/8">
            <BrandMark className="size-[18px]" />
          </span>
          <span className="text-[11px] font-semibold tracking-tight text-foreground/85">
            Cooper Standard
          </span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-3 text-[color:oklch(0.62_0.13_148)]" />
            Internal
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="rounded-xl"
        >
          <Bell className="size-[18px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="rounded-xl"
        >
          {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </Button>
        <div className="ml-2 flex items-center gap-3 border-l border-border pl-3">
          <div className="hidden text-right text-sm leading-tight md:block">
            <div className="font-medium">Alex Patel</div>
            <div className="text-xs text-muted-foreground">Administrator</div>
          </div>
          <Avatar className="size-9 ring-2 ring-primary/15">
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              AP
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
