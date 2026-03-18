import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Clock, Bot, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const transcript = [
  { role: "AI", text: "Hi! Thanks for calling Maria's Salon. How can I help you today?" },
  { role: "Caller", text: "Hi, I'd like to book a haircut for this Saturday if possible." },
  { role: "AI", text: "Of course! I have availability at 10:00 AM and 11:30 AM this Saturday. Which time works best for you?" },
  { role: "Caller", text: "10 AM would be perfect." },
  { role: "AI", text: "Great! Can I get your name please?" },
  { role: "Caller", text: "It's Sarah Mitchell." },
  { role: "AI", text: "Perfect, Sarah! I've booked you for a haircut this Saturday at 10:00 AM. You'll receive a confirmation text shortly. Is there anything else I can help with?" },
  { role: "Caller", text: "No, that's all. Thank you!" },
  { role: "AI", text: "You're welcome, Sarah! See you Saturday. Have a great day!" },
];

export default function CallDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/calls"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Call Detail</h1>
          <p className="text-sm text-muted-foreground">Call #{id} • +1 (555) 123-4567</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Transcript</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {transcript.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "Caller" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "AI" ? "bg-primary/10" : "bg-secondary"}`}>
                    {msg.role === "AI" ? <Bot className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${msg.role === "AI" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Call Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Caller", value: "+1 (555) 123-4567" },
                { label: "Date", value: "Today, 10:23 AM" },
                { label: "Duration", value: "2:34" },
                { label: "Outcome", value: "Booking Confirmed" },
                { label: "Sentiment", value: "Positive" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
              <div className="pt-2">
                <Badge className="bg-success/10 text-success">Handled by AI</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">Actions Taken</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["Appointment booked — Saturday 10 AM", "Confirmation SMS sent", "Calendar updated"].map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  {a}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
