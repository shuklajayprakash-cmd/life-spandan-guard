import { Link } from "@tanstack/react-router";
import { ArrowRight, Quote } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const testimonials = [
  {
    quote:
      "The ER had my father's cardiac history and medication list before the ambulance arrived. That never happens.",
    name: "Ananya Rao",
    role: "Daughter · Bengaluru",
  },
  {
    quote:
      "We cut triage intake from eleven minutes to under three for patients who arrive with a LifeSpandan card.",
    name: "Dr. Imran Sheikh",
    role: "Emergency Physician",
  },
  {
    quote:
      "As a solo traveller with epilepsy, the QR card is the first thing that made me feel genuinely safe.",
    name: "Marta Klein",
    role: "Field researcher",
  },
];

const faqs = [
  {
    q: "Does LifeSpandan replace emergency services?",
    a: "No. It makes them faster. LifeSpandan coordinates information and alerts around your emergency — you should always still contact your local emergency number in a life-threatening situation.",
  },
  {
    q: "Who can see my medical data?",
    a: "Only you, by default. Every record is protected by row-level security rules tied to your account. Family members you explicitly link can see emergency status and health scores — never your documents.",
  },
  {
    q: "What happens if I trigger SOS by accident?",
    a: "Every SOS runs a guarded countdown that you can cancel with one tap. Cancelled events are logged as cancelled and no responders are notified.",
  },
  {
    q: "Can hospitals and ambulance services join?",
    a: "Yes. The hospital and ambulance consoles are part of the platform, so partners can receive incoming cases with full pre-arrival context.",
  },
  {
    q: "Does it work without internet?",
    a: "Your printed QR emergency card works offline and can be scanned by any responder. Live dispatch requires a connection.",
  },
];

export function Social() {
  return (
    <>
      <section className="py-24 sm:py-28">
        <div className="mx-auto w-full max-w-6xl px-4">
          <Reveal>
            <h2 className="max-w-xl text-3xl font-bold sm:text-[2.7rem] sm:leading-[1.1]">
              Trusted in the moments that don't wait
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item, i) => (
              <Reveal key={item.name} delay={i * 90}>
                <figure className="h-full rounded-2xl border border-border bg-card p-7 shadow-soft lift-hover">
                  <Quote className="size-6 text-primary/70" />
                  <blockquote className="mt-5 text-[15px] leading-relaxed text-foreground">
                    {item.quote}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-border pt-4">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="pb-24 sm:pb-28">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">FAQ</p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Questions people ask first</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Still unsure? Create an account — your profile is portable and can be deleted at any time.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q} className="border-border">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto w-full max-w-6xl px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl gradient-signal px-8 py-16 text-center shadow-signal sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary-foreground/10 blur-2xl"
              />
              <h2 className="relative text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl">
                Your emergency plan should already exist
              </h2>
              <p className="relative mx-auto mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/85">
                Set it up once today. It works every day after that.
              </p>
              <div className="relative mt-9">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-13 rounded-full bg-primary-foreground px-8 text-base font-semibold text-primary hover:bg-primary-foreground/90"
                >
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Get protected free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
