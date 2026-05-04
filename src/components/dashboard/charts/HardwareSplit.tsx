import { useMemo } from "react";
import { SplitDonut } from "./SplitDonut";
import { useChartFilters } from "@/lib/filter-context";
import { filterHardwareSplit } from "@/lib/filtering";
import type { FilterDim } from "@/lib/types";

export const HARDWARE_SPLIT_FILTER: { id: string; applicable: readonly FilterDim[] } = {
  id: "hardwareSplit",
  applicable: ["range", "application", "cad", "productLine", "region", "domain"],
};

export function HardwareSplit() {
  const { effective } = useChartFilters(HARDWARE_SPLIT_FILTER.id, HARDWARE_SPLIT_FILTER.applicable);
  const data = useMemo(() => filterHardwareSplit(effective), [effective]);

  if (data.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-sm text-muted-foreground">
        No hardware data matches the current filter.
      </div>
    );
  }

  return <SplitDonut data={data} primaryLabel="Sessions" />;
}
