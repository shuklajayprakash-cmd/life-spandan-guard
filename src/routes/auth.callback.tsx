import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — LifeSpandan AI" },
      { name: "description", content: "Completing your secure sign-in to LifeSpandan AI." },
      { property: "og:title", content: "Signing you in — LifeSpandan AI" },
      { property: "og:description", content: "Completing your secure sign-in to LifeSpandan AI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const url = new URL(window.location.href);
      const errorDescription =
        url.searchParams.get("error_description") ??
        new URLSearchParams(url.hash.replace(/^#/, "")).get("error_description");
      if (errorDescription) {
        setError(errorDescription);
        return;
      }

      // supabase-js parses the code/hash automatically (detectSessionInUrl).
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && !cancelled) {
          sub.subscription.unsubscribe();
          navigate({ to: "/dashboard", replace: true });
        }
      });

      window.setTimeout(() => {
        if (cancelled) return;
        sub.subscription.unsubscribe();
        supabase.auth.getSession().then(({ data: latest }) => {
          if (cancelled) return;
          if (latest.session) navigate({ to: "/dashboard", replace: true });
          else setError("We couldn't complete sign-in. Please try again.");
        });
      }, 6000);
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold text-foreground">Sign-in failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <a
              href="/auth?mode=login"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-6 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Completing secure sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}
