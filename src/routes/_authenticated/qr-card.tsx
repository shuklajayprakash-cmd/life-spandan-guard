import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { PageHeader, Panel } from "@/components/app/Primitives";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmergencyContacts, useMedicalProfile, useProfile } from "@/hooks/useHealthData";

export const Route = createFileRoute("/_authenticated/qr-card")({
  head: () => ({
    meta: [
      { title: "QR life card — LifeSpandan AI" },
      { name: "description", content: "A printable emergency card responders can scan in seconds." },
      { property: "og:title", content: "QR life card — LifeSpandan AI" },
      { property: "og:description", content: "Printable QR emergency card with critical medical data." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QrCardPage,
});

function QrCardPage() {
  const profile = useProfile();
  const medical = useMedicalProfile();
  const contacts = useEmergencyContacts();
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const primary = contacts.data?.[0];

  useEffect(() => {
    const lines = [
      "LIFESPANDAN EMERGENCY CARD",
      `Name: ${profile.data?.full_name ?? "—"}`,
      `Blood group: ${medical.data?.blood_group ?? "—"}`,
      `Allergies: ${medical.data?.allergies?.join(", ") || "None recorded"}`,
      `Conditions: ${medical.data?.conditions?.join(", ") || "None recorded"}`,
      `Medications: ${medical.data?.medications?.join(", ") || "None recorded"}`,
      `Organ donor: ${medical.data?.organ_donor ? "Yes" : "No"}`,
      `Emergency contact: ${primary ? `${primary.name} ${primary.phone}` : "—"}`,
      `Doctor: ${medical.data?.primary_doctor ?? "—"} ${medical.data?.doctor_phone ?? ""}`.trim(),
    ].join("\n");

    QRCode.toDataURL(lines, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 512,
      color: { dark: "#111827", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [profile.data, medical.data, primary]);

  const loading = profile.isLoading || medical.isLoading;

  return (
    <div>
      <PageHeader
        eyebrow="Offline ready"
        title="QR life card"
        description="Print it, put it in a wallet or stick it on a helmet. Any phone camera reveals the essentials instantly — no internet required."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()} className="rounded-full print:hidden">
              <Printer className="size-4" /> Print
            </Button>
            {dataUrl && (
              <Button asChild className="rounded-full print:hidden">
                <a href={dataUrl} download="lifespandan-qr.png">
                  <Download className="size-4" /> Download QR
                </a>
              </Button>
            )}
          </div>
        }
      />

      {loading ? (
        <Skeleton className="h-80 max-w-2xl rounded-2xl" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-2xl border-2 border-primary/25 bg-card shadow-elevated">
            <div className="flex items-center justify-between gap-4 gradient-signal px-6 py-4 text-primary-foreground">
              <Logo compact />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Emergency card</p>
            </div>
            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
              <dl className="space-y-3.5 text-sm">
                <Row label="Name" value={profile.data?.full_name ?? "—"} strong />
                <Row label="Blood group" value={medical.data?.blood_group ?? "—"} strong />
                <Row label="Allergies" value={medical.data?.allergies?.join(", ") || "None recorded"} />
                <Row label="Conditions" value={medical.data?.conditions?.join(", ") || "None recorded"} />
                <Row label="Medications" value={medical.data?.medications?.join(", ") || "None recorded"} />
                <Row label="Organ donor" value={medical.data?.organ_donor ? "Yes" : "No"} />
                <Row
                  label="Emergency contact"
                  value={primary ? `${primary.name} · ${primary.phone}` : "Not configured"}
                  strong
                />
              </dl>
              <div className="flex flex-col items-center justify-center gap-2">
                {dataUrl ? (
                  <img src={dataUrl} alt="Emergency medical QR code" className="size-40 rounded-xl border border-border" />
                ) : (
                  <div className="grid size-40 place-items-center rounded-xl border border-dashed border-border text-muted-foreground">
                    <QrCode className="size-8" />
                  </div>
                )}
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Scan for details
                </p>
              </div>
            </div>
          </div>

          <Panel title="How responders use it" className="print:hidden">
            <ol className="space-y-4 text-sm text-muted-foreground">
              {[
                "Any phone camera scans the code — no app, no login, no signal needed.",
                "Blood group, allergies and current medication appear immediately.",
                "The first emergency contact is one tap away from a call.",
                "Update your medical profile and the card regenerates automatically.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-3 border-b border-border/60 pb-2.5 last:border-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-bold text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  );
}
