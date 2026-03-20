import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Phone,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  PhoneCall,
  Loader2,
} from "lucide-react";
import { usePhoneSetup } from "@/hooks/use-phone-setup";
import { useOrganization, useOrgId } from "@/hooks/use-organization";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

function deriveCountry(number: string | null): string {
  if (!number) return "Unknown";
  if (number.startsWith("+44")) return "United Kingdom";
  if (number.startsWith("+1")) return "United States";
  if (number.startsWith("+61")) return "Australia";
  if (number.startsWith("+49")) return "Germany";
  if (number.startsWith("+33")) return "France";
  return "International";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    provisioned: "Active",
    verified: "Verified",
    failed: "Failed",
  };
  return map[status] || status;
}

export default function PhoneSetup() {
  const {
    phoneSetup,
    isLoading,
    provisionNumber,
    isProvisioning,
    updateSetup,
    isUpdating,
  } = usePhoneSetup();
  const { data: org } = useOrganization();
  const orgId = useOrgId();
  const [isTestingCall, setIsTestingCall] = useState(false);

  const handleTestCall = async () => {
    if (!orgId) return;
    setIsTestingCall(true);
    try {
      const { data, error } = await supabase.functions.invoke("make-test-call", {
        body: { organization_id: orgId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(data?.message || "Test call initiated!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate test call";
      toast.error(message);
    } finally {
      setIsTestingCall(false);
    }
  };

  const virtualNumber = phoneSetup?.virtual_number;
  const isProvisioned = !!virtualNumber;
  const verificationStatus = phoneSetup?.verification_status || "pending";

  const handleCopy = () => {
    if (virtualNumber) {
      navigator.clipboard.writeText(virtualNumber);
      toast.success("Number copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Phone Setup</h1>
        <p className="text-sm text-muted-foreground">
          Connect your business phone number and configure call routing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Connection Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProvisioned ? (
                <div className="flex items-center justify-between rounded-lg border bg-success/5 border-success/20 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Phone line connected</p>
                      <p className="text-xs text-muted-foreground">
                        Calls are being forwarded to your AI agent
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success text-[10px]">Active</Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">No phone line assigned yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Request your AI phone line to start receiving calls.
                    </p>
                  </div>
                  <Button onClick={() => provisionNumber()} disabled={isProvisioning}>
                    {isProvisioning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up your phone line…
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Request your AI phone line
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isProvisioned && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Your Business Number</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {org?.primary_business_number || "Not set"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      This is the number your customers call
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Virtual Number</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{virtualNumber}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Forward your business number to this virtual number
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Routing - only show when provisioned */}
          {isProvisioned && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Call Routing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">AI answers all incoming calls</p>
                    <p className="text-xs text-muted-foreground">
                      Your AI agent picks up every call first
                    </p>
                  </div>
                  <Switch
                    checked={phoneSetup?.routing_enabled ?? false}
                    onCheckedChange={(checked) =>
                      updateSetup({ routing_enabled: checked })
                    }
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">After-hours AI handling</p>
                    <p className="text-xs text-muted-foreground">
                      AI answers calls outside your business hours
                    </p>
                  </div>
                  <Switch
                    checked={phoneSetup?.after_hours_enabled ?? false}
                    onCheckedChange={(checked) =>
                      updateSetup({ after_hours_enabled: checked })
                    }
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Ring staff first, then AI</p>
                    <p className="text-xs text-muted-foreground">
                      Try reaching a human before AI picks up (adds delay)
                    </p>
                  </div>
                  <Switch
                    checked={phoneSetup?.ring_staff_first ?? false}
                    onCheckedChange={(checked) =>
                      updateSetup({ ring_staff_first: checked })
                    }
                    disabled={isUpdating}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Setup Instructions */}
          {isProvisioned && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">How to Forward Your Number</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Set up call forwarding from your phone provider to route calls through the
                  platform.
                </p>
                <div className="space-y-2">
                  {[
                    "Log in to your phone provider's dashboard (e.g., BT, Sky, Vodafone, Three)",
                    "Find the Call Forwarding or Routing settings",
                    `Set the forwarding destination to your virtual number: ${virtualNumber}`,
                    'Choose "Forward all calls" or "Forward when busy/unanswered"',
                    "Save changes and make a test call to verify",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 rounded-lg bg-secondary/50 p-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Detailed Guide
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Test Call */}
          {isProvisioned && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Test Your Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Make a test call to hear how your AI agent handles a real conversation.
                </p>
                <Button className="w-full" onClick={handleTestCall} disabled={isTestingCall}>
                  {isTestingCall ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calling…
                    </>
                  ) : (
                    <>
                      <PhoneCall className="mr-2 h-4 w-4" /> Make Test Call
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  We'll call your business number and simulate a customer conversation.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Phone Number Details */}
          {isProvisioned && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Number Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Country", value: deriveCountry(virtualNumber) },
                  {
                    label: "Type",
                    value:
                      virtualNumber?.startsWith("+44800") || virtualNumber?.startsWith("+1800")
                        ? "Toll-free"
                        : "National",
                  },
                  { label: "Provider", value: "Platform-managed" },
                  { label: "Status", value: statusLabel(verificationStatus) },
                  {
                    label: "Provisioned",
                    value: phoneSetup?.provisioned_at
                      ? format(new Date(phoneSetup.provisioned_at), "MMM d, yyyy")
                      : "—",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Verification */}
          {isProvisioned && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {verificationStatus !== "pending" ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">Number provisioned</span>
                </div>
                <div className="flex items-center gap-2">
                  {phoneSetup?.forwarding_confirmed ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">Forwarding confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  {phoneSetup?.last_test_call_at ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">Test call completed</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
