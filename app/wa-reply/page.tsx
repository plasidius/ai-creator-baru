"use client";

import { useState } from "react";

const SCENARIOS = [
  { id: "tanya_harga", label: "💰 Tanya Harga" },
  { id: "mahal", label: "😤 Bilang Mahal" },
  { id: "nanti", label: "🕐 Nanti Dulu" },
  { id: "pikir", label: "🤔 Pikir-pikir" },
  { id: "komplain", label: "😡 Komplain" },
  { id: "followup", label: "📲 Follow Up" },
  { id: "closing", label: "🎯 Closing" },
  { id: "custom", label: "✏️ Custom" },
];

export default function WAReply() {
  const [product, setProduct] = useState("");
  const [scenario, setScenario] = useState("tanya_harga");
  const [customMsg, setCustomMsg] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!product.trim()) return;
    setLoading(true);
    setReply("");

    const scenarioLabel = SCENARIOS.find((s) => s.id === scenario)?.label || scenario;
    const context = scenario === "custom" ? customMsg : scenarioLabel;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Kamu adalah CS profesional dan expert closing untuk produk: "${product}".
Balas pesan WA untuk situasi: ${context}

ATURAN WAJIB:
- Sapa dengan "Kak" (bukan Halo/Hai di awal)
- Bahasa Indonesia friendly, hangat, tidak kaku seperti robot
- Max 5 kalimat total
- Pakai teknik Feel-Felt-Found jika situasi keberatan
- Akhiri dengan 1 CTA soft, tidak memaksa
- Emoji max 3, letakkan di tempat yang pas
- Jangan sebut harga langsung jika situasi keberatan harga
- Tidak terlihat seperti template/copy-paste

Langsung tulis balasannya saja, tanpa penjelasan.`,
        }),
      });
      const data = await res.json();
      setReply(data.result || "Gagal generate.");
    } catch {
      setReply("❌ Gagal connect ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReply() {
    if (!reply) return;
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-green-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-emerald-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/tiktok" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎬 TikTok</a>
          <a href="/affiliate" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🛒 Affiliate</a>
          <a href="/repurpose" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🔁 Repurpose</a>
          <a href="/wa-reply" className="px-4 py-2 rounded-xl bg-green-500/30 border border-green-500/40">💬 WA Reply</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">💬 Auto Reply WA Bisnis</h1>
          <p className="text-white/60 mt-2">Template balasan WhatsApp otomatis untuk CS — closing lebih cepat!</p>
        </div>

        {/* INPUT */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5">

          <div>
            <label className="text-white/60 text-sm mb-2 block">Nama / deskripsi produk</label>
            <input value={product} onChange={(e) => setProduct(e.target.value)}
              placeholder="Contoh: Serum Vitamin C Brightening 30ml..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/30" />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Situasi pelanggan</label>
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map((s) => (
                <button key={s.id} onClick={() => setScenario(s.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    scenario === s.id
                      ? "bg-green-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white/70"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {scenario === "custom" && (
            <div>
              <label className="text-white/60 text-sm mb-2 block">Pesan pelanggan</label>
              <textarea value={customMsg} onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Contoh: Kak, bisa minta diskon gak? Budget saya cuma 50rb..."
                className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <button onClick={generate} disabled={loading}
              className="px-6 py-3 rounded-xl font-bold bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "💬 Generate Balasan"}
            </button>
            <button onClick={() => { setProduct(""); setReply(""); setCustomMsg(""); }}
              className="px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-500">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* OUTPUT */}
        {reply && (
          <div className="mt-8 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h2 className="text-green-400 font-bold text-lg">💬 Balasan WA</h2>
              <button onClick={copyReply}
                className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/40 text-sm font-semibold border border-green-500/30">
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>

            {/* Preview chat bubble WA */}
            <div className="bg-[#075E54] rounded-2xl p-4 mb-4">
              <div className="bg-[#DCF8C6] text-black rounded-2xl rounded-tl-none p-4 max-w-sm ml-auto text-sm leading-relaxed">
                {reply}
                <div className="text-right text-[10px] text-gray-500 mt-1">✓✓</div>
              </div>
            </div>

            <pre className="whitespace-pre-wrap text-white/80 leading-relaxed text-sm">{reply}</pre>
          </div>
        )}

      </div>
    </main>
  );
}