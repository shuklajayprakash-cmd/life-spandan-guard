import { Link, Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Ambulance,
  BarChart3,
  Bell,
  Building2,
  ChevronsLeft,
  FileHeart,
  FolderLock,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Settings,
  Shield,
  Siren,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { SosLauncher } from "@/components/app/SosLauncher";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { mode: "login" } });
    return { user: data.user };
  },
  component: AppLayout,
});

const groups: { label: string; items: { to: string; label: string; icon: typeof Activity }[] }[] = [
  {
    label: "Daily",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/emergency", label: "Emergency", icon: Siren },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Health identity",
    items: [
      { to: "/medical-profile", label: "Medical profile", icon: FileHeart },
      { to: "/health-locker", label: "Health locker", icon: FolderLock },
      { to: "/qr-card", label: "QR life card", icon: QrCode },
      { to: "/sos-history", label: "SOS history", icon: History },
    ],
  },
  {
    label: "Circle",
    items: [
      { to: "/contacts", label: "Emergency contacts", icon: Shield },
      { to: "/family", label: "Family", icon: Users },
    ],
  },
  {
    label: "Consoles",
    items: [
      { to: "/hospital", label: "Hospital", icon: Building2 },
      { to: "/ambulance", label: "Ambulance", icon: Ambulance },
      { to: "/admin", label: "Admin", icon: Shield },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: UserRound },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, []);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  };

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "U")
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-background">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/dashboard" aria-label="Dashboard">
            <Logo />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            className="min-h-11 min-w-11 rounded-full lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <ChevronsLeft className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6" aria-label="Main">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-primary/10 data-[status=active]:font-semibold data-[status=active]:text-primary"
                    >
                      <item.icon className="size-4.5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full gradient-signal text-xs font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.user_metadata?.full_name ?? "Your account"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={signOut}
              className="min-h-11 min-w-11 rounded-full"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border glass">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              className="min-h-11 min-w-11 rounded-full lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>

            <p className="hidden text-sm font-medium text-muted-foreground sm:block">
              Save Every Second. Save Every Life.
            </p>

            <div className="ml-auto flex items-center gap-1.5">
              <Button asChild variant="ghost" size="icon" aria-label="Notifications" className="min-h-11 min-w-11 rounded-full">
                <Link to="/notifications">
                  <Bell className="size-5" />
                </Link>
              </Button>
              <ThemeToggle />
              <Button asChild size="sm" className="rounded-full">
                <Link to="/emergency">
                  <Siren className="size-4" /> SOS
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:pb-24">
          <Outlet />
        </main>
      </div>

      <SosLauncher />
    </div>
  );
}
