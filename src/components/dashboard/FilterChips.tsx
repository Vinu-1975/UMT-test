import { useState } from "react";
import {
  CalendarDays,
  Cpu,
  Globe2,
  Layers,
  MonitorSmartphone,
  Network,
  Package,
  RotateCcw,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useFilters, DEFAULT_FILTERS } from "@/lib/filter-context";
import {
  APPLICATIONS,
  CAD_TOOLS,
  HARDWARE_KINDS,
  PRODUCT_LINES,
  REGIONS,
  TECH_DOMAINS,
} from "@/lib/mock-data";
import type { RangePreset } from "@/lib/types";

const RANGES: { id: RangePreset; label: string }[] = [
  { id: "30d",    label: "30d" },
  { id: "90d",    label: "90d" },
  { id: "ytd",    label: "YTD" },
  { id: "12m",    label: "12 months" },
  { id: "custom", label: "Custom" },
];

function ChipPopover({
  icon: Icon,
  label,
  options,
  value,
  onChange,
  allLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  allLabel: string;
}) {
  const display = value === "all" ? allLabel : value;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-full font-normal"
        >
          <Icon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{display}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-1">
        <ul className="max-h-72 space-y-0.5 overflow-y-auto">
          <Option active={value === "all"} label={allLabel} onClick={() => onChange("all")} />
          {options.map((opt) => (
            <Option
              key={opt}
              active={opt === value}
              label={opt}
              onClick={() => onChange(opt)}
            />
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function Option({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={[
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm",
          active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted",
        ].join(" ")}
      >
        {label}
        {active ? <span className="size-1.5 rounded-full bg-primary" /> : null}
      </button>
    </li>
  );
}

function CustomRangePopover() {
  const { global, setGlobal } = useFilters();
  const [from, setFrom] = useState(global.customFrom ?? "");
  const [to, setTo] = useState(global.customTo ?? "");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
        >
          Custom
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-lg"
            />
          </div>
          <Button
            size="sm"
            className="w-full rounded-lg"
            onClick={() =>
              setGlobal({
                range: "custom",
                customFrom: from || undefined,
                customTo: to || undefined,
              })
            }
            disabled={!from || !to || from > to}
          >
            Apply range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FilterChips() {
  const { global, setGlobal, resetGlobal } = useFilters();

  const dirty =
    global.range !== DEFAULT_FILTERS.range ||
    global.application !== "all" ||
    global.cad !== "all" ||
    global.productLine !== "all" ||
    global.region !== "all" ||
    global.domain !== "all" ||
    global.hardware !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
        <CalendarDays className="ml-2 size-4 text-muted-foreground" />
        {RANGES.map((r) =>
          r.id === "custom" && global.range === "custom" ? (
            <CustomRangePopover key={r.id} />
          ) : (
            <button
              key={r.id}
              type="button"
              onClick={() =>
                r.id === "custom"
                  ? setGlobal({ range: "custom" })
                  : setGlobal({ range: r.id, customFrom: undefined, customTo: undefined })
              }
              className={[
                "rounded-full px-3 py-1 text-sm transition-colors",
                global.range === r.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {r.label}
            </button>
          ),
        )}
      </div>

      <Separator orientation="vertical" className="hidden h-6 md:block" />

      <ChipPopover icon={Layers}            label="App"      options={APPLICATIONS.map((a) => a.name)} value={global.application} onChange={(v) => setGlobal({ application: v })} allLabel="All applications" />
      <ChipPopover icon={Cpu}               label="CAD"      options={CAD_TOOLS}                       value={global.cad}         onChange={(v) => setGlobal({ cad: v })}         allLabel="All CAD tools" />
      <ChipPopover icon={Package}           label="Product"  options={PRODUCT_LINES}                   value={global.productLine} onChange={(v) => setGlobal({ productLine: v })} allLabel="All product lines" />
      <ChipPopover icon={Globe2}            label="Region"   options={REGIONS}                         value={global.region}      onChange={(v) => setGlobal({ region: v })}      allLabel="All regions" />
      <ChipPopover icon={Network}           label="Domain"   options={TECH_DOMAINS}                    value={global.domain}      onChange={(v) => setGlobal({ domain: v })}      allLabel="All domains" />
      <ChipPopover icon={MonitorSmartphone} label="Hardware" options={HARDWARE_KINDS}                  value={global.hardware}    onChange={(v) => setGlobal({ hardware: v as "all" | "VDI" | "Non-VDI" })} allLabel="All hardware" />

      {dirty ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetGlobal}
          className="h-9 gap-1.5 rounded-full text-xs text-muted-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset all
        </Button>
      ) : null}
    </div>
  );
}
