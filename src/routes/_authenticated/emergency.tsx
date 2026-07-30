import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BatteryFull,
  CheckCircle2,
  MapPin,
  Phone,
  Radio,
  Siren,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/Primitives";
import { useDeviceSignals } from "@/components/app/SosLauncher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEmergencyContacts, useEmergencyEvents } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency centre — LifeSpandan AI" },
      { name: "description", content: "Live emergency status, device signals and active SOS timeline." },
      { property: "og:title", content: "Emergency centre — LifeSpandan AI" },
      { property: "og:description", content: "Live emergency status and active SOS timeline." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { signals, locating, refresh } = useDeviceSignals();
  const events = useEmergencyEvents(20);
  const contacts = useEmergencyContacts();
  const queryClient = useQueryClient();

  const active = events.data?.find((event) => event.status === "active");

  const resolve = async (id: string) => {
    const { error } = await supabase
      .from("emergency_events")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Emergency marked as resolved");
    queryClient.invalidateQueries();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Emergency"
        title="Emergency centre"
        description="Live device signals, active incidents and the people who get alerted the moment you trigger SOS."
        actions={
          <Button variant="outline" onClick={refresh} className="rounded-full">
            <Radio className="size-4" /> Refresh signals
          </Button>
        }
      />

      {active ? (
        <div className="mb-6 overflow-hidden rounded-2xl border-2 border-primary bg-primary/5 p-6 shadow-signal animate-scale-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-2xl gradient-signal text-primary-foreground animate-pulse-ring">
                <Siren className="size-6" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Active emergency</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Started {new Date(active.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <Button onClick={() => resolve(active.id)} className="rounded-full">
              <CheckCircle2 className="size-4" /> Mark resolved
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard
          icon={MapPin}
          label="GPS location"
          value={
            signals.latitude
              ? `${signals.latitude.toFixed(4)}, ${signals.longitude?.toFixed(4)}`
              : locating
                ? "Locating…"
                : "Permission needed"
          }
          hint={signals.accuracy ? `±${Math.round(signals.accuracy)} m accuracy` : "Enable location access"}
          ok={Boolean(signals.latitude)}
        />
        <SignalCard
          icon={BatteryFull}
          label="Battery"
          value={signals.battery !== null ? `${signals.battery}%` : "Unavailable"}
          hint="Low battery reduces tracking time"
          ok={(signals.battery ?? 100) > 20}
        />
        <SignalCard
          icon={Wifi}
          label="Network"
          value={signals.network}
          hint="Connection used for dispatch"
          ok={signals.network !== "offline"}
        />
        <SignalCard
          icon={Phone}
          label="Contacts armed"
          value={String(contacts.data?.length ?? 0)}
          hint="Alerted simultaneously"
          ok={(contacts.data?.length ?? 0) > 0}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Emergency timeline" description="Chronological record of every incident">
          {events.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : events.data?.length ? (
            <ol className="relative space-y-6 border-l border-border pl-6">
              {events.data.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    className={`absolute -left-[1.72rem] top-1 size-3 rounded-full ring-4 ring-card ${
                      event.status === "active" ? "bg-primary" : event.status === "resolved" ? "bg-accent" : "bg-muted-foreground"
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold capitalize">{event.trigger_type} SOS</p>
                    <Badge variant={event.status === "active" ? "destructive" : "secondary"} className="capitalize">
                      {event.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                    {event.battery_level !== null ? ` · battery ${event.battery_level}%` : ""}
                    {event.network_type ? ` · ${event.network_type}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={Siren}
              title="No incidents yet"
              description="Your emergency history is empty. The floating SOS button is always available."
            />
          )}
        </Panel>

        <Panel title="Who gets alerted" description="Ordered by priority">
          {contacts.data?.length ? (
            <ul className="space-y-3">
              {contacts.data.map((contact) => (
                <li key={contact.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3">
                  <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {contact.priority}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{contact.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {contact.relationship ?? "Contact"} · {contact.phone}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Phone}
              title="No contacts yet"
              description="Add at least one person who should be called immediately."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

function SignalCard({
  icon: Icon,
  label,
  value,
  hint,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  ok: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lift-hover">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${ok ? "bg-accent/14 text-accent" : "bg-primary/10 text-primary"}`}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-4 truncate text-lg font-bold capitalize">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
