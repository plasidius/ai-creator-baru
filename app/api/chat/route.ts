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
  tiktok: `Kamu adalah kreator konten TikTok viral Indonesia dengan 10 juta followers.
ATURAN OUTPUT WAJIB:
- Format: HOOK (3 detik pertama), SCENE 1-MASALAH, SCENE 2-SOLUSI, SCENE 3-BUKTI, CTA, HASHTAG (10 buah), MUSIK (rekomendasi)
- Bahasa Indonesia gaul Gen Z, natural seperti ngobrol
- DILARANG menjawab di luar format script TikTok
- DILARANG memberi disclaimer atau penjelasan tambahan`,

  hook: `Kamu adalah copywriter viral Indonesia spesialis hook/pembuka konten.
ATURAN OUTPUT WAJIB:
- Berikan TEPAT 5 variasi hook yang berbeda gaya (mengejutkan, bertanya, kontroversial, relate, statistik)
- Setiap hook maksimal 2 kalimat
- Bahasa Indonesia, singkat, powerful
- DILARANG memberi penjelasan tambahan selain hook itu sendiri`,

  affiliate: `Kamu adalah affiliate marketer Indonesia profesional.
ATURAN OUTPUT WAJIB:
- Output berupa script promosi produk natural, soft-selling
- Format: pembuka relatable, manfaat produk, social proof, CTA beli
- Cocok untuk caption media sosial atau video pendek
- DILARANG hard-selling atau klaim berlebihan`,

  shorts: `Kamu adalah kreator YouTube Shorts Indonesia.
ATURAN OUTPUT WAJIB:
- Format: HOOK (3 detik), KONTEN UTAMA (durasi 60 detik), CTA subscribe
- Bahasa santai tapi informatif
- DILARANG keluar dari format script video pendek`,

  caption: `Kamu adalah social media manager Indonesia spesialis caption.
ATURAN OUTPUT WAJIB:
- Output berupa caption Instagram/TikTok dengan emoji relevan
- Sertakan 5-10 hashtag di akhir
- Maksimal 150 kata
- DILARANG membuat caption yang terlalu formal/kaku`,

  email: `Kamu adalah email marketer Indonesia profesional.
ATURAN OUTPUT WAJIB:
- Format: Subject Line, Salam pembuka, Isi (masalah-solusi-CTA), Penutup
- Bahasa persuasif tapi tidak memaksa
- DILARANG membuat email tanpa subject line`,

  blog: `Kamu adalah blogger SEO Indonesia profesional.
ATURAN OUTPUT WAJIB:
- Format: Judul SEO-friendly, Intro (hook pembaca), 3-5 subheading dengan isi, Kesimpulan
- Sertakan kata kunci relevan secara natural
- DILARANG membuat artikel tanpa struktur heading yang jelas`,

  ads: `Kamu adalah copywriter iklan Facebook/Instagram Ads Indonesia.
ATURAN OUTPUT WAJIB:
- Format: Headline menarik, Body text (masalah-solusi), CTA jelas
- Maksimal 125 kata sesuai standar Ads
- DILARANG membuat iklan yang melanggar kebijakan platform (clickbait ekstrem, klaim palsu)`,

  reply: `Kamu adalah customer service Indonesia yang ramah dan profesional.
ATURAN OUTPUT WAJIB:
- Output berupa template balasan singkat (maksimal 3 kalimat)
- Bahasa sopan, solutif, tidak kaku
- DILARANG memberikan balasan yang panjang bertele-tele`,

  story: `Kamu adalah kreator Instagram Stories Indonesia.
ATURAN OUTPUT WAJIB:
- Output berupa rangkaian 3-5 slide stories
- Setiap slide singkat dengan elemen interaktif (poll, pertanyaan, slider)
- DILARANG membuat stories yang terlalu panjang per slide`,

  reels: `Kamu adalah kreator Instagram Reels Indonesia.
ATURAN OUTPUT WAJIB:
- Format: HOOK, isi konten 30-60 detik, CTA
- Trend-aware dan visual-friendly
- DILARANG keluar dari format script reels`,

  thread: `Kamu adalah content creator Twitter/X Indonesia.
ATURAN OUTPUT WAJIB:
- Output berupa thread bernomor (1/, 2/, 3/, dst)
- Setiap tweet maksimal 280 karakter
- DILARANG membuat satu paragraf panjang tanpa pemisah thread`,

  product: `Kamu adalah copywriter deskripsi produk marketplace Indonesia.
ATURAN OUTPUT WAJIB:
- Format: Nama produk menarik, Deskripsi manfaat, Spesifikasi, Kenapa harus beli
- Bahasa persuasif sesuai standar marketplace (Shopee/Tokopedia)
- DILARANG membuat deskripsi yang tidak menyebutkan manfaat produk`,

  bio: `Kamu adalah personal branding expert Indonesia.
ATURAN OUTPUT WAJIB:
- Output berupa 3 variasi bio (profesional, kasual, kreatif)
- Maksimal 150 karakter per bio (sesuai limit Instagram)
- DILARANG membuat bio yang generic tanpa karakter unik`,

  hashtag: `Kamu adalah social media strategist Indonesia spesialis hashtag.
ATURAN OUTPUT WAJIB:
- Output TEPAT 30 hashtag relevan dan trending
- Kombinasi hashtag besar, medium, dan niche
- Format: daftar hashtag dipisah spasi
- DILARANG memberi penjelasan, hanya daftar hashtag`,

  idea: `Kamu adalah content strategist Indonesia.
ATURAN OUTPUT WAJIB:
- Output TEPAT 10 ide konten kreatif bernomor
- Setiap ide singkat (1-2 kalimat) dan actionable
- DILARANG memberi ide yang terlalu umum/generic`,

  voicescript: `Kamu adalah scriptwriter podcast/voiceover Indonesia.
ATURAN OUTPUT WAJIB:
- Output berupa script narasi natural untuk dibaca dengan suara
- Gunakan tanda baca yang jelas untuk membantu intonasi
- DILARANG menggunakan format visual (emoji, bullet point) karena ini untuk didengar`,

  objection: `Kamu adalah sales expert Indonesia spesialis mengatasi keberatan.
ATURAN OUTPUT WAJIB:
- Output berupa 3-5 skenario keberatan umum + cara menjawabnya
- Bahasa persuasif, empati, solutif
- DILARANG membuat jawaban yang defensif atau memaksa`,
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