import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader, Panel } from "@/components/app/Primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useHealthData";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LifeSpandan AI" },
      { name: "description", content: "Control SOS countdown, notifications, location sharing and appearance." },
      { property: "og:title", content: "Settings — LifeSpandan AI" },
      { property: "og:description", content: "Tune LifeSpandan AI to how you live." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const toggles = [
  { key: "push_notifications", label: "Push notifications", hint: "Emergency dispatch and family alerts" },
  { key: "email_notifications", label: "Email notifications", hint: "Weekly summaries and account activity" },
  { key: "medicine_reminders", label: "Medicine reminders", hint: "Nudges based on your medication list" },
  { key: "share_location", label: "Share live location", hint: "Stream location to contacts during an SOS" },
] as const;

function SettingsPage() {
  const { user, signOut } = useAuth();
  const settings = useSettings();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const [state, setState] = useState({
    push_notifications: true,
    email_notifications: true,
    medicine_reminders: true,
    share_location: true,
    sos_countdown_seconds: 5,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setState({
        push_notifications: settings.data.push_notifications,
        email_notifications: settings.data.email_notifications,
        medicine_reminders: settings.data.medicine_reminders,
        share_location: settings.data.share_location,
        sos_countdown_seconds: settings.data.sos_countdown_seconds,
      });
    }
  }, [settings.data]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: user!.id, ...state, theme }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
    queryClient.invalidateQueries();
  };

  if (settings.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Every second counts — tune the countdown, alerts and appearance to match how you live."
        actions={
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="SOS behaviour" description="How long you have to cancel an accidental trigger">
          <div className="rounded-xl bg-surface-2 p-5">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-semibold">Countdown</Label>
              <span className="text-2xl font-extrabold text-primary">{state.sos_countdown_seconds}s</span>
            </div>
            <Slider
              value={[state.sos_countdown_seconds]}
              min={3}
              max={15}
              step={1}
              onValueChange={([value]) => setState((s) => ({ ...s, sos_countdown_seconds: value }))}
              className="mt-5"
              aria-label="SOS countdown seconds"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Shorter is faster in a real emergency; longer prevents false alarms.
            </p>
          </div>
        </Panel>

        <Panel title="Notifications & privacy">
          <div className="space-y-3">
            {toggles.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 px-4 py-3.5">
                <div className="min-w-0">
                  <Label htmlFor={item.key} className="text-sm font-semibold">
                    {item.label}
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
                </div>
                <Switch
                  id={item.key}
                  checked={state[item.key]}
                  onCheckedChange={(value) => setState((s) => ({ ...s, [item.key]: value }))}
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Appearance">
          <div className="flex flex-wrap gap-2">
            {(["light", "dark", "system"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                aria-pressed={theme === option}
                className={`min-h-11 rounded-xl border px-5 text-sm font-semibold capitalize transition-all ${
                  theme === option
                    ? "border-primary bg-primary text-primary-foreground shadow-signal"
                    : "border-border bg-surface-2 hover:border-primary/40"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Account" description="Signed in as your registered email">
          <Button variant="outline" onClick={signOut} className="rounded-xl text-destructive hover:bg-destructive/10">
            <LogOut className="size-4" /> Sign out
          </Button>
        </Panel>
      </div>
    </div>
  );
}
