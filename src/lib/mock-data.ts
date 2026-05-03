import type {
  Application,
  ApplicationUsage,
  CadTool,
  CadUsage,
  DomainRecord,
  DomainUsage,
  MonthlyUsagePoint,
  RawSessionRow,
  Region,
  RegionUsage,
  SessionStatus,
  VdiUserRecord,
  Hardware,
} from "./types";

// Deterministic PRNG so the demo data is stable across reloads.
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

const CAD_TOOLS: readonly CadTool[] = [
  "CATIA",
  "NX",
  "Creo",
  "SolidWorks",
  "Inventor",
];
const REGIONS: readonly Region[] = [
  "North America",
  "Europe",
  "Asia Pacific",
  "South America",
  "Middle East",
];
const DOMAINS = [
  "engineering.acme",
  "design.acme",
  "manufacturing.acme",
  "rd.acme",
  "global.acme",
  "partner.acme",
  "consult.acme",
];
const CORPORATE_GROUPS = [
  "ACME Engineering",
  "ACME Design",
  "ACME Manufacturing",
  "ACME R&D",
  "ACME Global",
  "Partner Network",
  "Consultants",
];

// ── Applications ────────────────────────────────────────────────
export const APPLICATIONS: Application[] = [
  { id: "app-1",  name: "Body Designer",      cad: "CATIA",      productLine: "Body & Chassis" },
  { id: "app-2",  name: "Surface Studio",     cad: "CATIA",      productLine: "Exterior" },
  { id: "app-3",  name: "Powertrain Suite",   cad: "NX",         productLine: "Powertrain" },
  { id: "app-4",  name: "Harness Builder",    cad: "NX",         productLine: "Electronics" },
  { id: "app-5",  name: "Mechanism Studio",   cad: "Creo",       productLine: "Powertrain" },
  { id: "app-6",  name: "Sheet Metal Pro",    cad: "Creo",       productLine: "Body & Chassis" },
  { id: "app-7",  name: "Assembly Lab",       cad: "SolidWorks", productLine: "Interior" },
  { id: "app-8",  name: "Drawing Tools",      cad: "SolidWorks", productLine: "Body & Chassis" },
  { id: "app-9",  name: "Layout Planner",     cad: "Inventor",   productLine: "Interior" },
  { id: "app-10", name: "Casting Designer",   cad: "Inventor",   productLine: "Powertrain" },
  { id: "app-11", name: "Detail Master",      cad: "CATIA",      productLine: "Electronics" },
  { id: "app-12", name: "Validator Plus",     cad: "NX",         productLine: "Body & Chassis" },
];

// ── Headline KPIs ───────────────────────────────────────────────
export const HEADLINE = {
  totalSessions:        184_204,
  sessionsDelta:        12_840,        // vs last month
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
const REGION_SEED: RegionUsage[] = [
  { region: "North America", sessions: 64_300 },
  { region: "Europe",        sessions: 52_140 },
  { region: "Asia Pacific",  sessions: 41_980 },
  { region: "South America", sessions: 14_840 },
  { region: "Middle East",   sessions:  10_944 },
];
export const REGION_USAGE: RegionUsage[] = REGION_SEED;

// ── Domains ─────────────────────────────────────────────────────
export const DOMAIN_USAGE: DomainUsage[] = CORPORATE_GROUPS.map((g, i) => ({
  domain: g,
  sessions: between(8_000, 38_000) - i * 1_200,
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

// ── Raw sessions ────────────────────────────────────────────────
const STATUS_OPTIONS: SessionStatus[] = ["Active", "Completed", "Completed", "Completed", "Failed", "Stopped"];
const HARDWARE_OPTIONS: Hardware[] = ["VDI", "VDI", "VDI", "Non-VDI"];
const FIRST_NAMES = ["Alex","Priya","Marco","Lin","Yuki","Sara","Diego","Kofi","Anna","Ravi","Jonas","Emma","Liam","Mei","Noah","Aisha"];
const LAST_NAMES  = ["Patel","Schmidt","García","Tanaka","Müller","Silva","Okafor","Singh","Rossi","Park","Dubois","Khan","Cohen","Andersen"];

function buildName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export const RAW_SESSIONS: RawSessionRow[] = Array.from({ length: 96 }, (_, i) => {
  const app = pick(APPLICATIONS);
  const startOffsetMin = between(0, 60 * 24 * 30);   // up to 30 days ago
  const start = new Date(Date.now() - startOffsetMin * 60_000);
  const status = pick(STATUS_OPTIONS);
  const stop = status === "Active" ? null : new Date(start.getTime() + between(8, 240) * 60_000);
  return {
    id: `sess-${(i + 1).toString().padStart(4, "0")}`,
    application: app.name,
    cad: app.cad,
    user: buildName(),
    machine: `WS-${between(100, 999)}`,
    domain: pick(DOMAINS),
    region: pick(REGIONS),
    productLine: app.productLine,
    startTime: start.toISOString(),
    stopTime: stop?.toISOString() ?? null,
    status,
    hardware: pick(HARDWARE_OPTIONS),
  };
});

// ── VDI users ───────────────────────────────────────────────────
const VDI_STATUSES: VdiUserRecord["status"][] = ["Active","Active","Active","Inactive","Pending","Disabled"];
export const VDI_USERS: VdiUserRecord[] = Array.from({ length: 28 }, (_, i) => {
  const fullName = buildName();
  const status = pick(VDI_STATUSES);
  const lastSeen = new Date(Date.now() - between(0, 60 * 24 * 14) * 60_000);
  const email = `${fullName.toLowerCase().replace(/\s+/g, ".")}@${pick(DOMAINS)}.com`;
  return {
    id: `vdi-${(i + 1).toString().padStart(3, "0")}`,
    fullName,
    email,
    domain: pick(DOMAINS),
    region: pick(REGIONS),
    hostname: `VDI-${between(1000, 9999)}`,
    status,
    lastSeen: lastSeen.toISOString(),
  };
});

export const VDI_STATS = {
  total:    VDI_USERS.length,
  active:   VDI_USERS.filter((u) => u.status === "Active").length,
  inactive: VDI_USERS.filter((u) => u.status === "Inactive").length,
  pending:  VDI_USERS.filter((u) => u.status === "Pending").length,
  disabled: VDI_USERS.filter((u) => u.status === "Disabled").length,
};

// ── Domain mappings ─────────────────────────────────────────────
export const DOMAIN_RECORDS: DomainRecord[] = DOMAINS.map((d, i) => ({
  id: `dom-${(i + 1).toString().padStart(3, "0")}`,
  technicalDomain: d,
  corporateGroup: CORPORATE_GROUPS[i] ?? "Other",
  region: pick(REGIONS),
  users: between(40, 480),
  active: rand() > 0.18,
}));

// ── Quick-link suggestions for Home page ───────────────────────
export const QUICK_LINKS = [
  { title: "View latest sessions",  description: "See who is using which tool right now",          to: "/sessions" },
  { title: "Compare CAD tools",     description: "Which CAD platform is used the most?",           to: "/reports?tab=cad" },
  { title: "Manage VDI users",      description: "Add, edit, or remove VDI user records",          to: "/vdi" },
  { title: "Map a new domain",      description: "Group technical domains under a corporate name", to: "/domains" },
];
