import { Bell, Moon, Search, ShieldCheck, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { BrandMark } from "./BrandMark";
import { PaletteSwitcher } from "./PaletteSwitcher";

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
            without competing with the wordmark in the sidebar. The thin gold
            inner stroke ties it to the swoosh in the BrandMark. */}
        <div
          className="group/chip relative mr-2 hidden items-center gap-2 overflow-hidden rounded-full border border-[oklch(0.43_0.17_256_/_0.18)] bg-card py-1 pr-3 pl-1.5 shadow-[0_1px_0_0_oklch(0.83_0.16_88_/_0.35)_inset] transition-colors hover:border-[oklch(0.83_0.16_88_/_0.55)] lg:flex"
          aria-label="Cooper Standard tenant"
        >
          <span className="grid size-6 place-items-center rounded-full bg-primary/8 ring-1 ring-[oklch(0.83_0.16_88_/_0.45)] transition-shadow group-hover/chip:ring-[oklch(0.83_0.16_88)]">
            <BrandMark className="size-[18px]" />
          </span>
          <span className="text-[11px] font-semibold tracking-tight">
            <span className="text-[#0E4DA1] dark:text-primary">Cooper</span>
            <span className="ml-0.5 text-[color:oklch(0.62_0.13_82)] dark:text-[color:oklch(0.83_0.16_88)]">
              Standard
            </span>
          </span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-3 text-[color:oklch(0.62_0.13_148)]" />
            Internal
          </span>
        </div>

        <PaletteSwitcher />
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
