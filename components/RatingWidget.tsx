"use client";

import { useState } from "react";

// =====================================================================
// Komponen ini DIPAKAI SEMUA TOOLS — cukup import & taruh di bawah hasil
// generate, kirim `toolId` yang sesuai. Tidak perlu buat komponen rating
// terpisah per tool.
//
// Contoh pemakaian di halaman tool manapun (misal app/tiktok/page.tsx):
//
//   import RatingWidget from "@/components/RatingWidget";
//   ...
//   {result && <RatingWidget toolId="tiktok" />}
//
// =====================================================================

export default function RatingWidget({ toolId }: { toolId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitRating(value: number, withComment?: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool_id: toolId, rating: value, comment: withComment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengirim rating");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  function handleStarClick(value: number) {
    setRating(value);
    if (value <= 3) {
      // Rating rendah → tampilkan kolom komentar dulu sebelum submit
      setShowComment(true);
    } else {
      // Rating tinggi → submit langsung, tidak perlu komentar
      submitRating(value);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60 text-center">
        🙏 Terima kasih atas rating-nya!
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-white/50 mb-2 text-center">
        Seberapa puas kamu dengan hasil ini?
      </p>
      <div className="flex items-center justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={loading}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl leading-none transition-transform hover:scale-110 disabled:opacity-50"
          >
            {(hovered || rating) >= star ? "⭐" : "☆"}
          </button>
        ))}
      </div>

      {showComment && (
        <div className="mt-3 space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Apa yang kurang dari hasil ini? (opsional)"
            rows={2}
            maxLength={500}
            className="w-full text-sm rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white placeholder:text-white/30 resize-none"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => submitRating(rating, comment)}
            className="w-full text-sm font-semibold py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Feedback"}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
    </div>
  );
}