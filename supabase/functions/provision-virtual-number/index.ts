import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProvisionRequest {
  organization_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ProvisionRequest = await req.json();
    const { organization_id } = body;

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: "organization_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Read platform settings
    const { data: settings, error: settingsError } = await supabase
      .from("platform_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Platform settings not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const provider = settings.default_voice_provider;
    const apiKey = (settings as Record<string, unknown>).provider_api_key as string;
    const bundleId = (settings as Record<string, unknown>).provider_bundle_id as string;
    const connectionId = (settings as Record<string, unknown>).provider_connection_id as string;
    const numberType = (settings as Record<string, unknown>).provider_number_type as string || "national";
    const countryCode = (settings as Record<string, unknown>).provider_country_code as string || "GB";
    const apiSecret = (settings as Record<string, unknown>).provider_api_secret as string;
    const webhookBaseUrl = (settings as Record<string, unknown>).webhook_base_url as string;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Provider API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let virtualNumber: string;
    let phoneNumberId: string;

    if (provider === "telnyx") {
      // Search for available number
      const searchParams = new URLSearchParams({
        "filter[country_code]": countryCode,
        "filter[number_type]": numberType,
        "filter[features][]": "voice",
        "filter[limit]": "1",
      });

      const searchRes = await fetch(
        `https://api.telnyx.com/v2/available_phone_numbers?${searchParams}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const searchData = await searchRes.json();
      if (!searchRes.ok || !searchData.data?.length) {
        return new Response(
          JSON.stringify({
            error: "No available numbers found",
            details: searchData,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const availableNumber = searchData.data[0].phone_number;

      // Purchase number
      const orderBody: Record<string, unknown> = {
        phone_numbers: [
          {
            phone_number: availableNumber,
            ...(bundleId
              ? {
                  regulatory_requirements: [
                    {
                      requirement_id: "regulatory_bundle",
                      field_value: bundleId,
                    },
                  ],
                }
              : {}),
          },
        ],
        ...(connectionId ? { connection_id: connectionId } : {}),
      };

      const orderRes = await fetch(
        "https://api.telnyx.com/v2/number_orders",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderBody),
        }
      );

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        return new Response(
          JSON.stringify({
            error: "Failed to purchase number",
            details: orderData,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      virtualNumber = availableNumber;
      phoneNumberId =
        orderData.data?.phone_numbers?.[0]?.id ||
        orderData.data?.id ||
        "";

      // Assign webhook URL to the number (via connection or direct update)
      const base = webhookBaseUrl || `${supabaseUrl}/functions/v1`;
      const webhookUrl = `${base}/handle-call?org=${organization_id}`;
      
      if (phoneNumberId) {
        await fetch(
          `https://api.telnyx.com/v2/phone_numbers/${phoneNumberId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...(connectionId ? { connection_id: connectionId } : {}),
              tags: [organization_id],
            }),
          }
        );
      }
    } else if (provider === "twilio") {
      if (!apiSecret) {
        return new Response(
          JSON.stringify({ error: "Twilio Account SID (API Secret) not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const accountSid = apiSecret;
      const twilioAuth = btoa(`${accountSid}:${apiKey}`);
      const ntMap: Record<string, string> = {
        national: "Local",
        "toll-free": "TollFree",
      };
      const twilioNumberType = ntMap[numberType] || "Local";

      // Search
      const searchRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${countryCode}/${twilioNumberType}.json?VoiceEnabled=true&PageSize=1`,
        { headers: { Authorization: `Basic ${twilioAuth}` } }
      );

      const searchData = await searchRes.json();
      if (
        !searchRes.ok ||
        !searchData.available_phone_numbers?.length
      ) {
        return new Response(
          JSON.stringify({
            error: "No available numbers found",
            details: searchData,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const availableNumber =
        searchData.available_phone_numbers[0].phone_number;

      // Purchase
      const base = webhookBaseUrl || `${supabaseUrl}/functions/v1`;
      const webhookUrl = `${base}/handle-call?org=${organization_id}`;
      const purchaseRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${twilioAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            PhoneNumber: availableNumber,
            VoiceUrl: webhookUrl,
          }),
        }
      );

      const purchaseData = await purchaseRes.json();
      if (!purchaseRes.ok) {
        return new Response(
          JSON.stringify({
            error: "Failed to purchase number",
            details: purchaseData,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      virtualNumber = purchaseData.phone_number;
      phoneNumberId = purchaseData.sid;
    } else {
      return new Response(
        JSON.stringify({ error: `Provider "${provider}" is not yet supported` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save to phone_setups
    const { data: existingSetup } = await supabase
      .from("phone_setups")
      .select("id")
      .eq("organization_id", organization_id)
      .limit(1)
      .maybeSingle();

    const phoneSetupData = {
      virtual_number: virtualNumber,
      virtual_phone_number_id: phoneNumberId,
      provider,
      provisioned_at: new Date().toISOString(),
      verification_status: "provisioned",
      provider_config: {
        connection_id: connectionId || null,
        bundle_id: bundleId || null,
      },
    };

    if (existingSetup) {
      const { error: updateError } = await supabase
        .from("phone_setups")
        .update(phoneSetupData)
        .eq("id", existingSetup.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("phone_setups")
        .insert({
          ...phoneSetupData,
          organization_id,
        });
      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        virtual_number: virtualNumber,
        status: "provisioned",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
