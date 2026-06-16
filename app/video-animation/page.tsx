"use client";

import { useState } from "react";

const STYLES = [
  { id: "2d", label: "🎨 2D Animasi" },
  { id: "3d", label: "🎭 3D Cinematic" },
  { id: "whiteboard", label: "✏️ Whiteboard" },
  { id: "motion", label: "⚡ Motion Graphics" },
  { id: "cartoon", label: "🐱 Kartun" },
  { id: "realistic", label: "🎬 Realistik" },
];

const DURATIONS = [
  { id: "15", label: "⚡ 15 detik" },
  { id: "30", label: "🎬 30 detik" },
  { id: "60", label: "📱 60 detik" },
];

type Result = {
  judul: string;
  storyboard: string;
  voiceScript: string;
  musicMood: string;
  caption: string;
  hashtags: string;
};

export default function VideoAnimationPage() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("2d");
  const [duration, setDuration] = useState("30");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"storyboard" | "voice" | "caption">("storyboard");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);

    const styleLabel = STYLES.find(s => s.id === style)?.label || style;
    const durationLabel = DURATIONS.find(d => d.id === duration)?.label || duration;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "voicescript",
          prompt: `Kamu adalah produser video animasi profesional Indonesia.

Buat paket konten AI Video Animation untuk:
- Topik: "${topic}"
- Style: ${styleLabel}
- Durasi: ${durationLabel}

Buat PERSIS dalam format JSON berikut (tidak ada teks lain di luar JSON):
{
  "judul": "Judul video animasi yang menarik max 10 kata",
  "storyboard": "Storyboard detail scene per scene. Format: 'SCENE 1 (00:00-00:05): [deskripsi visual detail]\\nSCENE 2 (00:05-00:15): [deskripsi visual detail]' dst. Jelaskan gerakan, warna, efek animasi.",
  "voiceScript": "Script narasi/voice over lengkap sesuai durasi. Natural, engaging, bahasa Indonesia.",
  "musicMood": "Rekomendasi mood dan genre musik yang cocok untuk animasi ini.",
  "caption": "Caption untuk upload di sosmed. Engaging dengan hook dan CTA. Max 150 kata.",
  "hashtags": "20 hashtag relevan. Format: #tag1 #tag2 dst"
}

WAJIB: Hanya return JSON valid, tidak ada teks lain.`,
        }),
      });

      const data = await res.json();
      if (data.error) { alert("Error: " + data.error); return; }
      const clean = (data.result || "").replace(/```json|```/g, "").trim();
      const parsed: Result = JSON.parse(clean);
      setResult(parsed);
      setActiveTab("storyboard");
    } catch (e) {
      alert("Gagal generate. Coba lagi.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copy(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#08030f] via-[#120820] to-[#050310]" />
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-violet-700 blur-[160px] rounded-full absolute top-[-150px] left-[-150px]" />
        <div className="w-[500px] h-[500px] bg-purple-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-100px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto">

        <div className="mb-8 flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
          <a href="/" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🏠 Dashboard</a>
          <a href="/tiktok" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🎬 TikTok</a>
          <a href="/reels-generator" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">📱 Reels</a>
          <a href="/video-animation" className="px-3 py-2 rounded-xl bg-violet-600/40 border border-violet-500/40 text-sm font-bold">🎬 Video Animation</a>
        </div>

        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-violet-900/40 to-purple-800/20 backdrop-blur-xl border border-violet-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/30">🎬</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">AI Video Animation</h1>
              <p className="text-violet-300/70 text-sm">Ubah script menjadi video animasi otomatis dengan AI</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {["Storyboard Detail", "Script Narasi", "Panduan Musik", "Caption + Hashtag"].map(f => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">✓ {f}</span>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5 mb-6">
          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Topik / Ide Video *</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="Contoh: Cara kerja AI, Sejarah batik Indonesia, Tips investasi pemula..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/25 focus:border-violet-500/50 transition-colors" />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Style Animasi</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${style === s.id ? "bg-violet-500 text-white font-bold shadow-lg shadow-violet-500/30" : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Durasi Video</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d.id} onClick={() => setDuration(d.id)}
                  className={`flex-1 py-2 rounded-xl text-sm transition-all ${duration === d.id ? "bg-purple-500 text-white font-bold" : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={generate} disabled={loading || !topic.trim()}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30 transition-all flex items-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</> : "🎬 Generate Video Animation"}
            </button>
            <button onClick={() => { setTopic(""); setResult(null); }}
              className="px-5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/20 text-sm font-medium transition-all">
              🗑 Clear
            </button>
          </div>
        </div>

        {result && (
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-violet-500/20 overflow-hidden">
            <div className="p-5 border-b border-white/10 bg-violet-900/20">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <p className="text-white/50 text-xs mb-1">🎬 Judul Video</p>
                  <h2 className="font-black text-lg text-white">{result.judul}</h2>
                </div>
                <button onClick={() => copy("judul", result.judul)}
                  className="px-3 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-xs font-semibold border border-violet-500/30 flex-shrink-0">
                  {copiedKey === "judul" ? "✅" : "📋"}
                </button>
              </div>
            </div>

            <div className="flex border-b border-white/10">
              {([["storyboard", "🎬 Storyboard"], ["voice", "🎙️ Script Narasi"], ["caption", "📝 Caption"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-all ${activeTab === key ? "bg-violet-600/30 text-violet-300 border-b-2 border-violet-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "storyboard" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-violet-400 font-bold">🎬 Storyboard & Scene</h3>
                    <button onClick={() => copy("storyboard", result.storyboard)}
                      className="px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-sm font-semibold border border-violet-500/30">
                      {copiedKey === "storyboard" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.storyboard}</pre>
                  </div>
                  <div className="mt-4 p-4 rounded-2xl bg-violet-900/20 border border-violet-500/20">
                    <p className="text-violet-300 text-xs font-semibold mb-1">🎵 Rekomendasi Musik</p>
                    <p className="text-white/60 text-sm">{result.musicMood}</p>
                  </div>
                </div>
              )}
              {activeTab === "voice" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-violet-400 font-bold">🎙️ Script Narasi</h3>
                    <button onClick={() => copy("voice", result.voiceScript)}
                      className="px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-sm font-semibold border border-violet-500/30">
                      {copiedKey === "voice" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.voiceScript}</pre>
                  </div>
                </div>
              )}
              {activeTab === "caption" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-violet-400 font-bold">📝 Caption</h3>
                      <button onClick={() => copy("caption", result.caption)}
                        className="px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-sm font-semibold border border-violet-500/30">
                        {copiedKey === "caption" ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                      <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.caption}</pre>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-violet-400 font-bold">#️⃣ Hashtag</h3>
                      <button onClick={() => copy("hashtags", result.hashtags)}
                        className="px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-sm font-semibold border border-violet-500/30">
                        {copiedKey === "hashtags" ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.split(" ").filter(h => h.startsWith("#")).map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-sm font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              <button onClick={() => copy("all", `JUDUL:\n${result.judul}\n\nSTORYBOARD:\n${result.storyboard}\n\nSCRIPT NARASI:\n${result.voiceScript}\n\nMUSIK:\n${result.musicMood}\n\nCAPTION:\n${result.caption}\n\nHASHTAGS:\n${result.hashtags}`)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-700/40 to-purple-600/40 hover:from-violet-600/60 hover:to-purple-500/60 border border-violet-500/30 font-bold text-sm transition-all">
                {copiedKey === "all" ? "✅ Semua Berhasil di-Copy!" : "📋 Copy Semua Sekaligus"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-white/5 text-center text-white/20 text-xs">
          🎬 AI Video Animation — Bagian dari AI Content Suite 🇮🇩
        </div>
      </div>
    </main>
  );
}