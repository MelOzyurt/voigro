import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Phone, PhoneForwarded, CheckCircle, AlertCircle, ExternalLink, Copy, PhoneCall } from "lucide-react";

export default function PhoneSetup() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Phone Setup</h1>
        <p className="text-sm text-muted-foreground">Connect your business phone number and configure call routing.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Connection Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-success/5 border-success/20 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Phone line connected</p>
                    <p className="text-xs text-muted-foreground">Calls are being forwarded to your AI agent</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success text-[10px]">Active</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Your Business Number</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">+1 (555) 000-0000</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">This is the number your customers call</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Virtual Number</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">+1 (888) 555-0199</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Forward your business number to this virtual number</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Routing */}
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Call Routing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">AI answers all incoming calls</p>
                  <p className="text-xs text-muted-foreground">Your AI agent picks up every call first</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">After-hours AI handling</p>
                  <p className="text-xs text-muted-foreground">AI answers calls outside your business hours</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Ring staff first, then AI</p>
                  <p className="text-xs text-muted-foreground">Try reaching a human before AI picks up (adds delay)</p>
                </div>
                <Switch />
              </div>
              <div>
                <Label>Escalation / Transfer Number</Label>
                <Input defaultValue="+1 (555) 000-0000" className="mt-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">Where to transfer calls when the AI escalates to a human.</p>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader><CardTitle className="font-display text-base">How to Forward Your Number</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Set up call forwarding from your business phone provider to route calls through Voxia.
              </p>
              <div className="space-y-2">
                {[
                  "Log in to your phone provider's dashboard (e.g., AT&T, Verizon, Google Voice)",
                  "Find the Call Forwarding or Routing settings",
                  "Set the forwarding destination to your Voxia number: +1 (888) 555-0199",
                  "Choose \"Forward all calls\" or \"Forward when busy/unanswered\"",
                  "Save changes and make a test call to verify",
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 rounded-lg bg-secondary/50 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                    <span className="text-sm text-foreground">{step}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> View Detailed Guide
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Test Call */}
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Test Your Agent</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Make a test call to hear how your AI agent handles a real conversation.</p>
              <Button className="w-full">
                <PhoneCall className="mr-2 h-4 w-4" /> Make Test Call
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">We'll call your business number and simulate a customer conversation.</p>
            </CardContent>
          </Card>

          {/* Phone Number Details */}
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Number Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Country", value: "United States" },
                { label: "Type", value: "Toll-free" },
                { label: "Provider", value: "Voxia" },
                { label: "Status", value: "Verified" },
                { label: "Provisioned", value: "Mar 10, 2026" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Verification */}
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Verification</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">Number verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">Forwarding confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">Test call completed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
