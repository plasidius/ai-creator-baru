"use client";

import { useState, useRef } from "react";

export default function TikTokAI() {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loadingThumb, setLoadingThumb] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbSessionRef = useRef<number>(0);

  function buildPollinationsUrl(text: string, width: number, height: number, seed: number): string {
    const uniquePrompt = `${text} variation${seed}`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(uniquePrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&nofeed=true`;
  }

  function loadThumbnail(promptText: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const sessionId = ++thumbSessionRef.current;

    setImgLoaded(false);
    setThumbError(false);
    setLoadingThumb(true);
    setImage("");

    const seed = Date.now() + Math.floor(Math.random() * 9999999);

    const urlCandidates = [
      buildPollinationsUrl(promptText + " cinematic tiktok vertical 9:16 viral aesthetic", 720, 1280, seed),
      `https://picsum.photos/seed/${seed}/720/1280`,
    ];

    let index = 0;

    function tryNext() {
      if (thumbSessionRef.current !== sessionId) return;
      if (index >= urlCandidates.length) {
        setLoadingThumb(false);
        setThumbError(true);
        return;
      }

      const url = urlCandidates[index];
      const img = new window.Image();

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (thumbSessionRef.current !== sessionId) return;
        img.onload = null;
        img.onerror = null;
        img.src = "";
        index++;
        tryNext();
      }, 20000);

      img.onload = () => {
        if (thumbSessionRef.current !== sessionId) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setImage(url);
        setImgLoaded(true);
        setLoadingThumb(false);
        setThumbError(false);
      };

      img.onerror = () => {
        if (thumbSessionRef.current !== sessionId) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        index++;
        tryNext();
      };

      img.src = url;
    }

    tryNext();
  }

  async function generate() {
    if (!prompt) return;
    try {
      setLoading(true);
      setScript("");
      loadThumbnail(prompt);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "tiktok",
          prompt: `Kamu adalah kreator konten TikTok viral Indonesia dengan 10 juta followers.
Buat script TikTok viral untuk topik: "${prompt}"

FORMAT WAJIB:
🎣 HOOK (3 detik pertama — wajib bikin orang stop scroll):
[1-2 kalimat pembuka yang mengejutkan atau bikin penasaran]

📱 SCENE 1 - MASALAH (detik 3-15):
[Gambarkan masalah yang relate dengan target audience]

💡 SCENE 2 - SOLUSI (detik 15-40):
[Berikan solusi atau informasi utama, pakai poin-poin]

🔥 SCENE 3 - BUKTI (detik 40-55):
[Contoh nyata atau fakta pendukung]

🚀 CTA (detik 55-60):
[Ajakan like, komen, follow, atau save]

HASHTAG: 10 hashtag relevan Indonesia
MUSIK: Rekomendasi jenis musik yang cocok

Bahasa: Indonesia gaul Gen Z, tidak formal, natural seperti ngobrol biasa.`,
        }),
      });

      const data = await res.json();
      setScript(data.result || "Gagal generate script.");
    } catch (err) {
      console.error(err);
      setScript("❌ Gagal connect ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function copyScript() {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    thumbSessionRef.current++;
    setPrompt("");
    setScript("");
    setImage("");
    setImgLoaded(false);
    setLoadingThumb(false);
    setThumbError(false);
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-fuchsia-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-pink-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex gap-3 flex-wrap">
            <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
            <a href="/tiktok" className="px-4 py-2 rounded-xl bg-fuchsia-500/30 border border-fuchsia-500/40">🎬 TikTok</a>
            <a href="/voice" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎤 Voice</a>
            <a href="/shorts" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎬 Shorts</a>
            <a href="/affiliate" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🛒 Affiliate</a>
          </div>
        </div>

        <div className="mb-10 p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">🎬 TikTok AI Script</h1>
          <p className="text-white/60 mt-2">Generate script viral TikTok otomatis dengan AI</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
          <label className="text-white/60 text-sm mb-2 block">Ide konten kamu</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Contoh: Tips cepat kaya dari affiliate marketing..."
            className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30"
          />
          <div className="flex gap-4 mt-5 flex-wrap">
            <button onClick={generate} disabled={loading}
              className="px-6 py-3 rounded-xl font-bold bg-fuchsia-500 hover:bg-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "🚀 Generate Script"}
            </button>
            <button onClick={handleClear} className="px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-500">
              🗑 Clear
            </button>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {script && (
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-fuchsia-400 font-bold text-lg">📝 Script TikTok</h2>
                <button onClick={copyScript}
                  className="px-4 py-2 rounded-xl bg-fuchsia-500/30 hover:bg-fuchsia-500/50 text-sm font-semibold border border-fuchsia-500/30">
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-white/80 leading-relaxed text-sm">{script}</pre>
            </div>
          )}

          {(loadingThumb || imgLoaded || thumbError) && (
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
              <h2 className="text-fuchsia-400 font-bold mb-4">🖼 AI Thumbnail</h2>

              {loadingThumb && (
                <div className="rounded-2xl bg-white/10 w-full aspect-[9/16] flex flex-col items-center justify-center gap-3 animate-pulse">
                  <div className="text-4xl">🖼</div>
                  <p className="text-white/40 text-sm">Generating thumbnail...</p>
                  <p className="text-white/20 text-xs">Bisa sampai 20 detik</p>
                </div>
              )}

              {!loadingThumb && imgLoaded && image && (
                <>
                  <img src={image} alt="TikTok thumbnail" className="rounded-2xl w-full block" />
                  <button onClick={() => loadThumbnail(prompt)}
                    className="mt-3 w-full py-2 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/40 text-sm text-fuchsia-300 border border-fuchsia-500/20">
                    🔄 Regenerate Thumbnail
                  </button>
                </>
              )}

              {!loadingThumb && thumbError && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/20 w-full aspect-[9/16] flex flex-col items-center justify-center gap-3">
                  <div className="text-4xl">❌</div>
                  <p className="text-red-300 text-sm text-center px-4">Thumbnail gagal dimuat</p>
                  <button onClick={() => loadThumbnail(prompt)}
                    className="mt-2 px-5 py-2 rounded-xl bg-fuchsia-500/30 hover:bg-fuchsia-500/50 text-sm text-fuchsia-300 border border-fuchsia-500/30">
                    🔄 Coba Lagi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}