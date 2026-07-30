import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center rounded-xl gradient-signal shadow-signal">
        <Activity className="size-5 text-primary-foreground" strokeWidth={2.6} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-foreground">
            LifeSpandan<span className="text-primary"> AI</span>
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Emergency OS
          </span>
        </span>
      )}
    </span>
  );
}
