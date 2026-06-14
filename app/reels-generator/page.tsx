"use client";

import { useState } from "react";

const STEPS = ["📝 Script", "🎙️ Voice Style", "🎬 Generate"];

export default function ReelsGenerator() {
  const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("energik");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const VOICE_STYLES = [
    { id: "energik", label: "⚡ Energik", desc: "Semangat, cepat, hype" },
    { id: "calm", label: "😌 Calm", desc: "Tenang, informatif" },
    { id: "lucu", label: "😂 Lucu", desc: "Santai, komedi" },
    { id: "serius", label: "🎯 Serius", desc: "Profesional, tegas" },
    { id: "storytelling", label: "📖 Storytelling", desc: "Cerita personal, emosional" },
  ];

  async function generateScript() {
    if (!prompt) return;
    setLoading(true);
    setScript("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Buat script Reels/TikTok viral untuk topik: "${prompt}"
Format:
[HOOK - 3 detik pertama yang bikin stop scroll]
[ISI - poin-poin utama, max 45 detik]
[CTA - ajakan di akhir]
Bahasa Indonesia gaul, to the point, tidak bertele-tele.`,
        }),
      });
      const data = await res.json();
      setScript(data.result || "Gagal generate.");
      setStep(1);
    } catch { setScript("❌ Error."); }
    finally { setLoading(false); }
  }

  async function generateReels() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Berikan panduan produksi video Reels lengkap untuk script berikut dengan gaya voice "${voiceStyle}":

Script: "${script}"

Berikan:
1. PANDUAN VOICE OVER — cara membaca script dengan gaya ${voiceStyle}
2. SARAN VISUAL — adegan/shot apa yang cocok per bagian script
3. MUSIK & SOUND — rekomendasi jenis musik background
4. EDITING TIPS — cut, transisi, text overlay yang viral
5. HASHTAG — 15 hashtag relevan Indonesia`,
        }),
      });
      const data = await res.json();
      setResult(data.result || "Gagal generate.");
      setStep(2);
    } catch { setResult("❌ Error."); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-pink-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-rose-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/tiktok" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎬 TikTok</a>
          <a href="/shorts" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">▶️ Shorts</a>
          <a href="/reels-generator" className="px-4 py-2 rounded-xl bg-pink-500/30 border border-pink-500/40">📱 Reels</a>
        </div>

        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">📱 Reels Video Generator</h1>
          <p className="text-white/60 mt-2">Script → Voice Guide → Visual Tips → Hashtag — semua dalam satu flow</p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              i === step ? "bg-pink-500 text-white" : i < step ? "bg-white/20 text-white/60" : "bg-white/5 text-white/30"
            }`}>
              {i < step ? "✅" : `${i + 1}.`} {s}
            </div>
          ))}
        </div>

        {/* STEP 0 - INPUT */}
        {step === 0 && (
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <label className="text-white/60 text-sm mb-2 block">Topik Reels kamu</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: 5 tips hemat uang ala Gen Z yang jarang orang tau..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />
            <button onClick={generateScript} disabled={loading || !prompt}
              className="mt-4 px-6 py-3 rounded-xl font-bold bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "📝 Generate Script →"}
            </button>
          </div>
        )}

        {/* STEP 1 - VOICE STYLE */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-pink-400 font-bold">📝 Script Generated</h2>
                <button onClick={() => { navigator.clipboard.writeText(script); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="px-3 py-1 rounded-lg bg-pink-500/20 text-sm text-pink-300">
                  {copied ? "✅ Copied" : "📋 Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed">{script}</pre>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h2 className="text-pink-400 font-bold mb-4">🎙️ Pilih Gaya Voice</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {VOICE_STYLES.map((v) => (
                  <button key={v.id} onClick={() => setVoiceStyle(v.id)}
                    className={`p-3 rounded-2xl text-left transition-all ${
                      voiceStyle === v.id ? "bg-pink-500 border-pink-400" : "bg-white/5 border-white/10 hover:bg-white/10"
                    } border`}>
                    <div className="font-bold text-sm">{v.label}</div>
                    <div className="text-xs text-white/50 mt-1">{v.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(0)} className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20">← Back</button>
                <button onClick={generateReels} disabled={loading}
                  className="px-6 py-3 rounded-xl font-bold bg-pink-500 hover:bg-pink-600 disabled:opacity-50">
                  {loading ? "⏳ Generating..." : "🎬 Generate Panduan →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 - RESULT */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-pink-400 font-bold text-lg">🎬 Panduan Produksi Reels</h2>
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="px-4 py-2 rounded-xl bg-pink-500/20 text-sm text-pink-300 border border-pink-500/30">
                  {copied ? "✅ Copied!" : "📋 Copy Semua"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed">{result}</pre>
            </div>
            <button onClick={() => { setStep(0); setScript(""); setResult(""); setPrompt(""); }}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20">
              🔄 Buat Reels Baru
            </button>
          </div>
        )}
      </div>
    </main>
  );
}