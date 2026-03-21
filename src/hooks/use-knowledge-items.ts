import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "./use-organization";

export type KnowledgeItemType = "service" | "product" | "faq";

export interface KnowledgeItemInput {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  sort_order?: number;
}

export function useKnowledgeItems(type: KnowledgeItemType) {
  const orgId = useOrgId();

  return useQuery({
    queryKey: ["knowledge-items", orgId, type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_items")
        .select("*")
        .eq("organization_id", orgId!)
        .eq("type", type)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useCreateKnowledgeItem(type: KnowledgeItemType) {
  const orgId = useOrgId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: KnowledgeItemInput) => {
      const { data, error } = await supabase
        .from("knowledge_items")
        .insert({
          organization_id: orgId!,
          type,
          name: input.name,
          description: input.description ?? null,
          metadata: (input.metadata ?? {}) as any,
          sort_order: input.sort_order ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-items", orgId, type] }),
  });
}

export function useUpdateKnowledgeItem(type: KnowledgeItemType) {
  const orgId = useOrgId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: KnowledgeItemInput & { id: string }) => {
      const { data, error } = await supabase
        .from("knowledge_items")
        .update({
          name: input.name,
          description: input.description ?? null,
          metadata: (input.metadata ?? {}) as any,
          sort_order: input.sort_order,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-items", orgId, type] }),
  });
}

export function useDeleteKnowledgeItem(type: KnowledgeItemType) {
  const orgId = useOrgId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("knowledge_items")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-items", orgId, type] }),
  });
}
