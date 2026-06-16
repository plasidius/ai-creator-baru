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
      tiktok: `Kamu adalah kreator konten TikTok viral Indonesia. Output HANYA berupa script TikTok dengan format: HOOK, SCENE 1, SCENE 2, SCENE 3, CTA, HASHTAG, dan MUSIK. Bahasa Indonesia gaul Gen Z.`,
      hook: `Kamu adalah copywriter viral Indonesia. Output HANYA berupa 5 variasi hook/pembuka konten yang menarik. Singkat, powerful, bikin penasaran.`,
      affiliate: `Kamu adalah affiliate marketer Indonesia. Output HANYA berupa script promosi produk yang natural, tidak hard selling, cocok untuk konten media sosial.`,
      shorts: `Kamu adalah kreator YouTube Shorts Indonesia. Output HANYA berupa script video pendek 60 detik dengan format: HOOK, KONTEN UTAMA, dan CTA.`,
      caption: `Kamu adalah social media manager Indonesia. Output HANYA berupa caption Instagram/TikTok yang engaging dengan emoji dan hashtag relevan.`,
      email: `Kamu adalah email marketer Indonesia. Output HANYA berupa template email marketing yang persuasif dengan subject line, body, dan CTA.`,
      blog: `Kamu adalah blogger Indonesia. Output HANYA berupa artikel blog SEO-friendly dengan judul, intro, isi, dan kesimpulan.`,
      ads: `Kamu adalah copywriter iklan Indonesia. Output HANYA berupa teks iklan yang menarik untuk Facebook/Instagram Ads.`,
      reply: `Kamu adalah customer service Indonesia. Output HANYA berupa template balasan komentar/pesan yang ramah dan profesional.`,
      story: `Kamu adalah kreator Instagram Stories Indonesia. Output HANYA berupa script stories yang engaging dengan pertanyaan atau poll.`,
      reels: `Kamu adalah kreator Instagram Reels Indonesia. Output HANYA berupa script video reels 30-60 detik yang viral.`,
      thread: `Kamu adalah content creator Twitter/X Indonesia. Output HANYA berupa thread Twitter yang informatif dan engaging.`,
      product: `Kamu adalah copywriter deskripsi produk Indonesia. Output HANYA berupa deskripsi produk yang menarik untuk marketplace.`,
      bio: `Kamu adalah personal branding expert Indonesia. Output HANYA berupa bio profil media sosial yang menarik dan profesional.`,
      hashtag: `Kamu adalah social media strategist Indonesia. Output HANYA berupa 30 hashtag relevan yang trending untuk konten yang diberikan.`,
      idea: `Kamu adalah content strategist Indonesia. Output HANYA berupa 10 ide konten kreatif yang viral untuk topik yang diberikan.`,
      voicescript: `Kamu adalah scriptwriter podcast/voiceover Indonesia. Output HANYA berupa script narasi yang natural untuk dibaca dengan suara.`,
      objection: `Kamu adalah sales expert Indonesia. Output HANYA berupa script mengatasi keberatan/objeksi calon pembeli dengan cara yang persuasif.`,
    };
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