import type {
  AdminRecord,
  Application,
  ApplicationFunctionalityUsage,
  ApplicationUsage,
  CadTool,
  CadUsage,
  DomainRecord,
  DomainUsage,
  Hardware,
  MonthlyCadUsagePoint,
  MonthlyUsagePoint,
  RawSessionRow,
  Region,
  RegionUsage,
  SessionStatus,
  VdiUserRecord,
} from "./types";

import RAW_SESSIONS_JSON from "./data/raw-sessions.json";
import VDI_USERS_JSON from "./data/vdi-users.json";
import DOMAIN_RECORDS_JSON from "./data/domain-records.json";

// ── Enumerations ────────────────────────────────────────────────
export const CAD_TOOLS: readonly CadTool[] = ["CATIA", "NX"];
export const REGIONS: readonly Region[] = ["NA", "EU", "ASIA", "SA"];
export const HARDWARE_KINDS: readonly Hardware[] = ["VDI", "Non-VDI"];
export const SESSION_STATUSES: readonly SessionStatus[] = [
  "Active",
  "Completed",
  "Failed",
  "Stopped",
];

// ── Cast loaded JSON to typed shapes ───────────────────────────
export const RAW_SESSIONS: RawSessionRow[] = RAW_SESSIONS_JSON as RawSessionRow[];
export const VDI_USERS: VdiUserRecord[] = VDI_USERS_JSON as VdiUserRecord[];
export const DOMAIN_RECORDS: DomainRecord[] = DOMAIN_RECORDS_JSON as DomainRecord[];

// ── Derived enumerations from real data ─────────────────────────
const uniqueSorted = (arr: string[]): string[] =>
  [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const PRODUCT_LINES: readonly string[] = uniqueSorted(
  RAW_SESSIONS.map((s) => s.productLine),
);

export const TECH_DOMAINS: readonly string[] = uniqueSorted(
  RAW_SESSIONS.map((s) => s.domain),
);

export const CORP_GROUPS: readonly string[] = uniqueSorted(
  DOMAIN_RECORDS.map((d) => d.corporateGroup),
);

// ── Applications (one entry per unique application name) ────────
const APP_LINE_PRIORITY: Record<string, number> = {
  FLUIDS: 0,
  SEALING: 1,
  FBD: 2,
  FTS: 3,
  GENERAL: 4,
};
function pickDominant<T extends string>(values: T[]): T {
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}
const appAggregates = new Map<
  string,
  { cads: CadTool[]; productLines: string[] }
>();
for (const s of RAW_SESSIONS) {
  const a = appAggregates.get(s.application);
  if (a) {
    a.cads.push(s.cad);
    a.productLines.push(s.productLine);
  } else {
    appAggregates.set(s.application, { cads: [s.cad], productLines: [s.productLine] });
  }
}

export const APPLICATIONS: Application[] = [...appAggregates.entries()]
  .map(([name, a], i) => ({
    id: `app-${String(i + 1).padStart(2, "0")}`,
    name,
    cad: pickDominant(a.cads),
    productLine: pickDominant(a.productLines),
  }))
  .sort((x, y) => {
    const px = APP_LINE_PRIORITY[x.productLine] ?? 99;
    const py = APP_LINE_PRIORITY[y.productLine] ?? 99;
    if (px !== py) return px - py;
    return x.name.localeCompare(y.name);
  });

// ── Per-application usage with functionality breakdown ──────────
function bucketFunctionality(fn: string): "validation" | "execution" | "blockCreation" | "viewOps" {
  const u = fn.toUpperCase();
  if (u.includes("VALIDATION") || u.includes("CHECK")) return "validation";
  if (u.includes("CREATE") || u.includes("CREATION") || u.includes("PLACEMENT") || u.includes("INSERT")) return "blockCreation";
  if (u.includes("VIEW") || u.includes("SHOW") || u.includes("HIDE") || u.includes("DISPLAY") || u.includes("NOTES") || u.includes("TITLEBLOCK")) return "viewOps";
  return "execution";
}
const usageByApp = new Map<
  string,
  { cad: CadTool; productLine: string; total: number; validation: number; execution: number; blockCreation: number; viewOps: number }
>();
for (const s of RAW_SESSIONS) {
  let row = usageByApp.get(s.application);
  if (!row) {
    row = { cad: s.cad, productLine: s.productLine, total: 0, validation: 0, execution: 0, blockCreation: 0, viewOps: 0 };
    usageByApp.set(s.application, row);
  }
  row.total++;
  row[bucketFunctionality(s.functionality)]++;
}
export const APPLICATION_USAGE: ApplicationUsage[] = [...usageByApp.entries()]
  .map(([application, r]) => ({ application, ...r }))
  .sort((a, b) => b.total - a.total);

// ── Per-application functionality usage (granular) ──────────────
const fnByApp = new Map<string, Map<string, { cad: CadTool; total: number }>>();
for (const s of RAW_SESSIONS) {
  let perFn = fnByApp.get(s.application);
  if (!perFn) {
    perFn = new Map();
    fnByApp.set(s.application, perFn);
  }
  const cur = perFn.get(s.functionality);
  if (cur) cur.total++;
  else perFn.set(s.functionality, { cad: s.cad, total: 1 });
}
export const APPLICATION_FUNCTIONALITY_USAGE: ApplicationFunctionalityUsage[] =
  [...fnByApp.entries()].flatMap(([application, perFn]) =>
    [...perFn.entries()].map(([functionality, { cad, total }]) => ({
      application,
      functionality,
      cad,
      total,
    })),
  );

// ── Per-CAD usage ───────────────────────────────────────────────
const cadCounts = new Map<CadTool, number>();
for (const s of RAW_SESSIONS) cadCounts.set(s.cad, (cadCounts.get(s.cad) ?? 0) + 1);
const cadGrand = [...cadCounts.values()].reduce((a, b) => a + b, 0) || 1;
export const CAD_USAGE: CadUsage[] = [...cadCounts.entries()]
  .map(([cad, sessions]) => ({ cad, sessions, share: sessions / cadGrand }))
  .sort((a, b) => b.sessions - a.sessions);

// ── Region usage ────────────────────────────────────────────────
const regionCounts = new Map<Region, number>();
for (const s of RAW_SESSIONS) regionCounts.set(s.region, (regionCounts.get(s.region) ?? 0) + 1);
export const REGION_USAGE: RegionUsage[] = REGIONS.map((r) => ({
  region: r,
  sessions: regionCounts.get(r) ?? 0,
})).filter((r) => r.sessions > 0);

// ── Domain usage ────────────────────────────────────────────────
const domainCounts = new Map<string, number>();
for (const s of RAW_SESSIONS) domainCounts.set(s.domain, (domainCounts.get(s.domain) ?? 0) + 1);
export const DOMAIN_USAGE: DomainUsage[] = [...domainCounts.entries()]
  .map(([domain, sessions]) => ({ domain, sessions }))
  .sort((a, b) => b.sessions - a.sessions);

// ── Monthly usage (production vs test) ─────────────────────────
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthly: { production: number; test: number }[] = MONTH_LABELS.map(() => ({ production: 0, test: 0 }));
for (const s of RAW_SESSIONS) {
  const monthIdx = parseInt(s.startTime.slice(5, 7), 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) continue;
  if (s.isProd) monthly[monthIdx]!.production++;
  else monthly[monthIdx]!.test++;
}
export const MONTHLY_USAGE: MonthlyUsagePoint[] = MONTH_LABELS.map((m, i) => ({
  month: m,
  production: monthly[i]!.production,
  test: monthly[i]!.test,
}));

// Monthly usage broken down by CAD platform (CATIA / NX) for the home page.
const monthlyCad: { CATIA: number; NX: number }[] = MONTH_LABELS.map(() => ({ CATIA: 0, NX: 0 }));
for (const s of RAW_SESSIONS) {
  const monthIdx = parseInt(s.startTime.slice(5, 7), 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) continue;
  if (s.cad === "CATIA") monthlyCad[monthIdx]!.CATIA++;
  else if (s.cad === "NX") monthlyCad[monthIdx]!.NX++;
}
export const MONTHLY_CAD_USAGE: MonthlyCadUsagePoint[] = MONTH_LABELS.map((m, i) => ({
  month: m,
  CATIA: monthlyCad[i]!.CATIA,
  NX: monthlyCad[i]!.NX,
  total: monthlyCad[i]!.CATIA + monthlyCad[i]!.NX,
}));

// ── Hardware split + Production/Test split ──────────────────────
const vdiSessions = RAW_SESSIONS.filter((s) => s.hardware === "VDI").length;
const nonVdiSessions = RAW_SESSIONS.length - vdiSessions;
const prodSessions = RAW_SESSIONS.filter((s) => s.isProd).length;
const testSessions = RAW_SESSIONS.length - prodSessions;

export const HARDWARE_SPLIT = [
  { name: "VDI", value: vdiSessions },
  { name: "Non-VDI", value: nonVdiSessions },
];
export const PROD_TEST_SPLIT = [
  { name: "Production", value: prodSessions },
  { name: "Test", value: testSessions },
];

// ── Headline KPIs (real data) ───────────────────────────────────
const totalSessions = RAW_SESSIONS.length;
const uniqueUsers = new Set(RAW_SESSIONS.map((s) => s.user)).size;
const avgDurationMin = (() => {
  let totalMin = 0;
  let counted = 0;
  for (const s of RAW_SESSIONS) {
    if (!s.stopTime) continue;
    const start = new Date(s.startTime.replace(" ", "T"));
    const stop = new Date(s.stopTime.replace(" ", "T"));
    const min = (stop.getTime() - start.getTime()) / 60_000;
    if (min >= 0) {
      totalMin += min;
      counted++;
    }
  }
  return counted > 0 ? Math.round(totalMin / counted) : 0;
})();

export const HEADLINE = {
  totalSessions,
  sessionsDelta: Math.round(totalSessions * 0.07),
  activeUsers: uniqueUsers,
  activeUsersDelta: Math.round(uniqueUsers * 0.04),
  applications: APPLICATIONS.length,
  applicationsDelta: 1,
  averageSessionMin: avgDurationMin,
  averageSessionDelta: -3,
};

// ── Admins (placeholder) ────────────────────────────────────────
const ADMIN_USERS = ["adm001", "adm002", "adm003"];
export const ADMIN_RECORDS: AdminRecord[] = ADMIN_USERS.map((u, i) => ({
  id: `adm-${String(i + 1).padStart(3, "0")}`,
  userId: u,
}));

// ── Quick-link suggestions for Home page ───────────────────────
export const QUICK_LINKS = [
  { title: "View latest sessions", description: "See who is using which tool right now",     to: "/sessions" },
  { title: "Compare CAD tools",    description: "Which CAD platform is used the most?",      to: "/reports?tab=cad" },
  { title: "Manage VDI users",     description: "Add, edit, or remove VDI user records",     to: "/vdi" },
  { title: "User-domain mappings", description: "Map users to engineering domains",          to: "/domains" },
];
