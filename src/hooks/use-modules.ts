import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/hooks/use-organization";

export type ModuleKey =
  | "voice_agent"
  | "booking"
  | "calendar"
  | "public_booking_page"
  | "crm"
  | "marketing";

export interface OrgModule {
  id: string;
  organization_id: string;
  module_key: ModuleKey;
  enabled: boolean;
  config: Record<string, unknown>;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useModules() {
  const orgId = useOrgId();

  return useQuery({
    queryKey: ["organization-modules", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("organization_modules")
        .select("*")
        .eq("organization_id", orgId);
      if (error) throw error;
      return (data ?? []) as unknown as OrgModule[];
    },
    enabled: !!orgId,
  });
}

export function useIsModuleEnabled(key: ModuleKey): boolean {
  const { data: modules } = useModules();
  if (!modules) return false;
  const mod = modules.find((m) => m.module_key === key);
  return mod?.enabled ?? false;
}

export function useEnabledModules(): ModuleKey[] {
  const { data: modules } = useModules();
  if (!modules) return [];
  return modules.filter((m) => m.enabled).map((m) => m.module_key);
}

export function useToggleModule() {
  const queryClient = useQueryClient();
  const orgId = useOrgId();

  return useMutation({
    mutationFn: async ({ key, enabled }: { key: ModuleKey; enabled: boolean }) => {
      if (!orgId) throw new Error("No organization");
      const { error } = await supabase
        .from("organization_modules")
        .update({ enabled, activated_at: enabled ? new Date().toISOString() : null })
        .eq("organization_id", orgId)
        .eq("module_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-modules", orgId] });
    },
  });
}
