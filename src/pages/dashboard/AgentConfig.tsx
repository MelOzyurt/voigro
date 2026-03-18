import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Bot, Save } from "lucide-react";
import { useState } from "react";

export default function AgentConfig() {
  const [agentName, setAgentName] = useState("Maria's Assistant");
  const [greeting, setGreeting] = useState("Hi! Thanks for calling Maria's Salon. How can I help you today?");
  const [description, setDescription] = useState("A premium hair salon offering cuts, coloring, styling, and treatments.");
  const [tone, setTone] = useState("friendly");
  const [style, setStyle] = useState("concise");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">AI Agent</h1>
          <p className="text-sm text-muted-foreground">Configure how your AI phone agent behaves.</p>
        </div>
        <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
        </TabsList>

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
                <Input value={agentName} onChange={e => setAgentName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Greeting Message</Label>
                <Textarea value={greeting} onChange={e => setGreeting(e.target.value)} className="mt-1.5" rows={3} />
              </div>
              <div>
                <Label>Business Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1.5" rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Tone & Style</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tone of Voice</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Warm</SelectItem>
                    <SelectItem value="professional">Professional & Formal</SelectItem>
                    <SelectItem value="casual">Casual & Relaxed</SelectItem>
                    <SelectItem value="energetic">Energetic & Upbeat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Response Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise — Short & direct</SelectItem>
                    <SelectItem value="detailed">Detailed — Thorough explanations</SelectItem>
                    <SelectItem value="conversational">Conversational — Natural flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fallback Message</Label>
                <Textarea defaultValue="I'm sorry, I don't have that information right now. Would you like me to have someone call you back?" className="mt-1.5" rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Supported Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Appointment Booking", desc: "Allow callers to book appointments", enabled: true },
                { label: "Callback Requests", desc: "Let callers request a callback", enabled: true },
                { label: "Lead Capture", desc: "Collect contact info from potential customers", enabled: true },
                { label: "Order Intake", desc: "Accept simple orders over the phone", enabled: false },
                { label: "FAQ Answering", desc: "Answer common questions about your business", enabled: true },
              ].map((action, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                  <Switch defaultChecked={action.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalation" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Escalation Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Transfer Phone Number</Label>
                <Input defaultValue="+1 (555) 000-0000" className="mt-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">Calls will be transferred here when the AI can't handle them.</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-escalate angry callers</p>
                  <p className="text-xs text-muted-foreground">Transfer when negative sentiment is detected</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Escalate after 3 failed attempts</p>
                  <p className="text-xs text-muted-foreground">Transfer if the AI can't understand the request</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
