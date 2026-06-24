import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { ratelimit } from "@/lib/ratelimit";

// ✅ SMART VIDEO ROUTE
// - Kalau ada REPLICATE_API_TOKEN → generate video beneran
// - Kalau tidak ada → fallback ke Picsum preview

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "❌ Terlalu banyak permintaan. Coba lagi sebentar.", limit, remaining, reset },
        { status: 429 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt wajib diisi" }, { status: 400 });
    }

    // Kalau ada token Replicate → generate video AI beneran
    if (process.env.REPLICATE_API_TOKEN) {
      try {
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN,
        });

        const output = await replicate.run("minimax/video-01", {
          input: {
            prompt: prompt,
            prompt_optimizer: true,
          },
        });

        const videoUrl =
          typeof output === "string"
            ? output
            : Array.isArray(output)
            ? output[0]
            : (output as any)?.url ?? null;

        if (videoUrl) {
          return NextResponse.json({ videoUrl, type: "ai_video" });
        }
      } catch (replicateErr: any) {
        console.error("Replicate gagal, fallback ke preview:", replicateErr?.message);
        // Lanjut ke fallback di bawah
      }
    }

    // Fallback: Picsum preview (selalu jalan, gratis)
    const seed = Date.now() + Math.floor(Math.random() * 9999999);
    const imageUrl = `https://picsum.photos/seed/${seed}/1280/720`;

    return NextResponse.json({
      videoUrl: imageUrl,
      type: "image_preview",
      message: "Preview visual — set REPLICATE_API_TOKEN untuk video AI beneran",
    });

  } catch (err: any) {
    console.error("Video API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}