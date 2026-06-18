import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  pro: 100,
  premium: 999999,
};

async function checkUsage(userId: string, supabase: ReturnType<typeof createServerClient>) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, usage_count, usage_reset_at")
    .eq("id", userId)
    .single();

  const plan = profile?.plan || "free";
  const limit = PLAN_LIMITS[plan] || 10;

  const resetAt = profile?.usage_reset_at ? new Date(profile.usage_reset_at) : new Date(0);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let usageCount = profile?.usage_count || 0;

  if (resetAt < todayMidnight) {
    usageCount = 0;
    await supabase
      .from("profiles")
      .update({ usage_count: 0, usage_reset_at: now.toISOString() })
      .eq("id", userId);
  }

  return { plan, limit, usageCount };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, tool } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt wajib diisi" }, { status: 400 });
    }

    // ===== CEK AUTH & USAGE LIMIT =====
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { plan, limit, usageCount } = await checkUsage(user.id, supabase);

      if (usageCount >= limit) {
        return NextResponse.json({
          error: `❌ Limit harian tercapai (${usageCount}/${limit}). <a href="/pricing">Upgrade ke Pro</a> untuk lebih banyak generate!`,
          limitReached: true,
          plan,
          used: usageCount,
          limit,
        }, { status: 429 });
      }

      // Increment usage
      await supabase
        .from("profiles")
        .update({ usage_count: usageCount + 1 })
        .eq("id", user.id);
    }

    // ===== ANTHROPIC =====
    const TOOL_SYSTEM_PROMPTS: Record<string, string> = {
 hook: `ROLE
Kamu adalah copywriter viral Indonesia spesialis hook/pembuka konten dengan pengalaman 5 tahun membuat konten yang menembus algoritma TikTok dan Instagram.

CONTEXT
Hook adalah 3 detik pertama yang menentukan apakah orang akan terus menonton atau langsung scroll. Kamu akan menerima topik dari user, dan harus membuat hook yang sesuai dengan demografi target mereka.

TARGET AUDIENCE
Sesuaikan gaya bahasa berdasarkan sinyal usia dari topik/konteks yang diberikan user:
- Gen Z (15-24 tahun): bahasa gaul, singkatan, referensi tren terkini, energik
- Milenial (25-40 tahun): bahasa santai tapi informatif, problem-solving, relatable dengan kehidupan dewasa
- Gen X/Dewasa (40+ tahun): bahasa lebih sopan, fokus pada manfaat praktis, kredibilitas

Jika tidak ada sinyal usia jelas dari topik, gunakan bahasa Milenial sebagai default (paling universal).

GOAL
Membuat 5 variasi hook yang membuat target audience berhenti scroll dalam 3 detik pertama, dengan gaya berbeda-beda untuk memberikan pilihan ke user.

OUTPUT FORMAT
1. [Hook gaya mengejutkan/statistik]
2. [Hook gaya bertanya/penasaran]
3. [Hook gaya kontroversial/berani]
4. [Hook gaya relate/personal]
5. [Hook gaya storytelling singkat]

CONSTRAINTS
- Setiap hook maksimal 2 kalimat
- Tidak boleh clickbait yang menyesatkan
- Tidak boleh ada disclaimer atau penjelasan tambahan
- Hanya output 5 hook, tanpa pembuka atau penutup

EXAMPLES
Topik: "tips menabung"
Output untuk Milenial:
1. 90% orang gagal menabung karena 1 kesalahan ini.
2. Kamu udah coba semua cara nabung tapi tetap gagal?
3. Menabung itu cuma buat orang yang gajinya gede? Salah besar.
4. Gue dulu boros parah, sampai akhirnya nemu cara ini.
5. Bulan lalu gue nyaris nggak punya tabungan sama sekali.

QUALITY CHECKLIST
Sebelum output, pastikan:
- Apakah hook ini bikin orang penasaran dalam 1 detik?
- Apakah bahasanya sesuai target audience?
- Apakah tidak ada kata yang membingungkan?
- Apakah terdengar natural, bukan seperti AI?`,
};
    const systemPrompt = TOOL_SYSTEM_PROMPTS[tool] || `Kamu adalah asisten AI Indonesia yang helpful. Jawab dalam Bahasa Indonesia.`;
    const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
    const openaiKey = process.env.OPENAI_API_KEY?.trim();

    if (!anthropicKey && !openaiKey) {
      return NextResponse.json({ error: "API key belum diset" }, { status: 500 });
    }

    if (anthropicKey) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: prompt.trim() }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const result = data?.content?.[0]?.text;
          if (result) return NextResponse.json({ result });
        }

        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.message || "Error dari Anthropic";
        console.error("Anthropic error:", errMsg);
        if (!openaiKey) return NextResponse.json({ error: "❌ " + errMsg }, { status: 500 });
      } catch (e) {
        console.error("Anthropic fetch error:", e);
        if (!openaiKey) return NextResponse.json({ error: "❌ Gagal connect ke Anthropic" }, { status: 500 });
      }
    }

    // ===== OPENAI FALLBACK =====
    if (openaiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            max_tokens: 1024,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt.trim() }
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const result = data?.choices?.[0]?.message?.content;
          if (result) return NextResponse.json({ result });
        }

        const errData = await res.json().catch(() => ({}));
        return NextResponse.json({ error: "❌ " + (errData?.error?.message || "Error dari OpenAI") }, { status: 500 });
      } catch (e) {
        console.error("OpenAI fetch error:", e);
        return NextResponse.json({ error: "❌ Gagal connect ke OpenAI" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "❌ Semua API gagal." }, { status: 500 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Chat API error:", msg);
    return NextResponse.json({ error: "❌ Internal server error: " + msg }, { status: 500 });
  }
}