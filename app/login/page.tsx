"use client";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }
    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 80, 255, ${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
}

// Floating card component
function FloatingCard({ emoji, title, subtitle, className, style }: { emoji: string; title: string; subtitle: string; className: string; style?: React.CSSProperties }) {
  return (
    <div className={`absolute flex items center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl ${className}`}
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.1)" }}>
        {emoji}
      </div>
      <div>
        <p className="font-black text-sm text-white leading-none">{title}</p>
        <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  function resetMessages() { setError(""); setSuccess(""); }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "❌ Email atau password salah" : "❌ " + error.message);
    } else {
      document.cookie = "ai_suite_session=1; path=/; max-age=86400";
      setSuccess("✅ Berhasil masuk!");
      setTimeout(() => router.push("/"), 800);
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    if (password.length < 6) { setError("❌ Password minimal 6 karakter"); return; }

    if (!executeRecaptcha) {
      setError("❌ reCAPTCHA belum siap, coba lagi");
      return;
    }

    setLoading(true);

    const token = await executeRecaptcha("register");

    const verifyRes = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      setError("❌ Verifikasi gagal, kamu terdeteksi sebagai bot");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    if (error) { setError("❌ " + error.message); }
    else { setSuccess("✅ Akun dibuat! Cek email untuk verifikasi."); setMode("login"); }
    setLoading(false);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setError("❌ " + error.message); }
    else { setSuccess("✅ Link reset dikirim ke email kamu!"); }
    setLoading(false);
  }

  async function handleGoogle() {
    resetMessages();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  const handleSubmit = mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot;

  return (
    <main className="min-h-screen text-white relative overflow-hidden flex"
      style={{ background: "linear-gradient(135deg, #06030f 0%, #0d0620 50%, #040310 100%)" }}>

      {/* BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30 blur-[150px]"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }} />
      </div>
      <Particles />

      {/* ===== LEFT SIDE ===== */}
      <div className={`hidden lg:flex flex-col justify-between flex-1 p-12 relative z-10 transition-all duration-700 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-2xl shadow-2xl shadow-fuchsia-500/40">
            🤖
          </div>
          <div>
            <div className="font-black text-xl leading-none">AI Suite</div>
            <div className="text-white/40 text-sm">Indonesia Creator Tools</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="my-auto">
          <h1 className="text-5xl font-black leading-tight mb-4">
            Buat konten lebih cepat<br />
            <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">dengan AI.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-md leading-relaxed">
            Akses 18+ AI Tools untuk membuat konten, mengembangkan bisnis, dan meningkatkan produktivitas Anda.
          </p>

          {/* Robot + Floating Cards */}
          <div className="relative mt-12 h-80">

            {/* Floating Cards — mengelilingi robot */}
            <FloatingCard emoji="🤖" title="Smart Tools" subtitle="AI Powered"
              className="top-0 left-0 animate-bounce" style={{ animationDuration: "3s" } as React.CSSProperties} />
            <FloatingCard emoji="💼" title="Bisnis" subtitle="Otomasi AI"
              className="top-0 right-8 animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" } as React.CSSProperties} />
            <FloatingCard emoji="📣" title="Marketing" subtitle="Promosi AI"
              className="bottom-0 left-0 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" } as React.CSSProperties} />
            <FloatingCard emoji="🎬" title="Video" subtitle="Konten Visual"
              className="bottom-0 right-4 animate-bounce" style={{ animationDuration: "4.5s", animationDelay: "0.3s" } as React.CSSProperties} />

            {/* Robot illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full blur-3xl opacity-40"
                  style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", transform: "scale(1.5)" }} />

                {/* Robot body */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Platform */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-6 rounded-full blur-md opacity-50"
                    style={{ background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)" }} />

                  {/* Robot SVG */}
                  <div className="text-9xl select-none filter drop-shadow-2xl animate-pulse" style={{ animationDuration: "2s" }}>
                    🤖
                  </div>

                  {/* Laptop */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-5xl select-none">
                    💻
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-8 text-white/40 text-sm">
          <span className="flex items-center gap-2">🛡️ Aman & Terpercaya</span>
          <span className="flex items-center gap-2">⚡ Gratis Selamanya</span>
          <span className="flex items-center gap-2">🇮🇩 Made in Indonesia</span>
        </div>
      </div>

      {/* ===== RIGHT SIDE — FORM ===== */}
      <div className={`w-full lg:w-[480px] flex items-center justify-center p-6 lg:p-10 relative z-10 transition-all duration-700 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-xl">🤖</div>
            <div className="font-black text-lg">AI Suite</div>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-white/10 overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)", backdropFilter: "blur(24px)" }}>

            {/* Header */}
            <div className="p-8 pb-0">
              <h2 className="text-2xl font-black mb-1">
                {mode === "login" && "Selamat Datang Kembali👋"}
                {mode === "register" && "Buat Akun Baru ✨"}
                {mode === "forgot" && "Reset Password 🔑"}
              </h2>
              <p className="text-white/40 text-sm">
                {mode === "login" && "Masuk untuk mengakses semua tools AI gratis"}
                {mode === "register" && "Daftar gratis dan mulai buat konten viral"}
                {mode === "forgot" && "Masukkan email untuk link reset password"}
              </p>
            </div>

            {/* Tab switcher */}
            {mode !== "forgot" && (
              <div className="flex mx-8 mt-6 border-b border-white/10">
                <button onClick={() => { setMode("login"); resetMessages(); }}
                  className={`flex-1 pb-3 text-sm font-bold transition-all ${mode === "login" ? "text-fuchsia-400 border-b-2 border-fuchsia-400" : "text-white/40 hover:text-white/60"}`}>
                  Masuk
                </button>
                <button onClick={() => { setMode("register"); resetMessages(); }}
                  className={`flex-1 pb-3 text-sm font-bold transition-all ${mode === "register" ? "text-fuchsia-400 border-b-2 border-fuchsia-400" : "text-white/40 hover:text-white/60"}`}>
                  Daftar
                </button>
              </div>
            )}

            <div className="p-8">
              {/* Messages */}
              {error && <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">

                {mode === "register" && (
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-2 block">Nama Lengkap</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">👤</span>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Nama kamu..." required
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none text-white placeholder:text-white/25 border border-white/10 focus:border-fuchsia-500/60 transition-colors text-sm"
                        style={{ background: "rgba(0,0,0,0.3)" }} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-white/60 text-xs font-medium mb-2 block">Email</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">✉️</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@kamu.com" required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none text-white placeholder:text-white/25 border border-white/10 focus:border-fuchsia-500/60 transition-colors text-sm"
                      style={{ background: "rgba(0,0,0,0.3)" }} />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-2 block">Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔒</span>
                      <input type={showPass ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••" required minLength={6}
                        className="w-full pl-11 pr-12 py-3.5 rounded-2xl outline-none text-white placeholder:text-white/25 border border-white/10 focus:border-fuchsia-500/60 transition-colors text-sm"
                        style={{ background: "rgba(0,0,0,0.3)" }} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="text-right">
                    <button type="button" onClick={() => { setMode("forgot"); resetMessages(); }}
                      className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">
                      Lupa password?
                    </button>
                  </div>
                )}

                {mode === "register" && (
                  <p className="text-xs text-white/40 text-center -mt-1">
                    Dengan mendaftar, kamu menyetujui{" "}
                    <a href="/terms" target="_blank" className="text-fuchsia-400 hover:underline">
                      Syarat & Ketentuan
                    </a>{" "}
                    dan{" "}
                    <a href="/privacy" target="_blank" className="text-fuchsia-400 hover:underline">
                      Kebijakan Privasi
                    </a>{" "}
                    kami.
                  </p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-fuchsia-500 via-violet-500 to-blue-500 hover:opacity-90 shadow-xl shadow-fuchsia-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-2">
                  {loading ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
                  ) : (
                    <>
                      {mode === "login" && <><span>🚀</span> Masuk Sekarang</>}
                      {mode === "register" && <><span>✨</span> Daftar Gratis</>}
                      {mode === "forgot" && <><span>📧</span> Kirim Link Reset</>}
                    </>
                  )}
                </button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-xs">atau lanjut dengan</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <button onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-white/15 hover:border-white/25 hover:bg-white/5 transition-all text-sm font-semibold text-white/80"
                    style={{ background: "rgba(0,0,0,0.2)" }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Lanjut dengan Google
                  </button>
                </>
              )}

              {mode === "forgot" && (
                <button onClick={() => { setMode("login"); resetMessages(); }}
                  className="w-full mt-4 text-center text-white/30 text-xs hover:text-white/50 transition-colors">
                  ← Kembali ke halaman masuk
                </button>
              )}

              {mode !== "forgot" && (
                <p className="text-center text-white/40 text-xs mt-5">
                  {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                  <button onClick={() => { setMode(mode === "login" ? "register" : "login"); resetMessages(); }}
                    className="text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors">
                    {mode === "login" ? "Daftar Gratis" : "Masuk"}
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Mobile trust badges */}
          <div className="flex justify-center gap-4 mt-6 text-white/25 text-xs flex-wrap lg:hidden">
            <span>🛡️ Aman</span>
            <span>⚡ Gratis</span>
            <span>🇮🇩 Indonesia</span>
          </div>
        </div>
      </div>
    </main>
  );
}