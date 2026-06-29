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
    const perPage = 20;

    // Ambil email dari sistem auth Supabase (perlu service role, tidak ada di tabel profiles)
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (authError) {
      console.error("Gagal ambil daftar auth users:", authError.message);
      return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 });
    }

    const userIds = authData.users.map((u) => u.id);

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, plan, usage_count, usage_reset_at")
      .in("id", userIds);

    if (profileError) {
      console.error("Gagal ambil profiles:", profileError.message);
    }

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const users = authData.users.map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        plan: profile?.plan ?? "free",
        usage_count: profile?.usage_count ?? 0,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      };
    });

    return NextResponse.json({
      users,
      page,
      perPage,
      total: authData.total ?? users.length,
    });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}