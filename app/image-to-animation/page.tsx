"use client";

import { useState, useRef } from "react";

const ANIMATION_TYPES = [
  { id: "parallax", label: "🎞️ Parallax", desc: "Efek kedalaman 3D" },
  { id: "zoom", label: "🔍 Zoom In/Out", desc: "Dramatis & sinematik" },
  { id: "float", label: "🌊 Float", desc: "Mengambang lembut" },
  { id: "shake", label: "⚡ Shake", desc: "Energik, hype" },
  { id: "glitch", label: "👾 Glitch", desc: "Efek digital error" },
  { id: "fade", label: "✨ Fade Reveal", desc: "Muncul perlahan" },
];

export default function ImageToAnimation() {
  const [animType, setAnimType] = useState("parallax");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!description) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "idea",
          prompt: `Kamu adalah spesialis animasi foto/gambar untuk konten sosial media.
Deskripsi gambar: "${description}"
Efek animasi yang diinginkan: ${animType}

Berikan panduan lengkap:

1. PROMPT UNTUK AI ANIMATION TOOLS:
   - Prompt untuk CapCut AI (animasi foto)
   - Prompt untuk Runway ML (image to video)
   - Prompt untuk Pika Labs
   - Prompt untuk Kaiber AI

2. PANDUAN MANUAL (tanpa AI):
   - Cara buat efek ${animType} di CapCut (step by step)
   - Cara buat di Adobe Premiere / After Effects
   - Tips untuk hasil maksimal

3. CAPTION KONTEN:
   - Caption viral yang cocok untuk konten animasi ini
   - 10 hashtag relevan

4. MUSIK REKOMENDASI:
   - Jenis musik yang cocok dengan efek ${animType}`,
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
        <div className="w-[500px] h-[500px] bg-teal-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-green-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/image-to-animation" className="px-4 py-2 rounded-xl bg-teal-500/30 border border-teal-500/40">🖼️ Image to Animation</a>
        </div>

        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">🖼️ Image to Animation</h1>
          <p className="text-white/60 mt-2">Jadikan foto atau gambar statis bergerak — panduan lengkap + AI prompts</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-2 block">Deskripsi gambar kamu</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Foto produk skincare dengan background putih bersih, ada bunga di samping produk..."
                className="w-full h-36 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-3 block">Pilih Efek Animasi</label>
              <div className="grid grid-cols-2 gap-3">
                {ANIMATION_TYPES.map((a) => (
                  <button key={a.id} onClick={() => setAnimType(a.id)}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      animType === a.id ? "bg-teal-500/40 border-teal-400" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    <div className="font-bold text-sm">{a.label}</div>
                    <div className="text-xs text-white/50 mt-0.5">{a.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={loading || !description}
              className="w-full py-3 rounded-xl font-bold bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "🖼️ Generate Animation Guide"}
            </button>
          </div>

          {result && (
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-teal-400 font-bold text-lg">🖼️ Panduan Animasi</h2>
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="px-4 py-2 rounded-xl bg-teal-500/20 text-sm text-teal-300 border border-teal-500/30">
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed max-h-[600px] overflow-y-auto">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}