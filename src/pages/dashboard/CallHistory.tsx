import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCalls } from "@/hooks/use-calls";
import { format, formatDistanceToNow } from "date-fns";

const statusStyles: Record<string, string> = {
  completed: "bg-success/10 text-success",
  answered: "bg-success/10 text-success",
  in_progress: "bg-primary/10 text-primary",
  initiated: "bg-primary/10 text-primary",
  ringing: "bg-primary/10 text-primary",
  missed: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CallHistory() {
  const { data: calls, isLoading } = useCalls();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Calls</h1>
        <p className="text-sm text-muted-foreground">View and manage all incoming calls and their outcomes.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by number or outcome..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Outcome" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="callback">Callback</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="faq">FAQ</SelectItem>
            <SelectItem value="order">Order</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading calls...</p>}
        {!isLoading && (!calls || calls.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No calls yet. Calls will appear here once your AI agent starts handling them.</p>
        )}
        {calls?.map(call => (
          <Link
            key={call.id}
            to={`/dashboard/calls/${call.id}`}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{call.from_number}</p>
                <span className="text-[10px] text-muted-foreground">• {formatDuration(call.duration_seconds)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{call.outcome ?? "—"}</p>
              <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}</p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <Badge variant="secondary" className={`${statusStyles[call.status] ?? ""} text-[10px]`}>{call.status}</Badge>
              {call.sentiment && <span className="text-[10px] text-muted-foreground">{call.sentiment}</span>}
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
