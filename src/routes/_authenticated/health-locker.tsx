import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Download, FileText, FolderLock, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/app/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHealthReports } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/health-locker")({
  head: () => ({
    meta: [
      { title: "Health locker — LifeSpandan AI" },
      { name: "description", content: "Encrypted storage for prescriptions, lab reports and scans." },
      { property: "og:title", content: "Health locker — LifeSpandan AI" },
      { property: "og:description", content: "Private, encrypted medical document storage." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HealthLockerPage,
});

const docTypes = ["report", "prescription", "scan", "vaccination", "insurance", "other"];
const MAX_BYTES = 15 * 1024 * 1024;

function HealthLockerPage() {
  const { user } = useAuth();
  const reports = useHealthReports();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("report");
  const [uploading, setUploading] = useState(false);

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file first");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Files must be under 15 MB");
      return;
    }
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      const path = `${user!.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("health-documents").upload(path, file);
      if (uploadError) throw uploadError;

      const { error } = await supabase.from("health_reports").insert({
        user_id: user!.id,
        title: title.trim() || file.name.slice(0, 120),
        doc_type: docType,
        file_path: path,
        file_size: file.size,
        mime_type: file.type || null,
      });
      if (error) throw error;

      toast.success("Document secured");
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const open = async (path: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage.from("health-documents").createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Could not open document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const remove = async (id: string, path: string | null) => {
    if (path) await supabase.storage.from("health-documents").remove([path]);
    const { error } = await supabase.from("health_reports").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Document deleted");
    queryClient.invalidateQueries();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Digital locker"
        title="Health locker"
        description="Every report in one private vault. Files are stored encrypted and only ever readable by you."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Upload a document" description="PDF, image or scan up to 15 MB">
          <form onSubmit={upload} className="space-y-4">
            <div>
              <Label htmlFor="doc-title" className="text-xs font-semibold">
                Title
              </Label>
              <Input
                id="doc-title"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Blood panel — March"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="doc-type" className="text-xs font-semibold">
                Category
              </Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger id="doc-type" className="mt-2 h-11 rounded-xl capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {docTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="doc-file" className="text-xs font-semibold">
                File
              </Label>
              <Input
                id="doc-file"
                ref={fileRef}
                type="file"
                accept=".pdf,image/*"
                className="mt-2 h-11 cursor-pointer rounded-xl file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
              />
            </div>
            <Button type="submit" disabled={uploading} className="w-full rounded-xl">
              <Upload className="size-4" /> {uploading ? "Encrypting…" : "Upload to locker"}
            </Button>
          </form>
        </Panel>

        <Panel title="Stored documents" description={`${reports.data?.length ?? 0} file(s)`}>
          {reports.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : reports.data?.length ? (
            <ul className="space-y-3">
              {reports.data.map((report) => (
                <li
                  key={report.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3.5"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary/12 text-secondary">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{report.title}</p>
                    <p className="truncate text-xs capitalize text-muted-foreground">
                      {report.doc_type} · {new Date(report.created_at).toLocaleDateString()}
                      {report.file_size ? ` · ${(report.file_size / 1024 / 1024).toFixed(2)} MB` : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Open ${report.title}`}
                    onClick={() => open(report.file_path)}
                    className="min-h-11 min-w-11 rounded-full"
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${report.title}`}
                    onClick={() => remove(report.id, report.file_path)}
                    className="min-h-11 min-w-11 rounded-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FolderLock}
              title="Locker is empty"
              description="Upload prescriptions, lab reports or scans so they're never lost when it matters."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
