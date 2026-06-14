"use client";

import { useState } from "react";

const PLATFORMS = [
  {
    id: "tiktok",
    label: "🎬 TikTok Script",
    color: "fuchsia",
    prompt: (input: string) => `Kamu adalah kreator TikTok viral Indonesia.
Ubah konten ini menjadi script TikTok viral:
"${input}"

FORMAT:
🎣 HOOK (3 detik — stop scroll):
[kalimat pembuka mengejutkan]

📱 ISI (poin cepat, max 45 detik):
[bullet points singkat & padat]

🚀 CTA:
[ajakan like/follow/save/komen]

HASHTAG: 10 hashtag Indonesia relevan
Bahasa: gaul Gen Z, energik, tidak kaku.`,
  },
  {
    id: "ig",
    label: "📸 IG Caption",
    color: "pink",
    prompt: (input: string) => `Kamu adalah influencer Instagram Indonesia.
Ubah konten ini menjadi IG Caption viral:
"${input}"

FORMAT:
- Baris 1: Hook kuat (bikin orang klik "more")
- Baris 2-3: (kosong untuk spacing)
- Isi: Story telling personal, relatable, line break setiap 2 kalimat
- Penutup: Pertanyaan untuk engagement di kolom komentar
- Hashtag: 30 hashtag (mix: besar + niche + spesifik)

Gaya: personal, hangat, seperti teman cerita.`,
  },
  {
    id: "twitter",
    label: "🐦 Twitter Thread",
    color: "sky",
    prompt: (input: string) => `Kamu adalah Twitter/X creator viral Indonesia.
Ubah konten ini menjadi Twitter Thread viral:
"${input}"

FORMAT (tiap tweet max 280 karakter):
Tweet 1: Hook kontroversial/mengejutkan + "Thread 🧵"
Tweet 2-3: Setup masalah
Tweet 4-6: Isi utama (poin per tweet)
Tweet 7: Plot twist atau insight tak terduga
Tweet 8: Kesimpulan
Tweet 9: CTA (RT, follow, bookmark)

Tandai tiap tweet dengan angka: 1/ 2/ 3/ dst`,
  },
  {
    id: "youtube",
    label: "▶️ YouTube Desc",
    color: "red",
    prompt: (input: string) => `Kamu adalah YouTuber SEO expert Indonesia.
Buat YouTube Description SEO-friendly dari konten ini:
"${input}"

FORMAT:
[PARAGRAF 1 - 2 kalimat: ringkasan video dengan keyword utama]

📌 APA YANG AKAN KAMU PELAJARI:
• [poin 1]
• [poin 2]
• [poin 3]

⏱️ TIMESTAMPS:
0:00 - Intro
[isi sesuai konten]

🔔 Subscribe untuk konten serupa!

#hashtag1 #hashtag2 #hashtag3 [15 hashtag relevan]

Kata kunci SEO: [5 keyword utama yang dicari orang Indonesia]`,
  },
  {
    id: "whatsapp",
    label: "💬 WA Broadcast",
    color: "green",
    prompt: (input: string) => `Kamu adalah copywriter WA Broadcast Indonesia.
Ubah konten ini menjadi pesan WA Broadcast yang dibaca orang:
"${input}"

FORMAT:
[Salam personal - jangan "Halo semuanya"]
[Baris kosong]
[Hook: fakta/pertanyaan yang bikin penasaran - 1 kalimat]
[Baris kosong]
[Isi: max 3 poin, pakai emoji, kalimat pendek]
[Baris kosong]
[CTA: 1 ajakan jelas, tidak lebih]
[Baris kosong]
[Tanda tangan: nama/brand]

Aturan: max 150 kata, personal, tidak terasa spam, ada urgensi tapi tidak memaksa.`,
  },
];

export default function ContentRepurpose() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");

  async function generate() {
    if (!input.trim()) return;
    setLoading(true);
    setResults({});

    const newResults: Record<string, string> = {};

    await Promise.all(
      PLATFORMS.map(async (p) => {
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: p.prompt(input) }),
          });
          const data = await res.json();
          newResults[p.id] = data.result || "Gagal generate.";
        } catch {
          newResults[p.id] = "❌ Gagal connect ke server.";
        }
      })
    );

    setResults(newResults);
    setLoading(false);
  }

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-fuchsia-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-blue-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/tiktok" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎬 TikTok</a>
          <a href="/repurpose" className="px-4 py-2 rounded-xl bg-blue-500/30 border border-blue-500/40">🔁 Repurpose</a>
        </div>

        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">🔁 Content Repurpose AI</h1>
          <p className="text-white/60 mt-2">Ubah 1 konten jadi 5 format — TikTok, IG, Twitter, YouTube, WA — masing-masing dioptimasi</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <label className="text-white/60 text-sm mb-2 block">Paste konten asli kamu</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Contoh: Tips hemat uang ala Gen Z: 1) Masak sendiri 2) Kurangi jajan boba 3) Nabung di awal bukan akhir bulan..."
            className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />
          <div className="flex gap-4 mt-5 flex-wrap">
            <button onClick={generate} disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating 5 format..." : "🔁 Repurpose Sekarang"}
            </button>
            <button onClick={() => { setInput(""); setResults({}); }}
              className="px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-500">
              🗑 Clear
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-3 w-1/2" />
                <div className="h-3 bg-white/10 rounded mb-2" />
                <div className="h-3 bg-white/10 rounded mb-2 w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && Object.keys(results).length > 0 && (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map((p) => (
              results[p.id] && (
                <div key={p.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white">{p.label}</h3>
                    <button onClick={() => copyText(p.id, results[p.id])}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs">
                      {copied === p.id ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-white/70 text-sm leading-relaxed flex-1 max-h-96 overflow-y-auto">
                    {results[p.id]}
                  </pre>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </main>
  );
}