import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Siren, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export type DeviceSignals = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  battery: number | null;
  network: string;
};

export function useDeviceSignals() {
  const [signals, setSignals] = useState<DeviceSignals>({
    latitude: null,
    longitude: null,
    accuracy: null,
    battery: null,
    network: "unknown",
  });
  const [locating, setLocating] = useState(false);

  const refresh = useCallback(() => {
    if (typeof navigator === "undefined") return;

    const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    setSignals((prev) => ({ ...prev, network: connection?.effectiveType ?? (navigator.onLine ? "online" : "offline") }));

    const batteryApi = (navigator as unknown as { getBattery?: () => Promise<{ level: number }> }).getBattery;
    if (batteryApi) {
      batteryApi.call(navigator).then((battery) => {
        setSignals((prev) => ({ ...prev, battery: Math.round(battery.level * 100) }));
      }).catch(() => undefined);
    }

    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSignals((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }));
          setLocating(false);
        },
        () => setLocating(false),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
      );
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { signals, locating, refresh };
}

export function SosLauncher() {
  const [armed, setArmed] = useState(false);
  const [count, setCount] = useState(5);
  const [sending, setSending] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { signals, refresh } = useDeviceSignals();
  const queryClient = useQueryClient();

  const clear = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const dispatch = useCallback(async () => {
    setSending(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You must be signed in");

      const { error } = await supabase.from("emergency_events").insert({
        user_id: userData.user.id,
        status: "active",
        trigger_type: "manual",
        latitude: signals.latitude,
        longitude: signals.longitude,
        accuracy_m: signals.accuracy,
        battery_level: signals.battery,
        network_type: signals.network,
      });
      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: userData.user.id,
        title: "Emergency alert dispatched",
        body: "Your contacts and nearby responders were notified with your live location.",
        category: "emergency",
      });

      queryClient.invalidateQueries();
      toast.error("SOS dispatched", {
        description: "Emergency contacts and responders have been alerted.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not dispatch SOS");
    } finally {
      setSending(false);
      setArmed(false);
      setCount(5);
    }
  }, [signals, queryClient]);

  useEffect(() => {
    if (!armed) return;
    refresh();
    setCount(5);
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clear();
          void dispatch();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return clear;
  }, [armed, dispatch, refresh]);

  return (
    <>
      <button
        type="button"
        onClick={() => setArmed(true)}
        aria-label="Trigger emergency SOS"
        className="fixed bottom-6 right-5 z-40 grid size-16 place-items-center rounded-full gradient-signal text-primary-foreground shadow-signal transition-transform duration-200 hover:scale-105 active:scale-95 animate-pulse-ring sm:size-[4.5rem]"
      >
        <span className="flex flex-col items-center">
          <Siren className="size-6" />
          <span className="mt-0.5 text-[10px] font-bold tracking-wider">SOS</span>
        </span>
      </button>

      {armed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Emergency countdown"
          className="fixed inset-0 z-[60] grid place-items-center bg-foreground/60 p-4 backdrop-blur-md animate-fade-in"
        >
          <div className="w-full max-w-sm animate-scale-in rounded-3xl border border-border bg-card p-8 text-center shadow-lift">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Dispatching in</p>
            <div
              className={cn(
                "mx-auto mt-6 grid size-36 place-items-center rounded-full border-4 border-primary/20 text-6xl font-extrabold tabular-nums text-primary",
                !sending && "animate-pulse-ring",
              )}
            >
              {sending ? <Loader2 className="size-12 animate-spin" /> : count}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Your live location, medical profile and vitals will be shared with your emergency contacts and
              nearby responders.
            </p>

            <dl className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
              <SignalChip label="GPS" value={signals.latitude ? "Locked" : "Searching"} ok={Boolean(signals.latitude)} />
              <SignalChip label="Battery" value={signals.battery !== null ? `${signals.battery}%` : "n/a"} ok={(signals.battery ?? 100) > 15} />
              <SignalChip label="Network" value={signals.network} ok={signals.network !== "offline"} />
            </dl>

            <Button
              variant="outline"
              disabled={sending}
              onClick={() => {
                clear();
                setArmed(false);
                setCount(5);
                toast.success("SOS cancelled", { description: "No one was notified." });
              }}
              className="mt-7 h-12 w-full rounded-xl text-sm font-semibold"
            >
              <X className="size-4" /> Cancel emergency
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function SignalChip({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-xl bg-muted px-2 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 font-semibold capitalize", ok ? "text-accent" : "text-primary")}>{value}</dd>
    </div>
  );
}
