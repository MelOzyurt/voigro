import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Trash2, Upload, Image, Loader2, Phone, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization, useOrgId } from "@/hooks/use-organization";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePhoneSetup } from "@/hooks/use-phone-setup";

export default function SettingsPage() {
  const { data: org, isLoading: orgLoading } = useOrganization();
  const { phoneSetup } = usePhoneSetup();
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  

  const [form, setForm] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    primary_business_number: "",
    timezone: "",
  });

  const hasRequestedNumber = !!(org as Record<string, unknown>)?.requested_business_number;

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name ?? "",
        industry: org.industry ?? "",
        location: org.location ?? "",
        website: org.website ?? "",
        primary_business_number: org.primary_business_number ?? "",
        timezone: org.timezone ?? "UTC",
      });
    }
  }, [org]);

  const currentLogo = logoPreview ?? org?.logo_url ?? null;

  const updateField = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      const orgUpdate: Record<string, unknown> = {
        name: form.name,
        industry: form.industry || null,
        location: form.location || null,
        website: form.website || null,
        primary_business_number: form.primary_business_number || null,
        timezone: form.timezone || "UTC",
      };

      // Set requested_business_number on first save (immutable after)
      if (!hasRequestedNumber && form.primary_business_number) {
        orgUpdate.requested_business_number = form.primary_business_number;
      }

      const { error } = await supabase
        .from("organizations")
        .update(orgUpdate as never)
        .eq("id", orgId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast.success("Settings saved.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("File size must be under 2MB."); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${orgId}/logo.${ext}`;
      const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      const logoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("organizations")
        .update({ logo_url: logoUrl })
        .eq("id", orgId);
      if (updateError) throw updateError;

      setLogoPreview(logoUrl);
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast.success("Logo uploaded.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload logo.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!orgId) return;
    setUploading(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ logo_url: null })
        .eq("id", orgId);
      if (error) throw error;
      setLogoPreview(null);
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast.success("Logo removed.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove logo.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const pairingStatus = (phoneSetup as Record<string, unknown>)?.pairing_status as string | undefined;

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your business profile and preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Business Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Business Name</Label>
                  <Input value={form.name} onChange={e => updateField("name", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input value={form.industry} onChange={e => updateField("industry", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={form.location} onChange={e => updateField("location", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={form.website} onChange={e => updateField("website", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input value={form.timezone} onChange={e => updateField("timezone", e.target.value)} className="mt-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone Number & AI Status */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Your Business Phone Number
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                {hasRequestedNumber ? (
                  <div>
                    <Input
                      value={form.primary_business_number}
                      readOnly
                      className="mt-1.5 bg-muted/50"
                    />
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Info className="h-3 w-3" />
                      Contact support to change your business number.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Input
                      value={form.primary_business_number}
                      onChange={e => updateField("primary_business_number", e.target.value)}
                      placeholder="+44 XXXX XXXXXX"
                      className="mt-1.5"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      The number your customers currently call. We will set up AI answering on this number.
                    </p>
                  </div>
                )}
              </div>

              {/* Pairing status card */}
              <div className="rounded-lg border p-4">
                {pairingStatus === "paired" ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 hover:bg-emerald-500/15">AI Active</Badge>
                    </div>
                    <p className="text-sm text-foreground">Your AI assistant is answering calls on this number.</p>
                    <p className="text-xs text-muted-foreground">Virtual line: platform-managed</p>
                  </div>
                ) : pairingStatus === "suspended" ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Suspended</Badge>
                    </div>
                    <p className="text-sm text-foreground">AI answering is currently paused. Contact support.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 hover:bg-amber-500/15">Awaiting setup</Badge>
                    </div>
                    <p className="text-sm text-foreground">Our team will activate AI answering on your number shortly.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Logo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Upload your business logo. Recommended: 512×512px, max 2MB.</p>
              <div className="flex items-start gap-6">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 overflow-hidden">
                  {currentLogo ? (
                    <img src={currentLogo} alt="Business logo" className="h-full w-full object-contain" />
                  ) : (
                    <Image className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="space-y-3">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <Button variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload Logo"}
                  </Button>
                  {currentLogo && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={uploading} onClick={handleRemoveLogo}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">PNG, JPG, or SVG accepted.</p>
                </div>
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
      </Tabs>
    </div>
  );
}
