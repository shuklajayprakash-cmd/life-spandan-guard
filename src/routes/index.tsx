import { createFileRoute } from "@tanstack/react-router";

import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Social } from "@/components/marketing/Social";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeSpandan AI — Save Every Second. Save Every Life." },
      {
        name: "description",
        content:
          "AI-powered emergency healthcare ecosystem: one-tap SOS, portable medical identity, digital health locker, QR life card and family safety.",
      },
      { property: "og:title", content: "LifeSpandan AI — Save Every Second. Save Every Life." },
      {
        property: "og:description",
        content:
          "One tap sends your live location, medical history and vitals to family, hospitals and ambulances at once.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Social />
      </main>
      <SiteFooter />
    </div>
  );
}
