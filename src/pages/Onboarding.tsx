import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Phone, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const industries = ["Restaurant", "Auto Shop / Garage", "Medical Clinic", "Salon / Spa", "Retail Store", "Professional Services", "Real Estate", "Other"];
const actions = [
  { id: "booking", label: "Appointment Booking" },
  { id: "callback", label: "Callback Requests" },
  { id: "lead", label: "Lead Capture" },
  { id: "order", label: "Order Intake" },
];

const stepTitles = ["Business Info", "Details", "Agent Actions", "Plan"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    businessName: "", industry: "", location: "", phone: "", website: "",
    hours: "", services: "", selectedActions: [] as string[], plan: "professional",
  });

  const update = (key: string, value: any) => setData(prev => ({ ...prev, [key]: value }));
  const toggleAction = (id: string) => {
    const actions = data.selectedActions.includes(id)
      ? data.selectedActions.filter(a => a !== id)
      : [...data.selectedActions, id];
    update("selectedActions", actions);
  };

  const next = () => step < 3 ? setStep(step + 1) : navigate("/dashboard");
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Voxia</span>
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Set up your AI agent</h1>
          {/* Progress */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {stepTitles.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">{t}</span>
                {i < 3 && <div className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          {step === 0 && (
            <div className="space-y-4">
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
                <Input placeholder="City, State" value={data.location} onChange={e => update("location", e.target.value)} className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Business Phone Number</Label>
                <Input placeholder="+1 (555) 000-0000" value={data.phone} onChange={e => update("phone", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input placeholder="https://yourbusiness.com" value={data.website} onChange={e => update("website", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Opening Hours</Label>
                <Input placeholder="Mon-Fri 9am-6pm" value={data.hours} onChange={e => update("hours", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Services / Products</Label>
                <Input placeholder="Haircuts, Coloring, Styling..." value={data.services} onChange={e => update("services", e.target.value)} className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">What should your AI agent be able to do?</p>
              {actions.map(action => (
                <label key={action.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-secondary/50">
                  <Checkbox checked={data.selectedActions.includes(action.id)} onCheckedChange={() => toggleAction(action.id)} />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose your plan to get started.</p>
              {[
                { id: "starter", name: "Starter", price: "$49/mo", desc: "100 calls/month" },
                { id: "professional", name: "Professional", price: "$149/mo", desc: "500 calls/month" },
                { id: "enterprise", name: "Enterprise", price: "Custom", desc: "Unlimited calls" },
              ].map(plan => (
                <label key={plan.id} className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${data.plan === plan.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-secondary/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full border-2 ${data.plan === plan.id ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {data.plan === plan.id && <div className="m-0.5 h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{plan.desc}</span>
                    </div>
                  </div>
                  <span className="font-display text-sm font-bold text-foreground">{plan.price}</span>
                </label>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={next}>{step === 3 ? "Launch Dashboard" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
