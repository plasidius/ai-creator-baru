"use client";

import { useState, useRef } from "react";

export default function VoicePage() {
  const [text, setText] = useState("");
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Web Speech API (browser native, tidak butuh API key) ───
  function speakBrowser() {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setPlaying(true);
    setStatus("🎤 Memutar suara...");

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    utter.rate = speed;
    utter.pitch = pitch;

    // Pilih suara Indonesia kalau ada
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(
      (v) => v.lang.startsWith("id") || v.name.toLowerCase().includes("indonesia")
    );
    if (idVoice) utter.voice = idVoice;

    utter.onend = () => {
      setPlaying(false);
      setStatus("✅ Selesai!");
    };
    utter.onerror = () => {
      setPlaying(false);
      setStatus("❌ Error saat memutar suara.");
    };

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }

  function stopSpeak() {
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    setPlaying(false);
    setStatus("⏹ Dihentikan.");
  }

  // ─── ElevenLabs (opsional, butuh API key di .env.local) ───
  // Uncomment ini kalau mau pakai ElevenLabs:
  /*
  async function generateElevenLabs() {
    if (!text) return;
    try {
      setLoading(true);
      setStatus("⏳ Generate suara ElevenLabs...");

      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("API error");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStatus("✅ Audio siap!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Gagal generate ElevenLabs.");
    } finally {
      setLoading(false);
    }
  }
  */

  const charCount = text.length;
  const maxChars = 1000;

  return (
    <main className="min-h-screen text-white relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-fuchsia-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-cyan-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">

        {/* NAVBAR */}
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex gap-3 flex-wrap">
            <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
            <a href="/tiktok" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎬 TikTok</a>
            <a href="/voice" className="px-4 py-2 rounded-xl bg-cyan-500/30 border border-cyan-500/40">🎤 Voice</a>
            <a href="/shorts" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🎬 Shorts</a>
            <a href="/affiliate" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🛒 Affiliate</a>
          </div>
        </div>

        {/* HERO */}
        <div className="mb-10 p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black">🎤 Voice AI Indonesia</h1>
          <p className="text-white/60 mt-2">Generate suara AI otomatis — langsung di browser, tanpa API key</p>
        </div>

        {/* INPUT */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-white/60 text-sm">Teks yang mau diubah jadi suara</label>
            <span className={`text-xs ${charCount > maxChars ? "text-red-400" : "text-white/40"}`}>
              {charCount}/{maxChars}
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            placeholder="Tulis script atau teks di sini... Contoh: Halo semua, selamat datang di channel aku!"
            className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none resize-none text-white placeholder:text-white/30"
          />

          {/* CONTROLS */}
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Kecepatan: {speed}x</label>
              <input
                type="range" min="0.5" max="2" step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Pitch: {pitch}</label>
              <input
                type="range" min="0.5" max="2" step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-5 flex-wrap">
            {!playing ? (
              <button
                onClick={speakBrowser}
                disabled={!text}
                className="px-6 py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎤 Play Voice
              </button>
            ) : (
              <button
                onClick={stopSpeak}
                className="px-6 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600"
              >
                ⏹ Stop
              </button>
            )}
            <button
              onClick={() => { setText(""); setStatus(""); setAudioUrl(""); stopSpeak(); }}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20"
            >
              🗑 Clear
            </button>
          </div>
        </div>

        {/* STATUS */}
        {status && (
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur text-center text-white/70">
            {status}
          </div>
        )}

        {/* AUDIO PLAYER (kalau pakai ElevenLabs / API) */}
        {audioUrl && (
          <div className="mt-6 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
            <h2 className="text-cyan-400 font-bold mb-4">🔊 Audio Result</h2>
            <audio ref={audioRef} controls src={audioUrl} className="w-full" />
            <a
              href={audioUrl}
              download="voice-ai.mp3"
              className="inline-block mt-4 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl font-bold"
            >
              ⬇ Download Audio
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
