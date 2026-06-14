"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("❌ Password tidak sama");
      return;
    }
    if (password.length < 6) {
      setError("❌ Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    // Simulasi reset — ganti dengan logika sesuai auth system kamu
    setTimeout(() => {
      setSuccess("✅ Password berhasil diubah! Mengalihkan...");
      setTimeout(() => router.push("/login"), 1500);
      setLoading(false);
    }, 1000);
  }

  return (
    <main className="min-h-screen text-white flex items-center justify-center bg-[#050508] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-fuchsia-700/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-blue-500 flex items-center justify-center text-3xl shadow-2xl shadow-fuchsia-500/40 mx-auto mb-3">
            🔑
          </div>
          <h1 className="font-black text-2xl">Buat Password Baru</h1>
          <p className="text-white/40 text-sm mt-1">Masukkan password baru kamu</p>
        </div>

        <div className="rounded-3xl border border-white/10 backdrop-blur-2xl p-8"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)" }}>

          {error && <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">{success}</div>}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Password Baru</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6}
                className="w-full px-4 py-3.5 rounded-2xl outline-none text-white placeholder:text-white/25 border border-white/10 focus:border-fuchsia-500/50 transition-colors text-sm"
                style={{ background: "rgba(0,0,0,0.3)" }} />
              <p className="text-white/25 text-xs mt-1.5 ml-1">Minimal 6 karakter</p>
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Konfirmasi Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-3.5 rounded-2xl outline-none text-white placeholder:text-white/25 border border-white/10 focus:border-fuchsia-500/50 transition-colors text-sm"
                style={{ background: "rgba(0,0,0,0.3)" }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-fuchsia-500 to-blue-500 hover:opacity-90 shadow-lg shadow-fuchsia-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                : "🔑 Simpan Password Baru"}
            </button>
          </form>

          <button onClick={() => router.push("/login")}
            className="w-full mt-5 text-center text-white/30 text-xs hover:text-white/50 transition-colors">
            ← Kembali ke halaman masuk
          </button>
        </div>
      </div>
    </main>
  );
}