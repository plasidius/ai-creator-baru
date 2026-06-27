import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ratelimit } from "@/lib/ratelimit";

// =====================================================================
// SATU endpoint ini dipakai SEMUA tools untuk submit & baca rating.
// Tidak perlu buat route terpisah per tool — cukup kirim `tool_id`
// yang sesuai (samakan dengan key di TOOL_SYSTEM_PROMPTS, misal "tiktok",
// "hook", "caption", dst) dari komponen <RatingWidget /> manapun.
// =====================================================================

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// POST: submit rating baru (1-5 bintang + komentar opsional) untuk satu tool
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const { success } = await ratelimit.limit(`rating:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Coba lagi sebentar." },
        { status: 429 }
      );
    }

    const { tool_id, rating, comment } = await req.json();

    if (!tool_id || typeof tool_id !== "string") {
      return NextResponse.json({ error: "tool_id wajib diisi" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating harus antara 1-5" }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Harus login untuk memberi rating" }, { status: 401 });
    }

    const { error } = await supabase.from("ratings").insert({
      user_id: user.id,
      tool_id,
      rating,
      comment: comment?.trim() || null,
    });

    if (error) {
      console.error("Gagal simpan rating:", error.message);
      return NextResponse.json({ error: "Gagal menyimpan rating" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Rating API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: ambil rata-rata rating + jumlah rating untuk satu tool (atau semua tool)
// Dipakai untuk menampilkan badge "4.8 ⭐ (213 rating)" di kartu tool, atau di dashboard admin
export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabase();
    const toolId = req.nextUrl.searchParams.get("tool_id");

    let query = supabase.from("ratings").select("tool_id, rating");
    if (toolId) query = query.eq("tool_id", toolId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "Gagal mengambil data rating" }, { status: 500 });
    }

    // Agregasi rata-rata per tool_id
    const summary: Record<string, { count: number; average: number }> = {};
    for (const row of data ?? []) {
      if (!summary[row.tool_id]) summary[row.tool_id] = { count: 0, average: 0 };
      summary[row.tool_id].count += 1;
      summary[row.tool_id].average += row.rating;
    }
    for (const key in summary) {
      summary[key].average = Math.round((summary[key].average / summary[key].count) * 10) / 10;
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Rating GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}