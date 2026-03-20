import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, Trash2, Upload, Image, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization, useOrgId } from "@/hooks/use-organization";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAiAgent } from "@/hooks/use-ai-agent";
import BusinessHours, { type BusinessHoursData } from "@/components/BusinessHours";

export default function SettingsPage() {
  const { data: org, isLoading: orgLoading } = useOrganization();
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    opening_hours: "",
    primary_business_number: "",
    timezone: "",
  });

  // Sync form when org data loads
  useEffect(() => {
    if (org) {
      setForm({
        name: org.name ?? "",
        industry: org.industry ?? "",
        location: org.location ?? "",
        website: org.website ?? "",
        opening_hours: org.opening_hours ?? "",
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
      const { error } = await supabase
        .from("organizations")
        .update({
          name: form.name,
          industry: form.industry || null,
          location: form.location || null,
          website: form.website || null,
          opening_hours: form.opening_hours || null,
          primary_business_number: form.primary_business_number || null,
          timezone: form.timezone || "UTC",
        })
        .eq("id", orgId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast.success("Settings saved.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
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
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo.");
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
    } catch (err: any) {
      toast.error(err.message || "Failed to remove logo.");
    } finally {
      setUploading(false);
    }
  };

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
                  <Label>Business Phone</Label>
                  <Input value={form.primary_business_number} onChange={e => updateField("primary_business_number", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input value={form.timezone} onChange={e => updateField("timezone", e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Opening Hours</Label>
                <Input value={form.opening_hours} onChange={e => updateField("opening_hours", e.target.value)} className="mt-1.5" />
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
