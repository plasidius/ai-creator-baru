"use client";

import { useState } from "react";

const CHAR_STYLES = [
  { id: "anime", label: "🎌 Anime", desc: "Gaya Jepang" },
  { id: "cartoon", label: "🎨 Kartun", desc: "Colorful & fun" },
  { id: "realistic", label: "👤 Realistis", desc: "Semi foto" },
  { id: "chibi", label: "🧸 Chibi", desc: "Lucu & mini" },
  { id: "pixel", label: "👾 Pixel Art", desc: "Retro gaming" },
  { id: "3d", label: "💎 3D", desc: "Modern 3D" },
];

const ACTIONS = [
  "💬 Berbicara", "👋 Melambai", "💃 Menari", "🏃 Berlari",
  "😄 Tertawa", "🤔 Berpikir", "👍 Jempol", "🎉 Merayakan",
];

export default function CharacterAnimation() {
  const [charDesc, setCharDesc] = useState("");
  const [charStyle, setCharStyle] = useState("anime");
  const [action, setAction] = useState("💬 Berbicara");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!charDesc) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Kamu adalah animator karakter profesional dan AI art director.
Deskripsi karakter: "${charDesc}"
Gaya visual: ${charStyle}
Aksi/gerakan: ${action}

Berikan panduan lengkap:

1. PROMPT GENERATE KARAKTER (untuk Midjourney / DALL-E / Stable Diffusion):
   - Prompt lengkap bahasa Inggris untuk membuat karakter
   - Negative prompt (apa yang harus dihindari)

2. PROMPT ANIMASI KARAKTER:
   - Prompt untuk Runway ML (animate karakter)
   - Prompt untuk Kling AI
   - Prompt untuk Viggle AI (khusus dance/movement)

3. TOOLS GRATIS YANG BISA DIPAKAI:
   - List tools animasi karakter gratis
   - Step by step cara pakainya

4. SCRIPT UNTUK KARAKTER:
   - Kalau karakter ini mau bicara, apa yang sebaiknya dia katakan
   - Voice style yang cocok

5. PENGGUNAAN KONTEN:
   - Platform terbaik untuk posting karakter ini
   - Format video yang direkomendasikan`,
        }),
      });
      const data = await res.json();
      setResult(data.result || "Gagal generate.");
    } catch { setResult("❌ Error."); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-amber-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-orange-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/character-animation" className="px-4 py-2 rounded-xl bg-amber-500/30 border border-amber-500/40">🎭 Character Animation</a>
        </div>

        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">🎭 Character Animation</h1>
          <p className="text-white/60 mt-2">Buat karakter kartun/anime bergerak dari prompt — AI prompts + tools gratis</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-2 block">Deskripsi karakter</label>
              <textarea value={charDesc} onChange={(e) => setCharDesc(e.target.value)}
                placeholder="Contoh: Gadis muda berambut merah, mata biru, pakai hoodie hitam, ekspresi ceria dan energik..."
                className="w-full h-36 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-3 block">Gaya Visual</label>
              <div className="grid grid-cols-3 gap-2">
                {CHAR_STYLES.map((s) => (
                  <button key={s.id} onClick={() => setCharStyle(s.id)}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      charStyle === s.id ? "bg-amber-500/40 border-amber-400" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    <div className="font-bold text-sm">{s.label}</div>
                    <div className="text-xs text-white/50">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-3 block">Aksi Karakter</label>
              <div className="flex flex-wrap gap-2">
                {ACTIONS.map((a) => (
                  <button key={a} onClick={() => setAction(a)}
                    className={`px-3 py-2 rounded-xl text-sm transition-all border ${
                      action === a ? "bg-amber-500 border-amber-400" : "bg-white/10 border-white/10 hover:bg-white/20"
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={loading || !charDesc}
              className="w-full py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "🎭 Generate Character Guide"}
            </button>
          </div>

          {result && (
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-amber-400 font-bold text-lg">🎭 Panduan Karakter</h2>
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-sm text-amber-300 border border-amber-500/30">
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed max-h-[650px] overflow-y-auto">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}