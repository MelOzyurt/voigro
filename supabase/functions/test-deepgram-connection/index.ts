import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch deepgram_api_key from platform_settings
    const { data: settings, error: dbError } = await supabase
      .from("platform_settings")
      .select("deepgram_api_key")
      .limit(1)
      .maybeSingle();

    if (dbError) throw new Error(dbError.message);

    const deepgramKey = settings?.deepgram_api_key;
    if (!deepgramKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Deepgram API key not configured." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test the key by listing projects
    const res = await fetch("https://api.deepgram.com/v1/projects", {
      headers: { Authorization: `Token ${deepgramKey}` },
    });

    if (res.ok) {
      const data = await res.json();
      const projectCount = data?.projects?.length ?? 0;
      return new Response(
        JSON.stringify({ success: true, message: `Connected. ${projectCount} project(s) found.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const body = await res.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          success: false,
          error: (body as Record<string, string>)?.err_msg || `Deepgram returned HTTP ${res.status}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
