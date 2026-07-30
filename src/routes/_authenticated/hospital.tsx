import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";

import { EmptyState, PageHeader, Panel } from "@/components/app/Primitives";

export const Route = createFileRoute("/_authenticated/hospital")({
  head: () => ({
    meta: [
      { title: "Hospital console — LifeSpandan AI" },
      { name: "description", content: "Incoming emergency handovers for partner hospitals." },
      { property: "og:title", content: "Hospital console — LifeSpandan AI" },
      { property: "og:description", content: "Incoming emergency handovers for partner hospitals." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HospitalPage,
});

function HospitalPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Console"
        title="Hospital console"
        description="Partner hospitals receive patient medical summaries before the ambulance arrives."
      />
      <Panel title="Incoming patients">
        <EmptyState
          icon={Building2}
          title="No incoming handovers"
          description="Verified hospital accounts see live inbound patients and their medical profiles here."
        />
      </Panel>
    </div>
  );
}
