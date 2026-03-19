import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload, Trash2, Image, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
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

  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [numberType, setNumberType] = useState("national");
  const [countryCode, setCountryCode] = useState("GB");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [webhookBaseUrl, setWebhookBaseUrl] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);

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
      const s = settings as Record<string, unknown>;
      setApiKey((s.provider_api_key as string) ?? "");
      setApiSecret((s.provider_api_secret as string) ?? "");
      setBundleId((s.provider_bundle_id as string) ?? "");
      setConnectionId((s.provider_connection_id as string) ?? "");
      setNumberType((s.provider_number_type as string) ?? "national");
      setCountryCode((s.provider_country_code as string) ?? "GB");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        default_voice_provider: provider,
        provider_api_key: apiKey || null,
        provider_api_secret: apiSecret || null,
        provider_bundle_id: bundleId || null,
        provider_connection_id: connectionId || null,
        provider_number_type: numberType,
        provider_country_code: countryCode,
      } as Record<string, unknown>;

      if (settings?.id) {
        const { error } = await supabase
          .from("platform_settings")
          .update(payload as never)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("platform_settings")
          .insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success("Platform settings saved.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-provider-connection");
      if (error) throw error;
      if (data?.success) {
        toast.success("Connection verified successfully.");
      } else {
        toast.error(data?.error || "Connection test failed.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection test failed.";
      toast.error(message);
    } finally {
      setTestingConnection(false);
    }
  };

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      toast.error(message);
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Voice Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Select the default telephony provider for new organizations.
              </p>
              <div className="mt-3">
                <Label>Default Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="mt-1.5 max-w-xs">
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
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Provider Credentials</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>API Key</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter API key"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>API Secret</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showApiSecret ? "text" : "password"}
                      placeholder="Enter API secret"
                      value={apiSecret}
                      onChange={e => setApiSecret(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                    >
                      {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Regulatory Bundle ID</Label>
                  <Input
                    placeholder="Enter bundle ID"
                    value={bundleId}
                    onChange={e => setBundleId(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Connection ID</Label>
                  <Input
                    placeholder="Enter connection ID"
                    value={connectionId}
                    onChange={e => setConnectionId(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Number Type</Label>
                  <Select value={numberType} onValueChange={setNumberType}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="toll-free">Toll-free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Country Code</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GB">GB (+44)</SelectItem>
                      <SelectItem value="US">US (+1)</SelectItem>
                      <SelectItem value="CA">CA (+1)</SelectItem>
                      <SelectItem value="AU">AU (+61)</SelectItem>
                      <SelectItem value="DE">DE (+49)</SelectItem>
                      <SelectItem value="FR">FR (+33)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testingConnection || !apiKey}
                >
                  {testingConnection ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing…</>
                  ) : (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Test Connection</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Logo */}
        <Card className="lg:col-span-2">
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
