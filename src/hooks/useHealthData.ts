import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useSupabaseQuery<T>(key: unknown[], fn: (userId: string) => Promise<T>, enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...key, user?.id],
    enabled: Boolean(user?.id) && enabled,
    queryFn: async () => fn(user!.id),
  });
}

export function useProfile() {
  return useSupabaseQuery(["profile"], async (userId) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  });
}

export function useMedicalProfile() {
  return useSupabaseQuery(["medical_profile"], async (userId) => {
    const { data, error } = await supabase
      .from("medical_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });
}

export function useEmergencyContacts() {
  return useSupabaseQuery(["emergency_contacts"], async (userId) => {
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("priority", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });
}

export function useEmergencyEvents(limit = 50) {
  return useSupabaseQuery(["emergency_events", limit], async (userId) => {
    const { data, error } = await supabase
      .from("emergency_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  });
}

export function useHealthReports() {
  return useSupabaseQuery(["health_reports"], async (userId) => {
    const { data, error } = await supabase
      .from("health_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

export function useHealthScores() {
  return useSupabaseQuery(["health_scores"], async (userId) => {
    const { data, error } = await supabase
      .from("health_scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });
}

export function useFamilyMembers() {
  return useSupabaseQuery(["family_members"], async (userId) => {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });
}

export function useNotifications() {
  return useSupabaseQuery(["notifications"], async (userId) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data ?? [];
  });
}

export function useSettings() {
  return useSupabaseQuery(["user_settings"], async (userId) => {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });
}

export function useActivityLogs() {
  return useSupabaseQuery(["activity_logs"], async (userId) => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  });
}

export function profileCompletion(
  medical: Record<string, unknown> | null | undefined,
  contactsCount: number,
  profile: Record<string, unknown> | null | undefined,
) {
  const checks = [
    Boolean(profile?.full_name),
    Boolean(profile?.phone),
    Boolean(medical?.blood_group),
    Boolean(medical?.height_cm),
    Boolean(medical?.weight_kg),
    Array.isArray(medical?.allergies) && (medical?.allergies as string[]).length > 0,
    Array.isArray(medical?.medications) && (medical?.medications as string[]).length > 0,
    Boolean(medical?.insurance_provider),
    Boolean(medical?.preferred_hospital),
    contactsCount > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
