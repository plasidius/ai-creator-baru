"use client";

import { useState } from "react";

const STYLES = [
  { id: "motivasi", label: "💪 Motivasi" },
  { id: "edukasi", label: "📚 Edukasi" },
  { id: "jualan", label: "🛒 Jualan / Promo" },
  { id: "cerita", label: "📖 Cerita / Storytelling" },
  { id: "tips", label: "💡 Tips & Trik" },
  { id: "hiburan", label: "😂 Hiburan" },
];

const DURATIONS = [
  { id: "15", label: "⚡ 15 detik" },
  { id: "30", label: "🎬 30 detik" },
  { id: "60", label: "📱 60 detik" },
];

const VISUALS = [
  { id: "slideshow", label: "🖼️ Slideshow Gambar" },
  { id: "teks", label: "✍️ Teks Animasi" },
  { id: "infografis", label: "📊 Infografis" },
  { id: "cinematic", label: "🎥 Sinematik" },
];

type Result = {
  judul: string;
  script: string;
  visualDesc: string;
  musicMood: string;
  caption: string;
  hashtags: string;
};

export default function VoiceToVideoPage() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("motivasi");
  const [duration, setDuration] = useState("30");
  const [visual, setVisual] = useState("teks");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"script" | "visual" | "caption">("script");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);

    const styleLabel = STYLES.find((s) => s.id === style)?.label || style;
    const durationLabel = DURATIONS.find((d) => d.id === duration)?.label || duration;
    const visualLabel = VISUALS.find((v) => v.id === visual)?.label || visual;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "voicescript",
          prompt: `Kamu adalah produser konten video profesional Indonesia.

Buat paket konten Voice to Video untuk:
- Topik: "${topic}"
- Gaya: ${styleLabel}
- Durasi: ${durationLabel}
- Style visual: ${visualLabel}

Buat PERSIS dalam format JSON berikut (tidak ada teks lain di luar JSON):
{
  "judul": "Judul video yang menarik dan SEO friendly, max 10 kata",
  "script": "Script voice over lengkap sesuai durasi. Tulis natural seperti orang bicara, bukan membaca. Tandai jeda dengan [JEDA]. Tandai penekanan dengan *kata*. Bahasa Indonesia gaul tapi profesional.",
  "visualDesc": "Deskripsi detail visual untuk setiap bagian video. Format: '00:00-00:05: [deskripsi visual]\\n00:05-00:10: [deskripsi visual]' dst sesuai durasi. Jelaskan warna, gerakan, teks overlay yang muncul.",
  "musicMood": "Rekomendasi mood musik latar yang cocok beserta contoh genre atau nama lagu referensi Indonesia",
  "caption": "Caption untuk upload video di sosmed. Engaging, ada hook, ada CTA. Max 150 kata.",
  "hashtags": "20 hashtag relevan untuk video ini. Format: #tag1 #tag2 dst"
}

WAJIB: Hanya return JSON valid, tidak ada penjelasan, tidak ada markdown backtick.`,
        }),
      });

      const data = await res.json();
      if (data.error) { alert("Error: " + data.error); return; }
      const clean = (data.result || "").replace(/```json|```/g, "").trim();
      const parsed: Result = JSON.parse(clean);
      setResult(parsed);
      setActiveTab("script");
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
    { key: "script", label: "🎙️ Script VO" },
    { key: "visual", label: "🎬 Panduan Visual" },
    { key: "caption", label: "📝 Caption & Hashtag" },
  ] as const;

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#030a0a] via-[#001a10] to-[#020f08]" />
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-emerald-700 blur-[160px] rounded-full absolute top-[-150px] left-[-150px]" />
        <div className="w-[500px] h-[500px] bg-teal-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-100px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
          <a href="/" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🏠 Dashboard</a>
          <a href="/tiktok" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🎬 TikTok</a>
          <a href="/reels-generator" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">📱 Reels</a>
          <a href="/trending" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">📈 Trending</a>
          <a href="/voice-to-video" className="px-3 py-2 rounded-xl bg-emerald-600/40 border border-emerald-500/40 text-sm font-bold">🎙️ Voice to Video</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-emerald-900/40 to-teal-800/20 backdrop-blur-xl border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
              🎙️
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Voice to Video</h1>
              <p className="text-emerald-300/70 text-sm">Upload suara → AI buat script + panduan visual + caption otomatis</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {["Script Voice Over", "Panduan Visual", "Timeline Shot", "Caption + Hashtag"].map((f) => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5 mb-6">

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Topik / Ide Video *</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="Contoh: Tips hemat uang untuk anak kost, Review produk skincare murah..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/25 focus:border-emerald-500/50 transition-colors" />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Gaya Konten</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${style === s.id ? "bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30" : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block font-medium">Durasi Video</label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button key={d.id} onClick={() => setDuration(d.id)}
                    className={`flex-1 py-2 rounded-xl text-sm transition-all ${duration === d.id ? "bg-teal-500 text-white font-bold" : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block font-medium">Style Visual</label>
              <div className="flex flex-wrap gap-2">
                {VISUALS.map((v) => (
                  <button key={v.id} onClick={() => setVisual(v.id)}
                    className={`px-3 py-2 rounded-xl text-sm transition-all ${visual === v.id ? "bg-emerald-600 text-white font-bold" : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"}`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={generate} disabled={loading || !topic.trim()}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
              ) : "🎙️ Generate Konten Video"}
            </button>
            <button onClick={() => { setTopic(""); setResult(null); }}
              className="px-5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/20 text-sm font-medium transition-all">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-emerald-500/20 overflow-hidden">

            {/* Judul */}
            <div className="p-5 border-b border-white/10 bg-emerald-900/20">
              <p className="text-white/50 text-xs mb-1">🎬 Judul Video</p>
              <div className="flex justify-between items-center gap-3">
                <h2 className="font-black text-lg text-white">{result.judul}</h2>
                <button onClick={() => copy("judul", result.judul)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-xs font-semibold border border-emerald-500/30 flex-shrink-0">
                  {copiedKey === "judul" ? "✅" : "📋"}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-all ${activeTab === tab.key ? "bg-emerald-600/30 text-emerald-300 border-b-2 border-emerald-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "script" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-emerald-400 font-bold">🎙️ Script Voice Over</h3>
                      <p className="text-white/30 text-xs mt-0.5">*kata* = penekanan | [JEDA] = berhenti sebentar</p>
                    </div>
                    <button onClick={() => copy("script", result.script)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-sm font-semibold border border-emerald-500/30">
                      {copiedKey === "script" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.script}</pre>
                  </div>
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-900/20 border border-emerald-500/20">
                    <p className="text-emerald-300 text-xs font-semibold mb-1">🎵 Rekomendasi Musik Latar</p>
                    <p className="text-white/60 text-sm">{result.musicMood}</p>
                  </div>
                </div>
              )}

              {activeTab === "visual" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-emerald-400 font-bold">🎬 Panduan Visual & Timeline</h3>
                    <button onClick={() => copy("visual", result.visualDesc)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-sm font-semibold border border-emerald-500/30">
                      {copiedKey === "visual" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.visualDesc}</pre>
                  </div>
                  <p className="text-white/30 text-xs mt-3">💡 Gunakan panduan ini saat editing di CapCut, VN, atau Adobe Premiere</p>
                </div>
              )}

              {activeTab === "caption" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-emerald-400 font-bold">📝 Caption</h3>
                      <button onClick={() => copy("caption", result.caption)}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-sm font-semibold border border-emerald-500/30">
                        {copiedKey === "caption" ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                      <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.caption}</pre>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-emerald-400 font-bold">#️⃣ Hashtag</h3>
                      <button onClick={() => copy("hashtags", result.hashtags)}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-sm font-semibold border border-emerald-500/30">
                        {copiedKey === "hashtags" ? "✅ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.split(" ").filter(h => h.startsWith("#")).map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              <button onClick={() => copy("all", `JUDUL:\n${result.judul}\n\nSCRIPT VOICE OVER:\n${result.script}\n\nPANDUAN VISUAL:\n${result.visualDesc}\n\nMUSIK:\n${result.musicMood}\n\nCAPTION:\n${result.caption}\n\nHASHTAGS:\n${result.hashtags}`)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-700/40 to-teal-600/40 hover:from-emerald-600/60 hover:to-teal-500/60 border border-emerald-500/30 font-bold text-sm transition-all">
                {copiedKey === "all" ? "✅ Semua Berhasil di-Copy!" : "📋 Copy Semua Sekaligus"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-white/5 text-center text-white/20 text-xs">
          🎙️ Voice to Video — Bagian dari AI Content Suite 🇮🇩
        </div>
      </div>
    </main>
  );
}