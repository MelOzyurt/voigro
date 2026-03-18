import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const calls = [
  { id: "1", caller: "+1 (555) 123-4567", duration: "2:34", time: "Today, 10:23 AM", outcome: "Booking Confirmed", status: "handled" },
  { id: "2", caller: "+1 (555) 234-5678", duration: "1:12", time: "Today, 9:45 AM", outcome: "Callback Requested", status: "pending" },
  { id: "3", caller: "+1 (555) 345-6789", duration: "4:01", time: "Today, 9:12 AM", outcome: "Transferred to Staff", status: "escalated" },
  { id: "4", caller: "+1 (555) 456-7890", duration: "1:45", time: "Yesterday, 4:30 PM", outcome: "FAQ Answered", status: "handled" },
  { id: "5", caller: "+1 (555) 567-8901", duration: "3:22", time: "Yesterday, 2:15 PM", outcome: "Lead Captured", status: "handled" },
  { id: "6", caller: "+1 (555) 678-9012", duration: "0:45", time: "Yesterday, 11:00 AM", outcome: "Missed — After Hours", status: "missed" },
  { id: "7", caller: "+1 (555) 789-0123", duration: "2:10", time: "2 days ago", outcome: "Booking Confirmed", status: "handled" },
  { id: "8", caller: "+1 (555) 890-1234", duration: "1:58", time: "2 days ago", outcome: "Order Placed", status: "handled" },
];

const statusStyles: Record<string, string> = {
  handled: "bg-success/10 text-success",
  pending: "bg-primary/10 text-primary",
  escalated: "bg-destructive/10 text-destructive",
  missed: "bg-muted text-muted-foreground",
};

export default function CallHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Call History</h1>
        <p className="text-sm text-muted-foreground">View and manage all incoming calls.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search calls..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-2">
        {calls.map(call => (
          <div key={call.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{call.caller}</p>
              <p className="text-xs text-muted-foreground">{call.time} • {call.duration}</p>
            </div>
            <Badge variant="secondary" className={`${statusStyles[call.status]} text-[10px]`}>{call.outcome}</Badge>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/dashboard/calls/${call.id}`}><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
