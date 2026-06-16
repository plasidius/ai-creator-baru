"use client";

import { useState } from "react";

const VIDEO_STYLES = [
  { id: "cinematic", label: "🎬 Sinematik", desc: "Film pendek dramatis" },
  { id: "documentary", label: "📹 Dokumenter", desc: "Narasi faktual" },
  { id: "vlog", label: "🤳 Vlog", desc: "Personal, candid" },
  { id: "explainer", label: "💡 Explainer", desc: "Animasi edukatif" },
  { id: "promo", label: "🔥 Promo", desc: "Iklan produk viral" },
];

const DURATIONS = ["15 detik", "30 detik", "60 detik"];

export default function TextToVideo() {
  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [duration, setDuration] = useState("30 detik");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!idea) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "voicescript",
          prompt: `Kamu adalah sutradara video AI profesional.
Ide video: "${idea}"
Gaya: ${style}
Durasi: ${duration}

Buat panduan produksi video lengkap:

1. SCENE BREAKDOWN (per 5 detik):
   Deskripsikan setiap adegan secara visual

2. AI VIDEO PROMPTS:
   Prompt siap pakai untuk: Runway ML, Kling AI, Pika Labs
   (minimal 3 prompt berbeda untuk variasi)

3. NARASI / VOICE OVER:
   Script narasi yang pas dengan timing

4. MUSIK & MOOD:
   Rekomendasi genre musik + mood yang sesuai

5. EDITING FLOW:
   Urutan klip, transisi, text overlay

6. THUMBNAIL PROMPT:
   Prompt untuk generate thumbnail menarik`,
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
        <div className="w-[500px] h-[500px] bg-violet-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-purple-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/text-to-video" className="px-4 py-2 rounded-xl bg-violet-500/30 border border-violet-500/40">✨ Text to Video</a>
        </div>

        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">✨ Text to Video</h1>
          <p className="text-white/60 mt-2">Ketik ide → dapat scene breakdown + AI prompt + script siap produksi</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-2 block">Ide video kamu</label>
              <textarea value={idea} onChange={(e) => setIdea(e.target.value)}
                placeholder="Contoh: Video tentang seorang pemuda yang mulai bisnis online dari nol dan berhasil dalam 30 hari..."
                className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-3 block">Gaya Video</label>
              <div className="space-y-2">
                {VIDEO_STYLES.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all border ${
                      style === s.id ? "bg-violet-500/30 border-violet-500/50" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    <span className="font-bold">{s.label}</span>
                    <span className="text-white/50 text-sm">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-3 block">Durasi</label>
              <div className="flex gap-3">
                {DURATIONS.map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${
                      duration === d ? "bg-violet-500 border-violet-400" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={loading || !idea}
              className="w-full py-3 rounded-xl font-bold bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "✨ Generate Video Plan"}
            </button>
          </div>

          {result && (
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-violet-400 font-bold text-lg">✨ Video Production Plan</h2>
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="px-4 py-2 rounded-xl bg-violet-500/20 text-sm text-violet-300 border border-violet-500/30">
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed max-h-[700px] overflow-y-auto">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}