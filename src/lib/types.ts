// Domain types for UMT — kept aligned with legacy MVC controller JSON shapes
// so swapping mock data for a real API is a one-file change.

export type CadTool = "CATIA" | "NX" | "Creo" | "SolidWorks" | "Inventor";

export type Region =
  | "North America"
  | "Europe"
  | "Asia Pacific"
  | "South America"
  | "Middle East";

export type SessionStatus = "Active" | "Completed" | "Failed" | "Stopped";

export type Hardware = "VDI" | "Non-VDI";

export interface Application {
  id: string;
  name: string;
  cad: CadTool;
  productLine: string;
}

export interface MonthlyUsagePoint {
  month: string;        // "Jan", "Feb", …
  production: number;
  test: number;
}

export interface ApplicationUsage {
  application: string;
  cad: CadTool;
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
  productLine: string;
  startTime: string;    // ISO
  stopTime: string | null;
  status: SessionStatus;
  hardware: Hardware;
}

export interface VdiUserRecord {
  id: string;
  fullName: string;
  email: string;
  domain: string;
  region: Region;
  hostname: string;
  status: "Active" | "Inactive" | "Pending" | "Disabled";
  lastSeen: string;     // ISO
}

export interface DomainRecord {
  id: string;
  technicalDomain: string;
  corporateGroup: string;
  region: Region;
  users: number;
  active: boolean;
}

export interface KpiPoint {
  label: string;
  value: number;
}

export interface FilterState {
  range: "30d" | "90d" | "ytd" | "12m";
  application: string;  // "all" or app name
  cad: string;          // "all" or CadTool
  region: string;       // "all" or Region
  hardware: "all" | Hardware;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { total: number; page: number; limit: number };
};
