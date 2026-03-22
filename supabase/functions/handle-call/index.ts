import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VOICE = "Polly.Amy";

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
  deepgramApiKey: string;
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
    deepgramApiKey: (s.deepgram_api_key as string) || "",
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
        max_tokens: 150,
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
    const ws = bh.weekly_schedule as Record<string, Record<string, unknown>> | undefined;
    const schedule = ws?.[dayName];
    if (!schedule || !schedule.open) {
      // Check if previous day has overnight hours that extend into today
      const prevDayIndex = (local.getDay() + 6) % 7;
      const prevDayName = dayNames[prevDayIndex];
      const prevSchedule = ws?.[prevDayName];
      if (prevSchedule?.open && prevSchedule?.overnight) {
        const currentMinutes = local.getHours() * 60 + local.getMinutes();
        const [th, tm] = ((prevSchedule.to as string) || "00:00").split(":").map(Number);
        const toMin = th * 60 + tm;
        if (currentMinutes < toMin) return true;
      }
      return false;
    }

    // 24h check
    if (schedule.is24h) return true;

    const currentMinutes = local.getHours() * 60 + local.getMinutes();
    const [fh, fm] = ((schedule.from as string) || "09:00").split(":").map(Number);
    const [th, tm] = ((schedule.to as string) || "17:00").split(":").map(Number);
    const fromMin = fh * 60 + fm;
    const toMin = th * 60 + tm;

    if (schedule.overnight) {
      // Overnight: open from "from" until midnight (today's portion)
      return currentMinutes >= fromMin;
    }

    return currentMinutes >= fromMin && currentMinutes < toMin;
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

    const formatHours = (s: Record<string, unknown>): string => {
      if (s.is24h) return "24 hours";
      const from = s.from as string;
      const to = s.to as string;
      if (s.overnight) return `${from}–${to} (next day)`;
      return `${from}–${to}`;
    };

    const groups: { days: string[]; text: string }[] = [];
    const closed: string[] = [];
    for (const d of days) {
      const s = ws[d];
      if (!s || !s.open) { closed.push(dayLabels[d]); continue; }
      const text = formatHours(s);
      const last = groups[groups.length - 1];
      if (last && last.text === text) {
        last.days.push(dayLabels[d]);
      } else {
        groups.push({ days: [dayLabels[d]], text });
      }
    }
    const parts: string[] = [];
    for (const g of groups) {
      const range = g.days.length > 2 ? `${g.days[0]} to ${g.days[g.days.length - 1]}` : g.days.join(" and ");
      parts.push(`Open ${range} ${g.text} (${bh.timezone || "UTC+0"}).`);
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

  // Build parent→children map
  const childrenMap = new Map<string, Array<Record<string, unknown>>>();
  for (const item of knowledgeItems) {
    const pid = item.parent_id as string | null;
    if (pid) {
      if (!childrenMap.has(pid)) childrenMap.set(pid, []);
      childrenMap.get(pid)!.push(item);
    }
  }

  // Knowledge Base: Services, Products, FAQs (root items only)
  const services = knowledgeItems.filter(i => i.type === "service" && !i.parent_id);
  const products = knowledgeItems.filter(i => i.type === "product" && !i.parent_id);
  const faqs = knowledgeItems.filter(i => i.type === "faq" && !i.parent_id);

  console.log(`[AI] Knowledge items: ${knowledgeItems.length}, services: ${services.length}, products: ${products.length}, faqs: ${faqs.length}`);

  const formatItemWithChildren = (item: Record<string, unknown>): string => {
    const meta = item.metadata as Record<string, unknown> | undefined;
    let line = `- ${item.name}${item.description ? ': ' + item.description : ''}`;
    if (meta?.price) line += ` (Price: ${meta.price})`;
    if (meta?.duration) line += ` (Duration: ${meta.duration})`;
    const children = childrenMap.get(item.id as string);
    if (children && children.length > 0) {
      line += "\n  Options/Variants:";
      for (const child of children) {
        const cm = child.metadata as Record<string, unknown> | undefined;
        line += `\n    • ${child.name}${cm?.price ? ' - ' + cm.price : ''}`;
      }
    }
    return line;
  };

  if (services.length > 0) {
    parts.push("Our services:\n" + services.map(formatItemWithChildren).join("\n"));
  }

  if (products.length > 0) {
    parts.push("Our products:\n" + products.map(formatItemWithChildren).join("\n"));
  }

  if (faqs.length > 0) {
    parts.push("Frequently asked questions:\n" + faqs.map(f =>
      `Q: ${f.name}\nA: ${f.description || 'No answer provided.'}`
    ).join("\n\n"));
  }

  // Voice delivery instructions
  const voiceDelivery = agent.voice_delivery_instructions as string | undefined;
  if (voiceDelivery) {
    parts.push(`Voice delivery style: ${voiceDelivery}`);
  } else {
    parts.push(
      "Voice delivery style: Speak in a warm, friendly, and welcoming tone, like a polite restaurant staff member answering the phone.",
      "Smile slightly while speaking, with a natural rhythm and short pauses.",
      "Keep the delivery relaxed and conversational, not robotic.",
      "Emphasize the business name clearly. Slight pause after greeting."
    );
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
    const deepgramApiKey = platformConfig.deepgramApiKey;

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

        const complianceNotice = "This call is handled by an AI assistant and may be recorded for quality and training purposes. ";

        let agentGreeting: string;
        if (!withinHours && agent.after_hours_greeting) {
          agentGreeting = agent.after_hours_greeting as string;
        } else if (agent.greeting) {
          agentGreeting = agent.greeting as string;
        } else if (org.name) {
          agentGreeting = `Hello, thank you for calling ${org.name}. How can I help you today?`;
        } else {
          agentGreeting = "Hello, thank you for calling. How can I help you today?";
        }

        const greeting = complianceNotice + agentGreeting;
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
          // Step 2: After speak ends, start recording for Deepgram STT
          console.log(`[record-start] Starting record for phase=${phase}`);
          await providerAction(call_control_id, "record_start", apiKey, {
            format: "wav",
            channels: "single",
            play_beep: false,
            timeout_secs: 15,
            maximum_length: 15,
            trim_silence: false,
            minimum_silence_duration: 800,
            client_state: makeState(phase, { recordingActive: true }),
          });
        } else {
          console.log(`[call.speak.ended] Ignoring for phase=${phase}`);
        }
        break;
      }

      case "call.recording.saved": {
        const p = payload as Record<string, unknown>;
        console.log("[recording] Recording saved:", JSON.stringify(p));

        const recordingUrls = p.recording_urls as Record<string, string> | undefined;
        const recordingUrl = recordingUrls?.wav || recordingUrls?.mp3 || "";

        if (!recordingUrl) {
          console.error("[recording] No recording URL found");
          break;
        }

        // Download recording from Telnyx
        console.log("[recording] Downloading from:", recordingUrl);
        const audioRes = await fetch(recordingUrl);
        if (!audioRes.ok) {
          console.error("[recording] Download failed:", audioRes.status);
          break;
        }
        const audioBuffer = await audioRes.arrayBuffer();
        console.log("[recording] Downloaded, size:", audioBuffer.byteLength, "bytes");

        // Send to Deepgram nova-2-phonecall for STT
        if (!deepgramApiKey) {
          console.error("[deepgram] No Deepgram API key configured");
          await providerAction(call_control_id, "speak", apiKey, {
            payload: "I'm sorry, I'm having technical difficulties. Please try again later.",
            voice: VOICE,
            language: "en-GB",
            client_state: makeState("responding"),
          });
          break;
        }

        const dgRes = await fetch(
          "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=false&language=en",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${deepgramApiKey}`,
              "Content-Type": "audio/wav",
            },
            body: audioBuffer,
          }
        );

        if (!dgRes.ok) {
          const errText = await dgRes.text();
          console.error("[deepgram] STT failed:", dgRes.status, errText);
          await providerAction(call_control_id, "speak", apiKey, {
            payload: "I'm sorry, I had trouble hearing you. Could you please repeat?",
            voice: VOICE,
            language: "en-GB",
            client_state: makeState("responding"),
          });
          break;
        }

        const dgData = await dgRes.json();
        const transcript = (
          dgData?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""
        ).trim();

        console.log("[deepgram] Transcript:", `"${transcript}"`);

        if (!transcript) {
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

        console.log("[deepgram] AI response:", `"${aiResponse}"`);

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
          await providerAction(call_control_id, "speak", apiKey, {
            payload: aiResponse,
            voice: VOICE,
            language: "en-GB",
            client_state: makeState("transferring"),
          });
        } else {
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
