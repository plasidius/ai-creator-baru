"use client";

import { useState } from "react";

const NICHES = [
  { id: "jualan", label: "🛒 Jualan / Produk" },
  { id: "motivasi", label: "💪 Motivasi" },
  { id: "edukasi", label: "📚 Edukasi" },
  { id: "hiburan", label: "😂 Hiburan / Komedi" },
  { id: "lifestyle", label: "✨ Lifestyle" },
  { id: "kuliner", label: "🍜 Kuliner" },
  { id: "bisnis", label: "💼 Tips Bisnis" },
  { id: "religi", label: "🤲 Religi / Islami" },
];

const TONES = [
  { id: "viral", label: "🔥 Viral & Emosional" },
  { id: "santai", label: "😎 Santai & Friendly" },
  { id: "tegas", label: "💥 Tegas & Powerful" },
  { id: "lucu", label: "😄 Lucu & Receh" },
];

type Result = {
  hook: string;
  script: string;
  caption: string;
  hashtags: string;
};

export default function FBPro() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("jualan");
  const [tone, setTone] = useState("viral");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hook" | "script" | "caption" | "hashtags">("hook");

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);

    const nicheLabel = NICHES.find((n) => n.id === niche)?.label || niche;
    const toneLabel = TONES.find((t) => t.id === tone)?.label || tone;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "ads",
          prompt: `Kamu adalah ahli konten Facebook Reels viral untuk pasar Indonesia.

Buat konten Facebook Reels lengkap untuk:
- Topik/Produk: "${topic}"
- Niche: ${nicheLabel}
- Tone: ${toneLabel}
- Target audiens: ${target || "umum, semua kalangan"}

Buat PERSIS dalam format JSON berikut (tidak ada teks lain di luar JSON):
{
  "hook": "1 kalimat hook pembuka yang sangat kuat, bikin orang langsung stop scroll. Max 15 kata. Pakai angka atau pernyataan mengejutkan.",
  "script": "Script lengkap Reels 30-60 detik. Format: [HOOK] ... [MASALAH] ... [SOLUSI] ... [CTA]. Bahasa natural Indonesia, tidak kaku. Max 150 kata.",
  "caption": "Caption Facebook yang panjang dan engaging. Mulai dengan hook, lanjut cerita/value, akhiri dengan pertanyaan ke audiens atau CTA. Pakai line break. Max 200 kata.",
  "hashtags": "20 hashtag relevan gabungan: populer + niche + lokal Indonesia. Format: #tag1 #tag2 dst"
}

WAJIB: Hanya return JSON, tidak ada penjelasan, tidak ada markdown backtick.`,
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
      setActiveTab("hook");
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
    { key: "hook", label: "🎣 Hook", color: "from-blue-600 to-blue-500" },
    { key: "script", label: "🎬 Script", color: "from-blue-700 to-blue-600" },
    { key: "caption", label: "📝 Caption", color: "from-blue-800 to-blue-700" },
    { key: "hashtags", label: "#️⃣ Hashtag", color: "from-blue-900 to-blue-800" },
  ] as const;

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00050f] via-[#001133] to-[#000a1e]" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-blue-700 blur-[160px] rounded-full absolute top-[-150px] left-[-150px]" />
        <div className="w-[500px] h-[500px] bg-blue-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-100px]" />
        <div className="w-[400px] h-[400px] bg-indigo-700 blur-[120px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
          <a href="/" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🏠 Dashboard</a>
          <a href="/tiktok" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🎬 TikTok</a>
          <a href="/affiliate" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🛒 Affiliate</a>
          <a href="/wa-reply" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">💬 WA Reply</a>
          <a href="/fb-pro" className="px-3 py-2 rounded-xl bg-blue-600/40 border border-blue-500/40 text-sm font-bold">📘 FB Pro</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-xl border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
              📘
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">FB Pro — Kreator Reels</h1>
              <p className="text-blue-300/70 text-sm">Script + Hook + Caption + Hashtag Facebook Reels viral</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {["Hook Killer", "Script 60 detik", "Caption Viral", "20 Hashtag"].map((f) => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* INPUT FORM */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5 mb-6">

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Topik / Produk / Ide Konten *</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="Contoh: Sepatu sandal wanita anti slip, Tips hemat listrik, Resep ayam geprek..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/25 focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Niche Konten</label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button key={n.id} onClick={() => setNiche(n.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    niche === n.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"
                  }`}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Tone / Gaya Konten</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tone === t.id
                      ? "bg-blue-500 text-white"
                      : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Target Audiens <span className="text-white/30">(opsional)</span></label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Contoh: Ibu rumah tangga 25-45 tahun, Mahasiswa, Pebisnis UMKM..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 outline-none text-white placeholder:text-white/25 text-sm focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={generate}
              disabled={loading || !topic.trim()}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "📘 Generate Konten FB"
              )}
            </button>
            <button
              onClick={() => { setTopic(""); setResult(null); setTarget(""); }}
              className="px-5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/20 text-sm font-medium transition-all">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-blue-500/20 overflow-hidden">

            {/* Tab bar */}
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-all ${
                    activeTab === tab.key
                      ? "bg-blue-600/30 text-blue-300 border-b-2 border-blue-400"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === "hook" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-blue-400 font-bold text-lg">🎣 Hook Pembuka Viral</h2>
                    <button onClick={() => copy("hook", result.hook)}
                      className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 text-sm font-semibold border border-blue-500/30 transition-all">
                      {copiedKey === "hook" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-2xl p-6 border border-blue-500/20">
                    <p className="text-xl md:text-2xl font-black text-white leading-relaxed">{result.hook}</p>
                  </div>
                  <p className="text-white/30 text-xs mt-3">💡 Ucapkan hook ini di detik pertama video — sebelum apapun</p>
                </div>
              )}

              {activeTab === "script" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-blue-400 font-bold text-lg">🎬 Script Reels 30-60 Detik</h2>
                    <button onClick={() => copy("script", result.script)}
                      className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 text-sm font-semibold border border-blue-500/30 transition-all">
                      {copiedKey === "script" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.script}</pre>
                  </div>
                  <p className="text-white/30 text-xs mt-3">💡 Rekam sesuai urutan script — hook → masalah → solusi → CTA</p>
                </div>
              )}

              {activeTab === "caption" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-blue-400 font-bold text-lg">📝 Caption Facebook</h2>
                    <button onClick={() => copy("caption", result.caption)}
                      className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 text-sm font-semibold border border-blue-500/30 transition-all">
                      {copiedKey === "caption" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.caption}</pre>
                  </div>
                  <p className="text-white/30 text-xs mt-3">💡 Paste langsung ke kolom caption saat upload Reels</p>
                </div>
              )}

              {activeTab === "hashtags" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-blue-400 font-bold text-lg">#️⃣ 20 Hashtag Relevan</h2>
                    <button onClick={() => copy("hashtags", result.hashtags)}
                      className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 text-sm font-semibold border border-blue-500/30 transition-all">
                      {copiedKey === "hashtags" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.split(" ").filter(h => h.startsWith("#")).map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-white/30 text-xs mt-4">💡 Gabungkan hashtag populer + niche untuk jangkauan maksimal</p>
                </div>
              )}
            </div>

            {/* Copy All */}
            <div className="px-6 pb-6">
              <button
                onClick={() => copy("all", `HOOK:\n${result.hook}\n\nSCRIPT:\n${result.script}\n\nCAPTION:\n${result.caption}\n\nHASHTAGS:\n${result.hashtags}`)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-700/40 to-blue-600/40 hover:from-blue-600/60 hover:to-blue-500/60 border border-blue-500/30 font-bold text-sm transition-all">
                {copiedKey === "all" ? "✅ Semua Berhasil di-Copy!" : "📋 Copy Semua Sekaligus"}
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-white/20 text-xs">
          📘 FB Pro — Bagian dari AI Content Suite 🇮🇩
        </div>

      </div>
    </main>
  );
}