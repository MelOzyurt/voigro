

Collaborate

Share
GitHub'a push edemedim (yetki gerekiyor). Sana iki seçenek:
Seçenek 1 — Dosyayı direkt indir (en kolay)
Aşağıdaki dosyayı indir, voigro/supabase/functions/handle-call/index.ts dosyasının üzerine kopyala. Sonra terminalde:
Bash
cd voigro
git add supabase/functions/handle-call/index.ts
git commit -m "Switch to Telnyx Conversational AI"
git push
supabase functions deploy handle-call
Seçenek 2 — Bana GitHub token ver
GitHub → Settings → Developer settings → Personal access tokens → Generate new token (repo yetkisi yeterli). Token'ı bana gönder, ben push yaparım.
index.ts
Code · 17.18 KB
View all files in this task
How was this result?
Microsoft Windows [Version 10.0.22631.6199]
(c) Microsoft Corporation. All rights reserved.
C:\Users\melih>cd voigro
The system cannot find the path specified.
C:\Users\melih>git fetch origin
remote: Enumerating objects: 102, done.
remote: Counting objects: 100% (102/102), done.
remote: Compressing objects: 100% (79/79), done.
remote: Total 97 (delta 30), reused 23 (delta 1), pack-reused 0 (from 0)
Unpacking objects: 100% (97/97), 60.65 KiB | 117.00 KiB/s, done.
From https://github.com/MelOzyurt/docchat
 * [new branch]      main       -> origin/main
   b5b6bab..7692670  master     -> origin/master
Auto packing the repository in background for optimum performance.
See "git help gc" for manual housekeeping.
Enumerating objects: 97, done.
Counting objects: 100% (97/97), done.
Delta compression using up to 4 threads
Compressing objects: 100% (80/80), done.
Writing objects: 100% (97/97), done.
Total 97 (delta 30), reused 0 (delta 0), pack-reused 0 (from 0)
C:\Users\melih>git pull origin main
From https://github.com/MelOzyurt/docchat
 * branch            main       -> FETCH_HEAD
fatal: refusing to merge unrelated histories 
Yanlış klasördesin — docchat reposundasın, voigro değil. Şunu dene:
Bash
cd C:\Users\melih
dir
Voigro klasörünü bul. Muhtemelen şu isimlerden biri:
voigro
callio
voigro-app
Klasörü bulduktan sonra:
Bash
cd voigro
(ya da bulduğun isimle)
Klasör listesini bana göster, birlikte bulalım.
istersen voigro yu githubdan locale cekelim, sonra senin kodu uzerine yazalim, sonra git he commit edelim, boylece updated dosya uzeinde celistigimizdan emin oluruz
Tam doğru yaklaşım. Ben burada yapayım, sen sadece sonunda push ve deploy yaparsın.
After attempting to push code, I encountered permission issues; I will now clone the latest repo, then review and update the handle-call/index.ts file accordingly.

Cloned the latest repo, reviewed the handle-call/index.ts file, and copied the updated version into the fresh clone to proceed with the analysis. Next, I will review the full file.

GitHub push için yetkim yok — bu repo private ve benim GitHub token'ım yazma yetkisine sahip değil.
Ama commit hazır. Şimdi sana en kolay yolu gösteriyorum:
Senin Bilgisayarında Yapacakların (3 adım)
1. Voigro klasörünü bul ve aç:
Bash
cd C:\Users\melih
dir
Voigro klasörünü bul (muhtemelen voigro veya başka bir isim).
2. Güncel kodu GitHub'dan çek:
Bash
cd voigro   (ya da bulduğun klasör adı)
git pull
3. Benden gönderdiğim dosyayı kopyala:
Aşağıdaki ekteki index.ts dosyasını indir ve şu konuma yapıştır:
Plain Text
voigro\supabase\functions\handle-call\index.ts
Sonra:
Bash
git add supabase/functions/handle-call/index.ts
git commit -m "Switch to Telnyx Conversational AI"
git push
supabase functions deploy handle-call
Voigro klasörünün adını ve nerede olduğunu bilmiyorum. dir çıktısını bana gönder, birlikte bulalım.
index.ts
Code · 17.18 KB
View all files in this task
How was this result?
I confirmed the Telnyx Assistant ID is correctly inserted, and the code changes are committed locally. Due to permission issues, I cannot push to GitHub, but the next step is for you to pull the latest code, replace the filename, and deploy the function.

pasted_content_5.txt
Text · 5.74 KB
Dosyayı okuyorum...
Buldum! Klasörün adı callio — satır 39'da görüyorum.
Şu komutları sırayla çalıştır:
1. Klasöre gir ve güncel kodu çek:
Bash
cd C:\Users\melih\callio
git pull
2. Benden gönderdiğim index.ts dosyasını şu konuma kopyala:
Plain Text
C:\Users\melih\callio\supabase\functions\handle-call\index.ts
(Dosyayı bir önceki mesajda ek olarak gönderdim — indir ve üzerine yapıştır)
3. Commit ve push:
Bash
git add supabase/functions/handle-call/index.ts
git commit -m "Switch to Telnyx Conversational AI"
git push
4. Deploy:
Bash
supabase functions deploy handle-call
cd C:\Users\melih\callio ve git pull çıktısını bana gönder, doğru yerde olduğundan emin olalım.
C:\Users\melih>git clone https://github.com/MelOzyurt/voigro.git
Cloning into 'voigro'...
remote: Enumerating objects: 2229, done.
remote: Counting objects: 100% (382/382), done.
remote: Compressing objects: 100% (126/126), done.
remote: Total 2229 (delta 292), reused 317 (delta 238), pack-reused 1847 (from 1)
Receiving objects: 100% (2229/2229), 794.92 KiB | 9.03 MiB/s, done.
Resolving deltas: 100% (1760/1760), done.
C:\Users\melih>cd voigro
C:\Users\melih\voigro> 
Mükemmel! Şimdi benden gönderdiğim index.ts dosyasını şu konuma kopyala:
Plain Text
C:\Users\melih\voigro\supabase\functions\handle-call\index.ts
Dosyayı kopyaladıktan sonra şu komutları çalıştır:
Bash
git add supabase/functions/handle-call/index.ts
git commit -m "Switch to Telnyx Conversational AI"
git push
Push bittikten sonra söyle, deploy adımına geçeceğiz.
pasted_content_6.txt
Text · 27.59 KB
dosyandoysanin eski hali buydu :
Okuyorum...
Gördüm — bu eski kod (768 satır, VOICE = "Polly.Amy" ile başlıyor). Bu GitHub'daki mevcut hali.
Yani GitHub'da hâlâ eski kod var. Benim yazdığım yeni kod sadece bende.
Şimdi yapman gereken tek şey:
Bir önceki mesajımda sana ek olarak gönderdiğim index.ts dosyasını indir ve şu konuma yapıştır:
Plain Text
C:\Users\melih\voigro\supabase\functions\handle-call\index.ts
Dosyayı kopyaladıktan sonra terminalde:
Bash
cd C:\Users\melih\voigro
git add supabase/functions/handle-call/index.ts
git commit -m "Switch to Telnyx Conversational AI"
git push
Dosyayı gönderdim mi göremedim — göremediysen şimdi tekrar göndereyim mi?
Task completed
How was this result?
Suggested follow-ups


GitHubMy Browser

index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Telnyx Portal'dan alınan Voigro AI Assistant ID
const TELNYX_ASSISTANT_ID = "assistant-0768ff84-c9fd-4aab-98b0-15af86d17eae";

interface WebhookEvent {
  data: {
    event_type: string;
    payload: Record<string, unknown>;
  };
}

// --- Helpers ---

async function providerAction(
  callControlId: string,
  action: string,
  apiKey: string,
  body: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
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
    return {};
  }
  console.log(`[providerAction] "${action}" OK`);
  return await res.json().catch(() => ({}));
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
    if (schedule.is24h) return true;
    const currentMinutes = local.getHours() * 60 + local.getMinutes();
    const [fh, fm] = ((schedule.from as string) || "09:00").split(":").map(Number);
    const [th, tm] = ((schedule.to as string) || "17:00").split(":").map(Number);
    const fromMin = fh * 60 + fm;
    const toMin = th * 60 + tm;
    if (schedule.overnight) return currentMinutes >= fromMin;
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
      const range = g.days.length > 2
        ? `${g.days[0]} to ${g.days[g.days.length - 1]}`
        : g.days.join(" and ");
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

  const childrenMap = new Map<string, Array<Record<string, unknown>>>();
  for (const item of knowledgeItems) {
    const pid = item.parent_id as string | null;
    if (pid) {
      if (!childrenMap.has(pid)) childrenMap.set(pid, []);
      childrenMap.get(pid)!.push(item);
    }
  }

  const services = knowledgeItems.filter(i => i.type === "service" && !i.parent_id);
  const products = knowledgeItems.filter(i => i.type === "product" && !i.parent_id);
  const faqs = knowledgeItems.filter(i => i.type === "faq" && !i.parent_id);

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

  const voiceDelivery = agent.voice_delivery_instructions as string | undefined;
  if (voiceDelivery) {
    parts.push(`Voice delivery style: ${voiceDelivery}`);
  } else {
    parts.push(
      "Voice delivery style: Speak in a warm, friendly, and welcoming tone.",
      "Keep responses concise and conversational — maximum 2-3 sentences.",
      "If you cannot help the caller, let them know you will transfer them to a team member."
    );
  }

  parts.push(
    `Your tone should be ${agent.tone || "professional"} and your style ${agent.response_style || "concise"}.`,
    `Speak in ${agent.language === "tr" ? "Turkish" : "English"}.`
  );
  return parts.join("\n");
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

    if (!eventType || !payload) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const call_control_id = payload.call_control_id as string;
    const call_leg_id = payload.call_leg_id as string;
    const to = payload.to as string;
    const from = payload.from as string;

    console.log(`[Event] call_control_id=${call_control_id}, to=${to}, from=${from}`);

    // Platform API key'i al
    const { data: platformData } = await supabase
      .from("platform_settings")
      .select("provider_api_key")
      .limit(1)
      .single();
    const apiKey = (platformData?.provider_api_key as string) || "";

    switch (eventType) {

      case "call.initiated": {
        console.log(`[call.initiated] Answering call from ${from} to ${to}`);

        // Çağrı kaydını oluştur
        const { data: callData } = await supabase.from("calls").insert({
          from_number: from || "unknown",
          to_number: to || "unknown",
          provider: "telnyx",
          provider_call_id: call_leg_id || call_control_id,
          status: "initiated",
          started_at: new Date().toISOString(),
          // organization_id'yi aşağıda call.answered'da set edeceğiz
        }).select("id").single();

        console.log(`[call.initiated] Call record created: ${callData?.id}`);

        // Çağrıyı cevapla
        await providerAction(call_control_id, "answer", apiKey);
        break;
      }

      case "call.answered": {
        console.log(`[call.answered] Call answered, to=${to}`);

        // Organizasyonu numaradan bul
        const { data: phoneSetup } = await supabase
          .from("phone_setups")
          .select("organization_id")
          .eq("virtual_number", to)
          .eq("pairing_status", "paired")
          .eq("routing_enabled", true)
          .limit(1)
          .maybeSingle();

        let organizationId = phoneSetup?.organization_id as string | undefined;

        // Fallback: calls tablosundan bul
        if (!organizationId) {
          const { data: callRecord } = await supabase
            .from("calls")
            .select("organization_id")
            .eq("provider_call_id", call_leg_id || call_control_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          organizationId = callRecord?.organization_id;
        }

        if (!organizationId) {
          console.error("[call.answered] No organization found for number:", to);
          break;
        }

        console.log(`[call.answered] Organization: ${organizationId}`);

        // Çağrı kaydını organization_id ile güncelle
        await supabase
          .from("calls")
          .update({ organization_id: organizationId, status: "answered" })
          .eq("provider_call_id", call_leg_id || call_control_id);

        // Organizasyon, agent ve knowledge bilgilerini çek
        const [orgResult, agentResult, knowledgeResult] = await Promise.all([
          supabase.from("organizations").select("*").eq("id", organizationId).single(),
          supabase.from("ai_agents").select("*").eq("organization_id", organizationId).eq("is_active", true).limit(1).maybeSingle(),
          supabase.from("knowledge_items").select("*").eq("organization_id", organizationId).eq("is_active", true).order("sort_order", { ascending: true }),
        ]);

        const org = (orgResult.data || {}) as Record<string, unknown>;
        const agent = (agentResult.data || {}) as Record<string, unknown>;
        const knowledgeItems = (knowledgeResult.data || []) as Array<Record<string, unknown>>;

        console.log(`[call.answered] Agent: ${agent.name}, Org: ${org.name}, Knowledge items: ${knowledgeItems.length}`);

        // Greeting'i belirle (mesai saati kontrolü)
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

        // System prompt'u oluştur (Voigro DB'den)
        const systemPrompt = buildSystemPrompt(agent, org, knowledgeItems);

        console.log(`[call.answered] Starting Telnyx AI Assistant with dynamic variables`);

        // Telnyx AI Assistant'ı başlat — tek çağrı, her şeyi halleder
        await providerAction(call_control_id, "ai_assistant_start", apiKey, {
          assistant: {
            id: TELNYX_ASSISTANT_ID,
          },
          dynamic_variables: {
            system_prompt: systemPrompt,
            greeting: greeting,
          },
        });

        break;
      }

      case "call.conversation.ended": {
        // AI görüşmesi tamamlandı
        console.log(`[call.conversation.ended] Conversation ended`);

        // Çağrı kaydını güncelle
        const { data: callRecord } = await supabase
          .from("calls")
          .select("id, organization_id, started_at")
          .eq("provider_call_id", call_leg_id || call_control_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (callRecord) {
          const startTime = new Date(callRecord.started_at).getTime();
          const durationSeconds = Math.round((Date.now() - startTime) / 1000);
          await supabase
            .from("calls")
            .update({
              status: "completed",
              ended_at: new Date().toISOString(),
              duration_seconds: durationSeconds,
              handled_by: "ai",
            })
            .eq("id", callRecord.id);
        }
        break;
      }

      case "call.conversation_insights.generated": {
        // Telnyx AI, görüşme bitince transcript ve özet gönderir
        console.log(`[call.conversation_insights.generated] Insights received`);

        const insights = payload.insights as Record<string, unknown> | undefined;
        const transcript = insights?.transcript as string | undefined;
        const summary = insights?.summary as string | undefined;

        if (!transcript) break;

        // Çağrı kaydını bul
        const { data: callRecord } = await supabase
          .from("calls")
          .select("id, organization_id, started_at")
          .eq("provider_call_id", call_leg_id || call_control_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (callRecord) {
          // Transcript'i kaydet
          await supabase.from("transcripts").insert({
            call_id: callRecord.id,
            organization_id: callRecord.organization_id,
            messages: [{ role: "full_transcript", text: transcript, timestamp: new Date().toISOString() }],
            summary: summary || null,
            extracted_intent: transcript.slice(0, 200),
          });
          console.log(`[insights] Transcript saved for call: ${callRecord.id}`);
        }
        break;
      }

      case "call.hangup": {
        console.log(`[call.hangup] Call ended`);

        const { data: callRecord } = await supabase
          .from("calls")
          .select("id, started_at, status")
          .eq("provider_call_id", call_leg_id || call_control_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (callRecord && callRecord.status !== "completed") {
          const startTime = new Date(callRecord.started_at as string).getTime();
          const durationSeconds = Math.round((Date.now() - startTime) / 1000);
          await supabase
            .from("calls")
            .update({
              status: "completed",
              ended_at: new Date().toISOString(),
              duration_seconds: durationSeconds,
              handled_by: "ai",
            })
            .eq("id", callRecord.id);
        }
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
How to Resolve G722 Codec Compatibility Issues - Manus