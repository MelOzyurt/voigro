import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Bot, Save, Pencil, Lock } from "lucide-react";
import { useState } from "react";
import BusinessHours, { type BusinessHoursData } from "@/components/BusinessHours";

const DEFAULT_BUSINESS_HOURS: BusinessHoursData = {
  timezone: "UTC+0",
  weekly_schedule: {
    monday:    { open: true,  from: "09:00", to: "17:00" },
    tuesday:   { open: true,  from: "09:00", to: "17:00" },
    wednesday: { open: true,  from: "09:00", to: "17:00" },
    thursday:  { open: true,  from: "09:00", to: "17:00" },
    friday:    { open: true,  from: "09:00", to: "17:00" },
    saturday:  { open: false, from: "09:00", to: "13:00" },
    sunday:    { open: false, from: "09:00", to: "13:00" },
  },
  public_holidays: { enabled: true, country: "GB", closed_on_holidays: true },
  custom_closures: [],
  custom_openings: [],
};

export default function AgentConfig() {
  const [agentName, setAgentName] = useState("Maria's Assistant");
  const [greeting, setGreeting] = useState("Hi! Thanks for calling Maria's Salon. How can I help you today?");
  const [description, setDescription] = useState("A premium hair salon offering cuts, coloring, styling, and treatments. Located in San Francisco, CA. Open Mon-Fri 9am-7pm, Sat 9am-5pm.");
  const [tone, setTone] = useState("friendly");
  const [style, setStyle] = useState("concise");
  const [businessHours, setBusinessHours] = useState<BusinessHoursData>(DEFAULT_BUSINESS_HOURS);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    // TODO: persist to database
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">AI Agent</h1>
          <p className="text-sm text-muted-foreground">Configure how your AI phone agent behaves on calls.</p>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          )}
          {!editing && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Locked
            </span>
          )}
        </div>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="context">Business Context</TabsTrigger>
          <TabsTrigger value="behavior">Tone & Style</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
          <TabsTrigger value="outcomes">Call Outcomes</TabsTrigger>
        </TabsList>

        {/* Identity */}
        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Agent Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border bg-background p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{agentName}</p>
                  <p className="text-xs text-muted-foreground">Your AI phone agent</p>
                </div>
              </div>
              <div>
                <Label>Agent Name</Label>
                <Input value={agentName} onChange={e => setAgentName(e.target.value)} className="mt-1.5" disabled={!editing} />
                <p className="mt-1 text-xs text-muted-foreground">The name your agent uses to introduce itself.</p>
              </div>
              <div>
                <Label>Greeting Message</Label>
                <Textarea value={greeting} onChange={e => setGreeting(e.target.value)} className="mt-1.5" rows={3} disabled={!editing} />
                <p className="mt-1 text-xs text-muted-foreground">The first thing callers hear when the AI picks up.</p>
              </div>
              <div>
                <Label>After-Hours Greeting</Label>
                <Textarea defaultValue="Thanks for calling Maria's Salon. We're currently closed, but I can still help you book an appointment or take a message. How can I help?" className="mt-1.5" rows={3} disabled={!editing} />
                <p className="mt-1 text-xs text-muted-foreground">Used outside your business hours.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Context */}
        <TabsContent value="context" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Business Context</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1.5" rows={4} disabled={!editing} />
                <p className="mt-1 text-xs text-muted-foreground">Help the AI understand your business so it can answer questions accurately.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Industry</Label>
                  <Input defaultValue="Salon / Spa" className="mt-1.5" readOnly />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input defaultValue="San Francisco, CA" className="mt-1.5" readOnly />
                </div>
              </div>
              <div>
                <Label>Business Hours</Label>
                <div className="mt-2">
                  <BusinessHours value={businessHours} onChange={setBusinessHours} />
                </div>
              </div>
              <div>
                <Label>Special Instructions</Label>
                <Textarea defaultValue="Always mention that we offer a 10% first-time customer discount. If asked about parking, let them know there's free parking in the lot behind the building." className="mt-1.5" rows={3} disabled={!editing} />
                <p className="mt-1 text-xs text-muted-foreground">Custom instructions or policies the AI should always follow.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">Knowledge Sources</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Your agent uses these to answer caller questions. Manage them from their respective pages.</p>
              {[
                { label: "Services", count: 5, link: "/dashboard/services" },
                { label: "Products", count: 4, link: "/dashboard/products" },
                { label: "FAQs", count: 5, link: "/dashboard/faqs" },
              ].map((source, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-foreground">{source.label}</span>
                  <span className="text-xs text-muted-foreground">{source.count} items</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tone & Style */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Tone & Response Style</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tone of Voice</Label>
                <Select value={tone} onValueChange={setTone} disabled={!editing}>
                  <SelectTrigger className="mt-1.5" disabled={!editing}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Warm</SelectItem>
                    <SelectItem value="professional">Professional & Formal</SelectItem>
                    <SelectItem value="casual">Casual & Relaxed</SelectItem>
                    <SelectItem value="energetic">Energetic & Upbeat</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">How your agent sounds during conversations.</p>
              </div>
              <div>
                <Label>Response Style</Label>
                <Select value={style} onValueChange={setStyle} disabled={!editing}>
                  <SelectTrigger className="mt-1.5" disabled={!editing}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise — Short & direct answers</SelectItem>
                    <SelectItem value="detailed">Detailed — Thorough explanations</SelectItem>
                    <SelectItem value="conversational">Conversational — Natural flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Language</Label>
                <Select defaultValue="en" disabled={!editing}>
                  <SelectTrigger className="mt-1.5" disabled={!editing}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">Fallback Behavior</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Fallback Message</Label>
                <Textarea defaultValue="I'm sorry, I don't have that information right now. Would you like me to have someone call you back?" className="mt-1.5" rows={2} disabled={!editing} />
                <p className="mt-1 text-xs text-muted-foreground">Used when the AI doesn't know the answer.</p>
              </div>
              <div>
                <Label>Max Clarification Attempts</Label>
                <Select defaultValue="3" disabled={!editing}>
                  <SelectTrigger className="mt-1.5" disabled={!editing}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 attempts</SelectItem>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">How many times the agent tries to understand before escalating.</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Offer callback on fallback</p>
                  <p className="text-xs text-muted-foreground">When the AI can't help, offer to take a callback request</p>
                </div>
                <Switch defaultChecked disabled={!editing} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Supported Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose what your AI agent can do during calls.</p>
              {[
                { label: "Appointment Booking", desc: "Let callers book appointments with available time slots", enabled: true },
                { label: "Callback Requests", desc: "Collect caller details and schedule a callback from your team", enabled: true },
                { label: "Lead Capture", desc: "Gather contact information and interest details from potential customers", enabled: true },
                { label: "Order Intake", desc: "Accept simple product or service orders over the phone", enabled: false },
                { label: "FAQ Answering", desc: "Answer common questions using your configured FAQs and business info", enabled: true },
                { label: "Message Taking", desc: "Take messages when the business is closed or staff is unavailable", enabled: true },
              ].map((action, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                  <Switch defaultChecked={action.enabled} disabled={!editing} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escalation */}
        <TabsContent value="escalation" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Human Handoff & Escalation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Transfer Phone Number</Label>
                <Input defaultValue="+1 (555) 000-0000" className="mt-1.5" disabled={!editing} />
                <p className="mt-1 text-xs text-muted-foreground">Calls are transferred here when the AI escalates.</p>
              </div>
              <div>
                <Label>Transfer Announcement</Label>
                <Textarea defaultValue="Let me connect you with a team member who can help. Please hold for a moment." className="mt-1.5" rows={2} disabled={!editing} />
              </div>
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-foreground">Escalation Triggers</p>
                {[
                  { label: "Escalate when negative sentiment is detected", desc: "Transfer angry or frustrated callers to a human", enabled: true },
                  { label: "Escalate after repeated failed understanding", desc: "Transfer if the AI cannot understand after max attempts", enabled: true },
                  { label: "Escalate on explicit request", desc: "Transfer immediately when caller asks for a human", enabled: true },
                  { label: "Escalate for high-value inquiries", desc: "Transfer calls about large orders or custom requests", enabled: false },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{rule.label}</p>
                      <p className="text-xs text-muted-foreground">{rule.desc}</p>
                    </div>
                    <Switch defaultChecked={rule.enabled} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Allow transfer during business hours only</p>
                  <p className="text-xs text-muted-foreground">After hours, offer callback instead of transferring</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Call Outcomes */}
        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Call Outcome Behavior</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Configure what happens after each type of call outcome.</p>
              {[
                { label: "After Booking", desc: "Send a confirmation SMS to the caller", enabled: true },
                { label: "After Lead Capture", desc: "Send lead details to email or webhook", enabled: true },
                { label: "After Callback Request", desc: "Create a callback task and notify staff", enabled: true },
                { label: "After Order", desc: "Send order confirmation to caller and business", enabled: false },
                { label: "After Escalation", desc: "Log escalation reason and send summary to staff", enabled: true },
                { label: "After Missed Call", desc: "Send a follow-up SMS to the missed caller", enabled: false },
              ].map((outcome, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{outcome.label}</p>
                    <p className="text-xs text-muted-foreground">{outcome.desc}</p>
                  </div>
                  <Switch defaultChecked={outcome.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notification Email</Label>
                <Input defaultValue="john@mariassalon.com" className="mt-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">Where to send call summaries and action notifications.</p>
              </div>
              <div>
                <Label>Webhook URL (optional)</Label>
                <Input placeholder="https://your-crm.com/webhooks/callio" className="mt-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">Receive call outcome data via webhook for CRM or automation integration.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
