import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/lib/replicate";

export async function POST(req: NextRequest) {
  try {
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