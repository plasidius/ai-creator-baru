"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Remotion Player tidak support SSR
const VideoPreview = dynamic(() => import("./VideoPreview"), { ssr: false });

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const res = await fetch("/api/video-animation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setVideoUrl(data.videoUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Video Generator</h1>

      {/* Input prompt */}
      <input
        type="text"
        placeholder="Masukkan prompt video..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      {/* Preview Remotion */}
      {prompt && (
        <div style={{ marginBottom: 16 }}>
          <p>Preview animasi:</p>
          <VideoPreview title={prompt} />
        </div>
      )}

      {/* Tombol generate */}
      <button onClick={handleGenerate} disabled={loading || !prompt}>
        {loading ? "Generating..." : "Generate AI Video"}
      </button>

      {/* Error */}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Hasil video dari Replicate */}
      {videoUrl && (
        <div style={{ marginTop: 24 }}>
          <p>Hasil AI Video:</p>
          <video
            src={videoUrl}
            controls
            style={{ width: "360px", height: "640px" }}
          />
          <br />
          <a href={videoUrl} download="video.mp4">
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}