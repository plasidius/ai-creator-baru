import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { PLAN_PRICES } from "@/lib/plans";

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Hanya info non-sensitif — TIDAK PERNAH expose API key/secret apapun di sini.
  return NextResponse.json({
    environment: {
      midtransMode:
        process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production" ? "production" : "sandbox",
    },
    planPrices: PLAN_PRICES,
    rateLimits: {
      aiTools: "10 request / 60 detik per IP",
      adminLogin: "10 request / 60 detik per IP",
    },
    adminEmail: process.env.ADMIN_EMAIL
      ? process.env.ADMIN_EMAIL.replace(/(.{2}).+(@.+)/, "$1***$2")
      : "(belum diset)",
  });
}