import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Bot, User, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useCall } from "@/hooks/use-calls";
import { useTranscript } from "@/hooks/use-transcripts";
import { format } from "date-fns";

function formatDuration(seconds: number | null) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CallDetail() {
  const { id } = useParams();
  const { data: call, isLoading: callLoading } = useCall(id);
  const { data: transcript, isLoading: transcriptLoading } = useTranscript(id);
  const [note, setNote] = useState("");
  const [reviewed, setReviewed] = useState(false);

  const messages = (transcript?.messages as any[]) ?? [];
  const isLoading = callLoading || transcriptLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/calls"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {call ? `Call from ${call.from_number}` : `Call #${id}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {call ? `${format(new Date(call.started_at), "MMM d, yyyy h:mm a")} • ${formatDuration(call.duration_seconds)}` : "Loading..."}
          </p>
        </div>
        <Button
          variant={reviewed ? "outline" : "default"}
          size="sm"
          onClick={() => setReviewed(!reviewed)}
        >
          {reviewed ? <CheckCircle className="mr-2 h-4 w-4 text-success" /> : <AlertCircle className="mr-2 h-4 w-4" />}
          {reviewed ? "Reviewed" : "Mark as Reviewed"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading call details...</p>
      ) : !call ? (
        <p className="text-sm text-muted-foreground">Call not found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader><CardTitle className="font-display text-base">Call Summary</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {transcript?.summary ?? "No summary available for this call."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {transcript?.extracted_intent && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">Intent: {transcript.extracted_intent}</Badge>
                  )}
                  {call.sentiment && (
                    <Badge variant="secondary" className="bg-success/10 text-success text-[10px]">Sentiment: {call.sentiment}</Badge>
                  )}
                  {call.outcome && (
                    <Badge variant="secondary" className="bg-success/10 text-success text-[10px]">Outcome: {call.outcome}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card>
              <CardHeader><CardTitle className="font-display text-base">Transcript</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {messages.length === 0 && <p className="text-sm text-muted-foreground">No transcript available.</p>}
                {messages.map((msg: any, i: number) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "caller" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "assistant" ? "bg-primary/10" : "bg-secondary"}`}>
                      {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className={`max-w-[75%] ${msg.role === "caller" ? "text-right" : ""}`}>
                      <div className={`inline-block rounded-xl px-4 py-2.5 text-sm ${msg.role === "assistant" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>
                        {msg.text}
                      </div>
                      {msg.timestamp && <p className="mt-0.5 text-[10px] text-muted-foreground">{msg.timestamp}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Internal Notes */}
            <Card>
              <CardHeader><CardTitle className="font-display text-base">Internal Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Add a note about this call..." value={note} onChange={e => setNote(e.target.value)} rows={3} />
                <Button variant="outline" size="sm" disabled={!note.trim()}>
                  <MessageSquare className="mr-2 h-3.5 w-3.5" /> Add Note
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="font-display text-base">Call Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "From", value: call.from_number },
                  { label: "To", value: call.to_number },
                  { label: "Date", value: format(new Date(call.started_at), "MMM d, yyyy h:mm a") },
                  { label: "Duration", value: formatDuration(call.duration_seconds) },
                  { label: "Handled By", value: call.handled_by ?? "AI Agent" },
                  { label: "Outcome", value: call.outcome ?? "—" },
                  { label: "Sentiment", value: call.sentiment ?? "—" },
                  { label: "Status", value: call.status },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
