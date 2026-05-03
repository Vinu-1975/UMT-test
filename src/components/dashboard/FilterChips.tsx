import { useState } from "react";
import { CalendarDays, Cpu, Globe2, Layers, MonitorSmartphone } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Range = { id: "30d" | "90d" | "ytd" | "12m"; label: string };
const RANGES: Range[] = [
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "ytd", label: "Year to date" },
  { id: "12m", label: "Last 12 months" },
];

const APPS = ["All applications", "Body Designer", "Powertrain Suite", "Surface Studio", "Harness Builder"];
const CADS = ["All CAD tools", "CATIA", "NX", "Creo", "SolidWorks", "Inventor"];
const REGIONS = ["All regions", "North America", "Europe", "Asia Pacific", "South America", "Middle East"];
const HARDWARE = ["All hardware", "VDI", "Non-VDI"];

function ChipPopover({
  icon: Icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full font-normal">
          <Icon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-1">
        <ul className="space-y-0.5">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => onChange(opt)}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm",
                  opt === value
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-muted",
                ].join(" ")}
              >
                {opt}
                {opt === value ? (
                  <span className="size-1.5 rounded-full bg-primary" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function FilterChips() {
  const [range, setRange] = useState<Range["id"]>("30d");
  const [app, setApp] = useState(APPS[0]!);
  const [cad, setCad] = useState(CADS[0]!);
  const [region, setRegion] = useState(REGIONS[0]!);
  const [hw, setHw] = useState(HARDWARE[0]!);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
        <CalendarDays className="ml-2 size-4 text-muted-foreground" />
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={[
              "rounded-full px-3 py-1 text-sm transition-colors",
              range === r.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {r.label}
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="hidden h-6 md:block" />

      <ChipPopover icon={Layers}              label="App"      options={APPS}     value={app}    onChange={setApp} />
      <ChipPopover icon={Cpu}                 label="CAD"      options={CADS}     value={cad}    onChange={setCad} />
      <ChipPopover icon={Globe2}              label="Region"   options={REGIONS}  value={region} onChange={setRegion} />
      <ChipPopover icon={MonitorSmartphone}   label="Hardware" options={HARDWARE} value={hw}     onChange={setHw} />
    </div>
  );
}
