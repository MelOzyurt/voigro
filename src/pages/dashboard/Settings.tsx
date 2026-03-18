import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your business profile and preferences.</p>
        </div>
        <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="phone">Phone Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Business Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Business Name</Label>
                  <Input defaultValue="Maria's Salon" className="mt-1.5" />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input defaultValue="Salon / Spa" className="mt-1.5" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input defaultValue="San Francisco, CA" className="mt-1.5" />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input defaultValue="https://mariassalon.com" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Opening Hours</Label>
                <Input defaultValue="Mon-Fri 9am-7pm, Sat 9am-5pm" className="mt-1.5" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phone" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Phone Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Phone Number</Label>
                <Input defaultValue="+1 (555) 000-0000" className="mt-1.5" />
              </div>
              <div>
                <Label>Forwarding Number</Label>
                <Input defaultValue="+1 (555) 111-2222" className="mt-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">Your Voxia number that receives forwarded calls</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">After-hours handling</p>
                  <p className="text-xs text-muted-foreground">AI agent answers calls outside business hours</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Missed call alerts", desc: "Get notified when a call is missed", enabled: true },
                { label: "New booking notifications", desc: "Alert when a new booking is made", enabled: true },
                { label: "Callback reminders", desc: "Reminder for pending callbacks", enabled: true },
                { label: "Weekly summary email", desc: "Weekly report of AI agent performance", enabled: false },
                { label: "Lead capture alerts", desc: "Instant notification for new leads", enabled: true },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-base">Team Members</CardTitle>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Invite Member</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "John Doe", email: "john@mariassalon.com", role: "Owner" },
                { name: "Jane Smith", email: "jane@mariassalon.com", role: "Manager" },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {m.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{m.role}</span>
                    {m.role !== "Owner" && <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
