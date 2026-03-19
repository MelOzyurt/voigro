import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload, Trash2, Image, Eye, EyeOff, Loader2, CheckCircle, Brain } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const LLM_MODELS: Record<string, Array<{ value: string; label: string }>> = {
  lovable: [
    { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash" },
    { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
    { value: "openai/gpt-5", label: "GPT-5" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
  ],
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  ],
};

const LLM_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "tr", label: "Türkçe" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "ar", label: "العربية" },
];

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [provider, setProvider] = useState("telnyx");
  const [platformLogo, setPlatformLogo] = useState<string | null>(null);

  // Voice provider state
  const [apiKey, setApiKey] = useState("");
  
  const [connectionId, setConnectionId] = useState("");
  const [numberType, setNumberType] = useState("national");
  const [countryCode, setCountryCode] = useState("GB");
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookBaseUrl, setWebhookBaseUrl] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);
  

  // LLM state
  const [llmProvider, setLlmProvider] = useState("lovable");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [llmModel, setLlmModel] = useState("google/gemini-2.5-flash");
  const [llmLanguage, setLlmLanguage] = useState("en");
  const [showLlmApiKey, setShowLlmApiKey] = useState(false);
  const [testingLlm, setTestingLlm] = useState(false);
  

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
      
      
      setConnectionId((s.provider_connection_id as string) ?? "");
      setNumberType((s.provider_number_type as string) ?? "national");
      setCountryCode((s.provider_country_code as string) ?? "GB");
      setWebhookBaseUrl((s.webhook_base_url as string) ?? "");
      setLlmProvider((s.llm_provider as string) ?? "lovable");
      setLlmApiKey((s.llm_api_key as string) ?? "");
      setLlmModel((s.llm_model as string) ?? "google/gemini-2.5-flash");
      setLlmLanguage((s.llm_language as string) ?? "en");
    }
  }, [settings]);

  // When LLM provider changes, set a sensible default model
  const handleLlmProviderChange = (val: string) => {
    setLlmProvider(val);
    const models = LLM_MODELS[val];
    if (models?.length) {
      setLlmModel(models[0].value);
    }
  };

  const saveVoiceMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        default_voice_provider: provider,
        provider_api_key: apiKey || null,
        
        provider_connection_id: connectionId || null,
        provider_number_type: numberType,
        provider_country_code: countryCode,
        webhook_base_url: webhookBaseUrl || null,
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
      toast.success("Voice provider settings saved.");
      
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveLlmMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        llm_provider: llmProvider,
        llm_api_key: llmApiKey || null,
        llm_model: llmModel,
        llm_language: llmLanguage,
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
      toast.success("LLM settings saved.");
      
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

  const handleTestLlm = async () => {
    setTestingLlm(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-llm-connection");
      if (error) throw error;
      if (data?.success) {
        toast.success(`LLM connected: ${data.provider} — ${data.model}`);
      } else {
        toast.error(data?.error || "LLM connection test failed.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "LLM test failed.";
      toast.error(message);
    } finally {
      setTestingLlm(false);
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

  const currentLlmModels = LLM_MODELS[llmProvider] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Configure global platform behavior.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Voice Provider */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base">Voice Provider</CardTitle>
            {!voiceEditing && settings && (
              <Button variant="outline" size="sm" onClick={() => setVoiceEditing(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
          <fieldset disabled={!voiceEditing && !!settings} className="space-y-6">
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
                <Label>Webhook Base URL</Label>
                <Input
                  placeholder="https://your-project.supabase.co/functions/v1"
                  value={webhookBaseUrl}
                  onChange={e => setWebhookBaseUrl(e.target.value)}
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Base URL for call webhooks. The handler path will be appended automatically.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3">
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
                <Button
                  size="sm"
                  onClick={() => saveVoiceMutation.mutate()}
                  disabled={saveVoiceMutation.isPending}
                >
                  {saveVoiceMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Voice Settings</>
                  )}
                </Button>
              </div>
            </div>
          </fieldset>
          </CardContent>
        </Card>

        {/* LLM Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Brain className="h-4 w-4" /> AI / LLM Configuration
            </CardTitle>
            {!llmEditing && settings && (
              <Button variant="outline" size="sm" onClick={() => setLlmEditing(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
          <fieldset disabled={!llmEditing && !!settings} className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Configure the AI model used by the phone assistant to generate responses during calls.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>LLM Provider</Label>
                <Select value={llmProvider} onValueChange={handleLlmProviderChange}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lovable">Lovable AI (Built-in)</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {llmProvider === "lovable"
                    ? "Uses the built-in AI gateway — no API key needed."
                    : "Requires a valid API key from the selected provider."}
                </p>
              </div>

              <div>
                <Label>Model</Label>
                <Select value={llmModel} onValueChange={setLlmModel}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentLlmModels.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {llmProvider !== "lovable" && (
                <div>
                  <Label>API Key</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showLlmApiKey ? "text" : "password"}
                      placeholder="Enter LLM API key"
                      value={llmApiKey}
                      onChange={e => setLlmApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowLlmApiKey(!showLlmApiKey)}
                    >
                      {showLlmApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label>Response Language</Label>
                <Select value={llmLanguage} onValueChange={setLlmLanguage}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LLM_LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestLlm}
                disabled={testingLlm || (llmProvider !== "lovable" && !llmApiKey)}
              >
                {testingLlm ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing…</>
                ) : (
                  <><CheckCircle className="mr-2 h-4 w-4" /> Test LLM Connection</>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => saveLlmMutation.mutate()}
                disabled={saveLlmMutation.isPending}
              >
                {saveLlmMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save LLM Settings</>
                )}
              </Button>
            </div>
          </fieldset>
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
