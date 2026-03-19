import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function useAdminAuth() {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setSessionReady(true);
    });

    supabase.auth.getSession().then(() => setSessionReady(true));
    return () => subscription.unsubscribe();
  }, []);

  const query = useQuery({
    queryKey: ["admin-auth"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { user: null, isAdmin: false };

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "owner"]);

      const isAdmin = (data && data.length > 0) || false;
      return { user, isAdmin };
    },
    enabled: sessionReady,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });

  return {
    ...query,
    sessionReady,
  };
}
