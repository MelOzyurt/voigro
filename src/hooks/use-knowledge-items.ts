import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "./use-organization";

export type KnowledgeItemType = "service" | "product" | "faq";

export interface KnowledgeItemInput {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  sort_order?: number;
  parent_id?: string | null;
}

export function useKnowledgeItems(type: KnowledgeItemType, parentId?: string | null) {
  const orgId = useOrgId();

  return useQuery({
    queryKey: ["knowledge-items", orgId, type, parentId ?? "root"],
    queryFn: async () => {
      let query = supabase
        .from("knowledge_items")
        .select("*")
        .eq("organization_id", orgId!)
        .eq("type", type)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (parentId) {
        query = query.eq("parent_id", parentId);
      } else {
        query = query.is("parent_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}

export function useAllKnowledgeItems(type: KnowledgeItemType) {
  const orgId = useOrgId();

  return useQuery({
    queryKey: ["knowledge-items-all", orgId, type],
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
          parent_id: input.parent_id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-items"] }),
  });
}

export function useBulkCreateKnowledgeItems(type: KnowledgeItemType) {
  const orgId = useOrgId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (items: KnowledgeItemInput[]) => {
      const rows = items.map((input, i) => ({
        organization_id: orgId!,
        type,
        name: input.name,
        description: input.description ?? null,
        metadata: (input.metadata ?? {}) as any,
        sort_order: input.sort_order ?? i,
        parent_id: input.parent_id ?? null,
      }));
      const { data, error } = await supabase
        .from("knowledge_items")
        .insert(rows)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-items"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-items"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge-items"] }),
  });
}
