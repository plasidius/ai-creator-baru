import Replicate from "replicate";
import { NextResponse } from "next/server";
import { ratelimit } from "@/lib/ratelimit";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "❌ Terlalu banyak permintaan. Coba lagi sebentar.", limit, remaining, reset },
        { status: 429 }
      );
    }

    const body = await req.json();
    console.log("THUMBNAIL REQUEST:", body);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: body.prompt,
          num_outputs: 1,
          aspect_ratio: "9:16",
          output_format: "jpg",
          output_quality: 90,
        },
      }
    );

    console.log("THUMBNAIL OUTPUT:", JSON.stringify(output, null, 2));

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return Response.json({ imageUrl });

  } catch (err: any) {
    console.error("THUMBNAIL ERROR:", err?.message);
    return Response.json(
      { error: err?.message || "Gagal generate thumbnail" },
      { status: 500 }
    );
  }
}