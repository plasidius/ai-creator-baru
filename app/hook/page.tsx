"use client";

import { useState } from "react";

const NICHES = [
  "💰 Bisnis & Uang", "💄 Skincare & Kecantikan", "🏋️ Fitness & Kesehatan",
  "🍔 Kuliner & Resep", "📱 Teknologi", "🧠 Self Improvement",
  "👨‍👩‍👧 Parenting", "✈️ Travel", "🎓 Edukasi", "😂 Hiburan & Komedi",
];

const HOOK_TYPES = [
  { id: "pertanyaan", label: "❓ Pertanyaan" },
  { id: "fakta", label: "🔥 Fakta Mengejutkan" },
  { id: "kontroversi", label: "😱 Kontroversial" },
  { id: "cerita", label: "📖 Cerita Personal" },
  { id: "list", label: "📋 List/Tips" },
  { id: "challenge", label: "🎯 Challenge" },
];

export default function HookLibrary() {
  const [niche, setNiche] = useState("");
  const [hookType, setHookType] = useState("pertanyaan");
  const [topic, setTopic] = useState("");
  const [hooks, setHooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(-1);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setHooks([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "hook",
          prompt: `Kamu adalah copywriter viral Indonesia dengan track record konten 10 juta+ views.
Buat 10 hook pembuka konten VIRAL dengan formula berbeda untuk:
- Topik: "${topic}"
- Niche: ${niche || "Umum"}  
- Tipe: ${hookType}

FORMULA HOOK (gunakan variasi formula ini):
- WHAT IF: "Bagaimana kalau ternyata [hal yang dianggap benar] itu salah?"
- DATA SHOCK: "[Angka mengejutkan] orang Indonesia tidak tahu ini..."
- KONTROVERSI: "Jujur, [pendapat umum] itu bohong besar."
- STORY OPEN: "3 tahun lalu aku [situasi buruk], sekarang [hasil luar biasa]"
- CHALLENGE: "Coba [aksi sederhana] selama 7 hari, hasilnya bikin kaget"
- RELATABLE PAIN: "Pernah ngerasa [masalah spesifik]? Ini bukan salah kamu."
- SECRET REVEAL: "Hal yang [orang sukses/ahli] tidak pernah ceritain..."
- URGENCY: "Kalau kamu masih [kebiasaan buruk], berhenti sekarang sebelum..."

ATURAN:
- Bahasa Indonesia gaul, Gen Z
- Max 2 kalimat per hook
- Kalimat pertama WAJIB bikin penasaran/kaget
- DILARANG: "guys", "kalian", "teman-teman", "hai semua"
- Setiap hook harus berbeda formula

Format output (HANYA nomor + hook, tanpa label formula):
1. [hook]
2. [hook]
...sampai 10`,
        }),
      });
      const data = await res.json();
      const text = data.result || "";
      const lines = text
        .split("\n")
        .filter((l: string) => /^\d+\./.test(l.trim()))
        .map((l: string) => l.replace(/^\d+\.\s*/, "").trim());
      setHooks(lines.length > 0 ? lines : [text]);
    } catch {
      setHooks(["❌ Gagal connect ke server."]);
    } finally {
      setLoading(false);
    }
  }

  async function copyHook(idx: number, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(-1), 2000);
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-purple-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-fuchsia-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/tiktok" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎬 TikTok</a>
          <a href="/repurpose" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🔁 Repurpose</a>
          <a href="/objection" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">😤 Objection</a>
          <a href="/hook" className="px-4 py-2 rounded-xl bg-purple-500/30 border border-purple-500/40">🔥 Hook Library</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">🔥 Hook Library Generator</h1>
          <p className="text-white/60 mt-2">Generate 10 hook pembuka konten viral sekaligus — bikin orang stop scroll!</p>
        </div>

        {/* INPUT */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5">

          <div>
            <label className="text-white/60 text-sm mb-2 block">Topik konten</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: cara hemat uang di usia 20an..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/30" />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Niche (opsional)</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button key={n} onClick={() => setNiche(niche === n ? "" : n)}
                  className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                    niche === n ? "bg-purple-500 text-white" : "bg-white/10 hover:bg-white/20 text-white/70"
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Tipe hook</label>
            <div className="flex flex-wrap gap-2">
              {HOOK_TYPES.map((h) => (
                <button key={h.id} onClick={() => setHookType(h.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    hookType === h.id ? "bg-purple-500 text-white" : "bg-white/10 hover:bg-white/20 text-white/70"
                  }`}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button onClick={generate} disabled={loading}
              className="px-6 py-3 rounded-xl font-bold bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "🔥 Generate 10 Hook"}
            </button>
            <button onClick={() => { setTopic(""); setHooks([]); setNiche(""); }}
              className="px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-500">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* OUTPUT */}
        {hooks.length > 0 && (
          <div className="mt-8 grid md:grid-cols-2 gap-3">
            {hooks.map((h, i) => (
              <div key={i}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-start gap-3 hover:bg-white/10 transition-all">
                <span className="text-purple-400 font-black text-lg min-w-[28px]">{i + 1}</span>
                <p className="text-white/90 text-sm leading-relaxed flex-1">{h}</p>
                <button onClick={() => copyHook(i, h)}
                  className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-xs text-purple-300 shrink-0">
                  {copied === i ? "✅" : "📋"}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}