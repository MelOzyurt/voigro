import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload, Trash2, Image } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [provider, setProvider] = useState("telnyx");
  const [platformLogo, setPlatformLogo] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setProvider(settings.default_voice_provider);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (settings?.id) {
        const { error } = await supabase
          .from("platform_settings")
          .update({ default_voice_provider: provider } as any)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("platform_settings")
          .insert({ default_voice_provider: provider } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success("Platform settings saved.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `platform/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(path);

      setPlatformLogo(`${urlData.publicUrl}?t=${Date.now()}`);
      toast.success("Platform logo uploaded.");
    } catch (err: any) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Configure global platform behavior.</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Voice Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Voice Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the default telephony provider for new organizations.
            </p>
            <div>
              <Label>Default Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telnyx">Telnyx</SelectItem>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="vonage">Vonage</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                This determines which provider adapter is used for new phone setups.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Platform Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a logo displayed across the platform. Recommended: 512×512px, max 2MB.
            </p>
            <div className="flex items-start gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 overflow-hidden">
                {platformLogo ? (
                  <img src={platformLogo} alt="Platform logo" className="h-full w-full object-contain" />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading…" : "Upload Logo"}
                </Button>
                {platformLogo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setPlatformLogo(null)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">PNG, JPG, or SVG accepted.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
