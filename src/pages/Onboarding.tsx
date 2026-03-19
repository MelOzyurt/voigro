import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Phone, ArrowRight, ArrowLeft, CheckCircle, Copy, Loader2 } from "lucide-react";
import { usePhoneSetup } from "@/hooks/use-phone-setup";
import { useOrgId } from "@/hooks/use-organization";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const industries = ["Restaurant", "Auto Shop / Garage", "Medical Clinic", "Salon / Spa", "Retail Store", "Professional Services", "Real Estate", "Other"];
const agentActions = [
  { id: "booking", label: "Appointment Booking", desc: "Let callers book appointments" },
  { id: "callback", label: "Callback Requests", desc: "Collect details and schedule callbacks" },
  { id: "lead", label: "Lead Capture", desc: "Gather contact info from potential customers" },
  { id: "order", label: "Order Intake", desc: "Accept simple orders over the phone" },
  { id: "faq", label: "FAQ Answering", desc: "Answer common questions automatically" },
  { id: "message", label: "Message Taking", desc: "Take messages when you're unavailable" },
];

const stepTitles = ["Business Profile", "Services & Hours", "Agent Setup", "Phone & Actions", "Phone Line", "Choose Plan", "Review"];

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orgId = useOrgId();
  const [step, setStep] = useState(0);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [data, setData] = useState({
    businessName: "", industry: "", location: "", phone: "", website: "",
    hours: "", services: "", description: "",
    agentName: "", greeting: "", tone: "friendly",
    selectedActions: ["booking", "callback", "faq"] as string[],
    plan: "professional",
  });

  const { phoneSetup, provisionNumber, isProvisioning, updateSetup } = usePhoneSetup();
  const [provisionTriggered, setProvisionTriggered] = useState(false);

  const update = (key: string, value: unknown) => setData(prev => ({ ...prev, [key]: value }));
  const toggleAction = (id: string) => {
    const actions = data.selectedActions.includes(id)
      ? data.selectedActions.filter(a => a !== id)
      : [...data.selectedActions, id];
    update("selectedActions", actions);
  };

  // Create organization before phone provisioning step if not exists
  const ensureOrganization = async () => {
    if (orgId) return true;
    setCreatingOrg(true);
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: data.businessName || "My Business",
          industry: data.industry || null,
          location: data.location || null,
          primary_business_number: data.phone || null,
          website: data.website || null,
          opening_hours: data.hours || null,
        })
        .select("id")
        .single();
      if (orgError) throw orgError;

      // Link profile to org
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ organization_id: org.id })
          .eq("id", user.id);
        if (profileError) throw profileError;
      }

      // Invalidate queries so orgId refreshes
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      return true;
    } catch (err) {
      console.error("Failed to create organization:", err);
      toast.error("Failed to create your business profile. Please try again.");
      return false;
    } finally {
      setCreatingOrg(false);
    }
  };

  // Auto-trigger provisioning when reaching the phone line step (only when orgId is available)
  useEffect(() => {
    if (step === 4 && orgId && !phoneSetup?.virtual_number && !provisionTriggered && !isProvisioning) {
      setProvisionTriggered(true);
      provisionNumber();
    }
  }, [step, orgId, phoneSetup?.virtual_number, provisionTriggered, isProvisioning, provisionNumber]);

  const handleCopyNumber = () => {
    if (phoneSetup?.virtual_number) {
      navigator.clipboard.writeText(phoneSetup.virtual_number);
      toast.success("Number copied to clipboard");
    }
  };

  const handleConfirmForwarding = () => {
    updateSetup({ forwarding_confirmed: true });
    toast.success("Forwarding confirmed!");
    next();
  };

  const next = async () => {
    // Create org before phone provisioning step
    if (step === 3) {
      const ok = await ensureOrganization();
      if (!ok) return;
      // Wait for query invalidation to propagate before moving to step 4
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    step < stepTitles.length - 1 ? setStep(step + 1) : navigate("/dashboard");
  };
  const back = () => step > 0 && setStep(step - 1);

  const canProceedPhoneLine = phoneSetup?.virtual_number && phoneSetup?.forwarding_confirmed;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Callio</span>
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Set up your AI agent</h1>
          <p className="mt-1 text-sm text-muted-foreground">Step {step + 1} of {stepTitles.length} — {stepTitles[step]}</p>
          <div className="mt-6 flex items-center justify-center gap-1">
            {stepTitles.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 max-w-8 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Tell us about your business so your AI agent can represent you accurately.</p>
              <div>
                <Label>Business Name</Label>
                <Input placeholder="Maria's Salon" value={data.businessName} onChange={e => update("businessName", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Industry</Label>
                <Select value={data.industry} onValueChange={v => update("industry", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>{industries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input placeholder="City, Country" value={data.location} onChange={e => update("location", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input placeholder="https://yourbusiness.com" value={data.website} onChange={e => update("website", e.target.value)} className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Add your services, products, and hours so the AI can answer customer questions.</p>
              <div>
                <Label>Opening Hours</Label>
                <Input placeholder="Mon-Fri 9am-6pm, Sat 10am-4pm" value={data.hours} onChange={e => update("hours", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Services / Products</Label>
                <Textarea placeholder="List your main services or products, one per line..." value={data.services} onChange={e => update("services", e.target.value)} className="mt-1.5" rows={4} />
                <p className="mt-1 text-xs text-muted-foreground">You can add more detail later from the dashboard.</p>
              </div>
              <div>
                <Label>Business Description</Label>
                <Textarea placeholder="Briefly describe what your business does..." value={data.description} onChange={e => update("description", e.target.value)} className="mt-1.5" rows={3} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Customize how your AI agent sounds and introduces itself.</p>
              <div>
                <Label>Agent Name</Label>
                <Input placeholder="e.g. Maria's Assistant" value={data.agentName} onChange={e => update("agentName", e.target.value)} className="mt-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">The name your agent uses to introduce itself.</p>
              </div>
              <div>
                <Label>Greeting Message</Label>
                <Textarea placeholder="Hi! Thanks for calling [business]. How can I help you today?" value={data.greeting} onChange={e => update("greeting", e.target.value)} className="mt-1.5" rows={3} />
              </div>
              <div>
                <Label>Tone of Voice</Label>
                <Select value={data.tone} onValueChange={v => update("tone", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Warm</SelectItem>
                    <SelectItem value="professional">Professional & Formal</SelectItem>
                    <SelectItem value="casual">Casual & Relaxed</SelectItem>
                    <SelectItem value="energetic">Energetic & Upbeat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose what your AI agent can do and enter your business phone number.</p>
              <div>
                <Label>Business Phone Number</Label>
                <Input placeholder="+44 20 7946 0958" value={data.phone} onChange={e => update("phone", e.target.value)} className="mt-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">You'll forward this number to your AI phone line after setup.</p>
              </div>
              <div className="pt-2">
                <Label>What should your agent handle?</Label>
                <div className="mt-2 space-y-2">
                  {agentActions.map(action => (
                    <label key={action.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50">
                      <Checkbox checked={data.selectedActions.includes(action.id)} onCheckedChange={() => toggleAction(action.id)} />
                      <div>
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                We're assigning a virtual phone number for your AI agent. You'll forward your business number to it.
              </p>

              {isProvisioning && !phoneSetup?.virtual_number ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-foreground">Setting up your phone line…</p>
                  <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
                </div>
              ) : phoneSetup?.virtual_number ? (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-success/5 border-success/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm font-semibold text-foreground">Your AI phone line is ready!</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-foreground">{phoneSetup.virtual_number}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyNumber}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Forward your business number to this virtual number:</p>
                    {[
                      "Log in to your phone provider's dashboard",
                      "Find Call Forwarding settings",
                      `Set forwarding destination to: ${phoneSetup.virtual_number}`,
                      "Save and make a test call to verify",
                    ].map((s, i) => (
                      <div key={i} className="flex gap-3 rounded-lg bg-secondary/50 p-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground">{s}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleConfirmForwarding}
                    disabled={phoneSetup.forwarding_confirmed}
                  >
                    {phoneSetup.forwarding_confirmed ? (
                      <><CheckCircle className="mr-2 h-4 w-4" /> Forwarding Confirmed</>
                    ) : (
                      "I've set up forwarding"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-sm text-muted-foreground">Could not assign a number automatically.</p>
                  <Button onClick={() => { setProvisionTriggered(false); provisionNumber(); }} disabled={isProvisioning}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose the plan that fits your business. You can change anytime.</p>
              {[
                { id: "starter", name: "Starter", price: "£39/mo", desc: "100 calls/month • 1 number • Basic agent", overage: "£0.30/call overage" },
                { id: "professional", name: "Professional", price: "£119/mo", desc: "500 calls/month • 3 numbers • Advanced agent", overage: "£0.20/call overage" },
                { id: "enterprise", name: "Enterprise", price: "Custom", desc: "Unlimited calls • Custom integrations • SLA", overage: "Contact sales" },
              ].map(plan => (
                <label key={plan.id} className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${data.plan === plan.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-secondary/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full border-2 ${data.plan === plan.id ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {data.plan === plan.id && <div className="m-0.5 h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                      <p className="text-xs text-muted-foreground">{plan.desc}</p>
                      <p className="text-[10px] text-muted-foreground">{plan.overage}</p>
                    </div>
                  </div>
                  <span className="font-display text-sm font-bold text-foreground">{plan.price}</span>
                </label>
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Review your setup before launching. You can adjust everything from the dashboard later.</p>
              <div className="space-y-2">
                {[
                  { label: "Business", value: data.businessName || "Not set" },
                  { label: "Industry", value: data.industry || "Not set" },
                  { label: "Location", value: data.location || "Not set" },
                  { label: "Phone", value: data.phone || "Not set" },
                  { label: "AI Phone Line", value: phoneSetup?.virtual_number || "Not assigned" },
                  { label: "Agent Name", value: data.agentName || "Not set" },
                  { label: "Tone", value: data.tone },
                  { label: "Actions", value: data.selectedActions.length > 0 ? `${data.selectedActions.length} enabled` : "None" },
                  { label: "Plan", value: data.plan.charAt(0).toUpperCase() + data.plan.slice(1) },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between rounded-lg bg-secondary/50 px-3 py-2">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border bg-primary/5 border-primary/20 p-3">
                <p className="text-xs text-foreground font-medium">After launching, you'll need to:</p>
                <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                  <li>• Verify call forwarding is working correctly</li>
                  <li>• Add detailed services, products, and FAQs</li>
                  <li>• Make a test call to verify everything works</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button
              onClick={next}
              disabled={(step === 4 && !phoneSetup?.virtual_number) || creatingOrg}
            >
              {creatingOrg ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
              ) : step === stepTitles.length - 1 ? (
                "Launch Dashboard"
              ) : (
                "Continue"
              )}
              {!creatingOrg && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
