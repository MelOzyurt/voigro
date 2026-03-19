import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: settings } = await supabase
      .from("platform_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings) {
      return new Response(
        JSON.stringify({ success: false, error: "Platform settings not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const s = settings as Record<string, unknown>;
    const llmProvider = (s.llm_provider as string) || "lovable";
    const llmApiKey = (s.llm_api_key as string) || "";
    const llmModel = (s.llm_model as string) || "google/gemini-2.5-flash";

    // For Lovable AI, use built-in key
    if (llmProvider === "lovable") {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) {
        return new Response(
          JSON.stringify({ success: false, error: "Lovable AI key not configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: llmModel,
          messages: [{ role: "user", content: "Say hello in one word." }],
          max_tokens: 10,
        }),
      });
      if (res.ok) {
        return new Response(
          JSON.stringify({ success: true, provider: "Lovable AI", model: llmModel }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await res.text();
      return new Response(
        JSON.stringify({ success: false, error: `Lovable AI error: ${res.status}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!llmApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "LLM API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (llmProvider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${llmApiKey}` },
      });
      if (res.ok) {
        return new Response(
          JSON.stringify({ success: true, provider: "OpenAI", model: llmModel }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await res.text();
      return new Response(
        JSON.stringify({ success: false, error: "Invalid OpenAI API key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (llmProvider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": llmApiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: llmModel || "claude-sonnet-4-20250514",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });
      if (res.ok) {
        return new Response(
          JSON.stringify({ success: true, provider: "Anthropic", model: llmModel }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await res.text();
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Anthropic API key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (llmProvider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${llmApiKey}`
      );
      if (res.ok) {
        return new Response(
          JSON.stringify({ success: true, provider: "Google Gemini", model: llmModel }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await res.text();
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Gemini API key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Unknown LLM provider: ${llmProvider}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
