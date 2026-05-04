// Domain types for UMT — kept aligned with legacy MVC controller JSON shapes
// so swapping mock data for a real API is a one-file change.

export type CadTool = "CATIA" | "NX";

export type Region = "NA" | "EU" | "ASIA" | "SA";

export type ProductCategory = "Fluids" | "Sealing" | "General";

export type SessionStatus = "Active" | "Completed" | "Failed" | "Stopped";

export type Hardware = "VDI" | "Non-VDI";

export interface Application {
  id: string;
  name: string;
  cad: CadTool;
  productCategory: ProductCategory;
}

export interface MonthlyUsagePoint {
  month: string;        // "Jan", "Feb", …
  production: number;
  test: number;
}

export interface ApplicationUsage {
  application: string;
  cad: CadTool;
  productCategory: ProductCategory;
  total: number;
  validation: number;
  execution: number;
  blockCreation: number;
  viewOps: number;
}

export interface CadUsage {
  cad: CadTool;
  sessions: number;
  share: number;        // 0..1
}

export interface RegionUsage {
  region: Region;
  sessions: number;
}

export interface DomainUsage {
  domain: string;
  sessions: number;
}

export interface RawSessionRow {
  id: string;
  application: string;
  cad: CadTool;
  user: string;
  machine: string;
  domain: string;
  region: Region;
  productCategory: ProductCategory;
  startTime: string;    // ISO
  stopTime: string | null;
  status: SessionStatus;
  hardware: Hardware;
}

// VDI user — fields per UMT.txt section 2:
// "userid, region (EU/NA), domain, createddate, createdby, modifieddate, modifiedby"
export interface VdiUserRecord {
  id: string;             // record key
  userId: string;         // "userid" — the actual user identifier
  region: Region;
  domain: string;
  createdDate: string;    // ISO
  createdBy: string;
  modifiedDate: string;   // ISO
  modifiedBy: string;
}

// Domain assignment — fields per UMT.txt section 3:
// "userid, domain, region, createddate, createdby, modifieddate, modifiedby"
export interface DomainRecord {
  id: string;             // record key
  userId: string;
  domain: string;
  region: Region;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}

// Admin — UMT.txt section 4: "userid, remove, (add admin)"
export interface AdminRecord {
  id: string;
  userId: string;
}

export interface KpiPoint {
  label: string;
  value: number;
}

// ── Filter system ────────────────────────────────────────────────

export type RangePreset = "30d" | "90d" | "ytd" | "12m" | "custom";

export type FilterDim =
  | "range"
  | "application"
  | "cad"
  | "productCategory"
  | "region"
  | "domain"
  | "hardware"
  | "status";

export interface FilterState {
  range: RangePreset;
  customFrom?: string;
  customTo?: string;
  application: string;
  cad: string;
  productCategory: string;
  region: string;
  domain: string;
  hardware: "all" | Hardware;
  status: "all" | SessionStatus;
}

export type ChartFilterOverride = Partial<FilterState>;

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { total: number; page: number; limit: number };
};
