import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const transcripts = [
  { id: "1", caller: "+1 (555) 123-4567", time: "Today, 10:23 AM", duration: "2:34", summary: "Booking confirmed for Saturday at 10 AM", outcome: "Booking" },
  { id: "2", caller: "+1 (555) 234-5678", time: "Today, 9:45 AM", duration: "1:12", summary: "Caller requested a callback about pricing", outcome: "Callback" },
  { id: "3", caller: "+1 (555) 345-6789", time: "Today, 9:12 AM", duration: "4:01", summary: "Complex group booking inquiry, transferred to staff", outcome: "Escalated" },
  { id: "4", caller: "+1 (555) 456-7890", time: "Yesterday, 4:30 PM", duration: "1:45", summary: "Answered questions about business hours and location", outcome: "FAQ" },
  { id: "5", caller: "+1 (555) 567-8901", time: "Yesterday, 2:15 PM", duration: "3:22", summary: "Collected contact info for premium package interest", outcome: "Lead" },
];

export default function Transcripts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Transcripts</h1>
        <p className="text-sm text-muted-foreground">Browse and search call transcripts.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search transcripts..." className="pl-9" />
      </div>

      <div className="space-y-2">
        {transcripts.map(t => (
          <div key={t.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t.caller}</p>
              <p className="text-xs text-muted-foreground truncate">{t.summary}</p>
              <p className="text-xs text-muted-foreground">{t.time} • {t.duration}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">{t.outcome}</Badge>
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/dashboard/calls/${t.id}`}><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
