import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, MessageSquare, BookOpen, Send } from "lucide-react";

const checklist = [
  { label: "Create your account", done: true },
  { label: "Add business details", done: true },
  { label: "Configure AI agent", done: true },
  { label: "Add services & FAQs", done: false },
  { label: "Forward your phone number", done: false },
  { label: "Make your first test call", done: false },
];

const tickets = [
  { id: "T-001", subject: "Help configuring escalation rules", status: "Open", date: "Mar 15, 2026" },
  { id: "T-002", subject: "Question about billing", status: "Resolved", date: "Mar 10, 2026" },
];

export default function Support() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground">Get help setting up and managing your AI agent.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Submit a Request</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input placeholder="What do you need help with?" className="mt-1.5" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe your issue or question..." className="mt-1.5" rows={4} />
              </div>
              <Button><Send className="mr-2 h-4 w-4" /> Submit Request</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">Recent Tickets</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tickets.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{t.id} • {t.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] ${t.status === "Open" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>{t.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Setup Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.label}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">3 of 6 steps completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">Quick Links</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Getting Started Guide", icon: BookOpen },
                { label: "AI Agent Best Practices", icon: BookOpen },
                { label: "FAQ & Troubleshooting", icon: BookOpen },
              ].map((link, i) => (
                <button key={i} className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-foreground hover:bg-secondary transition-colors">
                  <link.icon className="h-4 w-4 text-primary" />
                  {link.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
