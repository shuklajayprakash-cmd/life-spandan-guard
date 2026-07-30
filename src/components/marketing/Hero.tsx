import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Siren, Zap } from "lucide-react";

import heroPulse from "@/assets/hero-pulse.png";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";

const signals = [
  { label: "Location locked", value: "GPS ±4 m" },
  { label: "Responders pinged", value: "3 nearby" },
  { label: "Medical record", value: "Shared" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-gradient" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-24 size-[28rem] rounded-full bg-primary/12 blur-3xl animate-drift"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-56 size-[24rem] rounded-full bg-secondary/14 blur-3xl animate-drift"
        style={{ animationDelay: "-8s" }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Live emergency intelligence
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.15rem]">
              Save Every Second.
              <br />
              <span className="text-gradient">Save Every Life.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              LifeSpandan AI turns the first golden minutes of an emergency into a coordinated response —
              one tap sends your live location, medical history and vitals to family, hospitals and
              ambulances at once.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-13 rounded-full px-7 text-base shadow-signal">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Create your life profile
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-border bg-surface/60 px-7 text-base backdrop-blur"
              >
                <a href="#how">See how it works</a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                { k: "8.2s", v: "Median alert dispatch" },
                { k: "62%", v: "Faster hospital prep" },
                { k: "24/7", v: "Guardian monitoring" },
              ].map((stat) => (
                <div key={stat.k}>
                  <dt className="text-2xl font-bold tracking-tight sm:text-3xl">{stat.k}</dt>
                  <dd className="mt-1 text-xs leading-snug text-muted-foreground">{stat.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="relative mx-auto max-w-md">
            <img
              src={heroPulse}
              alt="Illustration of a heartbeat waveform flowing through a glass emergency dashboard"
              width={1280}
              height={1280}
              className="w-full animate-float drop-shadow-2xl dark:brightness-125"
            />

            <div className="absolute -left-2 top-4 w-52 rounded-2xl glass p-4 shadow-lift sm:-left-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Siren className="size-4.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold">SOS triggered</p>
                  <p className="text-[11px] text-muted-foreground">Cardiac protocol</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {signals.map((signal) => (
                  <div key={signal.label} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{signal.label}</span>
                    <span className="font-semibold text-foreground">{signal.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -right-2 bottom-8 w-48 rounded-2xl glass p-4 shadow-lift sm:-right-6">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
                  <ShieldCheck className="size-4.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold">Health score</p>
                  <p className="text-[11px] text-muted-foreground">Stable · low risk</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[82%] rounded-full gradient-vital" />
              </div>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Zap className="size-3 text-accent" /> 82 / 100 this week
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
