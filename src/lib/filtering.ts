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
  MONTHLY_USAGE,
  RAW_SESSIONS,
  REGION_USAGE,
  bucketFunctionality,
} from "./mock-data";
import type { CadTool } from "./types";

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
  // Compute from the filtered raw session stream so every chip
  // (range, application, cad, productLine, region, domain, hardware, status)
  // bites instead of falling back to a coarse scalar shrink.
  const sessions = filterRawSessions(filters);
  type Bucket = { key: string; label: string; CATIA: number; NX: number };
  const buckets = new Map<string, Bucket>();
  const monthLabel = (d: Date) =>
    `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
  for (const s of sessions) {
    const d = new Date(s.startTime);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    let b = buckets.get(key);
    if (!b) {
      b = { key, label: monthLabel(d), CATIA: 0, NX: 0 };
      buckets.set(key, b);
    }
    if (s.cad === "CATIA") b.CATIA += 1;
    else if (s.cad === "NX") b.NX += 1;
  }
  return [...buckets.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((b) => ({
      month: b.label,
      CATIA: b.CATIA,
      NX: b.NX,
      total: b.CATIA + b.NX,
    }));
}

export function filterApplicationUsage(filters: FilterState): ApplicationUsage[] {
  // Aggregate per application from the filtered raw session stream so every
  // chip on the donut / functionality charts actually moves the numbers.
  const sessions = filterRawSessions(filters);
  type Row = {
    cad: CadTool;
    productLine: string;
    total: number;
    validation: number;
    execution: number;
    blockCreation: number;
    viewOps: number;
  };
  const byApp = new Map<string, Row>();
  for (const s of sessions) {
    let r = byApp.get(s.application);
    if (!r) {
      r = {
        cad: s.cad,
        productLine: s.productLine,
        total: 0,
        validation: 0,
        execution: 0,
        blockCreation: 0,
        viewOps: 0,
      };
      byApp.set(s.application, r);
    }
    r.total += 1;
    r[bucketFunctionality(s.functionality)] += 1;
  }
  return [...byApp.entries()]
    .map(([application, r]) => ({ application, ...r }))
    .sort((a, b) => b.total - a.total);
}

export function filterCadUsage(filters: FilterState): CadUsage[] {
  // Count directly from filtered raw sessions so region/domain/hardware/etc.
  // chips bite, instead of inheriting the limited-scope filterApplicationUsage.
  const sessions = filterRawSessions(filters);
  const totals = new Map<CadTool, number>();
  for (const s of sessions) totals.set(s.cad, (totals.get(s.cad) ?? 0) + 1);
  const grand = [...totals.values()].reduce((s, v) => s + v, 0) || 1;
  return [...totals.entries()]
    .map(([cad, sessions]) => ({ cad, sessions, share: sessions / grand }))
    .sort((a, b) => b.sessions - a.sessions);
}

export function filterRegionUsage(filters: FilterState): RegionUsage[] {
  // Count regions directly from the filtered raw session set so every chip
  // (range, application, cad, productLine, region, domain, hardware, status)
  // actually moves the numbers.
  const sessions = filterRawSessions(filters);
  const counts = new Map<string, number>();
  for (const s of sessions) counts.set(s.region, (counts.get(s.region) ?? 0) + 1);
  // Preserve the canonical region ordering from REGION_USAGE and drop empties.
  return REGION_USAGE
    .map((r) => ({ region: r.region, sessions: counts.get(r.region) ?? 0 }))
    .filter((r) => r.sessions > 0);
}

export function filterDomainUsage(filters: FilterState): DomainUsage[] {
  // Tally domains from the filtered raw sessions instead of scaling a static
  // total — that way every chip (range, app, cad, productLine, region,
  // hardware, status) shifts the ranking and the bar widths.
  const sessions = filterRawSessions(filters);
  const counts = new Map<string, number>();
  for (const s of sessions) counts.set(s.domain, (counts.get(s.domain) ?? 0) + 1);
  return [...counts.entries()]
    .map(([domain, sessions]) => ({ domain, sessions }))
    .filter((d) => d.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions);
}

export function filterFluidsSealingsSplit(filters: FilterState) {
  // Split the filtered raw sessions by product line directly.
  const sessions = filterRawSessions(filters);
  let fluids = 0;
  let sealings = 0;
  for (const s of sessions) {
    if (s.productLine === "FLUIDS") fluids += 1;
    else if (s.productLine === "SEALING") sealings += 1;
  }
  return [
    { name: "Fluids", value: fluids },
    { name: "Sealings", value: sealings },
  ].filter((p) => p.value > 0);
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
