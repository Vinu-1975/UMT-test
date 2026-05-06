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
  HARDWARE_SPLIT,
  MONTHLY_CAD_USAGE,
  MONTHLY_USAGE,
  PROD_TEST_SPLIT,
  RAW_SESSIONS,
  REGION_USAGE,
} from "./mock-data";

// ── Range helpers ──────────────────────────────────────────────────────

export function rangeToMonths(filters: FilterState): number {
  switch (filters.range) {
    case "30d": return 1;
    case "90d": return 3;
    case "ytd": return new Date().getMonth() + 1;
    case "12m": return 12;
    case "custom": {
      if (!filters.customFrom || !filters.customTo) return 12;
      const a = new Date(filters.customFrom);
      const b = new Date(filters.customTo);
      const months = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() + 1;
      return Math.max(1, Math.min(12, months));
    }
  }
}

function rangeWindow(filters: FilterState): { from: Date; to: Date } {
  const now = new Date();
  if (filters.range === "custom" && filters.customFrom && filters.customTo) {
    return { from: new Date(filters.customFrom), to: new Date(filters.customTo) };
  }
  const days = filters.range === "30d" ? 30 : filters.range === "90d" ? 90 : 365;
  const from = filters.range === "ytd"
    ? new Date(now.getFullYear(), 0, 1)
    : new Date(now.getTime() - days * 24 * 60 * 60_000);
  return { from, to: now };
}

// ── Per-chart filtered datasets ────────────────────────────────────────

export function filterMonthly(filters: FilterState): MonthlyUsagePoint[] {
  const months = rangeToMonths(filters);
  const sliced = MONTHLY_USAGE.slice(-months);
  const scale = approximateUsageScale(filters);
  return sliced.map((m) => ({
    month: m.month,
    production: Math.round(m.production * scale),
    test:       Math.round(m.test * scale),
  }));
}

export function filterMonthlyCad(filters: FilterState): MonthlyCadUsagePoint[] {
  const months = rangeToMonths(filters);
  const sliced = MONTHLY_CAD_USAGE.slice(-months);
  const scale = approximateUsageScale(filters);
  // When the user has selected a single CAD tool, zero out the other.
  return sliced.map((m) => {
    const catia = filters.cad === "all" || filters.cad === "CATIA" ? Math.round(m.CATIA * scale) : 0;
    const nx    = filters.cad === "all" || filters.cad === "NX"    ? Math.round(m.NX * scale)    : 0;
    return { month: m.month, CATIA: catia, NX: nx, total: catia + nx };
  });
}

export function filterApplicationUsage(filters: FilterState): ApplicationUsage[] {
  return APPLICATION_USAGE.filter((u) => {
    if (filters.application !== "all" && u.application !== filters.application) return false;
    if (filters.cad !== "all" && u.cad !== filters.cad) return false;
    if (filters.productLine !== "all" && u.productLine !== filters.productLine) return false;
    return true;
  });
}

export function filterCadUsage(filters: FilterState): CadUsage[] {
  if (filters.cad !== "all") {
    return CAD_USAGE.filter((c) => c.cad === filters.cad);
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
  const filtered = filters.region !== "all"
    ? REGION_USAGE.filter((r) => r.region === filters.region)
    : REGION_USAGE;
  return filtered.map((r) => ({ ...r, sessions: Math.round(r.sessions * scale) }));
}

export function filterDomainUsage(filters: FilterState): DomainUsage[] {
  const scale = approximateUsageScale(filters);
  const filtered = filters.domain !== "all"
    ? DOMAIN_USAGE.filter((d) => d.domain === filters.domain)
    : DOMAIN_USAGE;
  return filtered.map((d) => ({ ...d, sessions: Math.round(d.sessions * scale) }));
}

export function filterHardwareSplit(filters: FilterState) {
  const scale = approximateUsageScale(filters);
  if (filters.hardware !== "all") {
    return HARDWARE_SPLIT
      .filter((h) => h.name === filters.hardware)
      .map((h) => ({ ...h, value: Math.round(h.value * scale) }));
  }
  return HARDWARE_SPLIT.map((h) => ({ ...h, value: Math.round(h.value * scale) }));
}

export function filterProdTestSplit(filters: FilterState) {
  const scale = approximateUsageScale(filters);
  return PROD_TEST_SPLIT.map((p) => ({ ...p, value: Math.round(p.value * scale) }));
}

export function filterRawSessions(filters: FilterState): RawSessionRow[] {
  const { from, to } = rangeWindow(filters);
  return RAW_SESSIONS.filter((s) => {
    const start = new Date(s.startTime);
    if (start < from || start > to) return false;
    if (filters.application !== "all" && s.application !== filters.application) return false;
    if (filters.cad !== "all" && s.cad !== filters.cad) return false;
    if (filters.productLine !== "all" && s.productLine !== filters.productLine) return false;
    if (filters.region !== "all" && s.region !== filters.region) return false;
    if (filters.domain !== "all" && s.domain !== filters.domain) return false;
    if (filters.hardware !== "all" && s.hardware !== filters.hardware) return false;
    if (filters.status !== "all" && s.status !== filters.status) return false;
    return true;
  });
}

// ── Internals ──────────────────────────────────────────────────────────

function approximateUsageScale(filters: FilterState): number {
  let scale = 1;
  if (filters.application !== "all") {
    scale *= 1 / APPLICATIONS.length;
  } else if (filters.productLine !== "all") {
    const matching = APPLICATIONS.filter((a) => a.productLine === filters.productLine).length;
    scale *= matching / APPLICATIONS.length;
  }
  if (filters.cad !== "all") {
    const total = APPLICATIONS.length;
    const matching = APPLICATIONS.filter((a) => a.cad === filters.cad).length;
    scale *= matching / total;
  }
  if (filters.region !== "all") scale *= 0.30;
  if (filters.domain !== "all") scale *= 0.28;
  if (filters.hardware === "VDI") scale *= 0.66;
  if (filters.hardware === "Non-VDI") scale *= 0.34;
  return Math.max(scale, 0.04);
}
