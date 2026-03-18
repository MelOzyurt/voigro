import {
  Phone, PhoneMissed, Bot, PhoneForwarded, CalendarCheck,
  ArrowUpRight, ArrowDownRight, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const metrics = [
  { title: "Total Calls", value: "1,247", change: "+12%", up: true, icon: Phone },
  { title: "Missed Calls", value: "23", change: "-8%", up: false, icon: PhoneMissed },
  { title: "AI Handled", value: "1,180", change: "+15%", up: true, icon: Bot },
  { title: "Callbacks", value: "44", change: "+3%", up: true, icon: PhoneCallback },
  { title: "Bookings", value: "89", change: "+22%", up: true, icon: CalendarCheck },
];

const recentActivity = [
  { type: "call", text: "Incoming call handled — Booking confirmed for Saturday 10 AM", time: "5 min ago", status: "handled" },
  { type: "callback", text: "Callback requested by +1 (555) 234-5678", time: "12 min ago", status: "pending" },
  { type: "call", text: "Call transferred to staff — Complex inquiry about group booking", time: "28 min ago", status: "escalated" },
  { type: "lead", text: "New lead captured — Sarah M. interested in premium package", time: "1 hr ago", status: "new" },
  { type: "call", text: "After-hours call — FAQ answered, caller satisfied", time: "2 hr ago", status: "handled" },
];

const statusColors: Record<string, string> = {
  handled: "bg-success/10 text-success",
  pending: "bg-primary/10 text-primary",
  escalated: "bg-destructive/10 text-destructive",
  new: "bg-primary/10 text-primary",
};

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here's your AI agent performance overview.</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((m, i) => (
          <Card key={i} className="border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{m.title}</span>
                <m.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-foreground">{m.value}</span>
                <span className={`flex items-center text-xs font-medium ${m.up ? "text-success" : "text-destructive"}`}>
                  {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {m.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.time}</p>
                </div>
                <Badge variant="secondary" className={`shrink-0 text-[10px] ${statusColors[a.status]}`}>
                  {a.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "AI Agent", status: "Active", ok: true },
              { label: "Phone Line", status: "Connected", ok: true },
              { label: "Booking System", status: "Active", ok: true },
              { label: "Transcription", status: "Active", ok: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? "bg-success" : "bg-destructive"}`} />
                  <span className="text-xs text-muted-foreground">{s.status}</span>
                </div>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-3">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-success font-medium">All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
