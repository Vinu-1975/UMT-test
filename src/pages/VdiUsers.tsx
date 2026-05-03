import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleSlash,
  Clock,
  PauseCircle,
  Plus,
  Search,
  UserCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { VDI_USERS, VDI_STATS } from "@/lib/mock-data";
import { initials, relative } from "@/lib/format";
import type { VdiUserRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<VdiUserRecord["status"], string> = {
  Active:   "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  Inactive: "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
  Pending:  "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  Disabled: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("grid size-10 place-items-center rounded-xl", tone)}>
          <Icon className="size-[18px]" />
        </div>
        <div>
          <div className="num text-2xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VdiUsersPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<VdiUserRecord | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VDI_USERS;
    return VDI_USERS.filter((u) =>
      [u.fullName, u.email, u.hostname, u.domain, u.region].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="VDI users"
        description="Add, view, and manage your virtual desktop users. Click any row to see full details."
        action={
          <Button className="gap-2 rounded-xl">
            <Plus className="size-4" />
            Add VDI user
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active"   value={VDI_STATS.active}   icon={CheckCircle2}  tone="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" />
        <StatCard label="Inactive" value={VDI_STATS.inactive} icon={PauseCircle}   tone="bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" />
        <StatCard label="Pending"  value={VDI_STATS.pending}  icon={Clock}         tone="bg-amber-500/10 text-amber-700 dark:text-amber-300" />
        <StatCard label="Disabled" value={VDI_STATS.disabled} icon={CircleSlash}   tone="bg-rose-500/10 text-rose-700 dark:text-rose-300" />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users by name, email, hostname…"
                className="h-10 rounded-xl pl-9"
                aria-label="Search VDI users"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} of {VDI_USERS.length} users
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Domain</TableHead>
                  <TableHead className="hidden lg:table-cell">Hostname</TableHead>
                  <TableHead className="hidden lg:table-cell">Region</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow
                    key={u.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => setActive(u)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                            {initials(u.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                          <div className="font-medium">{u.fullName}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{u.domain}</TableCell>
                    <TableCell className="hidden lg:table-cell">{u.hostname}</TableCell>
                    <TableCell className="hidden lg:table-cell">{u.region}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {relative(u.lastSeen)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full border-transparent px-2.5 py-0.5 font-medium",
                          STATUS_TONE[u.status],
                        )}
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      No users match your search.
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
        title={active?.fullName ?? ""}
        description={active?.email}
        rows={[
          { label: "Status",
            value: active ? (
              <Badge
                variant="secondary"
                className={cn("rounded-full border-transparent px-2.5 py-0.5 font-medium", STATUS_TONE[active.status])}
              >
                {active.status}
              </Badge>
            ) : null,
          },
          { label: "Domain",   value: active?.domain },
          { label: "Region",   value: active?.region },
          { label: "Hostname", value: active?.hostname },
          { label: "Last seen", value: active ? relative(active.lastSeen) : null },
        ]}
        primaryAction={{ label: "Edit user", onClick: () => setActive(null) }}
        destructiveAction={{ label: "Disable user", onClick: () => setActive(null) }}
      />

      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex items-center gap-3 p-5">
          <UserCheck className="size-5 text-primary" />
          <div className="text-sm text-muted-foreground">
            Tip — disabling a user keeps their session history. Use it instead of deleting when you can.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
