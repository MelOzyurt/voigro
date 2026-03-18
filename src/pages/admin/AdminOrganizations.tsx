import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export default function AdminOrganizations() {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Organizations</h1>
        <p className="text-sm text-muted-foreground">All registered organizations on the platform.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !orgs?.length ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No organizations found.</div>
          ) : (
            <div className="divide-y">
              {orgs.map(org => (
                <div key={org.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.industry ?? "—"} · {org.location ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{org.subscription_plan}</Badge>
                    <Badge variant={org.status === "active" ? "default" : "secondary"} className="text-xs">{org.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
