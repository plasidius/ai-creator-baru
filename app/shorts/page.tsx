"use client";

import { useState, useRef } from "react";

export default function ShortsAI() {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState("");
  const [image, setImage] = useState("");
  const [loadingImg, setLoadingImg] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"shorts" | "animation">("shorts");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgSession = useRef(0);

  // Preload gambar dengan fallback — TIDAK pakai Pollinations (sudah 402)
  function loadThumbnail(promptText: string) {
    clearTimeout(timeoutRef.current!);
    const sessionId = ++imgSession.current;
    setImage(""); setImgError(false); setLoadingImg(true);

    const seed = Date.now() + Math.floor(Math.random() * 9999999);

    // Picsum saja karena Pollinations sudah 402 (berbayar dari Indonesia)
    const urlCandidates = [
      `https://picsum.photos/seed/${seed}/720/1280`,
      `https://picsum.photos/seed/${seed + 1}/720/1280`,
    ];

    let index = 0;

    function tryNext() {
      if (imgSession.current !== sessionId) return;
      if (index >= urlCandidates.length) { setLoadingImg(false); setImgError(true); return; }

      const url = urlCandidates[index];
      const img = new window.Image();

      clearTimeout(timeoutRef.current!);
      timeoutRef.current = setTimeout(() => {
        if (imgSession.current !== sessionId) return;
        img.onload = null; img.onerror = null; img.src = "";
        index++; tryNext();
      }, 15000);

      img.onload = () => {
        if (imgSession.current !== sessionId) return;
        clearTimeout(timeoutRef.current!);
        setImage(url); setImgError(false); setLoadingImg(false);
      };

      img.onerror = () => {
        if (imgSession.current !== sessionId) return;
        clearTimeout(timeoutRef.current!);
        index++; tryNext();
      };

      img.src = url;
    }

    tryNext();
  }

  async function generateScript() {
    if (!prompt) return;
    try {
      setLoading(true);
      setScript("");
      setVideoUrl("");
      loadThumbnail(prompt);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Buat script YouTube Shorts viral tentang: ${prompt}`,
        }),
      });

      const data = await res.json();
      setScript(data.result || "Gagal generate script.");
    } catch {
      setScript("❌ Gagal connect ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function generateVideo() {
    if (!prompt) return;
    try {
      setLoadingVideo(true);
      setVideoUrl("");

      const endpoint = activeTab === "animation" ? "/api/video-animation" : "/api/video";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      // Cek semua kemungkinan key output dari Replicate
      const url = data.videoUrl || data.video || data.url || data.output_url ||
        (Array.isArray(data.output) ? data.output[0] : null);

      if (!url || typeof url !== "string") {
        alert("Video gagal dibuat: " + (data.error || "Output tidak valid"));
        return;
      }

      setVideoUrl(url);
    } catch (err) {
      alert("❌ Gagal generate video. Cek API token Replicate.");
      console.error(err);
    } finally {
      setLoadingVideo(false);
    }
  }

  async function copyScript() {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    clearTimeout(timeoutRef.current!);
    imgSession.current++;
    setPrompt(""); setScript(""); setImage("");
    setVideoUrl(""); setImgError(false); setLoadingImg(false);
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-fuchsia-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-red-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">

        {/* NAVBAR */}
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">🏠 Dashboard</a>
          <a href="/tiktok" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">🎬 TikTok</a>
          <a href="/voice" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">🎤 Voice</a>
          <a href="/shorts" className="px-4 py-2 rounded-xl bg-red-500/30 border border-red-500/40">🎬 Shorts</a>
          <a href="/affiliate" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">🛒 Affiliate</a>
        </div>

        {/* HERO */}
        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h1 className="text-4xl font-black">🎬 AI Shorts Generator</h1>
          <p className="text-white/60 mt-2">Generate script + thumbnail + video animasi</p>
        </div>

        {/* TAB */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setActiveTab("shorts")}
            className={`px-5 py-3 rounded-xl font-bold ${activeTab === "shorts" ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`}>
            🎬 Shorts
          </button>
          <button onClick={() => setActiveTab("animation")}
            className={`px-5 py-3 rounded-xl font-bold ${activeTab === "animation" ? "bg-fuchsia-500" : "bg-white/10 hover:bg-white/20"}`}>
            ✨ Video Animasi
          </button>
        </div>

        {/* INPUT */}
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <label className="text-white/60 text-sm mb-2 block">Topik Shorts kamu</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="Contoh: Cara cepat sukses affiliate marketing Indonesia..."
            className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30" />

          <div className="flex gap-4 mt-5 flex-wrap">
            <button onClick={generateScript} disabled={loading}
              className="px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Generating..." : "📝 Generate Script"}
            </button>
            <button onClick={generateVideo} disabled={loadingVideo || !prompt}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
              {loadingVideo ? "⏳ Processing..." : activeTab === "shorts" ? "🎬 Generate Video" : "✨ Generate Animasi"}
            </button>
            <button onClick={handleClear} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl">
              🗑 Clear
            </button>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">

          {/* SCRIPT */}
          {script && (
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="flex justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-fuchsia-400 font-bold text-lg">📝 Script</h2>
                <button onClick={copyScript}
                  className="bg-fuchsia-500/30 hover:bg-fuchsia-500/50 px-4 py-2 rounded-xl text-sm font-semibold border border-fuchsia-500/30">
                  {copied ? "✅ Copied" : "📋 Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-white/80 leading-relaxed text-sm">{script}</pre>
            </div>
          )}

          {/* THUMBNAIL */}
          {(loadingImg || image || imgError) && (
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
              <h2 className="text-red-400 font-bold mb-4">🖼 Thumbnail</h2>

              {loadingImg && (
                <div className="rounded-2xl bg-white/10 w-full aspect-[9/16] flex flex-col items-center justify-center gap-3 animate-pulse">
                  <div className="text-4xl">🖼</div>
                  <p className="text-white/40 text-sm">Generating thumbnail...</p>
                </div>
              )}

              {!loadingImg && image && (
                <>
                  <img src={image} alt="Shorts thumbnail" className="rounded-2xl w-full block" />
                  <button onClick={() => loadThumbnail(prompt)}
                    className="mt-3 w-full py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-sm text-red-300 border border-red-500/20">
                    🔄 Regenerate
                  </button>
                </>
              )}

              {!loadingImg && imgError && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/20 w-full aspect-[9/16] flex flex-col items-center justify-center gap-3">
                  <div className="text-4xl">❌</div>
                  <p className="text-red-300 text-sm">Thumbnail gagal dimuat</p>
                  <button onClick={() => loadThumbnail(prompt)}
                    className="mt-2 px-5 py-2 rounded-xl bg-red-500/30 text-sm text-red-300">
                    🔄 Coba Lagi
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* VIDEO OUTPUT */}
        {loadingVideo && (
          <div className="mt-6 p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-4">
            <div className="text-5xl animate-spin">⚙️</div>
            <p className="text-white/60 text-sm">Generating video... bisa 1-3 menit</p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-fuchsia-500 h-2 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {videoUrl && !loadingVideo && (
          <div className="mt-6 p-4 rounded-3xl bg-white/5 border border-white/10">
            <h2 className="text-fuchsia-400 font-bold mb-4">✨ AI Video</h2>
            <video controls autoPlay loop className="w-full rounded-2xl"
              onError={() => alert("❌ Video gagal diputar. URL tidak valid atau format tidak didukung.")}>
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              Browser tidak mendukung video.
            </video>
            <a href={videoUrl} target="_blank" rel="noreferrer"
              className="mt-3 block text-center py-2 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/40 text-sm text-fuchsia-300 border border-fuchsia-500/20">
              ⬇️ Download Video
            </a>
          </div>
        )}

      </div>
    </main>
  );
}