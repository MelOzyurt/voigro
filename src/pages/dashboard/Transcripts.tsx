import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranscripts } from "@/hooks/use-transcripts";
import { formatDistanceToNow } from "date-fns";

const outcomeColors: Record<string, string> = {
  booking: "bg-success/10 text-success",
  callback: "bg-primary/10 text-primary",
  escalated: "bg-destructive/10 text-destructive",
  faq: "bg-secondary text-secondary-foreground",
  lead: "bg-primary/10 text-primary",
  missed: "bg-muted text-muted-foreground",
};

export default function Transcripts() {
  const { data: transcripts, isLoading } = useTranscripts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Transcripts</h1>
        <p className="text-sm text-muted-foreground">Browse, search, and review call transcripts.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search transcripts..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="callback">Callback</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="faq">FAQ</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="unreviewed">Unreviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading transcripts...</p>}
        {!isLoading && (!transcripts || transcripts.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No transcripts yet. They'll appear after your AI agent handles calls.</p>
        )}
        {transcripts?.map(t => {
          const call = t.calls as any;
          return (
            <Link key={t.id} to={`/dashboard/calls/${t.call_id}`} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{call?.from_number ?? "Unknown"}</p>
                  {t.reviewed ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{t.summary ?? "No summary"}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</p>
                  {t.extracted_intent && <span className="text-[10px] text-muted-foreground">• Intent: {t.extracted_intent}</span>}
                </div>
              </div>
              {call?.outcome && (
                <Badge variant="secondary" className={`${outcomeColors[call.outcome] ?? ""} text-[10px]`}>{call.outcome}</Badge>
              )}
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
