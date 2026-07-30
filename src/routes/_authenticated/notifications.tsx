import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — LifeSpandan AI" },
      { name: "description", content: "Alerts, reminders and health insights in one feed." },
      { property: "og:title", content: "Notifications — LifeSpandan AI" },
      { property: "og:description", content: "Your emergency and health notification feed." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});

const tones: Record<string, string> = {
  emergency: "bg-primary/10 text-primary",
  health: "bg-accent/14 text-accent",
  system: "bg-secondary/12 text-secondary",
};

function NotificationsPage() {
  const { user } = useAuth();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const unread = notifications.data?.filter((n) => !n.read) ?? [];

  const markAll = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user!.id)
      .eq("read", false);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Feed"
        title="Notifications"
        description="Emergency dispatches, medicine reminders and AI health insights, newest first."
        actions={
          unread.length > 0 ? (
            <Button variant="outline" onClick={markAll} className="rounded-full">
              <CheckCheck className="size-4" /> Mark all read
            </Button>
          ) : null
        }
      />

      <Panel title="Recent" description={`${unread.length} unread`}>
        {notifications.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : notifications.data?.length ? (
          <ul className="space-y-3">
            {notifications.data.map((item) => (
              <li
                key={item.id}
                className={`rounded-xl border px-4 py-3.5 transition-colors ${
                  item.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`rounded-full capitalize ${tones[item.category] ?? tones.system}`} variant="secondary">
                    {item.category}
                  </Badge>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                {item.body && <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Bell}
            title="Nothing to report"
            description="Alerts, reminders and insights will appear here as they happen."
          />
        )}
      </Panel>
    </div>
  );
}
