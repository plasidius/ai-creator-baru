"use client";

import { useState } from "react";

const OBJECTIONS = [
  { id: "mahal", label: "💸 Terlalu Mahal" },
  { id: "nanti", label: "🕐 Nanti Aja" },
  { id: "pikir", label: "🤔 Pikir-pikir Dulu" },
  { id: "ga_butuh", label: "🙅 Ga Butuh" },
  { id: "udah_ada", label: "📦 Udah Punya Yang Lain" },
  { id: "ga_percaya", label: "😒 Ga Yakin Produknya" },
  { id: "tanya_suami", label: "👫 Tanya Suami/Istri Dulu" },
  { id: "custom", label: "✏️ Keberatan Lain" },
];

export default function ObjectionHandler() {
  const [product, setProduct] = useState("");
  const [objection, setObjection] = useState("mahal");
  const [customObjection, setCustomObjection] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(-1);

  async function generate() {
    if (!product.trim()) return;
    setLoading(true);
    setReplies([]);

    const objLabel = OBJECTIONS.find((o) => o.id === objection)?.label || objection;
    const objText = objection === "custom" ? customObjection : objLabel;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Kamu adalah sales expert Indonesia dengan closing rate 80%.
Produk: "${product}"
Keberatan calon pembeli: "${objText}"

Buatkan 3 variasi jawaban menggunakan teknik berbeda:

JAWABAN 1 - TEKNIK FEEL-FELT-FOUND (Empati dulu):
[Akui perasaan mereka → cerita orang lain yang sama → hasil setelah pakai produk]
Max 3 kalimat, akhiri dengan pertanyaan balik yang soft.

JAWABAN 2 - TEKNIK AGREE-BRIDGE-CLOSE (Setuju lalu arahkan):
[Setujui keberatan → tambahkan perspektif baru → tawarkan solusi konkret]
Max 3 kalimat, akhiri dengan CTA yang tidak memaksa.

JAWABAN 3 - TEKNIK REFRAME (Ubah sudut pandang):
[Ubah cara pandang tentang keberatan → tunjukkan value sebenarnya → close]
Max 3 kalimat, paling soft dan empati.

Bahasa: Indonesia gaul, natural, tidak terlihat seperti script jualan.
Jangan gunakan kata: "Saya mengerti", "Tentu saja", "Betul sekali".`,
        }),
      });
      const data = await res.json();
      const text = data.result || "";

      // Parse 3 jawaban
      const parts = text.split(/JAWABAN \d+:/i).filter((s: string) => s.trim());
      setReplies(parts.length >= 3 ? parts : [text]);
    } catch {
      setReplies(["❌ Gagal connect ke server."]);
    } finally {
      setLoading(false);
    }
  }

  async function copyReply(idx: number, text: string) {
    await navigator.clipboard.writeText(text.trim());
    setCopied(idx);
    setTimeout(() => setCopied(-1), 2000);
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-orange-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-yellow-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/tiktok" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎬 TikTok</a>
          <a href="/affiliate" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🛒 Affiliate</a>
          <a href="/wa-reply" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">💬 WA Reply</a>
          <a href="/objection" className="px-4 py-2 rounded-xl bg-orange-500/30 border border-orange-500/40">😤 Objection</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">😤 Objection Handler AI</h1>
          <p className="text-white/60 mt-2">Jawaban otomatis untuk calon pembeli yang ragu — closing rate naik!</p>
        </div>

        {/* INPUT */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Produk yang dijual</label>
            <input value={product} onChange={(e) => setProduct(e.target.value)}
              placeholder="Contoh: Skincare Vitamin C brightening serum Korea..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none text-white placeholder:text-white/30" />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Keberatan calon pembeli</label>
            <div className="flex flex-wrap gap-2">
              {OBJECTIONS.map((o) => (
                <button key={o.id} onClick={() => setObjection(o.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    objection === o.id
                      ? "bg-orange-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white/70"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {objection === "custom" && (
            <div>
              <label className="text-white/60 text-sm mb-2 block">Tulis keberatan calon pembeli</label>
              <textarea value={customObjection} onChange={(e) => setCustomObjection(e.target.value)}
                placeholder="Contoh: Kak, harganya bisa lebih murah ga? Di tempat lain lebih murah..."
                className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <button onClick={generate} disabled={loading}
              className="px-6 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "💡 Generate Jawaban"}
            </button>
            <button onClick={() => { setProduct(""); setReplies([]); setCustomObjection(""); }}
              className="px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-500">
              🗑 Clear
            </button>
          </div>
        </div>

        {/* OUTPUT */}
        {replies.length > 0 && (
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {replies.map((r, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-orange-400 font-bold text-sm">
                    {i === 0 ? "💪 Tegas" : i === 1 ? "🎯 Strategis" : "🤗 Empati"}
                  </span>
                  <button onClick={() => copyReply(i, r)}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs">
                    {copied === i ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed flex-1">
                  {r.trim()}
                </pre>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}