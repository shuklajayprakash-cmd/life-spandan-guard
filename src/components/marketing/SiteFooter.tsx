import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "Platform",
    items: ["Emergency SOS", "Medical profile", "Health locker", "QR life card", "Family safety"],
  },
  { title: "For providers", items: ["Hospital console", "Ambulance dispatch", "Analytics", "API access"] },
  { title: "Company", items: ["About", "Careers", "Press", "Contact"] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              An AI-powered emergency healthcare ecosystem built for the seconds that decide outcomes.
            </p>
            <p className="mt-5 text-sm font-semibold text-foreground">Save Every Second. Save Every Life.</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <li key={item}>
                    <Link
                      to="/auth"
                      search={{ mode: "signup" }}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LifeSpandan AI. Not a substitute for emergency services.</p>
          <p>In a life-threatening emergency always call your local emergency number.</p>
        </div>
      </div>
    </footer>
  );
}
