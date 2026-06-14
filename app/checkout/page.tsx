"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PLANS = {
  pro: {
    name: "Pro",
    price: 99000,
    priceLabel: "Rp 99.000",
    period: "per bulan",
    color: "from-fuchsia-600 to-violet-600",
    features: ["100 generate per hari", "Priority response AI", "Support prioritas"],
  },
  premium: {
    name: "Premium",
    price: 199000,
    priceLabel: "Rp 199.000",
    period: "per bulan",
    color: "from-yellow-500 to-amber-500",
    features: ["Unlimited generate", "Priority response AI", "Support 24/7", "Akses fitur beta"],
  },
};

const BANKS = [
  { id: "bca", name: "BCA", no: "1234567890", atas: "AI Suite Indonesia" },
  { id: "bri", name: "BRI", no: "0987654321", atas: "AI Suite Indonesia" },
  { id: "mandiri", name: "Mandiri", no: "1122334455", atas: "AI Suite Indonesia" },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan") as "pro" | "premium" || "pro";
  const plan = PLANS[planId] || PLANS.pro;

  const [step, setStep] = useState<"detail" | "payment" | "confirm">("detail");
  const [selectedBank, setSelectedBank] = useState("bca");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId] = useState(`ORD-${Date.now()}`);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email || "");
    }
    getUser();
  }, []);

  async function handleConfirm() {
    if (!name || !proofFile) return;
    setLoading(true);

    // Simpan order ke Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("orders").insert({
        user_id: user.id,
        plan: planId,
        amount: plan.price,
        status: "pending",
        order_id: orderId,
        bank: selectedBank,
        name,
      });
    }

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-black mb-2">Pembayaran Dikonfirmasi!</h2>
        <p className="text-white/50 mb-2">Order ID: <span className="text-white font-mono">{orderId}</span></p>
        <p className="text-white/50 mb-6">Akun kamu akan diupgrade dalam <strong className="text-white">5-30 menit</strong> setelah verifikasi.</p>
        <button onClick={() => router.push("/")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 font-bold">
          🏠 Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">

      {/* Order Summary */}
      <div className={`p-6 rounded-3xl bg-gradient-to-br ${plan.color} bg-opacity-20 border border-white/20 mb-6`}
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)" }}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-sm mb-1">Paket yang dipilih</p>
            <h2 className="text-2xl font-black">{plan.name}</h2>
            <ul className="mt-2 space-y-1">
              {plan.features.map((f, i) => (
                <li key={i} className="text-white/60 text-xs flex items-center gap-1">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{plan.priceLabel}</p>
            <p className="text-white/50 text-xs">{plan.period}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
          <span className="text-white/50">Order ID</span>
          <span className="font-mono text-xs">{orderId}</span>
        </div>
      </div>

      {/* Steps */}
      {step === "detail" && (
        <div className="space-y-4">
          <h3 className="font-black text-lg">📋 Detail Pembeli</h3>

          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Nama Lengkap</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nama sesuai rekening..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/25 focus:border-fuchsia-500/50 text-sm" />
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kamu.com" type="email"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/25 focus:border-fuchsia-500/50 text-sm" />
          </div>

          <button onClick={() => setStep("payment")} disabled={!name || !email}
            className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-fuchsia-500 to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed">
            Lanjut ke Pembayaran →
          </button>
        </div>
      )}

      {step === "payment" && (
        <div className="space-y-4">
          <h3 className="font-black text-lg">💳 Pilih Metode Bayar</h3>

          {/* Bank selection */}
          <div className="space-y-2">
            {BANKS.map((bank) => (
              <button key={bank.id} onClick={() => setSelectedBank(bank.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  selectedBank === bank.id
                    ? "border-fuchsia-500/50 bg-fuchsia-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">Transfer Bank {bank.name}</p>
                    <p className="text-white/50 text-xs mt-0.5">{bank.no} a/n {bank.atas}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedBank === bank.id ? "border-fuchsia-500 bg-fuchsia-500" : "border-white/30"
                  }`}>
                    {selectedBank === bank.id && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/50 text-xs mb-1">Transfer tepat sebesar:</p>
            <p className="text-2xl font-black text-fuchsia-400">{plan.priceLabel}</p>
            <p className="text-white/30 text-xs mt-1">Tambahkan 3 digit unik terakhir order ID: <span className="text-white">{orderId.slice(-3)}</span></p>
          </div>

          <button onClick={() => setStep("confirm")}
            className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-fuchsia-500 to-violet-500">
            Sudah Transfer →
          </button>
          <button onClick={() => setStep("detail")}
            className="w-full py-2 text-white/40 text-sm hover:text-white/60">
            ← Kembali
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <h3 className="font-black text-lg">📸 Upload Bukti Transfer</h3>
          <p className="text-white/50 text-sm">Upload screenshot/foto bukti transfer kamu</p>

          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            proofFile ? "border-green-500/50 bg-green-500/10" : "border-white/20 hover:border-fuchsia-500/40"
          }`}>
            {proofFile ? (
              <div>
                <div className="text-4xl mb-2">✅</div>
                <p className="text-green-300 font-semibold text-sm">{proofFile.name}</p>
                <button onClick={() => setProofFile(null)} className="text-white/30 text-xs mt-2 hover:text-white/50">
                  Ganti file
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-white/50 text-sm">Klik untuk upload bukti transfer</p>
                <p className="text-white/30 text-xs mt-1">JPG, PNG, PDF max 5MB</p>
                <input type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>

          <button onClick={handleConfirm} disabled={!proofFile || loading}
            className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
            ) : "✅ Konfirmasi Pembayaran"}
          </button>
          <button onClick={() => setStep("payment")}
            className="w-full py-2 text-white/40 text-sm hover:text-white/60">
            ← Kembali
          </button>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen text-white relative overflow-hidden bg-[#050508]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-700/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-700/20 blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-2xl mx-auto">

        {/* NAVBAR */}
        <div className="mb-8 flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
          <a href="/" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🏠 Dashboard</a>
          <a href="/pricing" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">💎 Paket</a>
          <span className="px-3 py-2 rounded-xl bg-fuchsia-600/40 border border-fuchsia-500/40 text-sm font-bold">🛒 Checkout</span>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-white/50">Loading...</div>}>
          <CheckoutContent />
        </Suspense>

        <div className="mt-8 text-center text-white/20 text-xs">
          🔒 Pembayaran aman • Diverifikasi manual dalam 5-30 menit
        </div>
      </div>
    </main>
  );
}