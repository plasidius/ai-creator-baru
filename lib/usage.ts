import { supabase } from "@/lib/supabase";

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  pro: 100,
  premium: 999999,
};

export async function checkAndIncrementUsage(): Promise<{
  allowed: boolean;
  plan: string;
  used: number;
  limit: number;
  message?: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, plan: "free", used: 0, limit: 0, message: "Silakan login terlebih dahulu" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, usage_count, usage_reset_at")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan || "free";
  const limit = PLAN_LIMITS[plan] || 10;

  // Cek apakah perlu reset usage (sudah lewat tengah malam)
  const resetAt = profile?.usage_reset_at ? new Date(profile.usage_reset_at) : new Date(0);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let usageCount = profile?.usage_count || 0;

  if (resetAt < todayMidnight) {
    // Reset usage
    usageCount = 0;
    await supabase
      .from("profiles")
      .update({ usage_count: 0, usage_reset_at: now.toISOString() })
      .eq("id", user.id);
  }

  if (usageCount >= limit) {
    return {
      allowed: false,
      plan,
      used: usageCount,
      limit,
      message: `Limit harian tercapai (${usageCount}/${limit}). Upgrade ke Pro untuk lebih banyak generate!`,
    };
  }

  // Increment usage
  await supabase
    .from("profiles")
    .update({ usage_count: usageCount + 1 })
    .eq("id", user.id);

  return { allowed: true, plan, used: usageCount + 1, limit };
}