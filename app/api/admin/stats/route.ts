import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_IDS = ["free", "pro", "premium"] as const;

export async function GET(req: NextRequest) {
  // ===== PROTEKSI: hanya admin yang sudah login boleh akses =====
  // (matcher proxy.ts hanya cover /admin/*, route /api/admin/* dicek manual di sini)
  const cookieStore = await cookies();
  const adminEmail = cookieStore.get("admin_email")?.value;
  if (!adminEmail || adminEmail !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ===== 1. Jumlah user per plan =====
    const planCounts: Record<string, number> = { free: 0, pro: 0, premium: 0 };

    for (const planId of PLAN_IDS) {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("plan", planId);
      planCounts[planId] = count ?? 0;
    }

    // Fallback: kalau ada profile tanpa plan (null), dihitung sebagai "free"
    const { count: nullPlanCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .is("plan", null);
    planCounts.free += nullPlanCount ?? 0;

    const totalUsers = Object.values(planCounts).reduce((a, b) => a + b, 0);

    // ===== 2. Revenue dari order yang sudah dibayar (status = 'paid') =====
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("plan, amount, created_at")
      .eq("status", "paid");

    const revenueByPlan: Record<string, number> = { free: 0, pro: 0, premium: 0 };
    let totalRevenue = 0;

    for (const order of paidOrders ?? []) {
      const plan = order.plan as string;
      const amount = Number(order.amount) || 0;
      revenueByPlan[plan] = (revenueByPlan[plan] ?? 0) + amount;
      totalRevenue += amount;
    }

    // Revenue bulan ini saja (kalau kolom created_at ada)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = (paidOrders ?? [])
      .filter((o) => o.created_at && new Date(o.created_at) >= startOfMonth)
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    // ===== 3. Total generate (proxy untuk "konsumsi AI") =====
    // Catatan: ini total usage_count gabungan semua user (reset harian per user),
    // bukan total token asli — token tracking belum diimplementasikan.
    // Kalau mau akurat per-provider (Anthropic/OpenAI), perlu tabel log terpisah
    // yang dicatat setiap kali API dipanggil di app/api/chat/route.ts.
    const { data: usageRows } = await supabase
      .from("profiles")
      .select("usage_count");

    const totalGenerateToday = (usageRows ?? []).reduce(
      (sum, r) => sum + (r.usage_count ?? 0),
      0
    );

    // ===== 4. Order terbaru (untuk tabel transaksi terbaru, opsional) =====
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("order_id, plan, amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      users: {
        total: totalUsers,
        byPlan: planCounts,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
        byPlan: revenueByPlan,
      },
      usage: {
        totalGenerateToday,
      },
      recentOrders: recentOrders ?? [],
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data statistik" },
      { status: 500 }
    );
  }
}