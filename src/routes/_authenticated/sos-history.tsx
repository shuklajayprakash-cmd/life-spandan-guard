import { createFileRoute } from "@tanstack/react-router";
import { History, MapPin, Siren } from "lucide-react";

import { EmptyState, PageHeader, Panel, StatCard } from "@/components/app/Primitives";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmergencyEvents } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/sos-history")({
  head: () => ({
    meta: [
      { title: "SOS history — LifeSpandan AI" },
      { name: "description", content: "Every emergency alert with location, battery and resolution time." },
      { property: "og:title", content: "SOS history — LifeSpandan AI" },
      { property: "og:description", content: "A complete audit trail of your emergency alerts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SosHistoryPage,
});

function SosHistoryPage() {
  const events = useEmergencyEvents(100);
  const list = events.data ?? [];
  const resolved = list.filter((event) => event.status === "resolved");

  const avgMinutes = resolved.length
    ? Math.round(
        resolved.reduce(
          (total, event) =>
            total + (new Date(event.resolved_at!).getTime() - new Date(event.created_at).getTime()) / 60000,
          0,
        ) / resolved.length,
      )
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Audit trail"
        title="SOS history"
        description="A permanent, tamper-evident record of every alert you have ever sent."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Siren} label="Total alerts" value={String(list.length)} />
        <StatCard icon={History} label="Resolved" value={String(resolved.length)} tone="accent" />
        <StatCard
          icon={MapPin}
          label="Avg. resolution"
          value={avgMinutes ? `${avgMinutes} min` : "—"}
          tone="secondary"
        />
      </div>

      <Panel title="All alerts">
        {events.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : list.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Triggered</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(event.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize">{event.trigger_type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.latitude
                        ? `${event.latitude.toFixed(3)}, ${event.longitude?.toFixed(3)}`
                        : "Not captured"}
                    </TableCell>
                    <TableCell>{event.battery_level !== null ? `${event.battery_level}%` : "—"}</TableCell>
                    <TableCell className="capitalize">{event.network_type ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={event.status === "active" ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Siren}
            title="No alerts recorded"
            description="That's the best possible outcome. Your history stays empty until you need it."
          />
        )}
      </Panel>
    </div>
  );
}
