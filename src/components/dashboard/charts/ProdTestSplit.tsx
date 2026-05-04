import { useMemo } from "react";
import { SplitDonut } from "./SplitDonut";
import { useChartFilters } from "@/lib/filter-context";
import { filterProdTestSplit } from "@/lib/filtering";
import type { FilterDim } from "@/lib/types";

export const PROD_TEST_FILTER: { id: string; applicable: readonly FilterDim[] } = {
  id: "prodTestSplit",
  applicable: ["range", "application", "cad", "productLine", "region", "domain", "hardware"],
};

export function ProdTestSplit() {
  const { effective } = useChartFilters(PROD_TEST_FILTER.id, PROD_TEST_FILTER.applicable);
  const data = useMemo(() => filterProdTestSplit(effective), [effective]);

  return (
    <SplitDonut
      data={data}
      primaryLabel="Sessions"
      colors={["var(--chart-1)", "var(--chart-4)"]}
    />
  );
}
