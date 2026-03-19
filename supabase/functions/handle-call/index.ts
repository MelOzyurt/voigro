import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// In-memory conversation store (per isolate lifetime)
const conversations = new Map<
  string,
  { messages: Array<{ role: string; content: string }>; callId: string; orgId: string; startedAt: string }
>();

interface CallPayload {
  call_control_id: string;
  call_leg_id: string;
  to: string;
  from: string;
  client_state?: string;
  speech_transcript?: string;
  [key: string]: unknown;
}

interface WebhookEvent {
  data: {
    event_type: string;
    payload: CallPayload;
  };
}

interface LlmConfig {
  provider: string;
  apiKey: string;
  model: string;
  language: string;
}

async function getPlatformConfig(supabase: ReturnType<typeof createClient>): Promise<{
  providerApiKey: string;
  llm: LlmConfig;
}> {
  const { data } = await supabase
    .from("platform_settings")
    .select("*")
    .limit(1)
    .single();
  const s = (data || {}) as Record<string, unknown>;
  return {
    providerApiKey: (s.provider_api_key as string) || "",
    llm: {
      provider: (s.llm_provider as string) || "lovable",
      apiKey: (s.llm_api_key as string) || "",
      model: (s.llm_model as string) || "google/gemini-2.5-flash",
      language: (s.llm_language as string) || "en",
    },
  };
}

async function providerAction(
  callControlId: string,
  action: string,
  apiKey: string,
  body: Record<string, unknown> = {}
): Promise<void> {
  const res = await fetch(
    `https://api.telnyx.com/v2/calls/${callControlId}/actions/${action}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    console.error(`Call action "${action}" failed:`, res.status, text);
  }
}

async function getAIResponse(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  llm: LlmConfig
): Promise<string> {
  try {
    let url: string;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: Record<string, unknown>;

    if (llm.provider === "anthropic") {
      url = "https://api.anthropic.com/v1/messages";
      headers["x-api-key"] = llm.apiKey;
      headers["anthropic-version"] = "2023-06-01";
      body = {
        model: llm.model || "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
      };
    } else if (llm.provider === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${llm.model || "gemini-2.5-flash"}:generateContent?key=${llm.apiKey}`;
      body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      };
    } else {
      // OpenAI-compatible: covers "lovable" and "openai"
      if (llm.provider === "lovable") {
        url = "https://ai.gateway.lovable.dev/v1/chat/completions";
        headers["Authorization"] = `Bearer ${Deno.env.get("LOVABLE_API_KEY") || ""}`;
      } else {
        url = "https://api.openai.com/v1/chat/completions";
        headers["Authorization"] = `Bearer ${llm.apiKey}`;
      }
      body = {
        model: llm.model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      };
    }

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

    if (!res.ok) {
      const text = await res.text();
      console.error("AI error:", res.status, text);
      return "I'm sorry, I couldn't process that. Could you please repeat?";
    }

    const data = await res.json();
    if (llm.provider === "anthropic") {
      return data.content?.[0]?.text || "I didn't catch that. Could you repeat?";
    }
    if (llm.provider === "gemini") {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't catch that. Could you repeat?";
    }
    return data.choices?.[0]?.message?.content || "I didn't catch that. Could you repeat?";
  } catch (err) {
    console.error("AI call failed:", err);
    return "I'm sorry, I'm having technical difficulties. Please try again.";
  }
  }
}

function buildSystemPrompt(agent: Record<string, unknown>, org: Record<string, unknown>): string {
  const parts = [
    `You are ${agent.name || "an AI assistant"}, a phone assistant for ${org.name || "our business"}.`,
  ];

  if (agent.business_description) {
    parts.push(`About the business: ${agent.business_description}`);
  }
  if (agent.special_instructions) {
    parts.push(`Special instructions: ${agent.special_instructions}`);
  }

  parts.push(
    "Respond conversationally and concisely (max 2-3 sentences).",
    "If you cannot help the caller, let them know you will transfer them to a team member.",
    `Your tone should be ${agent.tone || "professional"} and your style ${agent.response_style || "concise"}.`,
    `Speak in ${agent.language === "tr" ? "Turkish" : "English"}.`
  );

  return parts.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Always respond 200 quickly to webhook
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const url = new URL(req.url);
    const orgIdParam = url.searchParams.get("org");

    let event: WebhookEvent;
    try {
      event = await req.json();
    } catch {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventType = event?.data?.event_type;
    const payload = event?.data?.payload;

    if (!eventType || !payload) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { call_control_id, call_leg_id, to, from } = payload;

    // Find organization by virtual number or query param
    let organizationId = orgIdParam || "";
    let agent: Record<string, unknown> = {};
    let org: Record<string, unknown> = {};

    if (!organizationId && to) {
      const { data: phoneSetup } = await supabase
        .from("phone_setups")
        .select("organization_id")
        .eq("virtual_number", to)
        .eq("routing_enabled", true)
        .limit(1)
        .maybeSingle();

      if (phoneSetup) {
        organizationId = phoneSetup.organization_id;
      }
    }

    if (!organizationId) {
      console.error("No organization found for number:", to);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch org and agent data
    const [orgResult, agentResult] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", organizationId).single(),
      supabase.from("ai_agents").select("*").eq("organization_id", organizationId).eq("is_active", true).limit(1).maybeSingle(),
    ]);

    if (orgResult.data) org = orgResult.data as Record<string, unknown>;
    if (agentResult.data) agent = agentResult.data as Record<string, unknown>;

    const platformConfig = await getPlatformConfig(supabase);
    const apiKey = platformConfig.providerApiKey;
    const llmConfig = platformConfig.llm;

    // Handle events
    switch (eventType) {
      case "call.initiated": {
        // Log call to database
        const { data: callData } = await supabase.from("calls").insert({
          organization_id: organizationId,
          from_number: from || "unknown",
          to_number: to || "unknown",
          provider: "platform",
          provider_call_id: call_leg_id || call_control_id,
          status: "initiated",
          started_at: new Date().toISOString(),
        }).select("id").single();

        // Initialize conversation store
        conversations.set(call_leg_id || call_control_id, {
          messages: [],
          callId: callData?.id || "",
          orgId: organizationId,
          startedAt: new Date().toISOString(),
        });

        // Answer the call
        await providerAction(call_control_id, "answer", apiKey);
        break;
      }

      case "call.answered": {
        // Speak greeting
        const greeting =
          (agent.greeting as string) ||
          "Hello, thank you for calling. How can I help you today?";

        await providerAction(call_control_id, "speak", apiKey, {
          payload: greeting,
          voice: "Polly.Joanna",
          language: "en-US",
        });
        break;
      }

      case "call.speak.ended": {
        // After speaking, gather caller input
        await providerAction(call_control_id, "gather", apiKey, {
          gather_method: "speech",
          speech_model: "enhanced",
          language: (agent.language as string) === "tr" ? "tr" : "en",
          speech_timeout: 5,
          timeout: 15,
        });
        break;
      }

      case "call.gather.ended": {
        const transcript = payload.speech_transcript as string;
        const convKey = call_leg_id || call_control_id;
        const conv = conversations.get(convKey);

        if (!transcript || transcript.trim() === "") {
          // No speech detected — ask again or end
          await providerAction(call_control_id, "speak", apiKey, {
            payload:
              (agent.fallback_message as string) ||
              "I didn't catch that. Could you please repeat?",
            voice: "Polly.Joanna",
            language: "en-US",
          });
          break;
        }

        // Add caller message to history
        if (conv) {
          conv.messages.push({ role: "user", content: transcript });
        }

        // Get AI response
        const systemPrompt = buildSystemPrompt(agent, org);
        const aiResponse = await getAIResponse(conv?.messages || [{ role: "user", content: transcript }], systemPrompt, llmConfig);

        // Add assistant message to history
        if (conv) {
          conv.messages.push({ role: "assistant", content: aiResponse });
        }

        // Check if AI wants to transfer
        const lowerResponse = aiResponse.toLowerCase();
        const shouldTransfer =
          lowerResponse.includes("transfer") &&
          (lowerResponse.includes("connecting you") ||
            lowerResponse.includes("let me transfer") ||
            lowerResponse.includes("i'll transfer"));

        if (shouldTransfer && agent.transfer_number) {
          // Announce transfer then transfer
          await providerAction(call_control_id, "speak", apiKey, {
            payload: aiResponse,
            voice: "Polly.Joanna",
            language: "en-US",
            client_state: btoa(JSON.stringify({ action: "transfer" })),
          });
        } else {
          // Speak AI response → will trigger speak.ended → gather again
          await providerAction(call_control_id, "speak", apiKey, {
            payload: aiResponse,
            voice: "Polly.Joanna",
            language: "en-US",
          });
        }
        break;
      }

      case "call.hangup": {
        const convKey = call_leg_id || call_control_id;
        const conv = conversations.get(convKey);

        if (conv?.callId) {
          const startTime = new Date(conv.startedAt).getTime();
          const durationSeconds = Math.round((Date.now() - startTime) / 1000);

          // Update call record
          await supabase
            .from("calls")
            .update({
              status: "completed",
              ended_at: new Date().toISOString(),
              duration_seconds: durationSeconds,
              handled_by: "ai",
            })
            .eq("id", conv.callId);

          // Save transcript if there were messages
          if (conv.messages.length > 0) {
            const lastUserMsg = [...conv.messages].reverse().find((m) => m.role === "user");
            await supabase.from("transcripts").insert({
              call_id: conv.callId,
              organization_id: conv.orgId,
              messages: conv.messages.map((m, i) => ({
                role: m.role === "user" ? "caller" : "assistant",
                text: m.content,
                timestamp: new Date(startTime + i * 5000).toISOString(),
                channel: m.role === "user" ? "stt" : "tts",
                confidence: m.role === "user" ? 0.9 : 1.0,
              })),
              summary: conv.messages.length > 0
                ? `Call with ${conv.messages.filter((m) => m.role === "user").length} caller messages`
                : null,
              extracted_intent: lastUserMsg?.content?.slice(0, 200) || null,
            });
          }
        }

        // Clean up
        conversations.delete(convKey);
        break;
      }

      default: {
        // Check for transfer action from client_state
        if (payload.client_state) {
          try {
            const state = JSON.parse(atob(payload.client_state as string));
            if (state.action === "transfer" && agent.transfer_number) {
              await providerAction(call_control_id, "transfer", apiKey, {
                to: agent.transfer_number,
              });
              break;
            }
          } catch {
            // Ignore invalid client_state
          }
        }
        // Unknown event — acknowledge silently
        break;
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error:", err instanceof Error ? err.message : err);
    // Always return 200 to prevent webhook retries
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
