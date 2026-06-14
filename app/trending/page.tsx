"use client";

import { useState } from "react";

const PLATFORMS = [
  { id: "all", label: "🌐 Semua Platform" },
  { id: "tiktok", label: "🎵 TikTok" },
  { id: "instagram", label: "📸 Instagram" },
  { id: "youtube", label: "▶️ YouTube" },
  { id: "facebook", label: "📘 Facebook" },
];

const NICHES = [
  { id: "umum", label: "🌍 Umum / Viral" },
  { id: "jualan", label: "🛒 Jualan & Bisnis" },
  { id: "lifestyle", label: "✨ Lifestyle" },
  { id: "kuliner", label: "🍜 Kuliner" },
  { id: "edukasi", label: "📚 Edukasi" },
  { id: "hiburan", label: "😂 Hiburan" },
  { id: "kecantikan", label: "💄 Kecantikan" },
  { id: "teknologi", label: "💻 Teknologi" },
  { id: "motivasi", label: "💪 Motivasi" },
  { id: "religi", label: "🤲 Religi" },
];

type Topic = {
  topic: string;
  why: string;
  contentIdea: string;
  difficulty: "Mudah" | "Sedang" | "Susah";
  potential: "Tinggi" | "Sangat Tinggi" | "Luar Biasa";
};

type Result = {
  topics: Topic[];
  summary: string;
};

export default function TrendingPage() {
  const [platform, setPlatform] = useState("all");
  const [niche, setNiche] = useState("umum");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  async function generate() {
    setLoading(true);
    setResult(null);

    const platformLabel = PLATFORMS.find((p) => p.id === platform)?.label || platform;
    const nicheLabel = NICHES.find((n) => n.id === niche)?.label || niche;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Kamu adalah pakar social media dan tren konten Indonesia yang selalu update.

Temukan 8 topik konten yang sedang viral atau trending untuk:
- Platform: ${platformLabel}
- Niche: ${nicheLabel}
- Kata kunci tambahan: ${keyword || "tidak ada"}
- Target: kreator konten Indonesia

Buat PERSIS dalam format JSON berikut (tidak ada teks lain di luar JSON):
{
  "summary": "Ringkasan singkat tren saat ini dalam 1-2 kalimat untuk niche ini di Indonesia",
  "topics": [
    {
      "topic": "Judul topik yang menarik dan spesifik (max 8 kata)",
      "why": "Kenapa topik ini trending sekarang? Jelaskan singkat 1 kalimat",
      "contentIdea": "Ide konten spesifik yang bisa langsung dibuat (1-2 kalimat)",
      "difficulty": "Mudah",
      "potential": "Sangat Tinggi"
    }
  ]
}

Aturan:
- difficulty hanya boleh: "Mudah", "Sedang", atau "Susah"
- potential hanya boleh: "Tinggi", "Sangat Tinggi", atau "Luar Biasa"
- Topik harus relevan dengan Indonesia dan bahasa Indonesia
- Variasikan difficulty dan potential
- WAJIB: Hanya return JSON valid, tidak ada teks lain`,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }

      const text = data.result || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed: Result = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      alert("Gagal generate. Coba lagi.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copyTopic(idx: number, topic: Topic) {
    const text = `📌 ${topic.topic}\n💡 Kenapa trending: ${topic.why}\n🎬 Ide konten: ${topic.contentIdea}`;
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  async function copyAll() {
    if (!result) return;
    const text = result.topics
      .map((t, i) => `${i + 1}. ${t.topic}\n   💡 ${t.why}\n   🎬 ${t.contentIdea}`)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  const difficultyColor = (d: string) => {
    if (d === "Mudah") return "bg-green-500/20 text-green-300 border-green-500/30";
    if (d === "Sedang") return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-red-500/20 text-red-300 border-red-500/30";
  };

  const potentialColor = (p: string) => {
    if (p === "Luar Biasa") return "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30";
    if (p === "Sangat Tinggi") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-white/10 text-white/50 border-white/20";
  };

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030a05] via-[#001a0a] to-[#020f04]" />
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-emerald-700 blur-[160px] rounded-full absolute top-[-150px] left-[-150px]" />
        <div className="w-[500px] h-[500px] bg-green-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-100px]" />
        <div className="w-[400px] h-[400px] bg-teal-700 blur-[120px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-5xl mx-auto">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
          <a href="/" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🏠 Dashboard</a>
          <a href="/tiktok" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🎬 TikTok</a>
          <a href="/affiliate" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🛒 Affiliate</a>
          <a href="/hook" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🔥 Hook</a>
          <a href="/trending" className="px-3 py-2 rounded-xl bg-green-600/40 border border-green-500/40 text-sm font-bold">📈 Trending</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-green-900/40 to-emerald-800/20 backdrop-blur-xl border border-green-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-green-500/30">
              📈
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Trending Topic Finder</h1>
              <p className="text-green-300/70 text-sm">Temukan topik viral terbaru dari TikTok, IG, YouTube & FB</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {["8 Topik Viral", "Ide Konten Siap Pakai", "Tingkat Kesulitan", "Potensi Viral"].map((f) => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5 mb-6">

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    platform === p.id
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Niche Konten</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button key={n.id} onClick={() => setNiche(n.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    niche === n.id
                      ? "bg-emerald-500 text-white font-bold"
                      : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"
                  }`}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">
              Kata Kunci Spesifik <span className="text-white/30">(opsional)</span>
            </label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="Contoh: skincare, UMKM Jawa Tengah, resep anak..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/25 focus:border-green-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={generate}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 transition-all flex items-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mencari Tren...
                </>
              ) : (
                "📈 Cari Trending Topics"
              )}
            </button>
            <button
              onClick={() => { setResult(null); setKeyword(""); }}
              className="px-5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/20 text-sm font-medium transition-all">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div className="space-y-4">

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-green-900/20 border border-green-500/20">
              <p className="text-green-300 text-sm font-medium">
                🔍 {result.summary}
              </p>
            </div>

            {/* Copy All */}
            <div className="flex justify-between items-center">
              <h2 className="text-white font-black text-lg">🔥 8 Topik Trending</h2>
              <button onClick={copyAll}
                className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/40 text-sm font-semibold border border-green-500/30 transition-all">
                {copiedAll ? "✅ Copied!" : "📋 Copy Semua"}
              </button>
            </div>

            {/* Topics Grid */}
            <div className="grid md:grid-cols-2 gap-3">
              {result.topics.map((topic, i) => (
                <div key={i}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-black flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <h3 className="font-bold text-sm text-white leading-tight">{topic.topic}</h3>
                    </div>
                    <button
                      onClick={() => copyTopic(i, topic)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs ml-2 flex-shrink-0">
                      {copiedIdx === i ? "✅" : "📋"}
                    </button>
                  </div>

                  <p className="text-white/50 text-xs mb-2 leading-relaxed">
                    <span className="text-yellow-400">💡</span> {topic.why}
                  </p>

                  <p className="text-white/70 text-xs mb-3 leading-relaxed">
                    <span className="text-blue-400">🎬</span> {topic.contentIdea}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${difficultyColor(topic.difficulty)}`}>
                      {topic.difficulty === "Mudah" ? "⚡" : topic.difficulty === "Sedang" ? "🔧" : "💪"} {topic.difficulty}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${potentialColor(topic.potential)}`}>
                      🚀 {topic.potential}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Generate Again */}
            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all disabled:opacity-40">
              🔄 Generate 8 Topik Baru
            </button>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-white/20 text-xs">
          📈 Trending Finder — Bagian dari AI Content Suite 🇮🇩
        </div>

      </div>
    </main>
  );
}