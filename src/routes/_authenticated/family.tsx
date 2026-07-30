import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState, PageHeader, Panel } from "@/components/app/Primitives";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyMembers } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/family")({
  head: () => ({
    meta: [
      { title: "Family circle — LifeSpandan AI" },
      { name: "description", content: "Link relatives so their emergencies reach you instantly." },
      { property: "og:title", content: "Family circle — LifeSpandan AI" },
      { property: "og:description", content: "Monitor and protect the people you care about." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FamilyPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  phone: z.string().trim().max(20).optional(),
  relationship: z.string().trim().max(40).optional(),
});

function FamilyPage() {
  const { user } = useAuth();
  const family = useFamilyMembers();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", relationship: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const { error } = await supabase.from("family_members").insert({
      owner_id: user!.id,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      relationship: form.relationship.trim() || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Family member invited");
    setForm({ name: "", phone: "", relationship: "" });
    setOpen(false);
    queryClient.invalidateQueries();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("family_members").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removed from circle");
    queryClient.invalidateQueries();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Together"
        title="Family circle"
        description="Add the people you look after. When they trigger an SOS, you see it — location, vitals and all."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="size-4" /> Invite member
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a family member</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                {(
                  [
                    ["name", "Full name", "text"],
                    ["phone", "Phone", "tel"],
                    ["relationship", "Relationship", "text"],
                  ] as const
                ).map(([key, label, type]) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={`family-${key}`} className="text-xs font-semibold">
                      {label}
                    </Label>
                    <Input
                      id={`family-${key}`}
                      type={type}
                      maxLength={80}
                      value={form[key]}
                      aria-invalid={Boolean(errors[key])}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                    {errors[key] && <p className="text-xs font-medium text-destructive">{errors[key]}</p>}
                  </div>
                ))}
                <DialogFooter>
                  <Button type="submit" className="w-full rounded-xl">
                    Send invitation
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Panel title="Your circle" description={`${family.data?.length ?? 0} member(s)`}>
        {family.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : family.data?.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {family.data.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface-2 p-4 lift-hover"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-secondary/12 text-base font-bold text-secondary">
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.relationship ?? "Family"}
                    {member.phone ? ` · ${member.phone}` : ""}
                  </p>
                  <Badge variant="secondary" className="mt-2 capitalize">
                    {member.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${member.name}`}
                  onClick={() => remove(member.id)}
                  className="min-h-11 min-w-11 rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Users}
            title="No family linked yet"
            description="Invite a parent, partner or child so you never miss their emergency."
            action={
              <Button onClick={() => setOpen(true)} className="rounded-full">
                <Plus className="size-4" /> Invite someone
              </Button>
            }
          />
        )}
      </Panel>
    </div>
  );
}
