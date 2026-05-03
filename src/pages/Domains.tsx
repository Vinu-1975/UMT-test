import { useMemo, useState } from "react";
import { Network, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDetailSheet } from "@/components/admin/AdminDetailSheet";
import { DOMAIN_RECORDS } from "@/lib/mock-data";
import { num } from "@/lib/format";
import type { DomainRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DomainsPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<DomainRecord | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOMAIN_RECORDS;
    return DOMAIN_RECORDS.filter((d) =>
      [d.technicalDomain, d.corporateGroup, d.region].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Domains"
        description="Group technical domains under a single corporate name. The mapping powers all reporting accuracy."
        action={
          <Button className="gap-2 rounded-xl">
            <Plus className="size-4" />
            Add domain mapping
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by technical or corporate name…"
                className="h-10 rounded-xl pl-9"
                aria-label="Search domains"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} of {DOMAIN_RECORDS.length} mappings
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Technical domain</TableHead>
                  <TableHead>Corporate group</TableHead>
                  <TableHead className="hidden md:table-cell">Region</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Users</TableHead>
                  <TableHead>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow
                    key={d.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => setActive(d)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Network className="size-4 text-muted-foreground" />
                        <span className="font-medium">{d.technicalDomain}</span>
                      </div>
                    </TableCell>
                    <TableCell>{d.corporateGroup}</TableCell>
                    <TableCell className="hidden md:table-cell">{d.region}</TableCell>
                    <TableCell className="hidden md:table-cell num text-right tabular-nums">
                      {num(d.users)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full border-transparent px-2.5 py-0.5 font-medium",
                          d.active
                            ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                            : "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
                        )}
                      >
                        {d.active ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                      No domain mappings match your search.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AdminDetailSheet
        open={active != null}
        onOpenChange={(open) => !open && setActive(null)}
        title={active?.corporateGroup ?? ""}
        description={active ? `Mapped from ${active.technicalDomain}` : ""}
        rows={[
          { label: "Technical domain", value: active?.technicalDomain },
          { label: "Region",           value: active?.region },
          { label: "Users",            value: active ? num(active.users) : null },
          {
            label: "State",
            value: active ? (
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-full border-transparent px-2.5 py-0.5 font-medium",
                  active.active
                    ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                    : "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
                )}
              >
                {active.active ? "Active" : "Archived"}
              </Badge>
            ) : null,
          },
        ]}
        primaryAction={{ label: "Edit mapping", onClick: () => setActive(null) }}
        destructiveAction={{ label: "Archive mapping", onClick: () => setActive(null) }}
      />
    </div>
  );
}
