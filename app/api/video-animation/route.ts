import { NextRequest, NextResponse } from "next/server";

// ✅ VIDEO API ROUTE — pakai Picsum (gratis, tidak butuh API key)
// Pollinations sudah 402 (berbayar) dari Indonesia (IP CGK)
//
// Upgrade ke video beneran:
// - Replicate: https://replicate.com (free credit $5)
// - RunwayML: https://runwayml.com
// - Luma AI: https://lumalabs.ai

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt wajib diisi" },
        { status: 400 }
      );
    }

    // Seed unik dari timestamp — gambar selalu berbeda setiap request
    const seed = Date.now() + Math.floor(Math.random() * 9999999);

    // Picsum: gratis, reliable, tidak diblokir dari Indonesia
    const imageUrl = `https://picsum.photos/seed/${seed}/1280/720`;

    return NextResponse.json({
      videoUrl: imageUrl,
      type: "image_preview",
      message: "Preview visual — upgrade ke Replicate untuk video beneran",
    });

  } catch (err) {
    console.error("Video API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}