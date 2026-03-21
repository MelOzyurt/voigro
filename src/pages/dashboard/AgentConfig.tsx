import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Save, Pencil, Lock, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { useAiAgent, useUpdateAiAgent, useCreateAiAgent } from "@/hooks/use-ai-agent";
import { toast } from "sonner";
import BusinessHours, { type BusinessHoursData } from "@/components/BusinessHours";
import CallObjectives, { type ObjectivesData, DEFAULT_OBJECTIVES } from "@/components/CallObjectives";
import type { Json } from "@/integrations/supabase/types";

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

// Removed old DEFAULT_ENABLED_ACTIONS — now using ObjectivesData

const DEFAULT_ESCALATION_RULES = {
  negative_sentiment: true,
  repeated_failure: true,
  explicit_request: true,
  high_value: false,
};

const DEFAULT_OUTCOME_BEHAVIORS = {
  after_booking: true,
  after_lead_capture: true,
  after_callback: true,
  after_order: false,
  after_escalation: true,
  after_missed_call: false,
};

type TabKey = "identity" | "context" | "behavior" | "actions" | "escalation" | "outcomes";

function TabEditControls({ editing, onEdit, onSave }: { editing: boolean; onEdit: () => void; onSave: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {!editing ? (
        <>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
          </Button>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Locked
          </span>
        </>
      ) : (
        <Button size="sm" variant="outline" onClick={onSave}>
          <Save className="mr-2 h-3.5 w-3.5" /> Save
        </Button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function AgentConfig() {
  const { data: agent, isLoading } = useAiAgent();
  const updateAgent = useUpdateAiAgent();
  const createAgent = useCreateAiAgent();
  const hasAgent = !!agent?.id;

  // Form state
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [afterHoursGreeting, setAfterHoursGreeting] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHoursData>(DEFAULT_BUSINESS_HOURS);
  const [tone, setTone] = useState("friendly");
  const [responseStyle, setResponseStyle] = useState("concise");
  const [language, setLanguage] = useState("en");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [maxClarification, setMaxClarification] = useState("3");
  const [offerCallback, setOfferCallback] = useState(true);
  const [enabledActions, setEnabledActions] = useState<ObjectivesData>(DEFAULT_OBJECTIVES);
  const [escalationRules, setEscalationRules] = useState(DEFAULT_ESCALATION_RULES);
  const [transferNumber, setTransferNumber] = useState("");
  const [transferAnnouncement, setTransferAnnouncement] = useState("");
  const [businessHoursOnlyTransfer, setBusinessHoursOnlyTransfer] = useState(false);
  const [outcomeBehaviors, setOutcomeBehaviors] = useState(DEFAULT_OUTCOME_BEHAVIORS);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const [editingTabs, setEditingTabs] = useState<Record<TabKey, boolean>>({
    identity: false, context: false, behavior: false,
    actions: false, escalation: false, outcomes: false,
  });

  // Populate form from DB if agent exists
  useEffect(() => {
    if (!agent) return;
    setName(agent.name || "");
    setGreeting(agent.greeting || "");
    setAfterHoursGreeting(agent.after_hours_greeting || "");
    setBusinessDescription(agent.business_description || "");
    setSpecialInstructions(agent.special_instructions || "");
    setTone(agent.tone || "friendly");
    setResponseStyle(agent.response_style || "concise");
    setLanguage(agent.language || "en");
    setFallbackMessage(agent.fallback_message || "");
    setMaxClarification(String(agent.max_clarification_attempts || 3));
    setOfferCallback(agent.offer_callback_on_fallback ?? true);
    setTransferNumber(agent.transfer_number || "");
    setTransferAnnouncement(agent.transfer_announcement || "");
    setBusinessHoursOnlyTransfer(agent.business_hours_only_transfer ?? false);
    setNotificationEmail(agent.notification_email || "");
    setWebhookUrl(agent.webhook_url || "");
    if (agent.business_hours && typeof agent.business_hours === "object") {
      setBusinessHours(agent.business_hours as unknown as BusinessHoursData);
    }
    if (agent.enabled_actions && typeof agent.enabled_actions === "object") {
      setEnabledActions({ ...DEFAULT_OBJECTIVES, ...(agent.enabled_actions as any) });
    }
    if (agent.escalation_rules && typeof agent.escalation_rules === "object") {
      setEscalationRules({ ...DEFAULT_ESCALATION_RULES, ...(agent.escalation_rules as any) });
    }
    if (agent.outcome_behaviors && typeof agent.outcome_behaviors === "object") {
      setOutcomeBehaviors({ ...DEFAULT_OUTCOME_BEHAVIORS, ...(agent.outcome_behaviors as any) });
    }
  }, [agent]);

  const isEditing = (tab: TabKey) => editingTabs[tab];
  const setTabEditing = (tab: TabKey, value: boolean) =>
    setEditingTabs(prev => ({ ...prev, [tab]: value }));

  // Save = just lock the tab (UI only)
  const handleTabSave = (tab: TabKey) => {
    setTabEditing(tab, false);
  };

  const getPayload = () => ({
    name,
    greeting,
    after_hours_greeting: afterHoursGreeting,
    business_description: businessDescription,
    special_instructions: specialInstructions,
    business_hours: businessHours as unknown as Json,
    tone,
    response_style: responseStyle,
    language,
    fallback_message: fallbackMessage,
    max_clarification_attempts: parseInt(maxClarification),
    offer_callback_on_fallback: offerCallback,
    enabled_actions: enabledActions as unknown as Json,
    escalation_rules: escalationRules as unknown as Json,
    outcome_behaviors: outcomeBehaviors as unknown as Json,
    transfer_number: transferNumber,
    transfer_announcement: transferAnnouncement,
    business_hours_only_transfer: businessHoursOnlyTransfer,
    notification_email: notificationEmail,
    webhook_url: webhookUrl,
  });

  // Create Agent / Update Agent = push to DB
  const pushing = updateAgent.isPending || createAgent.isPending;

  const handlePushToDb = async () => {
    // Lock all open tabs first
    setEditingTabs({ identity: false, context: false, behavior: false, actions: false, escalation: false, outcomes: false });

    const payload = getPayload();
    try {
      if (hasAgent) {
        await updateAgent.mutateAsync({ id: agent!.id, updates: payload });
        toast.success("Agent updated successfully");
      } else {
        await createAgent.mutateAsync(payload);
        toast.success("Agent created successfully");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save agent");
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  // actionsList removed — replaced by CallObjectives component

  const escalationList = [
    { key: "negative_sentiment", label: "Escalate when negative sentiment is detected", desc: "Transfer angry or frustrated callers to a human" },
    { key: "repeated_failure", label: "Escalate after repeated failed understanding", desc: "Transfer if the AI cannot understand after max attempts" },
    { key: "explicit_request", label: "Escalate on explicit request", desc: "Transfer immediately when caller asks for a human" },
    { key: "high_value", label: "Escalate for high-value inquiries", desc: "Transfer calls about large orders or custom requests" },
  ];

  const outcomeList = [
    { key: "after_booking", label: "After Booking", desc: "Send a confirmation SMS to the caller" },
    { key: "after_lead_capture", label: "After Lead Capture", desc: "Send lead details to email or webhook" },
    { key: "after_callback", label: "After Callback Request", desc: "Create a callback task and notify staff" },
    { key: "after_order", label: "After Order", desc: "Send order confirmation to caller and business" },
    { key: "after_escalation", label: "After Escalation", desc: "Log escalation reason and send summary to staff" },
    { key: "after_missed_call", label: "After Missed Call", desc: "Send a follow-up SMS to the missed caller" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">AI Agent</h1>
          <p className="text-sm text-muted-foreground">Configure how your AI phone agent behaves on calls.</p>
        </div>
        <Button onClick={handlePushToDb} disabled={pushing}>
          <Rocket className="mr-2 h-4 w-4" />
          {pushing ? "Saving…" : hasAgent ? "Update Agent" : "Create Agent"}
        </Button>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="context">Business Context</TabsTrigger>
          <TabsTrigger value="behavior">Tone & Style</TabsTrigger>
          <TabsTrigger value="actions">Call Objectives</TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
          <TabsTrigger value="outcomes">Call Outcomes</TabsTrigger>
        </TabsList>

        {/* Identity */}
        <TabsContent value="identity" className="space-y-6">
          <TabEditControls editing={isEditing("identity")} onEdit={() => setTabEditing("identity", true)} onSave={() => handleTabSave("identity")} />
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Agent Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border bg-background p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name || "AI Assistant"}</p>
                  <p className="text-xs text-muted-foreground">Your AI phone agent</p>
                </div>
              </div>
              <div>
                <Label>Agent Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="mt-1.5" disabled={!isEditing("identity")} />
                <p className="mt-1 text-xs text-muted-foreground">The name your agent uses to introduce itself.</p>
              </div>
              <div>
                <Label>Greeting Message</Label>
                <Textarea value={greeting} onChange={e => setGreeting(e.target.value)} className="mt-1.5" rows={3} disabled={!isEditing("identity")} />
                <p className="mt-1 text-xs text-muted-foreground">The first thing callers hear when the AI picks up.</p>
              </div>
              <div>
                <Label>After-Hours Greeting</Label>
                <Textarea value={afterHoursGreeting} onChange={e => setAfterHoursGreeting(e.target.value)} className="mt-1.5" rows={3} disabled={!isEditing("identity")} />
                <p className="mt-1 text-xs text-muted-foreground">Used outside your business hours.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Context */}
        <TabsContent value="context" className="space-y-6">
          <TabEditControls editing={isEditing("context")} onEdit={() => setTabEditing("context", true)} onSave={() => handleTabSave("context")} />
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Business Context</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Description</Label>
                <Textarea value={businessDescription} onChange={e => setBusinessDescription(e.target.value)} className="mt-1.5" rows={4} disabled={!isEditing("context")} />
                <p className="mt-1 text-xs text-muted-foreground">Help the AI understand your business so it can answer questions accurately.</p>
              </div>
              <div>
                <Label>Business Hours</Label>
                <div className="mt-2">
                  <BusinessHours value={businessHours} onChange={setBusinessHours} />
                </div>
              </div>
              <div>
                <Label>Special Instructions</Label>
                <Textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} className="mt-1.5" rows={3} disabled={!isEditing("context")} />
                <p className="mt-1 text-xs text-muted-foreground">Custom instructions or policies the AI should always follow.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">Knowledge Sources</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Your agent uses these to answer caller questions. Manage them from their respective pages.</p>
              {["Services", "Products", "FAQs"].map((label, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tone & Style */}
        <TabsContent value="behavior" className="space-y-6">
          <TabEditControls editing={isEditing("behavior")} onEdit={() => setTabEditing("behavior", true)} onSave={() => handleTabSave("behavior")} />
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Tone & Response Style</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tone of Voice</Label>
                <Select value={tone} onValueChange={setTone} disabled={!isEditing("behavior")}>
                  <SelectTrigger className="mt-1.5" disabled={!isEditing("behavior")}><SelectValue /></SelectTrigger>
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
                <Select value={responseStyle} onValueChange={setResponseStyle} disabled={!isEditing("behavior")}>
                  <SelectTrigger className="mt-1.5" disabled={!isEditing("behavior")}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise — Short & direct answers</SelectItem>
                    <SelectItem value="detailed">Detailed — Thorough explanations</SelectItem>
                    <SelectItem value="conversational">Conversational — Natural flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage} disabled={!isEditing("behavior")}>
                  <SelectTrigger className="mt-1.5" disabled={!isEditing("behavior")}><SelectValue /></SelectTrigger>
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
                <Textarea value={fallbackMessage} onChange={e => setFallbackMessage(e.target.value)} className="mt-1.5" rows={2} disabled={!isEditing("behavior")} />
                <p className="mt-1 text-xs text-muted-foreground">Used when the AI doesn't know the answer.</p>
              </div>
              <div>
                <Label>Max Clarification Attempts</Label>
                <Select value={maxClarification} onValueChange={setMaxClarification} disabled={!isEditing("behavior")}>
                  <SelectTrigger className="mt-1.5" disabled={!isEditing("behavior")}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 attempts</SelectItem>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Offer callback on fallback</p>
                  <p className="text-xs text-muted-foreground">When the AI can't help, offer to take a callback request</p>
                </div>
                <Switch checked={offerCallback} onCheckedChange={setOfferCallback} disabled={!isEditing("behavior")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions */}
        <TabsContent value="actions" className="space-y-6">
          <TabEditControls editing={isEditing("actions")} onEdit={() => setTabEditing("actions", true)} onSave={() => handleTabSave("actions")} />
          <CallObjectives
            value={enabledActions}
            onChange={setEnabledActions}
            disabled={!isEditing("actions")}
          />
        </TabsContent>

        {/* Escalation */}
        <TabsContent value="escalation" className="space-y-6">
          <TabEditControls editing={isEditing("escalation")} onEdit={() => setTabEditing("escalation", true)} onSave={() => handleTabSave("escalation")} />
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Human Handoff & Escalation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Transfer Phone Number</Label>
                <Input value={transferNumber} onChange={e => setTransferNumber(e.target.value)} className="mt-1.5" disabled={!isEditing("escalation")} />
                <p className="mt-1 text-xs text-muted-foreground">Calls are transferred here when the AI escalates.</p>
              </div>
              <div>
                <Label>Transfer Announcement</Label>
                <Textarea value={transferAnnouncement} onChange={e => setTransferAnnouncement(e.target.value)} className="mt-1.5" rows={2} disabled={!isEditing("escalation")} />
              </div>
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-foreground">Escalation Triggers</p>
                {escalationList.map((rule) => (
                  <div key={rule.key} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{rule.label}</p>
                      <p className="text-xs text-muted-foreground">{rule.desc}</p>
                    </div>
                    <Switch
                      checked={escalationRules[rule.key as keyof typeof escalationRules]}
                      onCheckedChange={(v) => setEscalationRules(prev => ({ ...prev, [rule.key]: v }))}
                      disabled={!isEditing("escalation")}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Allow transfer during business hours only</p>
                  <p className="text-xs text-muted-foreground">After hours, offer callback instead of transferring</p>
                </div>
                <Switch checked={businessHoursOnlyTransfer} onCheckedChange={setBusinessHoursOnlyTransfer} disabled={!isEditing("escalation")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Call Outcomes */}
        <TabsContent value="outcomes" className="space-y-6">
          <TabEditControls editing={isEditing("outcomes")} onEdit={() => setTabEditing("outcomes", true)} onSave={() => handleTabSave("outcomes")} />
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Call Outcome Behavior</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Configure what happens after each type of call outcome.</p>
              {outcomeList.map((outcome) => (
                <div key={outcome.key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{outcome.label}</p>
                    <p className="text-xs text-muted-foreground">{outcome.desc}</p>
                  </div>
                  <Switch
                    checked={outcomeBehaviors[outcome.key as keyof typeof outcomeBehaviors]}
                    onCheckedChange={(v) => setOutcomeBehaviors(prev => ({ ...prev, [outcome.key]: v }))}
                    disabled={!isEditing("outcomes")}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-base">Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notification Email</Label>
                <Input value={notificationEmail} onChange={e => setNotificationEmail(e.target.value)} className="mt-1.5" disabled={!isEditing("outcomes")} />
                <p className="mt-1 text-xs text-muted-foreground">Where to send call summaries and action notifications.</p>
              </div>
              <div>
                <Label>Webhook URL (optional)</Label>
                <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-crm.com/webhooks/callio" className="mt-1.5" disabled={!isEditing("outcomes")} />
                <p className="mt-1 text-xs text-muted-foreground">Receive call outcome data via webhook for CRM or automation integration.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
