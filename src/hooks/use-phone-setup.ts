import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "./use-organization";
import { toast } from "sonner";

export function usePhoneSetup() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["phone-setup", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phone_setups")
        .select("*")
        .eq("organization_id", orgId!)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const provisionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "provision-virtual-number",
        { body: { organization_id: orgId } }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { virtual_number: string; status: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone-setup", orgId] });
      toast.success("Your AI phone line has been set up!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to provision number");
    },
  });

  const updateSetupMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (!query.data?.id) throw new Error("No phone setup found");
      const { error } = await supabase
        .from("phone_setups")
        .update(updates as never)
        .eq("id", query.data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone-setup", orgId] });
    },
  });

  return {
    ...query,
    phoneSetup: query.data,
    provisionNumber: provisionMutation.mutate,
    isProvisioning: provisionMutation.isPending,
    updateSetup: updateSetupMutation.mutate,
    isUpdating: updateSetupMutation.isPending,
  };
}
