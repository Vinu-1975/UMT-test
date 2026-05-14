import type {
  ApplicationUsage,
  CadUsage,
  DomainUsage,
  FilterState,
  MonthlyCadUsagePoint,
  MonthlyUsagePoint,
  RawSessionRow,
  RegionUsage,
} from "./types";
import {
  APPLICATIONS,
  APPLICATION_USAGE,
  CAD_USAGE,
  DOMAIN_USAGE,
  FLUIDS_SEALING_SPLIT,
  MONTHLY_CAD_USAGE,
  MONTHLY_USAGE,
  RAW_SESSIONS,
  REGION_USAGE,
} from "./mock-data";

// ── Range helpers ──────────────────────────────────────────────────────

/**
 * Slice arguments to apply against the 12-bucket rolling monthly dataset
 * built in mock-data.ts (oldest → newest, newest = current month).
 * Returned as `[start, end?]` so callers can spread it straight into
 * `Array.prototype.slice`.
 *
 *   currentMonth → last entry only (i.e. the current calendar month)
 *   lastMonth    → the entry just before the last (previous month)
 *   thisYear     → tail entries from January of the current year through
 *                  the current month (currentMonth + 1 entries)
 *   lastYear     → the full 12-month rolling window
 */
export function rangeSlice(filters: FilterState): [number, number?] {
  switch (filters.range) {
    case "currentMonth": return [-1];
    case "lastMonth":    return [-2, -1];
    case "thisYear":     return [-(new Date().getMonth() + 1)];
    case "lastYear":     return [-12];
    case "custom": {
      if (!filters.customFrom || !filters.customTo) return [-12];
      const a = new Date(filters.customFrom);
      const b = new Date(filters.customTo);
      const months =
        (b.getFullYear() - a.getFullYear()) * 12 +
        b.getMonth() - a.getMonth() + 1;
      return [-Math.max(1, Math.min(12, months))];
    }
  }
}

/**
 * Absolute date window used to filter raw session rows. Each preset maps to
 * a concrete `[from, to]` interval — calendar-aware, so "Last month" honours
 * month boundaries rather than rolling a 30-day window.
 */
function rangeWindow(filters: FilterState): { from: Date; to: Date } {
  const now = new Date();
  switch (filters.range) {
    case "currentMonth":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to:   now,
      };
    case "lastMonth":
      // Day 0 of the current month is the last day of the previous month.
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to:   new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      };
    case "thisYear":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to:   now,
      };
    case "lastYear":
      return {
        from: new Date(now.getFullYear() - 1, 0, 1),
        to:   new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59),
      };
    case "custom":
      if (filters.customFrom && filters.customTo) {
        return { from: new Date(filters.customFrom), to: new Date(filters.customTo) };
      }
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
}

// ── Multi-select helper ────────────────────────────────────────────────

/** Empty selection (`[]`) means "no filter applied" — pass everything. */
function matches<T extends string>(selected: readonly T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

// ── Per-chart filtered datasets ────────────────────────────────────────

export function filterMonthly(filters: FilterState): MonthlyUsagePoint[] {
  const sliced = MONTHLY_USAGE.slice(...rangeSlice(filters));
  const scale = approximateUsageScale(filters);
  return sliced.map((m) => ({
    month: m.month,
    production: Math.round(m.production * scale),
    test:       Math.round(m.test * scale),
  }));
}

export function filterMonthlyCad(filters: FilterState): MonthlyCadUsagePoint[] {
  const sliced = MONTHLY_CAD_USAGE.slice(...rangeSlice(filters));
  const scale = approximateUsageScale(filters);
  // When the user has selected one CAD tool, zero out the other. With both
  // (or neither) selected, the chart shows both series.
  return sliced.map((m) => {
    const catia = matches(filters.cad, "CATIA") ? Math.round(m.CATIA * scale) : 0;
    const nx    = matches(filters.cad, "NX")    ? Math.round(m.NX * scale)    : 0;
    return { month: m.month, CATIA: catia, NX: nx, total: catia + nx };
  });
}

export function filterApplicationUsage(filters: FilterState): ApplicationUsage[] {
  return APPLICATION_USAGE.filter((u) => {
    if (!matches(filters.application, u.application)) return false;
    if (!matches(filters.cad, u.cad)) return false;
    if (!matches(filters.productLine, u.productLine)) return false;
    return true;
  });
}

export function filterCadUsage(filters: FilterState): CadUsage[] {
  if (filters.cad.length > 0) {
    return CAD_USAGE.filter((c) => filters.cad.includes(c.cad));
  }
  const apps = filterApplicationUsage(filters);
  const totals = new Map<string, number>();
  for (const a of apps) totals.set(a.cad, (totals.get(a.cad) ?? 0) + a.total);
  const grand = [...totals.values()].reduce((s, v) => s + v, 0) || 1;
  return [...totals.entries()]
    .map(([cad, sessions]) => ({
      cad: cad as CadUsage["cad"],
      sessions,
      share: sessions / grand,
    }))
    .sort((a, b) => b.sessions - a.sessions);
}

export function filterRegionUsage(filters: FilterState): RegionUsage[] {
  const scale = approximateUsageScale(filters);
  const filtered = filters.region.length > 0
    ? REGION_USAGE.filter((r) => filters.region.includes(r.region))
    : REGION_USAGE;
  return filtered.map((r) => ({ ...r, sessions: Math.round(r.sessions * scale) }));
}

export function filterDomainUsage(filters: FilterState): DomainUsage[] {
  const scale = approximateUsageScale(filters);
  const filtered = filters.domain.length > 0
    ? DOMAIN_USAGE.filter((d) => filters.domain.includes(d.domain))
    : DOMAIN_USAGE;
  return filtered.map((d) => ({ ...d, sessions: Math.round(d.sessions * scale) }));
}

export function filterFluidsSealingsSplit(filters: FilterState) {
  const scale = approximateUsageScale(filters);
  // The donut is itself a product-line breakdown. If the user has narrowed
  // productLine, hide the slices that fall outside the selection.
  const lines = filters.productLine;
  return FLUIDS_SEALING_SPLIT
    .filter((p) =>
      lines.length === 0 ||
      lines.includes(p.name === "Fluids" ? "FLUIDS" : "SEALING"),
    )
    .map((p) => ({ ...p, value: Math.round(p.value * scale) }));
}

export function filterRawSessions(filters: FilterState): RawSessionRow[] {
  const { from, to } = rangeWindow(filters);
  return RAW_SESSIONS.filter((s) => {
    const start = new Date(s.startTime);
    if (start < from || start > to) return false;
    if (!matches(filters.application, s.application)) return false;
    if (!matches(filters.cad, s.cad)) return false;
    if (!matches(filters.productLine, s.productLine)) return false;
    if (!matches(filters.region, s.region)) return false;
    if (!matches(filters.domain, s.domain)) return false;
    if (!matches(filters.hardware, s.hardware)) return false;
    if (!matches(filters.status, s.status)) return false;
    return true;
  });
}

// ── Internals ──────────────────────────────────────────────────────────

function approximateUsageScale(filters: FilterState): number {
  let scale = 1;
  const total = APPLICATIONS.length;
  if (filters.application.length > 0) {
    scale *= filters.application.length / total;
  } else if (filters.productLine.length > 0) {
    const matching = APPLICATIONS.filter((a) =>
      filters.productLine.includes(a.productLine),
    ).length;
    scale *= matching / total;
  }
  if (filters.cad.length > 0) {
    const matching = APPLICATIONS.filter((a) => filters.cad.includes(a.cad)).length;
    scale *= matching / total;
  }
  if (filters.region.length > 0) scale *= 0.30 + 0.20 * (filters.region.length - 1);
  if (filters.domain.length > 0) scale *= 0.28 + 0.18 * (filters.domain.length - 1);
  if (filters.hardware.length === 1) {
    if (filters.hardware[0] === "VDI")     scale *= 0.66;
    if (filters.hardware[0] === "Non-VDI") scale *= 0.34;
  }
  return Math.max(scale, 0.04);
}
