import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2, Rocket } from "lucide-react";
import voigroLogo from "@/assets/voigro-logo.png";
import { useOrgId } from "@/hooks/use-organization";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ModuleSelection from "@/components/onboarding/ModuleSelection";
import type { ModuleKey } from "@/hooks/use-modules";

const industries = ["Restaurant", "Auto Shop / Garage", "Medical Clinic", "Salon / Spa", "Retail Store", "Professional Services", "Real Estate", "Other"];

type StepId = "business" | "modules" | "launch";

const STEPS: { id: StepId; title: string }[] = [
  { id: "business", title: "Business Profile" },
  { id: "modules", title: "Choose Modules" },
  { id: "launch", title: "You're All Set!" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orgId = useOrgId();
  const [stepIndex, setStepIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [data, setData] = useState({
    businessName: "",
    industry: "",
    location: "",
    website: "",
    selectedModules: [] as ModuleKey[],
  });

  const currentStep = STEPS[stepIndex];
  const update = (key: string, value: unknown) => setData((prev) => ({ ...prev, [key]: value }));

  const toggleModule = (key: ModuleKey) => {
    const modules = data.selectedModules.includes(key)
      ? data.selectedModules.filter((m) => m !== key)
      : [...data.selectedModules, key];
    update("selectedModules", modules);
  };

  const createOrganization = async () => {
    if (orgId) return true;
    setCreating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("create-organization", {
        body: {
          name: data.businessName || "My Business",
          industry: data.industry || null,
          location: data.location || null,
          website: data.website || null,
          modules: data.selectedModules,
        },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await queryClient.invalidateQueries({ queryKey: ["organization-modules"] });
      return true;
    } catch (err: any) {
      console.error("Failed to create organization:", err);
      toast.error(err?.message || "Failed to create your business profile. Please try again.");
      return false;
    } finally {
      setCreating(false);
    }
  };

  const next = async () => {
    // After modules step, create org then show launch
    if (currentStep.id === "modules") {
      const ok = await createOrganization();
      if (!ok) return;
      await new Promise((r) => setTimeout(r, 500));
    }

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const back = () => stepIndex > 0 && setStepIndex(stepIndex - 1);

  const goToDashboard = () => navigate("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <img src={voigroLogo} alt="Voigro" className="h-8 w-8" />
            <span className="font-display text-xl font-bold text-foreground">Voigro</span>
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
            {currentStep.id === "launch" ? "You're all set!" : "Set up your business"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {stepIndex + 1} of {STEPS.length} — {currentStep.title}
          </p>
          <div className="mt-6 flex items-center justify-center gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 max-w-8 rounded-full transition-colors ${i <= stepIndex ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          {/* Step 1: Business Profile */}
          {currentStep.id === "business" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tell us about your business. You can update all details later from Settings.
              </p>
              <div>
                <Label>Business Name *</Label>
                <Input
                  placeholder="Maria's Salon"
                  value={data.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Select value={data.industry} onValueChange={(v) => update("industry", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="City, Country"
                  value={data.location}
                  onChange={(e) => update("location", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input
                  placeholder="https://yourbusiness.com"
                  value={data.website}
                  onChange={(e) => update("website", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* Step 2: Module Selection */}
          {currentStep.id === "modules" && (
            <ModuleSelection selected={data.selectedModules} onToggle={toggleModule} />
          )}

          {/* Step 3: Launch */}
          {currentStep.id === "launch" && (
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your business is ready!</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Head to your dashboard to configure your AI agent, set up phone lines, manage bookings, and more.
                </p>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-4 text-left">
                <p className="text-xs font-medium text-foreground mb-2">Next steps from your dashboard:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {data.selectedModules.includes("voice_agent") && (
                    <>
                      <li>• Configure your AI agent's personality & greeting</li>
                      <li>• Set up your phone line</li>
                      <li>• Add services, products & FAQs</li>
                    </>
                  )}
                  {data.selectedModules.includes("booking") && (
                    <li>• Set up availability rules & booking preferences</li>
                  )}
                  <li>• Customize your business profile in Settings</li>
                </ul>
              </div>
              <Button className="w-full" size="lg" onClick={goToDashboard}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation (hidden on launch step) */}
          {currentStep.id !== "launch" && (
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={back} disabled={stepIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={next} disabled={creating || (currentStep.id === "business" && !data.businessName.trim())}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
