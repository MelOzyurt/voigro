import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, PhoneCall, Bot } from "lucide-react";

export default function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orgs, calls, agents] = await Promise.all([
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("calls").select("id", { count: "exact", head: true }),
        supabase.from("ai_agents").select("id", { count: "exact", head: true }),
      ]);
      return {
        organizations: orgs.count ?? 0,
        calls: calls.count ?? 0,
        agents: agents.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Organizations", value: stats?.organizations ?? 0, icon: Building2 },
    { label: "Total Calls", value: stats?.calls ?? 0, icon: PhoneCall },
    { label: "AI Agents", value: stats?.agents ?? 0, icon: Bot },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide statistics and health.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
