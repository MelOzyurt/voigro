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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check user doesn't already have an org
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();

    if (profile?.organization_id) {
      return new Response(JSON.stringify({ error: "User already has an organization", organization_id: profile.organization_id }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { name, industry, location, website, modules = [] } = body;

    if (!name?.trim()) {
      return new Response(JSON.stringify({ error: "Business name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create organization (service role bypasses RLS)
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: name.trim(),
        industry: industry || null,
        location: location || null,
        website: website || null,
      })
      .select("id")
      .single();

    if (orgError) throw orgError;

    // Link profile to org (this triggers assign_owner_role)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ organization_id: org.id })
      .eq("id", userId);

    if (profileError) throw profileError;

    // Update module selections
    const allModuleKeys = ["voice_agent", "booking", "calendar", "public_booking_page", "crm", "marketing"];
    for (const key of allModuleKeys) {
      await supabaseAdmin
        .from("organization_modules")
        .update({ enabled: modules.includes(key) })
        .eq("organization_id", org.id)
        .eq("module_key", key);
    }

    return new Response(JSON.stringify({ organization_id: org.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
