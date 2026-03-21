import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VOICE = "Telnyx.Ultra.a7a59115-2425-4192-844c-1e98ec7d6877";

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

interface CallState {
  phase: string;
  orgId?: string;
  callId?: string;
  [key: string]: unknown;
}

// --- Helpers ---

function encodeState(phase: string, extra: Record<string, unknown> = {}): string {
  return btoa(JSON.stringify({ phase, ...extra }));
}

function decodeState(clientState: string | undefined): CallState {
  if (!clientState) return { phase: "" };
  try {
    return JSON.parse(atob(clientState)) as CallState;
  } catch {
    return { phase: "" };
  }
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
  console.log(`[providerAction] ${action} for ${callControlId}`, JSON.stringify(body));
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
    console.error(`[providerAction] "${action}" FAILED:`, res.status, text);
  } else {
    console.log(`[providerAction] "${action}" OK`);
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

    console.log(`[AI] Calling ${llm.provider} model=${llm.model}`);
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

    if (!res.ok) {
      const text = await res.text();
      console.error("[AI] error:", res.status, text);
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
    console.error("[AI] call failed:", err);
    return "I'm sorry, I'm having technical difficulties. Please try again.";
  }
}

function parseUtcOffset(tz: string): number {
  const match = (tz || "UTC+0").match(/^UTC([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3] || "0", 10));
}

function isWithinBusinessHours(bh: Record<string, unknown>): boolean {
  try {
    const offsetMin = parseUtcOffset((bh.timezone as string) || "UTC+0");
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utcMs + offsetMin * 60000);
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[local.getDay()];
    const schedule = (bh.weekly_schedule as Record<string, Record<string, unknown>>)?.[dayName];
    if (!schedule || !schedule.open) return false;
    const currentMinutes = local.getHours() * 60 + local.getMinutes();
    const [fh, fm] = ((schedule.from as string) || "09:00").split(":").map(Number);
    const [th, tm] = ((schedule.to as string) || "17:00").split(":").map(Number);
    return currentMinutes >= fh * 60 + fm && currentMinutes < th * 60 + tm;
  } catch {
    return true;
  }
}

function generateBusinessHoursSummary(bh: Record<string, unknown>): string {
  try {
    const ws = bh.weekly_schedule as Record<string, Record<string, unknown>> | undefined;
    if (!ws) return "";
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dayLabels: Record<string, string> = {
      monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
      thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
    };
    const groups: { days: string[]; from: string; to: string }[] = [];
    const closed: string[] = [];
    for (const d of days) {
      const s = ws[d];
      if (!s || !s.open) { closed.push(dayLabels[d]); continue; }
      const last = groups[groups.length - 1];
      if (last && last.from === s.from && last.to === s.to) {
        last.days.push(dayLabels[d]);
      } else {
        groups.push({ days: [dayLabels[d]], from: s.from as string, to: s.to as string });
      }
    }
    const parts: string[] = [];
    for (const g of groups) {
      const range = g.days.length > 2 ? `${g.days[0]} to ${g.days[g.days.length - 1]}` : g.days.join(" and ");
      parts.push(`Open ${range} ${g.from}–${g.to} (${bh.timezone || "UTC+0"}).`);
    }
    if (closed.length > 0) parts.push(`Closed ${closed.join(" and ")}.`);
    const ph = bh.public_holidays as Record<string, unknown> | undefined;
    if (ph?.enabled && ph?.closed_on_holidays) {
      parts.push(`Automatically closed on ${ph.country || "GB"} public holidays.`);
    }
    return parts.join(" ");
  } catch {
    return "";
  }
}

function buildSystemPrompt(
  agent: Record<string, unknown>,
  org: Record<string, unknown>,
  knowledgeItems: Array<Record<string, unknown>> = []
): string {
  const parts = [
    `You are ${agent.name || "an AI assistant"}, a phone assistant for ${org.name || "our business"}.`,
  ];
  if (agent.business_description) {
    parts.push(`About the business: ${agent.business_description}`);
  }
  const bh = agent.business_hours as Record<string, unknown> | undefined;
  if (bh) {
    const summary = generateBusinessHoursSummary(bh);
    if (summary) parts.push(`Business hours: ${summary}`);
  }
  if (agent.special_instructions) {
    parts.push(`Special instructions: ${agent.special_instructions}`);
  }

  // Knowledge Base: Services, Products, FAQs
  const services = knowledgeItems.filter(i => i.type === "service");
  const products = knowledgeItems.filter(i => i.type === "product");
  const faqs = knowledgeItems.filter(i => i.type === "faq");

  console.log(`[AI] Knowledge items: ${knowledgeItems.length}, services: ${services.length}, products: ${products.length}, faqs: ${faqs.length}`);

  if (services.length > 0) {
    parts.push("Our services:\n" + services.map(s =>
      `- ${s.name}${s.description ? ': ' + s.description : ''}${
        (s.metadata as Record<string, unknown>)?.price ? ' (Price: ' + (s.metadata as Record<string, unknown>).price + ')' : ''
      }${(s.metadata as Record<string, unknown>)?.duration ? ' (Duration: ' + (s.metadata as Record<string, unknown>).duration + ')' : ''}`
    ).join("\n"));
  }

  if (products.length > 0) {
    parts.push("Our products:\n" + products.map(p =>
      `- ${p.name}${p.description ? ': ' + p.description : ''}${
        (p.metadata as Record<string, unknown>)?.price ? ' (Price: ' + (p.metadata as Record<string, unknown>).price + ')' : ''
      }`
    ).join("\n"));
  }

  if (faqs.length > 0) {
    parts.push("Frequently asked questions:\n" + faqs.map(f =>
      `Q: ${f.name}\nA: ${f.description || 'No answer provided.'}`
    ).join("\n\n"));
  }

  parts.push(
    "Respond conversationally and concisely (max 2-3 sentences).",
    "If you cannot help the caller, let them know you will transfer them to a team member.",
    `Your tone should be ${agent.tone || "professional"} and your style ${agent.response_style || "concise"}.`,
    `Speak in ${agent.language === "tr" ? "Turkish" : "English"}.`
  );
  return parts.join("\n");
}

// --- DB helpers for stateless conversation ---

async function getConversationMessages(
  supabase: ReturnType<typeof createClient>,
  callId: string
): Promise<Array<{ role: string; content: string }>> {
  const { data } = await supabase
    .from("calls")
    .select("conversation_messages")
    .eq("id", callId)
    .single();
  return (data?.conversation_messages as Array<{ role: string; content: string }>) || [];
}

async function appendConversationMessage(
  supabase: ReturnType<typeof createClient>,
  callId: string,
  message: { role: string; content: string }
): Promise<Array<{ role: string; content: string }>> {
  const messages = await getConversationMessages(supabase, callId);
  messages.push(message);
  await supabase
    .from("calls")
    .update({ conversation_messages: messages })
    .eq("id", callId);
  return messages;
}

// --- Main handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    console.log(`[Event] ${eventType || "unknown"}`);
    console.log("[WEBHOOK] Full event:", JSON.stringify(event?.data));

    if (!eventType || !payload) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { call_control_id, call_leg_id, to, from } = payload;
    console.log(`[Event] call_control_id=${call_control_id}, to=${to}, from=${from}`);

    // --- Resolve orgId: from client_state first, then URL param, then DB lookup ---
    const state = decodeState(payload.client_state as string | undefined);
    let organizationId = state.orgId || orgIdParam || "";
    let callId = state.callId || "";

    if (!organizationId && to) {
      const { data: phoneSetup } = await supabase
        .from("phone_setups")
        .select("organization_id")
        .eq("virtual_number", to)
        .eq("pairing_status", "paired")
        .eq("routing_enabled", true)
        .limit(1)
        .maybeSingle();

      if (phoneSetup) {
        organizationId = phoneSetup.organization_id;
      }
    }

    if (!organizationId) {
      const lookupId = call_leg_id || call_control_id;
      if (lookupId) {
        const { data: callRecord } = await supabase
          .from("calls")
          .select("organization_id, id")
          .eq("provider_call_id", lookupId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (callRecord) {
          organizationId = callRecord.organization_id;
          if (!callId) callId = callRecord.id;
        }
      }
    }

    if (!organizationId) {
      console.error("No organization found for number:", to);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Event] Organization: ${organizationId}, callId: ${callId}`);

    const [orgResult, agentResult, knowledgeResult] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", organizationId).single(),
      supabase.from("ai_agents").select("*").eq("organization_id", organizationId).eq("is_active", true).limit(1).maybeSingle(),
      supabase.from("knowledge_items").select("*").eq("organization_id", organizationId).eq("is_active", true).order("sort_order", { ascending: true }),
    ]);

    const org = (orgResult.data || {}) as Record<string, unknown>;
    const agent = (agentResult.data || {}) as Record<string, unknown>;
    const knowledgeItems = (knowledgeResult.data || []) as Array<Record<string, unknown>>;

    console.log(`[Event] Agent: name=${agent.name}, greeting=${agent.greeting}, org=${org.name}`);

    const platformConfig = await getPlatformConfig(supabase);
    const apiKey = platformConfig.providerApiKey;
    const llmConfig = platformConfig.llm;

    const makeState = (phase: string, extra: Record<string, unknown> = {}): string =>
      encodeState(phase, { orgId: organizationId, callId, ...extra });

    switch (eventType) {
      case "call.initiated": {
        console.log(`[call.initiated] Answering call from ${from} to ${to}`);
        const { data: callData } = await supabase.from("calls").insert({
          organization_id: organizationId,
          from_number: from || "unknown",
          to_number: to || "unknown",
          provider: "platform",
          provider_call_id: call_leg_id || call_control_id,
          status: "initiated",
          started_at: new Date().toISOString(),
        }).select("id").single();

        callId = callData?.id || "";
        console.log(`[call.initiated] Created call record: ${callId}`);

        await providerAction(call_control_id, "answer", apiKey);
        break;
      }

      case "call.answered": {
        // Look up callId if missing
        if (!callId) {
          const { data: cr } = await supabase
            .from("calls")
            .select("id")
            .eq("provider_call_id", call_leg_id || call_control_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (cr) callId = cr.id;
        }

        const bh = agent.business_hours as Record<string, unknown> | undefined;
        const withinHours = bh ? isWithinBusinessHours(bh) : true;

        let greeting: string;
        if (!withinHours && agent.after_hours_greeting) {
          greeting = agent.after_hours_greeting as string;
        } else if (agent.greeting) {
          greeting = agent.greeting as string;
        } else if (org.name) {
          greeting = `Hello, thank you for calling ${org.name}. How can I help you today?`;
        } else {
          greeting = "Hello, thank you for calling. How can I help you today?";
        }

        console.log(`[call.answered] Speaking greeting: "${greeting}", callId: ${callId}`);

        // Step 1: Plain speak for greeting (NO gather_using_speak)
        await providerAction(call_control_id, "speak", apiKey, {
          payload: greeting,
          voice: VOICE,
          language: "en-GB",
          client_state: makeState("greeting"),
        });
        break;
      }

      case "call.speak.ended": {
        const phase = state.phase || "unknown";
        console.log(`[call.speak.ended] Phase: ${phase}, orgId: ${organizationId}, callId: ${callId}`);

        if (phase === "transferring" && agent.transfer_number) {
          console.log(`[call.speak.ended] Transferring to ${agent.transfer_number}`);
          await providerAction(call_control_id, "transfer", apiKey, {
            to: agent.transfer_number,
          });
        } else if (phase === "greeting" || phase === "responding") {
          // Step 2: After speak ends, start plain gather for speech capture
          console.log(`[gather-start] Starting plain gather for phase=${phase}`);
          await providerAction(call_control_id, "gather", apiKey, {
            gather_method: "speech",
            input: ["speech"],
            language: "en-US",
            speech_model: "default",
            speech_timeout: "auto",
            timeout: 25,
            minimum_silence_duration: 500,
            client_state: makeState(phase, { gatherActive: true }),
          });
        } else {
          console.log(`[call.speak.ended] Ignoring for phase=${phase}`);
        }
        break;
      }

      case "call.gather.ended":
      case "call.speak_and_gather.ended":
      case "call.gather_using_speak.ended":
      case "call.gather_stopped": {
        const p = payload as Record<string, unknown>;
        console.log(`[gather-ended] Full payload:`, JSON.stringify(p));

        // Resolve transcript from multiple possible fields
        const transcript = (
          (p.speech_transcript as string) ||
          (p.transcript as string) ||
          (p.text as string) ||
          ((p.results as Record<string, unknown>)?.text as string) ||
          ((p.metadata as Record<string, unknown>)?.transcript as string) ||
          ""
        ).trim();

        const gatherStatus = p.status as string;

        console.log(`[transcript] Resolved: "${transcript || "(empty)"}"`);
        console.log(`[gather-ended] Status: ${gatherStatus}`);

        // If gather ended because call hung up, don't try to respond
        if (gatherStatus === "call_hangup") {
          console.log(`[gather-ended] Call already hung up, skipping response`);
          break;
        }

        if (!transcript) {
          console.log(`[gather-ended] No speech detected, asking to repeat`);
          // Speak fallback, then gather will restart on speak.ended
          await providerAction(call_control_id, "speak", apiKey, {
            payload:
              (agent.fallback_message as string) ||
              "I didn't catch that. Could you please repeat?",
            voice: VOICE,
            language: "en-GB",
            client_state: makeState("responding"),
          });
          break;
        }

        // Persist user message and get full conversation
        const messagesAfterUser = await appendConversationMessage(supabase, callId, {
          role: "user",
          content: transcript,
        });

        const systemPrompt = buildSystemPrompt(agent, org, knowledgeItems);
        const aiResponse = await getAIResponse(messagesAfterUser, systemPrompt, llmConfig);

        console.log(`[speak] AI response: "${aiResponse}"`);

        // Persist AI response
        await appendConversationMessage(supabase, callId, {
          role: "assistant",
          content: aiResponse,
        });

        // Check if AI wants to transfer
        const lower = aiResponse.toLowerCase();
        const shouldTransfer =
          lower.includes("transfer") &&
          (lower.includes("connecting you") ||
            lower.includes("let me transfer") ||
            lower.includes("i'll transfer"));

        if (shouldTransfer && agent.transfer_number) {
          // Speak transfer message, then transfer on speak.ended
          await providerAction(call_control_id, "speak", apiKey, {
            payload: aiResponse,
            voice: VOICE,
            language: "en-GB",
            client_state: makeState("transferring"),
          });
        } else {
          // Speak AI response, then gather will restart on speak.ended
          await providerAction(call_control_id, "speak", apiKey, {
            payload: aiResponse,
            voice: VOICE,
            language: "en-GB",
            client_state: makeState("responding"),
          });
        }
        break;
      }

      case "call.hangup": {
        console.log(`[call.hangup] Call ended, callId: ${callId}`);

        if (callId) {
          const { data: callRecord } = await supabase
            .from("calls")
            .select("started_at, conversation_messages")
            .eq("id", callId)
            .single();

          const startedAt = callRecord?.started_at || new Date().toISOString();
          const messages = (callRecord?.conversation_messages as Array<{ role: string; content: string }>) || [];
          const startTime = new Date(startedAt).getTime();
          const durationSeconds = Math.round((Date.now() - startTime) / 1000);

          await supabase
            .from("calls")
            .update({
              status: "completed",
              ended_at: new Date().toISOString(),
              duration_seconds: durationSeconds,
              handled_by: "ai",
            })
            .eq("id", callId);

          if (messages.length > 0) {
            const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
            await supabase.from("transcripts").insert({
              call_id: callId,
              organization_id: organizationId,
              messages: messages.map((m, i) => ({
                role: m.role === "user" ? "caller" : "assistant",
                text: m.content,
                timestamp: new Date(startTime + i * 5000).toISOString(),
                channel: m.role === "user" ? "stt" : "tts",
                confidence: m.role === "user" ? 0.9 : 1.0,
              })),
              summary: `Call with ${messages.filter((m) => m.role === "user").length} caller messages`,
              extracted_intent: lastUserMsg?.content?.slice(0, 200) || null,
            });
          }
        }
        break;
      }

      case "call.speak.started": {
        console.log(`[call.speak.started] TTS started`);
        break;
      }

      default: {
        console.log(`[default] Unhandled event: ${eventType}`);
        break;
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[ERROR] Webhook handler:", err instanceof Error ? err.message : err);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
