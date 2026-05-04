import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ChartFilterOverride, FilterDim, FilterState } from "./types";

export const DEFAULT_FILTERS: FilterState = {
  range: "ytd",
  application: "all",
  cad: "all",
  productCategory: "all",
  region: "all",
  domain: "all",
  hardware: "all",
  status: "all",
};

type Ctx = {
  global: FilterState;
  setGlobal: (next: Partial<FilterState>) => void;
  resetGlobal: () => void;

  chartOverrides: Record<string, ChartFilterOverride>;
  setChartOverride: (chartId: string, next: ChartFilterOverride) => void;
  resetChart: (chartId: string) => void;
};

const FilterCtx = createContext<Ctx | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [global, setGlobalState] = useState<FilterState>(DEFAULT_FILTERS);
  const [chartOverrides, setChartOverrides] = useState<
    Record<string, ChartFilterOverride>
  >({});

  const setGlobal = useCallback(
    (next: Partial<FilterState>) =>
      setGlobalState((prev) => ({ ...prev, ...next })),
    [],
  );

  const resetGlobal = useCallback(() => setGlobalState(DEFAULT_FILTERS), []);

  const setChartOverride = useCallback(
    (chartId: string, next: ChartFilterOverride) =>
      setChartOverrides((prev) => ({
        ...prev,
        [chartId]: { ...(prev[chartId] ?? {}), ...next },
      })),
    [],
  );

  const resetChart = useCallback(
    (chartId: string) =>
      setChartOverrides((prev) => {
        const copy = { ...prev };
        delete copy[chartId];
        return copy;
      }),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({ global, setGlobal, resetGlobal, chartOverrides, setChartOverride, resetChart }),
    [global, setGlobal, resetGlobal, chartOverrides, setChartOverride, resetChart],
  );

  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

export function useFilters(): Ctx {
  const ctx = useContext(FilterCtx);
  if (!ctx) throw new Error("useFilters must be used inside <FilterProvider>");
  return ctx;
}

/**
 * Returns the effective filters for a specific chart: global filters merged
 * with that chart's per-chart overrides. Only dims listed in `applicable`
 * are considered overridable; everything else passes through from global.
 */
export function useChartFilters(
  chartId: string,
  applicable: readonly FilterDim[],
): {
  effective: FilterState;
  override: ChartFilterOverride;
  overrideCount: number;
  setOverride: (next: ChartFilterOverride) => void;
  reset: () => void;
} {
  const { global, chartOverrides, setChartOverride, resetChart } = useFilters();
  const override = chartOverrides[chartId] ?? {};

  const effective = useMemo<FilterState>(() => {
    const merged: FilterState = { ...global };
    for (const dim of applicable) {
      const v = override[dim];
      if (v !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (merged as any)[dim] = v;
      }
    }
    return merged;
  }, [global, override, applicable]);

  const overrideCount = useMemo(
    () =>
      applicable.reduce((n, dim) => {
        const v = override[dim];
        return n + (v !== undefined && v !== global[dim] ? 1 : 0);
      }, 0),
    [override, global, applicable],
  );

  return {
    effective,
    override,
    overrideCount,
    setOverride: (next) => setChartOverride(chartId, next),
    reset: () => resetChart(chartId),
  };
}
