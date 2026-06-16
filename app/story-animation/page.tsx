"use client";

import { useState } from "react";

const GENRES = [
  { id: "motivasi", label: "💪 Motivasi" },
  { id: "dongeng", label: "🧚 Dongeng / Fabel" },
  { id: "sejarah", label: "🏛️ Sejarah" },
  { id: "edukasi", label: "📚 Edukasi" },
  { id: "horror", label: "👻 Horror" },
  { id: "komedi", label: "😂 Komedi" },
  { id: "romance", label: "💕 Romance" },
  { id: "bisnis", label: "💼 Bisnis / Inspirasi" },
];

const STYLES = [
  { id: "2d", label: "🎨 2D Animasi" },
  { id: "cartoon", label: "🐱 Kartun" },
  { id: "cinematic", label: "🎬 Sinematik" },
  { id: "whiteboard", label: "✏️ Whiteboard" },
];

const DURATIONS = [
  { id: "60", label: "⚡ 1 Menit" },
  { id: "120", label: "🎬 2 Menit" },
  { id: "180", label: "📱 3 Menit" },
];

type Result = {
  judul: string;
  sinopsis: string;
  storyboard: string;
  narasi: string;
  musikMood: string;
  caption: string;
  hashtags: string;
};

export default function StoryAnimationPage() {
  const [topic, setTopic] = useState("");
  const [genre, setGenre] = useState("motivasi");
  const [style, setStyle] = useState("2d");
  const [duration, setDuration] = useState("60");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sinopsis" | "storyboard" | "narasi" | "caption">("sinopsis");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);

    const genreLabel = GENRES.find(g => g.id === genre)?.label || genre;
    const styleLabel = STYLES.find(s => s.id === style)?.label || style;
    const durationLabel = DURATIONS.find(d => d.id === duration)?.label || duration;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "story",
          prompt: `Kamu adalah penulis cerita animasi profesional Indonesia.

Buat cerita animasi lengkap untuk:
- Topik/Ide: "${topic}"
- Genre: ${genreLabel}
- Style Animasi: ${styleLabel}
- Durasi: ${durationLabel}

Buat PERSIS dalam format JSON berikut (tidak ada teks lain di luar JSON):
{
  "judul": "Judul cerita animasi yang menarik dan memorable, max 8 kata",
  "sinopsis": "Sinopsis cerita 3-4 paragraf. Perkenalkan tokoh, konflik, dan resolusi. Tulis dengan menarik seperti blurb film.",
  "storyboard": "Storyboard scene per scene dengan deskripsi visual detail. Format: 'ACT 1 - PEMBUKA:\\nSCENE 1 (00:00-00:15): [visual detail]\\n\\nACT 2 - KONFLIK:\\nSCENE 2 (00:15-00:45): [visual detail]\\n\\nACT 3 - RESOLUSI:\\nSCENE 3 (00:45-01:00): [visual detail]'",
  "narasi": "Narasi/voice over lengkap untuk semua scene. Bahasa Indonesia yang mengalir, emosional, dan engaging sesuai genre.",
  "musikMood": "Rekomendasi musik latar: mood, genre, tempo, dan contoh lagu referensi Indonesia yang cocok.",
  "caption": "Caption untuk upload di sosmed. Mulai dengan hook kuat, ceritakan sedikit tentang animasi, akhiri dengan CTA. Max 150 kata.",
  "hashtags": "20 hashtag relevan campuran populer dan niche. Format: #tag1 #tag2 dst"
}

WAJIB: Hanya return JSON valid, tidak ada teks lain.`,
        }),
      });

      const data = await res.json();
      if (data.error) { alert("Error: " + data.error); return; }
      const clean = (data.result || "").replace(/```json|```/g, "").trim();
      const parsed: Result = JSON.parse(clean);
      setResult(parsed);
      setActiveTab("sinopsis");
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

  const tabs = [
    { key: "sinopsis", label: "📖 Sinopsis" },
    { key: "storyboard", label: "🎬 Storyboard" },
    { key: "narasi", label: "🎙️ Narasi" },
    { key: "caption", label: "📝 Caption" },
  ] as const;

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#080510] via-[#0f0820] to-[#050310]" />
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-amber-700 blur-[160px] rounded-full absolute top-[-150px] left-[-150px]" />
        <div className="w-[500px] h-[500px] bg-orange-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-100px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
          <a href="/" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🏠 Dashboard</a>
          <a href="/video-animation" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🎬 Video Animation</a>
          <a href="/character-animation" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🎭 Character</a>
          <a href="/story-animation" className="px-3 py-2 rounded-xl bg-amber-600/40 border border-amber-500/40 text-sm font-bold">📖 Story Animation</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-amber-900/40 to-orange-800/20 backdrop-blur-xl border border-amber-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">📖</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Story Animation</h1>
              <p className="text-amber-300/70 text-sm">Ubah cerita menjadi video animasi lengkap dengan narasi</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {["Sinopsis Cerita", "Storyboard Scene", "Narasi Lengkap", "Caption + Hashtag"].map(f => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">✓ {f}</span>
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5 mb-6">

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Topik / Ide Cerita *</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Seorang pedagang kaki lima yang gigih akhirnya sukses, Kisah semut dan belalang versi modern..."
              className="w-full h-28 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/25 focus:border-amber-500/50 transition-colors text-sm" />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Genre Cerita</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g.id} onClick={() => setGenre(g.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${genre === g.id ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30" : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block font-medium">Style Animasi</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={`px-3 py-2 rounded-xl text-sm transition-all ${style === s.id ? "bg-orange-500 text-white font-bold" : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block font-medium">Durasi</label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button key={d.id} onClick={() => setDuration(d.id)}
                    className={`flex-1 py-2 rounded-xl text-sm transition-all ${duration === d.id ? "bg-amber-600 text-white font-bold" : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={generate} disabled={loading || !topic.trim()}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Generating...</> : "📖 Generate Story Animation"}
            </button>
            <button onClick={() => { setTopic(""); setResult(null); }}
              className="px-5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/20 text-sm font-medium transition-all">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-amber-500/20 overflow-hidden">

            {/* Judul */}
            <div className="p-5 border-b border-white/10 bg-amber-900/20">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <p className="text-white/50 text-xs mb-1">📖 Judul Cerita</p>
                  <h2 className="font-black text-xl text-white">{result.judul}</h2>
                </div>
                <button onClick={() => copy("judul", result.judul)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-xs font-semibold border border-amber-500/30 flex-shrink-0">
                  {copiedKey === "judul" ? "✅" : "📋"}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-all whitespace-nowrap px-3 ${activeTab === tab.key ? "bg-amber-600/30 text-amber-300 border-b-2 border-amber-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "sinopsis" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-amber-400 font-bold">📖 Sinopsis Cerita</h3>
                    <button onClick={() => copy("sinopsis", result.sinopsis)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-sm font-semibold border border-amber-500/30">
                      {copiedKey === "sinopsis" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.sinopsis}</pre>
                  </div>
                  <div className="mt-4 p-4 rounded-2xl bg-amber-900/20 border border-amber-500/20">
                    <p className="text-amber-300 text-xs font-semibold mb-1">🎵 Rekomendasi Musik</p>
                    <p className="text-white/60 text-sm">{result.musikMood}</p>
                  </div>
                </div>
              )}

              {activeTab === "storyboard" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-amber-400 font-bold">🎬 Storyboard Scene</h3>
                    <button onClick={() => copy("storyboard", result.storyboard)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-sm font-semibold border border-amber-500/30">
                      {copiedKey === "storyboard" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.storyboard}</pre>
                  </div>
                </div>
              )}

              {activeTab === "narasi" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-amber-400 font-bold">🎙️ Narasi / Voice Over</h3>
                    <button onClick={() => copy("narasi", result.narasi)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-sm font-semibold border border-amber-500/30">
                      {copiedKey === "narasi" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.narasi}</pre>
                  </div>
                </div>
              )}

              {activeTab === "caption" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-amber-400 font-bold">📝 Caption</h3>
                      <button onClick={() => copy("caption", result.caption)}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-sm font-semibold border border-amber-500/30">
                        {copiedKey === "caption" ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                      <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.caption}</pre>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-amber-400 font-bold">#️⃣ Hashtag</h3>
                      <button onClick={() => copy("hashtags", result.hashtags)}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-sm font-semibold border border-amber-500/30">
                        {copiedKey === "hashtags" ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.split(" ").filter(h => h.startsWith("#")).map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-sm font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              <button onClick={() => copy("all", `JUDUL:\n${result.judul}\n\nSINOPSIS:\n${result.sinopsis}\n\nSTORYBOARD:\n${result.storyboard}\n\nNARASI:\n${result.narasi}\n\nMUSIK:\n${result.musikMood}\n\nCAPTION:\n${result.caption}\n\nHASHTAGS:\n${result.hashtags}`)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-700/40 to-orange-600/40 hover:from-amber-600/60 hover:to-orange-500/60 border border-amber-500/30 font-bold text-sm transition-all">
                {copiedKey === "all" ? "✅ Semua Berhasil di-Copy!" : "📋 Copy Semua Sekaligus"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-white/5 text-center text-white/20 text-xs">
          📖 Story Animation — Bagian dari AI Content Suite 🇮🇩
        </div>
      </div>
    </main>
  );
}