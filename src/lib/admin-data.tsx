import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  DOMAIN_RECORDS as INITIAL_DOMAINS,
  VDI_USERS as INITIAL_VDI,
} from "./mock-data";
import type { DomainRecord, VdiUserRecord } from "./types";

type AdminCtx = {
  vdiUsers: VdiUserRecord[];
  upsertVdiUser: (record: VdiUserRecord) => void;
  removeVdiUser: (id: string) => void;

  domainRecords: DomainRecord[];
  upsertDomainRecord: (record: DomainRecord) => void;
  removeDomainRecord: (id: string) => void;
};

const Ctx = createContext<AdminCtx | null>(null);

function nextId(prefix: string, existing: { id: string }[]): string {
  const max = existing
    .map((r) => parseInt(r.id.replace(`${prefix}-`, ""), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [vdiUsers, setVdiUsers] = useState<VdiUserRecord[]>(INITIAL_VDI);
  const [domainRecords, setDomainRecords] = useState<DomainRecord[]>(INITIAL_DOMAINS);

  const upsertVdiUser = useCallback((record: VdiUserRecord) => {
    setVdiUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === record.id);
      if (idx === -1) return [{ ...record }, ...prev];
      const copy = [...prev];
      copy[idx] = { ...record };
      return copy;
    });
  }, []);

  const removeVdiUser = useCallback((id: string) => {
    setVdiUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const upsertDomainRecord = useCallback((record: DomainRecord) => {
    setDomainRecords((prev) => {
      const idx = prev.findIndex((d) => d.id === record.id);
      if (idx === -1) return [{ ...record }, ...prev];
      const copy = [...prev];
      copy[idx] = { ...record };
      return copy;
    });
  }, []);

  const removeDomainRecord = useCallback((id: string) => {
    setDomainRecords((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const value = useMemo<AdminCtx>(
    () => ({
      vdiUsers,
      upsertVdiUser,
      removeVdiUser,
      domainRecords,
      upsertDomainRecord,
      removeDomainRecord,
    }),
    [vdiUsers, upsertVdiUser, removeVdiUser, domainRecords, upsertDomainRecord, removeDomainRecord],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminData(): AdminCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminData must be used inside <AdminDataProvider>");
  return ctx;
}

export function newVdiId(records: { id: string }[]): string {
  return nextId("vdi", records);
}
export function newDomId(records: { id: string }[]): string {
  return nextId("dom", records);
}
