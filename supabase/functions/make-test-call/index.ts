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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { organization_id } = await req.json();
    if (!organization_id) {
      return new Response(JSON.stringify({ error: "organization_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user belongs to this org
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profile?.organization_id !== organization_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get phone setup
    const { data: phoneSetup } = await supabase
      .from("phone_setups")
      .select("virtual_number, provider_config")
      .eq("organization_id", organization_id)
      .limit(1)
      .maybeSingle();

    if (!phoneSetup?.virtual_number) {
      return new Response(
        JSON.stringify({ error: "No virtual number provisioned" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get platform settings for provider API key and connection
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("provider_api_key, provider_connection_id")
      .limit(1)
      .single();

    const apiKey = settings?.provider_api_key;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Telephony provider not configured. Contact admin." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const connectionId = (phoneSetup.provider_config as Record<string, unknown>)?.connection_id || 
                          settings?.provider_connection_id;

    // Initiate outbound call via Telnyx: call FROM virtual number TO virtual number (test)
    const callBody: Record<string, unknown> = {
      connection_id: connectionId,
      to: phoneSetup.virtual_number,
      from: phoneSetup.virtual_number,
      webhook_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/handle-call?org=${organization_id}`,
    };

    const res = await fetch("https://api.telnyx.com/v2/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callBody),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Telnyx call initiation failed:", res.status, text);
      return new Response(
        JSON.stringify({ error: "Failed to initiate test call. Check telephony configuration." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callData = await res.json();

    // Update last_test_call_at
    await supabase
      .from("phone_setups")
      .update({ last_test_call_at: new Date().toISOString() })
      .eq("organization_id", organization_id);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: "Test call initiated. Your phone will ring shortly.",
        call_control_id: callData?.data?.call_control_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("make-test-call error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
