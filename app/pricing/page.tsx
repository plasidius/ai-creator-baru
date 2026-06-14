"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { default as CheckoutButton } from "../../components/CheckoutButton";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Gratis",
    color: "from-gray-600 to-gray-500",
    border: "border-white/10",
    badge: null,
    features: [
      "10 generate per hari",
      "Semua 18 tools",
      "Copy hasil generate",
      "Support via email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99000,
    priceLabel: "Rp 99.000/bln",
    color: "from-fuchsia-600 to-violet-600",
    border: "border-fuchsia-500/30",
    badge: "🔥 Populer",
    features: [
      "100 generate per hari",
      "Semua 18 tools",
      "Priority response AI",
      "Copy & export hasil",
      "Support prioritas",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 199000,
    priceLabel: "Rp 199.000/bln",
    color: "from-yellow-500 to-amber-500",
    border: "border-yellow-500/30",
    badge: "⚡ Best Value",
    features: [
      "Unlimited generate",
      "Semua 18 tools",
      "Priority response AI",
      "Copy & export hasil",
      "Support 24/7",
      "Akses fitur beta",
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setUserId(user.id);
      setUserEmail(user.email!);

      const { data } = await supabase
        .from("profiles")
        .select("plan, usage_count")
        .eq("id", user.id)
        .single();

      if (data) {
        setCurrentPlan(data.plan || "free");
        setUsageCount(data.usage_count || 0);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [router]);

  return (
    <main className="min-h-screen text-white relative overflow-hidden bg-[#050508]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-700/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-700/20 blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-5xl mx-auto">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
          <a href="/" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🏠 Dashboard</a>
          <a href="/pricing" className="px-3 py-2 rounded-xl bg-fuchsia-600/40 border border-fuchsia-500/40 text-sm font-bold">💎 Paket</a>
        </div>

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
            Pilih Paket Terbaik
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Upgrade Akunmu 🚀</h1>
          <p className="text-white/50 max-w-lg mx-auto">Mulai gratis, upgrade kapan saja. Semua paket termasuk akses ke 18 tools AI.</p>

          {!loading && (
            <div className="inline-flex items-center gap-3 mt-6 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-white/50 text-sm">Paket kamu:</span>
              <span className={`font-black text-sm px-3 py-1 rounded-full ${
                currentPlan === "premium" ? "bg-yellow-500/20 text-yellow-300" :
                currentPlan === "pro" ? "bg-fuchsia-500/20 text-fuchsia-300" :
                "bg-white/10 text-white/60"
              }`}>
                {currentPlan.toUpperCase()}
              </span>
              <span className="text-white/30 text-xs">|</span>
              <span className="text-white/50 text-sm">Usage hari ini: <span className="text-white font-bold">{usageCount}</span></span>
            </div>
          )}
        </div>

        {/* PLANS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div key={plan.id}
              className={`relative p-6 rounded-3xl border backdrop-blur-xl transition-all ${plan.border} ${
                currentPlan === plan.id ? "ring-2 ring-fuchsia-500/50" : ""
              }`}
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)" }}>

              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r from-fuchsia-500 to-violet-500 shadow-lg">
                  {plan.badge}
                </div>
              )}

              {currentPlan === plan.id && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-black text-white bg-green-500">
                  ✓ Aktif
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {plan.id === "free" ? "🆓" : plan.id === "pro" ? "⚡" : "👑"}
              </div>
              <h2 className="font-black text-2xl mb-1">{plan.name}</h2>
              <p className={`text-lg font-black mb-6 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                {plan.priceLabel}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {currentPlan === plan.id ? (
                <button disabled
                  className="w-full py-3 rounded-2xl bg-white/10 text-white/40 font-bold text-sm cursor-not-allowed">
                  Paket Aktif
                </button>
              ) : plan.id === "free" ? (
                <button disabled
                  className="w-full py-3 rounded-2xl bg-white/5 text-white/30 font-bold text-sm cursor-not-allowed border border-white/10">
                  Paket Default
                </button>
              ) : (
                <CheckoutButton
                  userId={userId}
                  email={userEmail}
                  plan={plan.name}
                  amount={plan.price}
                />
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="font-black text-lg mb-4">❓ FAQ</h3>
          <div className="space-y-4 text-sm text-white/60">
            <div>
              <p className="text-white font-semibold mb-1">Bagaimana cara upgrade?</p>
              <p>Klik tombol Upgrade, lakukan pembayaran via transfer bank atau QRIS, akun otomatis upgrade dalam 5 menit.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Apakah bisa cancel kapan saja?</p>
              <p>Ya, kamu bisa cancel kapan saja. Akses Pro/Premium tetap aktif sampai akhir periode billing.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Reset usage harian kapan?</p>
              <p>Usage direset setiap tengah malam WIB (00:00).</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}