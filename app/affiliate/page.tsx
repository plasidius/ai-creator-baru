"use client";

import { useState } from "react";

const PLATFORMS = [
  { id: "tiktok", label: "🎵 TikTok Shop" },
  { id: "shopee", label: "🧡 Shopee" },
  { id: "tokopedia", label: "💚 Tokopedia" },
  { id: "instagram", label: "📸 Instagram" },
  { id: "facebook", label: "📘 Facebook" },
  { id: "whatsapp", label: "💬 WhatsApp" },
];

const STYLES = [
  { id: "viral", label: "🔥 Viral & Emosional" },
  { id: "review", label: "⭐ Review Jujur" },
  { id: "storytelling", label: "📖 Storytelling" },
  { id: "hard_selling", label: "💥 Hard Selling" },
  { id: "soft_selling", label: "🌸 Soft Selling" },
  { id: "komedi", label: "😂 Komedi / Receh" },
];

type Result = {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
};

export default function AffiliatePage() {
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [style, setStyle] = useState("viral");
  const [price, setPrice] = useState("");
  const [benefit, setBenefit] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hook" | "caption" | "cta" | "hashtags">("caption");

  async function generate() {
    if (!product.trim()) return;
    setLoading(true);
    setResult(null);

    const platformLabel = PLATFORMS.find((p) => p.id === platform)?.label || platform;
    const styleLabel = STYLES.find((s) => s.id === style)?.label || style;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Kamu adalah copywriter affiliate marketing terbaik Indonesia yang ahli bikin caption viral.

Buat caption affiliate untuk:
- Produk: "${product}"
- Platform: ${platformLabel}
- Gaya: ${styleLabel}
- Harga: ${price || "tidak disebutkan"}
- Keunggulan produk: ${benefit || "tidak disebutkan, cari sendiri yang relevan"}

Buat PERSIS dalam format JSON berikut (tidak ada teks lain di luar JSON):
{
  "hook": "1 kalimat hook super kuat max 15 kata, bikin orang stop scroll dan penasaran",
  "caption": "Caption affiliate lengkap dan engaging. Mulai dengan hook, ceritakan masalah yang diselesaikan produk, jelaskan manfaat, social proof singkat, dan akhiri dengan urgensi. Bahasa Indonesia gaul tapi tidak lebay. Max 200 kata. Gunakan line break dan emoji secukupnya.",
  "cta": "3 variasi CTA (Call to Action) yang berbeda gaya: 1 soft, 1 medium, 1 hard. Format: '1. [soft CTA]\\n2. [medium CTA]\\n3. [hard CTA]'",
  "hashtags": "25 hashtag relevan: mix populer + niche + produk spesifik. Format: #tag1 #tag2 dst"
}

WAJIB: Hanya return JSON valid, tidak ada penjelasan, tidak ada markdown backtick.`,
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
      setActiveTab("caption");
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
    { key: "caption", label: "📝 Caption" },
    { key: "hook", label: "🎣 Hook" },
    { key: "cta", label: "🎯 CTA" },
    { key: "hashtags", label: "#️⃣ Hashtag" },
  ] as const;

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0800] via-[#1a0e00] to-[#0a0500]" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-yellow-600 blur-[160px] rounded-full absolute top-[-150px] left-[-150px]" />
        <div className="w-[500px] h-[500px] bg-amber-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-100px]" />
        <div className="w-[400px] h-[400px] bg-orange-700 blur-[120px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
          <a href="/" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🏠 Dashboard</a>
          <a href="/tiktok" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">🎬 TikTok</a>
          <a href="/wa-reply" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">💬 WA Reply</a>
          <a href="/fb-pro" className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">📘 FB Pro</a>
          <a href="/affiliate" className="px-3 py-2 rounded-xl bg-yellow-600/40 border border-yellow-500/40 text-sm font-bold">🛒 Affiliate</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-yellow-900/40 to-amber-800/20 backdrop-blur-xl border border-yellow-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/30">
              🛒
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Affiliate Caption Generator</h1>
              <p className="text-yellow-300/70 text-sm">Caption affiliate viral untuk TikTok Shop, Shopee & semua platform</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {["Hook Viral", "Caption Lengkap", "3 Variasi CTA", "25 Hashtag"].map((f) => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5 mb-6">

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block font-medium">Nama Produk *</label>
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Contoh: Serum Niacinamide 10% Brightening..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/25 focus:border-yellow-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block font-medium">Harga <span className="text-white/30">(opsional)</span></label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: Rp 89.000 (disc 50%)"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/25 focus:border-yellow-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Keunggulan Produk <span className="text-white/30">(opsional)</span></label>
            <input
              value={benefit}
              onChange={(e) => setBenefit(e.target.value)}
              placeholder="Contoh: BPOM, kulit cerah 7 hari, cocok semua jenis kulit..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 outline-none text-white placeholder:text-white/25 text-sm focus:border-yellow-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    platform === p.id
                      ? "bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/30"
                      : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block font-medium">Gaya Caption</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    style === s.id
                      ? "bg-amber-500 text-black font-bold"
                      : "bg-white/8 hover:bg-white/15 text-white/60 border border-white/10"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={generate}
              disabled={loading || !product.trim()}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/30 transition-all flex items-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "🛒 Generate Caption Affiliate"
              )}
            </button>
            <button
              onClick={() => { setProduct(""); setResult(null); setPrice(""); setBenefit(""); }}
              className="px-5 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/20 text-sm font-medium transition-all">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-yellow-500/20 overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-all ${
                    activeTab === tab.key
                      ? "bg-yellow-600/30 text-yellow-300 border-b-2 border-yellow-400"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "hook" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-yellow-400 font-bold text-lg">🎣 Hook Pembuka</h2>
                    <button onClick={() => copy("hook", result.hook)}
                      className="px-4 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/40 text-sm font-semibold border border-yellow-500/30 transition-all">
                      {copiedKey === "hook" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-900/40 to-amber-800/20 rounded-2xl p-6 border border-yellow-500/20">
                    <p className="text-xl md:text-2xl font-black text-white leading-relaxed">{result.hook}</p>
                  </div>
                  <p className="text-white/30 text-xs mt-3">💡 Pakai sebagai kalimat pertama video atau caption</p>
                </div>
              )}

              {activeTab === "caption" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-yellow-400 font-bold text-lg">📝 Caption Affiliate</h2>
                    <button onClick={() => copy("caption", result.caption)}
                      className="px-4 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/40 text-sm font-semibold border border-yellow-500/30 transition-all">
                      {copiedKey === "caption" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white/85 leading-relaxed text-sm font-sans">{result.caption}</pre>
                  </div>
                </div>
              )}

              {activeTab === "cta" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-yellow-400 font-bold text-lg">🎯 3 Variasi CTA</h2>
                    <button onClick={() => copy("cta", result.cta)}
                      className="px-4 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/40 text-sm font-semibold border border-yellow-500/30 transition-all">
                      {copiedKey === "cta" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {result.cta.split("\n").filter(l => l.trim()).map((line, i) => (
                      <div key={i} className={`p-4 rounded-2xl border text-sm ${
                        i === 0 ? "bg-green-900/20 border-green-500/20 text-green-300" :
                        i === 1 ? "bg-yellow-900/20 border-yellow-500/20 text-yellow-300" :
                        "bg-red-900/20 border-red-500/20 text-red-300"
                      }`}>
                        <span className="font-bold mr-2">{i === 0 ? "🌸 Soft:" : i === 1 ? "💥 Medium:" : "🔥 Hard:"}</span>
                        {line.replace(/^[123]\.\s*/, "")}
                      </div>
                    ))}
                  </div>
                  <p className="text-white/30 text-xs mt-3">💡 Pilih CTA sesuai karakter audiens kamu</p>
                </div>
              )}

              {activeTab === "hashtags" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-yellow-400 font-bold text-lg">#️⃣ 25 Hashtag</h2>
                    <button onClick={() => copy("hashtags", result.hashtags)}
                      className="px-4 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/40 text-sm font-semibold border border-yellow-500/30 transition-all">
                      {copiedKey === "hashtags" ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.split(" ").filter(h => h.startsWith("#")).map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-yellow-300 text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Copy All */}
            <div className="px-6 pb-6">
              <button
                onClick={() => copy("all", `HOOK:\n${result.hook}\n\nCAPTION:\n${result.caption}\n\nCTA:\n${result.cta}\n\nHASHTAGS:\n${result.hashtags}`)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-700/40 to-amber-600/40 hover:from-yellow-600/60 hover:to-amber-500/60 border border-yellow-500/30 font-bold text-sm transition-all">
                {copiedKey === "all" ? "✅ Semua Berhasil di-Copy!" : "📋 Copy Semua Sekaligus"}
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-white/20 text-xs">
          🛒 Affiliate Caption — Bagian dari AI Content Suite 🇮🇩
        </div>

      </div>
    </main>
  );
}