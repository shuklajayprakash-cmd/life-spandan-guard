import { createFileRoute } from "@tanstack/react-router";
import { Activity, ShieldAlert, Siren, Users } from "lucide-react";

import { PageHeader, Panel, StatCard } from "@/components/app/Primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityLogs, useEmergencyEvents, useFamilyMembers } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — LifeSpandan AI" },
      { name: "description", content: "Platform oversight: alerts, members and audit activity." },
      { property: "og:title", content: "Admin panel — LifeSpandan AI" },
      { property: "og:description", content: "Platform oversight for LifeSpandan AI administrators." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const events = useEmergencyEvents(100);
  const family = useFamilyMembers();
  const logs = useActivityLogs();

  return (
    <div>
      <PageHeader
        eyebrow="Oversight"
        title="Admin panel"
        description="Visibility scoped by your role. Elevated data appears only for verified administrators."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Siren} label="Alerts visible" value={String(events.data?.length ?? 0)} />
        <StatCard icon={Users} label="Linked members" value={String(family.data?.length ?? 0)} tone="secondary" />
        <StatCard icon={Activity} label="Audit entries" value={String(logs.data?.length ?? 0)} tone="accent" />
      </div>

      <Panel title="Audit log" description="Most recent account activity">
        {logs.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : logs.data?.length ? (
          <ul className="space-y-2.5">
            {logs.data.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2.5 font-medium">
                  <ShieldAlert className="size-4 text-secondary" />
                  {log.description ?? log.action}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        )}
      </Panel>
    </div>
  );
}
