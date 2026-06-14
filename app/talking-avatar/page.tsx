"use client";

import { useState } from "react";

const AVATARS = [
  { id: "profesional", emoji: "👨‍💼", label: "Profesional" },
  { id: "casual", emoji: "😎", label: "Casual" },
  { id: "guru", emoji: "👩‍🏫", label: "Guru/Edukasi" },
  { id: "influencer", emoji: "🌟", label: "Influencer" },
  { id: "cartoon", emoji: "🧑‍🎨", label: "Kartun" },
];

export default function TalkingAvatar() {
  const [script, setScript] = useState("");
  const [avatar, setAvatar] = useState("profesional");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!script) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Kamu adalah direktur produksi video avatar AI.
Script yang akan dibacakan avatar: "${script}"
Tipe avatar: ${avatar}

Berikan panduan lengkap:

1. PROMPT AVATAR (untuk D-ID / HeyGen / Synthesia):
   - Deskripsi penampilan avatar yang cocok
   - Ekspresi wajah yang direkomendasikan
   - Gestur tangan

2. SCRIPT FINAL (sudah dioptimasi untuk TTS/avatar):
   - Tambahkan tanda baca untuk intonasi
   - Tandai bagian yang perlu penekanan dengan [TEGAS]
   - Tandai jeda dengan [PAUSE]

3. PANDUAN PRODUKSI:
   - Platform avatar AI yang disarankan (gratis/berbayar)
   - Setting suara yang cocok
   - Background yang sesuai

4. CAPTION & SUBTITLE:
   - Subtitle siap pakai per kalimat`,
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
        <div className="w-[500px] h-[500px] bg-cyan-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-blue-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/talking-avatar" className="px-4 py-2 rounded-xl bg-cyan-500/30 border border-cyan-500/40">🤖 Talking Avatar</a>
        </div>

        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">🤖 Talking Avatar</h1>
          <p className="text-white/60 mt-2">Avatar AI berbicara sesuai script kamu — panduan lengkap untuk D-ID, HeyGen, Synthesia</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-2 block">Script yang akan dibacakan avatar</label>
              <textarea value={script} onChange={(e) => setScript(e.target.value)}
                placeholder="Masukkan script yang mau dibacakan oleh avatar AI kamu..."
                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-3 block">Tipe Avatar</label>
              <div className="grid grid-cols-3 gap-3">
                {AVATARS.map((a) => (
                  <button key={a.id} onClick={() => setAvatar(a.id)}
                    className={`p-3 rounded-2xl text-center transition-all border ${
                      avatar === a.id ? "bg-cyan-500 border-cyan-400" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    <div className="text-3xl">{a.emoji}</div>
                    <div className="text-xs font-bold mt-1">{a.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={loading || !script}
              className="w-full py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "🤖 Generate Avatar Guide"}
            </button>
          </div>

          {result && (
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-cyan-400 font-bold text-lg">🤖 Panduan Avatar</h2>
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-sm text-cyan-300 border border-cyan-500/30">
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