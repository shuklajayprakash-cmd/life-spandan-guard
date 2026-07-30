import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader, Panel } from "@/components/app/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  profileCompletion,
  useEmergencyContacts,
  useMedicalProfile,
  useProfile,
} from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — LifeSpandan AI" },
      { name: "description", content: "Account details and emergency readiness score." },
      { property: "og:title", content: "Your profile — LifeSpandan AI" },
      { property: "og:description", content: "Manage your LifeSpandan AI account details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const profile = useProfile();
  const medical = useMedicalProfile();
  const contacts = useEmergencyContacts();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ full_name: "", phone: "", date_of_birth: "", gender: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile.data) {
      setForm({
        full_name: profile.data.full_name ?? "",
        phone: profile.data.phone ?? "",
        date_of_birth: profile.data.date_of_birth ?? "",
        gender: profile.data.gender ?? "",
      });
    }
  }, [profile.data]);

  const completion = profileCompletion(medical.data, contacts.data?.length ?? 0, profile.data);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user!.id,
      full_name: form.full_name.trim() || null,
      phone: form.phone.trim() || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated");
    queryClient.invalidateQueries();
  };

  if (profile.isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Basic identity details that appear on your emergency card and dispatch messages."
        actions={
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["full_name", "Full name", "text"],
                ["phone", "Phone", "tel"],
                ["date_of_birth", "Date of birth", "date"],
                ["gender", "Gender", "text"],
              ] as const
            ).map(([key, label, type]) => (
              <div key={key}>
                <Label htmlFor={key} className="text-xs font-semibold">
                  {label}
                </Label>
                <Input
                  id={key}
                  type={type}
                  maxLength={120}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold">Email</Label>
              <Input value={user?.email ?? ""} readOnly className="mt-2 h-11 rounded-xl bg-muted" />
            </div>
          </div>
        </Panel>

        <Panel title="Emergency readiness" description="Complete every section for maximum protection">
          <div className="rounded-xl bg-surface-2 p-5 text-center">
            <p className="text-5xl font-extrabold text-primary">{completion}%</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Profile complete
            </p>
            <Progress value={completion} className="mt-4 h-2" />
          </div>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[
              ["Name added", Boolean(profile.data?.full_name)],
              ["Blood group set", Boolean(medical.data?.blood_group)],
              ["Conditions recorded", Boolean(medical.data?.conditions?.length)],
              ["Allergies recorded", Boolean(medical.data?.allergies?.length)],
              ["Emergency contact added", (contacts.data?.length ?? 0) > 0],
            ].map(([label, done]) => (
              <li key={String(label)} className="flex items-center gap-2.5">
                <ShieldCheck className={`size-4 ${done ? "text-accent" : "text-muted-foreground/50"}`} />
                <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
