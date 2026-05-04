import { SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useChartFilters } from "@/lib/filter-context";
import {
  APPLICATIONS,
  CAD_TOOLS,
  HARDWARE_KINDS,
  PRODUCT_LINES,
  REGIONS,
  SESSION_STATUSES,
  TECH_DOMAINS,
} from "@/lib/mock-data";
import type { ChartFilterOverride, FilterDim } from "@/lib/types";

const DIM_LABEL: Record<FilterDim, string> = {
  range:       "Date range",
  application: "Application",
  cad:         "CAD tool",
  productLine: "Product line",
  region:      "Region",
  domain:      "Domain",
  hardware:    "Hardware",
  status:      "Status",
};

const DIM_OPTIONS: Record<Exclude<FilterDim, "range">, readonly string[]> = {
  application: APPLICATIONS.map((a) => a.name),
  cad:         CAD_TOOLS,
  productLine: PRODUCT_LINES,
  region:      REGIONS,
  domain:      TECH_DOMAINS,
  hardware:    HARDWARE_KINDS,
  status:      SESSION_STATUSES,
};

const RANGE_OPTIONS = [
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "ytd", label: "Year to date" },
  { id: "12m", label: "Last 12 months" },
] as const;

export function ChartFilterPopover({
  chartId,
  applicable,
}: {
  chartId: string;
  applicable: readonly FilterDim[];
}) {
  const { effective, overrideCount, setOverride, reset } =
    useChartFilters(chartId, applicable);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 rounded-full px-3 text-xs"
          aria-label={`Filter — ${chartId}`}
        >
          <SlidersHorizontal className="size-3.5" />
          Filter
          {overrideCount > 0 ? (
            <span className="grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {overrideCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Filter this chart</h4>
          {overrideCount > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          ) : null}
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Overrides the page-level filter, just for this card.
        </p>
        <Separator className="mb-3" />

        <div className="space-y-3">
          {applicable.map((dim) => (
            <DimRow
              key={dim}
              dim={dim}
              value={effective[dim] as string}
              onChange={(v) => setOverride({ [dim]: v } as ChartFilterOverride)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DimRow({
  dim,
  value,
  onChange,
}: {
  dim: FilterDim;
  value: string;
  onChange: (next: string) => void;
}) {
  const label = DIM_LABEL[dim];
  if (dim === "range") {
    return (
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-9 w-full rounded-lg">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  const options = DIM_OPTIONS[dim];
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full rounded-lg">
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
