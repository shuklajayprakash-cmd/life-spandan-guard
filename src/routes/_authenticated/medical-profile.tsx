import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader, Panel } from "@/components/app/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMedicalProfile, useProfile } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/medical-profile")({
  head: () => ({
    meta: [
      { title: "Medical profile — LifeSpandan AI" },
      { name: "description", content: "Blood group, conditions, allergies, medication, insurance and care team." },
      { property: "og:title", content: "Medical profile — LifeSpandan AI" },
      { property: "og:description", content: "The medical identity responders read in seconds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MedicalProfilePage,
});

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type Form = {
  full_name: string;
  phone: string;
  blood_group: string;
  height_cm: string;
  weight_kg: string;
  organ_donor: boolean;
  insurance_provider: string;
  insurance_number: string;
  primary_doctor: string;
  doctor_phone: string;
  preferred_hospital: string;
  notes: string;
};

const emptyForm: Form = {
  full_name: "",
  phone: "",
  blood_group: "",
  height_cm: "",
  weight_kg: "",
  organ_donor: false,
  insurance_provider: "",
  insurance_number: "",
  primary_doctor: "",
  doctor_phone: "",
  preferred_hospital: "",
  notes: "",
};

function MedicalProfilePage() {
  const { user } = useAuth();
  const profile = useProfile();
  const medical = useMedicalProfile();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<Form>(emptyForm);
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile.data || medical.data) {
      setForm({
        full_name: profile.data?.full_name ?? "",
        phone: profile.data?.phone ?? "",
        blood_group: medical.data?.blood_group ?? "",
        height_cm: medical.data?.height_cm ? String(medical.data.height_cm) : "",
        weight_kg: medical.data?.weight_kg ? String(medical.data.weight_kg) : "",
        organ_donor: medical.data?.organ_donor ?? false,
        insurance_provider: medical.data?.insurance_provider ?? "",
        insurance_number: medical.data?.insurance_number ?? "",
        primary_doctor: medical.data?.primary_doctor ?? "",
        doctor_phone: medical.data?.doctor_phone ?? "",
        preferred_hospital: medical.data?.preferred_hospital ?? "",
        notes: medical.data?.notes ?? "",
      });
      setConditions(medical.data?.conditions ?? []);
      setAllergies(medical.data?.allergies ?? []);
      setMedications(medical.data?.medications ?? []);
    }
  }, [profile.data, medical.data]);

  const set = (key: keyof Form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: form.full_name.trim() || null, phone: form.phone.trim() || null });
      if (profileError) throw profileError;

      const { error } = await supabase.from("medical_profiles").upsert(
        {
          user_id: user.id,
          blood_group: form.blood_group || null,
          height_cm: form.height_cm ? Number(form.height_cm) : null,
          weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
          organ_donor: form.organ_donor,
          conditions,
          allergies,
          medications,
          insurance_provider: form.insurance_provider.trim() || null,
          insurance_number: form.insurance_number.trim() || null,
          primary_doctor: form.primary_doctor.trim() || null,
          doctor_phone: form.doctor_phone.trim() || null,
          preferred_hospital: form.preferred_hospital.trim() || null,
          notes: form.notes.trim() || null,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;

      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "medical_profile_updated",
        description: "Medical profile saved",
      });

      queryClient.invalidateQueries();
      toast.success("Medical profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (profile.isLoading || medical.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Health identity"
        title="Medical profile"
        description="This is what a paramedic or ER doctor sees first. Precision here saves minutes later."
        actions={
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save profile
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Personal information">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Full name" value={form.full_name} onChange={(v) => set("full_name", v)} />
            <TextField label="Phone" value={form.phone} onChange={(v) => set("phone", v)} type="tel" />
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold">Blood group</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => set("blood_group", group)}
                    aria-pressed={form.blood_group === group}
                    className={`min-h-11 rounded-xl border px-4 text-sm font-semibold transition-all ${
                      form.blood_group === group
                        ? "border-primary bg-primary text-primary-foreground shadow-signal"
                        : "border-border bg-surface-2 text-foreground hover:border-primary/40"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
            <TextField label="Height (cm)" value={form.height_cm} onChange={(v) => set("height_cm", v)} type="number" />
            <TextField label="Weight (kg)" value={form.weight_kg} onChange={(v) => set("weight_kg", v)} type="number" />
            <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3 sm:col-span-2">
              <div>
                <p className="text-sm font-semibold">Registered organ donor</p>
                <p className="text-xs text-muted-foreground">Shown on your emergency card</p>
              </div>
              <Switch
                checked={form.organ_donor}
                onCheckedChange={(v) => set("organ_donor", v)}
                aria-label="Registered organ donor"
              />
            </div>
          </div>
        </Panel>

        <Panel title="Clinical history" description="Add each item and press Enter">
          <div className="space-y-6">
            <TagField label="Conditions" placeholder="e.g. Type 2 diabetes" values={conditions} onChange={setConditions} />
            <TagField label="Allergies" placeholder="e.g. Penicillin" values={allergies} onChange={setAllergies} tone="primary" />
            <TagField label="Medications" placeholder="e.g. Metformin 500mg" values={medications} onChange={setMedications} tone="secondary" />
          </div>
        </Panel>

        <Panel title="Insurance">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Provider" value={form.insurance_provider} onChange={(v) => set("insurance_provider", v)} />
            <TextField label="Policy number" value={form.insurance_number} onChange={(v) => set("insurance_number", v)} />
          </div>
        </Panel>

        <Panel title="Care team">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Primary doctor" value={form.primary_doctor} onChange={(v) => set("primary_doctor", v)} />
            <TextField label="Doctor phone" value={form.doctor_phone} onChange={(v) => set("doctor_phone", v)} type="tel" />
            <div className="sm:col-span-2">
              <TextField label="Preferred hospital" value={form.preferred_hospital} onChange={(v) => set("preferred_hospital", v)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes" className="text-xs font-semibold">
                Notes for responders
              </Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Anything a first responder must know in the first 60 seconds."
                className="mt-2 rounded-xl"
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={120}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 rounded-xl"
      />
    </div>
  );
}

function TagField({
  label,
  placeholder,
  values,
  onChange,
  tone = "accent",
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  tone?: "accent" | "primary" | "secondary";
}) {
  const [draft, setDraft] = useState("");
  const id = label.toLowerCase();
  const tones = {
    accent: "bg-accent/14 text-accent-foreground",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/12 text-secondary",
  };

  const add = () => {
    const value = draft.trim();
    if (!value || values.includes(value) || values.length >= 30) return;
    onChange([...values, value.slice(0, 80)]);
    setDraft("");
  };

  return (
    <div>
      <Label htmlFor={id} className="text-xs font-semibold">
        {label}
      </Label>
      <div className="mt-2 flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          maxLength={80}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="h-11 rounded-xl"
        />
        <Button type="button" variant="outline" onClick={add} className="h-11 rounded-xl">
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <li key={value}>
              <Badge className={`gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${tones[tone]}`} variant="secondary">
                {value}
                <button
                  type="button"
                  aria-label={`Remove ${value}`}
                  onClick={() => onChange(values.filter((v) => v !== value))}
                  className="rounded-full transition-opacity hover:opacity-70"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
