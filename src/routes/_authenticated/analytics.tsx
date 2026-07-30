import { createFileRoute } from "@tanstack/react-router";
import { Activity, HeartPulse, Sparkles, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState, PageHeader, Panel, StatCard } from "@/components/app/Primitives";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityLogs, useEmergencyEvents, useHealthScores } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Health analytics — LifeSpandan AI" },
      { name: "description", content: "AI health score trends, risk signals and activity insights." },
      { property: "og:title", content: "Health analytics — LifeSpandan AI" },
      { property: "og:description", content: "Track your AI health score and risk trends over time." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const scores = useHealthScores();
  const events = useEmergencyEvents(100);
  const logs = useActivityLogs();

  const series =
    scores.data?.map((score) => ({
      date: new Date(score.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      health: score.health_score,
      risk: score.risk_score,
      lifestyle: score.lifestyle_score,
    })) ?? [];

  const latest = scores.data?.[scores.data.length - 1];
  const previous = scores.data?.[scores.data.length - 2];
  const delta = latest && previous ? latest.health_score - previous.health_score : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Health analytics"
        description="Your AI health score blends profile completeness, clinical history and emergency patterns into one number."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={HeartPulse}
          label="Health score"
          value={latest ? String(latest.health_score) : "—"}
          hint={delta ? `${delta > 0 ? "+" : ""}${delta} vs last check` : "No previous reading"}
        />
        <StatCard icon={Activity} label="Risk score" value={latest ? String(latest.risk_score) : "—"} tone="secondary" />
        <StatCard
          icon={TrendingUp}
          label="Lifestyle"
          value={latest ? String(latest.lifestyle_score) : "—"}
          tone="accent"
        />
        <StatCard icon={Sparkles} label="Alerts logged" value={String(events.data?.length ?? 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Score trend" description="Health vs risk over time">
          {scores.isLoading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : series.length > 1 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.75rem",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Area type="monotone" dataKey="health" stroke="var(--color-accent)" fill="url(#healthFill)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="risk" stroke="var(--color-primary)" fill="url(#riskFill)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="Not enough data yet"
              description="Complete your medical profile and generate a health score from the dashboard to start the trend."
            />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="AI recommendations">
            {latest?.recommendations?.length ? (
              <ul className="space-y-3">
                {latest.recommendations.map((item) => (
                  <li key={item} className="flex gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Sparkles} title="No recommendations" description="Generate a health score to receive guidance." />
            )}
          </Panel>

          <Panel title="Score breakdown">
            {latest ? (
              <div className="space-y-5">
                {[
                  { label: "Health", value: latest.health_score },
                  { label: "Lifestyle", value: latest.lifestyle_score },
                  { label: "Risk", value: latest.risk_score },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">{row.label}</span>
                      <span className="font-bold">{row.value}</span>
                    </div>
                    <Progress value={row.value} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No score recorded yet.</p>
            )}
          </Panel>

          <Panel title="Recent activity">
            {logs.data?.length ? (
              <ul className="space-y-2.5 text-sm">
                {logs.data.slice(0, 6).map((log) => (
                  <li key={log.id} className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">{log.description ?? log.action}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
