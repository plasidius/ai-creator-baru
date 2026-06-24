import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";
import { ratelimit } from "@/lib/ratelimit";

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

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          aspect_ratio: "9:16",
          output_format: "webp",
          num_outputs: 1,
        },
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("Replicate error:", err);
    return NextResponse.json(
      { error: "Gagal generate gambar" },
      { status: 500 }
    );
  }
}