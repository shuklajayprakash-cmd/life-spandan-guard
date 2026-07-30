import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BatteryFull,
  Bell,
  FileHeart,
  FolderLock,
  HeartPulse,
  Pill,
  QrCode,
  ShieldAlert,
  Siren,
  Users,
} from "lucide-react";

import { EmptyState, Panel, StatCard } from "@/components/app/Primitives";
import { useDeviceSignals } from "@/components/app/SosLauncher";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  profileCompletion,
  useEmergencyContacts,
  useEmergencyEvents,
  useHealthScores,
  useMedicalProfile,
  useNotifications,
  useProfile,
} from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LifeSpandan AI" },
      { name: "description", content: "Your live emergency readiness, health score and quick actions." },
      { property: "og:title", content: "Dashboard — LifeSpandan AI" },
      { property: "og:description", content: "Your live emergency readiness at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/medical-profile", label: "Medical profile", icon: FileHeart },
  { to: "/health-locker", label: "Upload report", icon: FolderLock },
  { to: "/qr-card", label: "QR life card", icon: QrCode },
  { to: "/family", label: "Family circle", icon: Users },
];

function Dashboard() {
  const { user } = useAuth();
  const profile = useProfile();
  const medical = useMedicalProfile();
  const contacts = useEmergencyContacts();
  const events = useEmergencyEvents(5);
  const scores = useHealthScores();
  const notifications = useNotifications();

  const loading = profile.isLoading || medical.isLoading || contacts.isLoading;
  const completion = profileCompletion(medical.data, contacts.data?.length ?? 0, profile.data);
  const latest = scores.data?.[scores.data.length - 1];
  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;
  const { signals } = useDeviceSignals();

  const firstName = (profile.data?.full_name ?? user?.user_metadata?.full_name ?? "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft animate-fade-up sm:p-9">
        <div aria-hidden className="pointer-events-none absolute inset-0 hero-gradient" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{greeting}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{firstName}, you're covered</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Emergency readiness is {completion}% complete. Every field you fill shortens the time a
              responder needs to understand you.
            </p>
            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">Profile completion</span>
                <span className="font-bold">{completion}%</span>
              </div>
              <Progress value={completion} className="mt-2 h-2" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link to="/emergency">
                  <Siren className="size-4" /> Emergency centre
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/medical-profile">
                  Complete profile <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative grid w-full max-w-xs shrink-0 gap-3 rounded-2xl glass p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Today's status
            </p>
            <StatusRow icon={HeartPulse} label="Vitals" value="Stable" tone="accent" />
            <StatusRow
              icon={BatteryFull}
              label="Battery"
              value={signals.battery !== null ? `${signals.battery}%` : "Unknown"}
              tone={(signals.battery ?? 100) > 20 ? "accent" : "primary"}
            />
            <StatusRow
              icon={Activity}
              label="Location"
              value={signals.latitude ? "Locked" : "Searching"}
              tone={signals.latitude ? "accent" : "muted"}
            />
            <StatusRow icon={Bell} label="Unread alerts" value={String(unread)} tone={unread ? "primary" : "muted"} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Health score"
              value={latest?.health_score ?? "—"}
              hint={latest ? "Updated from your latest analysis" : "Generate one in Analytics"}
              icon={HeartPulse}
              tone="accent"
            />
            <StatCard
              label="Emergency risk"
              value={latest?.risk_score ?? "—"}
              hint="Lower is safer"
              icon={ShieldAlert}
              tone="primary"
            />
            <StatCard
              label="Emergency contacts"
              value={contacts.data?.length ?? 0}
              hint="People alerted on SOS"
              icon={Users}
              tone="secondary"
            />
            <StatCard
              label="SOS events"
              value={events.data?.length ?? 0}
              hint="Recent recorded incidents"
              icon={Siren}
              tone="primary"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Recent emergency activity"
          description="Every SOS is logged with location and device context"
          actions={
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/sos-history">View all</Link>
            </Button>
          }
        >
          {events.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : events.data?.length ? (
            <ol className="relative space-y-5 border-l border-border pl-6">
              {events.data.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[1.72rem] top-1.5 size-3 rounded-full bg-primary ring-4 ring-card" />
                  <p className="text-sm font-semibold capitalize">{event.status} emergency</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()} ·{" "}
                    {event.latitude ? `${Number(event.latitude).toFixed(3)}, ${Number(event.longitude).toFixed(3)}` : "no location"}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={Siren}
              title="No emergencies recorded"
              description="That's the best possible dashboard state. Your SOS button is armed and ready."
            />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Quick actions" description="Everything one tap away">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <action.icon className="size-5 text-primary transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Upcoming medicines" description="From your medical profile">
            {medical.data?.medications?.length ? (
              <ul className="space-y-3">
                {medical.data.medications.slice(0, 4).map((med: string) => (
                  <li key={med} className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3">
                    <Pill className="size-4 text-secondary" />
                    <span className="text-sm font-medium">{med}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Pill}
                title="No medicines added"
                description="Add your medication list so responders never guess."
                action={
                  <Button asChild size="sm" className="rounded-full">
                    <Link to="/medical-profile">Add medication</Link>
                  </Button>
                }
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "primary" | "accent" | "muted";
}) {
  const tones = { primary: "text-primary", accent: "text-accent", muted: "text-muted-foreground" };
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" /> {label}
      </span>
      <span className={`font-semibold ${tones[tone]}`}>{value}</span>
    </div>
  );
}
