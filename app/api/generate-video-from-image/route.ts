import { NextRequest, NextResponse } from "next/server";

const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, animType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Gambar wajib diupload" },
        { status: 400 }
      );
    }

    // Mapping animation type ke motion strength
    const motionMap: Record<string, number> = {
      parallax: 64,
      zoom: 96,
      float: 32,
      shake: 127,
      glitch: 100,
      fade: 48,
    };

    const motionBucketId = motionMap[animType] || 64;

    const output = await replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172dc",
      {
        input: {
          input_image: imageBase64,
          motion_bucket_id: motionBucketId,
          frames_per_second: 6,
          sizing_strategy: "maintain_aspect_ratio",
        },
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({
      videoUrl,
      message: "Video animasi berhasil dibuat",
    });
  } catch (err) {
    console.error("Image-to-video error:", err);
    return NextResponse.json(
      { error: "Gagal generate video dari gambar" },
      { status: 500 }
    );
  }
}