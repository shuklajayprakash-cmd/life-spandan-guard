import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Phone, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState, PageHeader, Panel } from "@/components/app/Primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEmergencyContacts } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Emergency contacts — LifeSpandan AI" },
      { name: "description", content: "The people alerted the instant you trigger an SOS." },
      { property: "og:title", content: "Emergency contacts — LifeSpandan AI" },
      { property: "og:description", content: "Manage who gets alerted during an emergency." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContactsPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(20),
  relationship: z.string().trim().max(40).optional(),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
});

function ContactsPage() {
  const { user } = useAuth();
  const contacts = useEmergencyContacts();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", relationship: "", email: "", notify: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => (next[String(issue.path[0])] = issue.message));
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("emergency_contacts").insert({
      user_id: user!.id,
      name: form.name.trim(),
      phone: form.phone.trim(),
      relationship: form.relationship.trim() || null,
      email: form.email.trim() || null,
      notify_on_sos: form.notify,
      priority: (contacts.data?.length ?? 0) + 1,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contact added");
    setForm({ name: "", phone: "", relationship: "", email: "", notify: true });
    setOpen(false);
    queryClient.invalidateQueries();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contact removed");
    queryClient.invalidateQueries();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Circle"
        title="Emergency contacts"
        description="Ordered by priority. Everyone with notifications on is alerted at the same moment your SOS fires."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="size-4" /> Add contact
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New emergency contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <FormField id="name" label="Full name" value={form.name} error={errors.name} onChange={(v) => setForm({ ...form, name: v })} />
                <FormField id="phone" label="Phone" type="tel" value={form.phone} error={errors.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <FormField id="relationship" label="Relationship" value={form.relationship} error={errors.relationship} onChange={(v) => setForm({ ...form, relationship: v })} />
                <FormField id="email" label="Email (optional)" type="email" value={form.email} error={errors.email} onChange={(v) => setForm({ ...form, email: v })} />
                <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                  <Label htmlFor="notify" className="text-sm font-medium">
                    Notify on SOS
                  </Label>
                  <Switch id="notify" checked={form.notify} onCheckedChange={(v) => setForm({ ...form, notify: v })} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={busy} className="w-full rounded-xl">
                    Add contact
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Panel title="Your alert chain" description={`${contacts.data?.length ?? 0} contact(s) configured`}>
        {contacts.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : contacts.data?.length ? (
          <ul className="space-y-3">
            {contacts.data.map((contact) => (
              <li
                key={contact.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface-2 px-4 py-3.5 transition-colors hover:border-primary/30"
              >
                <span className="grid size-10 place-items-center rounded-full gradient-signal text-sm font-bold text-primary-foreground">
                  {contact.priority}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{contact.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {contact.relationship ?? "Contact"} · {contact.phone}
                    {contact.email ? ` · ${contact.email}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    contact.notify_on_sos ? "bg-accent/14 text-accent" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {contact.notify_on_sos ? "Alerts on" : "Muted"}
                </span>
                <Button asChild variant="ghost" size="icon" aria-label={`Call ${contact.name}`} className="min-h-11 min-w-11 rounded-full">
                  <a href={`tel:${contact.phone}`}>
                    <Phone className="size-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${contact.name}`}
                  onClick={() => remove(contact.id)}
                  className="min-h-11 min-w-11 rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={UserPlus}
            title="No emergency contacts"
            description="Add the people who must know first. One is enough to start."
            action={
              <Button onClick={() => setOpen(true)} className="rounded-full">
                <Plus className="size-4" /> Add your first contact
              </Button>
            }
          />
        )}
      </Panel>
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={255}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl"
      />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
