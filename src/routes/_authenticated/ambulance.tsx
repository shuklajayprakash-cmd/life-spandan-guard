import { createFileRoute } from "@tanstack/react-router";
import { Ambulance } from "lucide-react";

import { EmptyState, PageHeader, Panel } from "@/components/app/Primitives";

export const Route = createFileRoute("/_authenticated/ambulance")({
  head: () => ({
    meta: [
      { title: "Ambulance console — LifeSpandan AI" },
      { name: "description", content: "Dispatch queue and live routing for responder crews." },
      { property: "og:title", content: "Ambulance console — LifeSpandan AI" },
      { property: "og:description", content: "Dispatch queue and live routing for responder crews." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AmbulancePage,
});

function AmbulancePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Console"
        title="Ambulance console"
        description="Responder crews see the dispatch queue, patient location and critical medical flags."
      />
      <Panel title="Dispatch queue">
        <EmptyState
          icon={Ambulance}
          title="No active dispatches"
          description="Verified responder accounts see assigned emergencies and navigation here."
        />
      </Panel>
    </div>
  );
}
