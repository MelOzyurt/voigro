import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneForwarded, CalendarCheck, UserPlus, ShoppingCart, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useActions } from "@/hooks/use-actions";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  confirmed: "bg-success/10 text-success",
  new: "bg-primary/10 text-primary",
  contacted: "bg-primary/10 text-primary",
  qualified: "bg-success/10 text-success",
  fulfilled: "bg-success/10 text-success",
};

const typeIcons: Record<string, any> = {
  callback: PhoneForwarded,
  booking: CalendarCheck,
  lead: UserPlus,
  order: ShoppingCart,
};

export default function Actions() {
  const { data: actions, isLoading } = useActions();

  const callbacks = actions?.filter(a => a.type === "callback") ?? [];
  const bookings = actions?.filter(a => a.type === "booking") ?? [];
  const leads = actions?.filter(a => a.type === "lead") ?? [];
  const orders = actions?.filter(a => a.type === "order") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Actions</h1>
        <p className="text-sm text-muted-foreground">Business outcomes from your AI agent's calls — callbacks, bookings, leads, and orders.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pending Callbacks", value: callbacks.filter(c => c.status === "pending").length, icon: PhoneForwarded, color: "text-primary" },
          { label: "Upcoming Bookings", value: bookings.length, icon: CalendarCheck, color: "text-success" },
          { label: "New Leads", value: leads.filter(l => l.status === "new").length, icon: UserPlus, color: "text-primary" },
          { label: "Recent Orders", value: orders.length, icon: ShoppingCart, color: "text-success" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="callbacks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="callbacks">Callbacks ({callbacks.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        {["callbacks", "bookings", "leads", "orders"].map(tab => {
          const items = tab === "callbacks" ? callbacks : tab === "bookings" ? bookings : tab === "leads" ? leads : orders;
          const Icon = typeIcons[tab === "callbacks" ? "callback" : tab === "bookings" ? "booking" : tab === "leads" ? "lead" : "order"];
          return (
            <TabsContent key={tab} value={tab} className="space-y-2">
              {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
              {!isLoading && items.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No {tab} yet.</p>
              )}
              {items.map(item => {
                const payload = item.payload as Record<string, any>;
                return (
                  <div key={item.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                      {item.status === "completed" ? <CheckCircle className="h-4 w-4 text-success" /> : <Icon className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{payload?.name ?? payload?.caller ?? item.type}</p>
                      <p className="text-xs text-muted-foreground">{payload?.reason ?? payload?.service ?? payload?.interest ?? item.notes ?? "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</p>
                    </div>
                    <Badge variant="secondary" className={`${statusColors[item.status] ?? ""} text-[10px]`}>{item.status}</Badge>
                    {item.call_id && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/dashboard/calls/${item.call_id}`}><ArrowRight className="h-4 w-4" /></Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
