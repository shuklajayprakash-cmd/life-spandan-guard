import { Reveal } from "@/components/marketing/Reveal";

const steps = [
  {
    step: "01",
    title: "Build your life profile",
    body: "Two minutes of setup: medical history, allergies, medication, insurance and the people who must be called first.",
  },
  {
    step: "02",
    title: "Carry it everywhere",
    body: "Your emergency QR card, health locker and contacts live in your pocket and on your fridge door.",
  },
  {
    step: "03",
    title: "Trigger once",
    body: "Hold SOS. A five-second guarded countdown protects against accidents, then the alert fans out instantly.",
  },
  {
    step: "04",
    title: "Everyone arrives informed",
    body: "Family sees live status. The hospital sees history before the doors open. Nothing is explained twice.",
  },
];

const stats = [
  { value: "4 min", label: "Average window for cardiac survival" },
  { value: "38%", label: "Of ER delays are missing patient history" },
  { value: "1 tap", label: "From incident to coordinated response" },
  { value: "AES-256", label: "Encryption on every stored record" },
];

export function HowItWorks() {
  return (
    <>
      <section id="how" className="relative overflow-hidden py-24 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 hero-gradient opacity-60" />
        <div className="relative mx-auto w-full max-w-6xl px-4">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">How it works</p>
              <h2 className="mt-4 text-3xl font-bold sm:text-[2.7rem] sm:leading-[1.1]">
                Four steps between an ordinary day and a survivable one
              </h2>
            </div>
          </Reveal>

          <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, i) => (
              <Reveal key={item.step} delay={i * 80}>
                <li className="relative h-full rounded-2xl glass p-6 shadow-soft lift-hover">
                  <span className="text-sm font-bold tracking-[0.2em] text-primary">{item.step}</span>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="impact" className="py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <Reveal>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card px-6 py-10 text-center">
                  <p className="text-3xl font-extrabold tracking-tight text-gradient sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-snug text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
