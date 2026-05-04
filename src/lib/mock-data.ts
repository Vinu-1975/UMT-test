import type {
  AdminRecord,
  Application,
  ApplicationUsage,
  CadTool,
  CadUsage,
  DomainRecord,
  DomainUsage,
  MonthlyUsagePoint,
  ProductCategory,
  RawSessionRow,
  Region,
  RegionUsage,
  SessionStatus,
  VdiUserRecord,
  Hardware,
} from "./types";

// Deterministic PRNG so demo data is stable across reloads.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260502);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]!;
const between = (min: number, max: number) =>
  Math.round(min + rand() * (max - min));

// ── Enumerations (exact values from UMT.txt) ────────────────────
export const CAD_TOOLS: readonly CadTool[] = ["CATIA", "NX"];

export const REGIONS: readonly Region[] = ["NA", "EU", "ASIA", "SA"];

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  "Fluids",
  "Sealing",
  "General",
];

export const DOMAINS = ["ATIBAIA", "BATTIPAGLIA", "CHONGQING", "COVENTRY"] as const;

export const HARDWARE_KINDS: readonly Hardware[] = ["VDI", "Non-VDI"];
export const SESSION_STATUSES: readonly SessionStatus[] = [
  "Active",
  "Completed",
  "Failed",
  "Stopped",
];

// ── Applications ────────────────────────────────────────────────
// The full 24-tool list from UMT.txt, with case preserved exactly as written.
// CAD and product-category assignments are deterministic placeholders — adjust
// when the real mapping arrives.
export const APPLICATIONS: Application[] = [
  { id: "app-01", name: "3d trim",            cad: "CATIA", productCategory: "Sealing" },
  { id: "app-02", name: "auto section",       cad: "CATIA", productCategory: "Sealing" },
  { id: "app-03", name: "bbb",                cad: "NX",    productCategory: "General" },
  { id: "app-04", name: "Design toolkit",     cad: "CATIA", productCategory: "General" },
  { id: "app-05", name: "dlc",                cad: "NX",    productCategory: "General" },
  { id: "app-06", name: "ext straighten",     cad: "NX",    productCategory: "Sealing" },
  { id: "app-07", name: "fbd pmc",            cad: "CATIA", productCategory: "Fluids" },
  { id: "app-08", name: "file manager",       cad: "CATIA", productCategory: "General" },
  { id: "app-09", name: "file organiser",     cad: "NX",    productCategory: "Fluids" },
  { id: "app-10", name: "fts pmc",            cad: "CATIA", productCategory: "Fluids" },
  { id: "app-11", name: "hide show 3d",       cad: "CATIA", productCategory: "Sealing" },
  { id: "app-12", name: "measure 3d dim",     cad: "CATIA", productCategory: "General" },
  { id: "app-13", name: "multi 3d ops",       cad: "NX",    productCategory: "Sealing" },
  { id: "app-14", name: "notes utility",      cad: "NX",    productCategory: "General" },
  { id: "app-15", name: "pin space place",    cad: "NX",    productCategory: "General" },
  { id: "app-16", name: "point chart",        cad: "NX",    productCategory: "Fluids" },
  { id: "app-17", name: "point converter",    cad: "NX",    productCategory: "Sealing" },
  { id: "app-18", name: "polyline creation",  cad: "CATIA", productCategory: "Fluids" },
  { id: "app-19", name: "profile checker",    cad: "NX",    productCategory: "Fluids" },
  { id: "app-20", name: "rename entities",    cad: "NX",    productCategory: "Sealing" },
  { id: "app-21", name: "section manager",    cad: "NX",    productCategory: "General" },
  { id: "app-22", name: "smart cvt",          cad: "CATIA", productCategory: "Fluids" },
  { id: "app-23", name: "tube chart",         cad: "CATIA", productCategory: "Fluids" },
  { id: "app-24", name: "xyz coord",          cad: "CATIA", productCategory: "General" },
];

// ── Headline KPIs ───────────────────────────────────────────────
export const HEADLINE = {
  totalSessions:        184_204,
  sessionsDelta:        12_840,
  activeUsers:          2_148,
  activeUsersDelta:     46,
  applications:         APPLICATIONS.length,
  applicationsDelta:    1,
  averageSessionMin:    47,
  averageSessionDelta:  -3,
};

// ── Monthly trend (12 months, full year) ────────────────────────
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const MONTHLY_USAGE: MonthlyUsagePoint[] = MONTH_LABELS.map((m, i) => {
  const seasonal = 1 + 0.18 * Math.sin((i / 12) * Math.PI * 2);
  return {
    month: m,
    production: Math.round((10_500 + i * 480) * seasonal + between(-900, 900)),
    test:       Math.round((2_400  + i * 120) * seasonal + between(-300, 300)),
  };
});

// ── Per-application usage ───────────────────────────────────────
export const APPLICATION_USAGE: ApplicationUsage[] = APPLICATIONS.map((a) => {
  const total = between(2_400, 18_500);
  const validation    = Math.round(total * (0.20 + rand() * 0.10));
  const execution     = Math.round(total * (0.30 + rand() * 0.10));
  const blockCreation = Math.round(total * (0.15 + rand() * 0.10));
  const viewOps       = Math.max(0, total - validation - execution - blockCreation);
  return {
    application: a.name,
    cad: a.cad,
    productCategory: a.productCategory,
    total,
    validation,
    execution,
    blockCreation,
    viewOps,
  };
}).sort((a, b) => b.total - a.total);

// ── Per-CAD usage ───────────────────────────────────────────────
const CAD_TOTALS = CAD_TOOLS.map((cad) => {
  const sessions = APPLICATION_USAGE
    .filter((u) => u.cad === cad)
    .reduce((sum, u) => sum + u.total, 0);
  return { cad, sessions };
});
const CAD_GRAND_TOTAL = CAD_TOTALS.reduce((s, c) => s + c.sessions, 0);
export const CAD_USAGE: CadUsage[] = CAD_TOTALS
  .map((c) => ({ ...c, share: c.sessions / CAD_GRAND_TOTAL }))
  .sort((a, b) => b.sessions - a.sessions);

// ── Regions ─────────────────────────────────────────────────────
export const REGION_USAGE: RegionUsage[] = [
  { region: "NA",   sessions: 64_300 },
  { region: "EU",   sessions: 52_140 },
  { region: "ASIA", sessions: 41_980 },
  { region: "SA",   sessions: 14_840 },
];

// ── Domains ─────────────────────────────────────────────────────
export const DOMAIN_USAGE: DomainUsage[] = DOMAINS.map((d, i) => ({
  domain: d,
  sessions: between(20_000, 70_000) - i * 2_000,
})).sort((a, b) => b.sessions - a.sessions);

// ── Hardware split + Production/Test split ──────────────────────
export const HARDWARE_SPLIT = [
  { name: "VDI",     value: 121_500 },
  { name: "Non-VDI", value: 62_704  },
];
export const PROD_TEST_SPLIT = [
  { name: "Production", value: MONTHLY_USAGE.reduce((s, m) => s + m.production, 0) },
  { name: "Test",       value: MONTHLY_USAGE.reduce((s, m) => s + m.test, 0) },
];

// ── Helpers for admin / sample data ─────────────────────────────
const STATUS_OPTIONS: SessionStatus[] = [
  "Active", "Completed", "Completed", "Completed", "Failed", "Stopped",
];
const HARDWARE_OPTIONS: Hardware[] = ["VDI", "VDI", "VDI", "Non-VDI"];

// User IDs follow a corporate-style stub: 3 letters + 3 digits.
const USER_PREFIXES = [
  "apt", "psh", "mga", "ltn", "ymu", "sru", "dgs", "kfo", "ans", "rsv",
  "jbs", "emb", "lha", "mzh", "noa", "asa", "ckh", "lpa", "rdb", "sjk",
];
function makeUserId(i: number): string {
  const p = USER_PREFIXES[i % USER_PREFIXES.length]!;
  return `${p}${(100 + i).toString()}`;
}

const ADMIN_USERS = ["adm001", "adm002", "adm003"];
function pickAdmin(): string {
  return pick(ADMIN_USERS);
}
function isoOffsetDays(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60_000).toISOString();
}

// ── Raw sessions ────────────────────────────────────────────────
export const RAW_SESSIONS: RawSessionRow[] = Array.from({ length: 96 }, (_, i) => {
  const app = pick(APPLICATIONS);
  const startOffsetMin = between(0, 60 * 24 * 30);
  const start = new Date(Date.now() - startOffsetMin * 60_000);
  const status = pick(STATUS_OPTIONS);
  const stop = status === "Active" ? null : new Date(start.getTime() + between(8, 240) * 60_000);
  return {
    id: `sess-${(i + 1).toString().padStart(4, "0")}`,
    application: app.name,
    cad: app.cad,
    user: makeUserId(i),
    machine: `WS-${between(100, 999)}`,
    domain: pick(DOMAINS),
    region: pick(REGIONS),
    productCategory: app.productCategory,
    startTime: start.toISOString(),
    stopTime: stop?.toISOString() ?? null,
    status,
    hardware: pick(HARDWARE_OPTIONS),
  };
});

// ── VDI users ───────────────────────────────────────────────────
export const VDI_USERS: VdiUserRecord[] = Array.from({ length: 24 }, (_, i) => {
  const createdDays  = between(60, 720);
  const modifiedDays = between(1, Math.max(2, createdDays - 1));
  return {
    id: `vdi-${(i + 1).toString().padStart(3, "0")}`,
    userId: makeUserId(i),
    region: pick(REGIONS),
    domain: pick(DOMAINS),
    createdDate:  isoOffsetDays(createdDays),
    createdBy:    pickAdmin(),
    modifiedDate: isoOffsetDays(modifiedDays),
    modifiedBy:   pickAdmin(),
  };
});

// ── Domain assignments (user ↔ domain mapping) ──────────────────
export const DOMAIN_RECORDS: DomainRecord[] = Array.from({ length: 18 }, (_, i) => {
  const createdDays  = between(60, 720);
  const modifiedDays = between(1, Math.max(2, createdDays - 1));
  return {
    id: `dom-${(i + 1).toString().padStart(3, "0")}`,
    userId: makeUserId(i + 5),
    domain: pick(DOMAINS),
    region: pick(REGIONS),
    createdDate:  isoOffsetDays(createdDays),
    createdBy:    pickAdmin(),
    modifiedDate: isoOffsetDays(modifiedDays),
    modifiedBy:   pickAdmin(),
  };
});

// ── Admins ──────────────────────────────────────────────────────
export const ADMIN_RECORDS: AdminRecord[] = ADMIN_USERS.map((u, i) => ({
  id: `adm-${(i + 1).toString().padStart(3, "0")}`,
  userId: u,
}));

// ── Quick-link suggestions for Home page ───────────────────────
export const QUICK_LINKS = [
  { title: "View latest sessions", description: "See who is using which tool right now",     to: "/sessions" },
  { title: "Compare CAD tools",    description: "Which CAD platform is used the most?",      to: "/reports?tab=cad" },
  { title: "Manage VDI users",     description: "Add, edit, or remove VDI user records",     to: "/vdi" },
  { title: "User-domain mappings", description: "Map users to engineering domains",          to: "/domains" },
];
