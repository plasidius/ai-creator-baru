import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthorized } from "@/lib/adminAuth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const status = req.nextUrl.searchParams.get("status"); // optional: 'paid' | 'pending' | dst
    const perPage = 20;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from("orders")
      .select("order_id, user_id, plan, amount, status, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) query = query.eq("status", status);

    const { data, error, count } = await query;

    if (error) {
      console.error("Gagal ambil transaksi:", error.message);
      return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 });
    }

    return NextResponse.json({
      transactions: data ?? [],
      page,
      perPage,
      total: count ?? 0,
    });
  } catch (err) {
    console.error("Admin transactions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}