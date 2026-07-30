import { Link, createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

type Mode = "login" | "signup" | "forgot";

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
const passwordSchema = z.string().min(8, "Use at least 8 characters").max(72);
const nameSchema = z.string().trim().min(2, "Enter your full name").max(80);

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (["login", "signup", "forgot"].includes(String(search.mode)) ? search.mode : "login") as Mode,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — LifeSpandan AI" },
      {
        name: "description",
        content: "Access your LifeSpandan AI emergency profile, health locker and family safety dashboard.",
      },
      { property: "og:title", content: "Sign in — LifeSpandan AI" },
      { property: "og:description", content: "Access your LifeSpandan AI emergency profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const highlights = [
  "One-tap SOS with guarded countdown",
  "Medical identity readable by any responder",
  "Encrypted health locker & QR life card",
];

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  const setMode = (next: Mode) => navigate({ to: "/auth", search: { mode: next }, replace: true });

  const validate = () => {
    const next: Record<string, string> = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) next.email = emailResult.error.issues[0].message;
    if (mode !== "forgot") {
      const pwResult = passwordSchema.safeParse(password);
      if (!pwResult.success) next.password = pwResult.error.issues[0].message;
    }
    if (mode === "signup") {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) next.fullName = nameResult.error.issues[0].message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Welcome back");
        router.invalidate();
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "Check your inbox to verify your email." });
        router.invalidate();
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent", { description: "Check your email to choose a new password." });
        setMode("login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed", { description: result.error.message });
      return;
    }
    if (result.redirected) return;
    router.invalidate();
    navigate({ to: "/dashboard", replace: true });
  };

  const title =
    mode === "signup" ? "Create your life profile" : mode === "forgot" ? "Reset password" : "Welcome back";
  const subtitle =
    mode === "signup"
      ? "Two minutes now. Every second later."
      : mode === "forgot"
        ? "We'll email you a secure reset link."
        : "Sign in to your emergency dashboard.";

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden gradient-signal p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 size-96 rounded-full bg-primary-foreground/10 blur-3xl animate-drift"
        />
        <Link to="/" className="relative inline-flex w-fit items-center gap-2 text-primary-foreground">
          <Logo compact />
          <span className="text-base font-extrabold tracking-tight">LifeSpandan AI</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground">
            Save Every Second. Save Every Life.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-primary-foreground/90">
                <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/70">
          Protected by row-level security. Your records stay yours.
        </p>
      </aside>

      <main className="relative flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/">
              <ArrowLeft className="size-4" /> Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm animate-fade-up">
            <div className="lg:hidden">
              <Logo />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight lg:mt-0">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

            {mode !== "forgot" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoogle}
                  disabled={busy}
                  className="mt-7 h-12 w-full rounded-xl text-sm font-semibold"
                >
                  <GoogleMark />
                  Continue with Google
                </Button>
                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    or with email
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form onSubmit={onSubmit} className={mode === "forgot" ? "mt-7 space-y-4" : "space-y-4"}>
              {mode === "signup" && (
                <Field
                  id="fullName"
                  label="Full name"
                  icon={User}
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Aarav Sharma"
                  autoComplete="name"
                  error={errors.fullName}
                />
              )}
              <Field
                id="email"
                label="Email"
                icon={Mail}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email}
              />
              {mode !== "forgot" && (
                <Field
                  id="password"
                  label="Password"
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  error={errors.password}
                />
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              )}

              <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-sm font-semibold">
                {busy && <Loader2 className="size-4 animate-spin" />}
                {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signup" ? (
                <>
                  Already protected?{" "}
                  <button onClick={() => setMode("login")} className="font-semibold text-primary hover:underline">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to LifeSpandan?{" "}
                  <button onClick={() => setMode("signup")} className="font-semibold text-primary hover:underline">
                    Create an account
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  error,
  ...rest
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-12 rounded-xl pl-10"
          {...rest}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  );
}
