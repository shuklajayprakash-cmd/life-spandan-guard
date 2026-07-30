import {
  Ambulance,
  BrainCircuit,
  FileHeart,
  MapPinned,
  QrCode,
  Users,
} from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

const features = [
  {
    icon: Ambulance,
    title: "One-tap SOS dispatch",
    body: "A guarded countdown, then simultaneous alerts to contacts, hospitals and ambulance partners with live coordinates.",
    tone: "primary" as const,
  },
  {
    icon: FileHeart,
    title: "Portable medical identity",
    body: "Blood group, conditions, allergies, medication and insurance travel with you — readable in seconds by any responder.",
    tone: "secondary" as const,
  },
  {
    icon: BrainCircuit,
    title: "AI risk intelligence",
    body: "Continuous scoring across health, lifestyle and emergency risk, with recommendations that adapt as your data changes.",
    tone: "accent" as const,
  },
  {
    icon: QrCode,
    title: "Emergency QR card",
    body: "A printable, scannable card that exposes only what a first responder needs — nothing more.",
    tone: "secondary" as const,
  },
  {
    icon: Users,
    title: "Family guardian view",
    body: "Track loved ones' safety status, battery, location and SOS history from one calm dashboard.",
    tone: "accent" as const,
  },
  {
    icon: MapPinned,
    title: "Location & geofence ready",
    body: "Live location, safe zones and route architecture built for map providers from day one.",
    tone: "primary" as const,
  },
];

const toneClass = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/12 text-secondary",
  accent: "bg-accent/14 text-accent",
};

export function Features() {
  return (
    <section id="platform" className="relative py-24 sm:py-32">
      <div className="mx-auto w-full max-w-6xl px-4">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The platform</p>
            <h2 className="mt-4 text-3xl font-bold sm:text-[2.7rem] sm:leading-[1.1]">
              Everything an emergency needs, decided before it happens
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Most emergency time is lost to missing information. LifeSpandan keeps the answers ready and
              releases them the instant they matter.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 70}>
              <article className="group h-full rounded-2xl border border-border bg-card p-6 shadow-soft lift-hover">
                <span
                  className={`grid size-11 place-items-center rounded-xl ${toneClass[feature.tone]} transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon className="size-5.5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
