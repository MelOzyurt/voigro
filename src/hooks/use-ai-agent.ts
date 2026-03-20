import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "./use-organization";
import type { TablesUpdate } from "@/integrations/supabase/types";

export function useAiAgent() {
  const orgId = useOrgId();
  
  return useQuery({
    queryKey: ["ai-agent", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("organization_id", orgId!)
        .eq("is_active", true)
        .order("version", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useUpdateAiAgent() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"ai_agents"> }) => {
      const { data, error } = await supabase
        .from("ai_agents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent", orgId] });
    },
  });
}

export function useCreateAiAgent() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: TablesUpdate<"ai_agents">) => {
      const { data, error } = await supabase
        .from("ai_agents")
        .insert({ ...values, organization_id: orgId! } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent", orgId] });
    },
  });
}
