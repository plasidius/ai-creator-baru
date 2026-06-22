"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ANIMATION_TYPES = [
  { id: "parallax", label: "🎞️ Parallax", desc: "Efek kedalaman 3D" },
  { id: "zoom", label: "🔍 Zoom In/Out", desc: "Dramatis & sinematik" },
  { id: "float", label: "🌊 Float", desc: "Mengambang lembut" },
  { id: "shake", label: "⚡ Shake", desc: "Energik, hype" },
  { id: "glitch", label: "👾 Glitch", desc: "Efek digital error" },
  { id: "fade", label: "✨ Fade Reveal", desc: "Muncul perlahan" },
];

export default function ImageToAnimation() {
  const router = useRouter();
  const [plan, setPlan] = useState("free");
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [animType, setAnimType] = useState("parallax");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      setPlan(data?.plan || "free");
      setCheckingPlan(false);
    }
    checkPlan();
  }, [router]);

  const hasAccess = plan === "pro" || plan === "premium";

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("❌ File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("❌ Ukuran gambar maksimal 5MB");
      return;
    }

    setError("");
    setImageFile(file);
    setVideoUrl("");

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function generate() {
    if (!imageFile) {
      setError("❌ Upload gambar dulu");
      return;
    }

    setLoading(true);
    setError("");
    setVideoUrl("");

    try {
      const base64 = await fileToBase64(imageFile);

      const res = await fetch("/api/generate-video-from-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          animType,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError("❌ " + data.error);
      } else {
        setVideoUrl(data.videoUrl);
      }
    } catch (err) {
      console.error(err);
      setError("❌ Gagal connect ke server");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setImageFile(null);
    setImagePreview("");
    setVideoUrl("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (checkingPlan) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/40">Memuat...</div>
      </main>
    );
  }

  // ===== LOCKED VIEW UNTUK FREE USER =====
  if (!hasAccess) {
    return (
      <main className="min-h-screen text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
        <div className="absolute inset-0 opacity-40">
          <div className="w-[500px] h-[500px] bg-teal-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        </div>

        <div className="relative z-10 p-6 md:p-10">
          <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
            <a href="/image-to-animation" className="px-4 py-2 rounded-xl bg-teal-500/30 border border-teal-500/40">🖼️ Image to Animation</a>
          </div>

          <div className="max-w-xl mx-auto mt-20 p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-black mb-2">Fitur Khusus Pro & Premium</h1>
            <p className="text-white/60 mb-6">
              Image to Animation menggunakan AI video generation berkualitas tinggi yang
              membutuhkan resource lebih besar. Upgrade ke Pro atau Premium untuk mengakses fitur ini.
            </p>
            <a
              href="/pricing"
              className="inline-block px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:opacity-90"
            >
              ⚡ Upgrade Sekarang
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ===== FULL ACCESS VIEW UNTUK PRO/PREMIUM =====
  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40">
        <div className="w-[500px] h-[500px] bg-teal-600 blur-[140px] rounded-full absolute top-[-100px] left-[-100px]" />
        <div className="w-[500px] h-[500px] bg-green-500 blur-[140px] rounded-full absolute bottom-[-120px] right-[-120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        <div className="mb-8 flex flex-wrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <a href="/" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">🏠 Dashboard</a>
          <a href="/image-to-animation" className="px-4 py-2 rounded-xl bg-teal-500/30 border border-teal-500/40">🖼️ Image to Animation</a>
        </div>

        <div className="mb-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-black">🖼️ Image to Animation</h1>
              <p className="text-white/60 mt-2">Upload foto, pilih efek, dan ubah jadi video animasi otomatis dengan AI</p>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              ⭐ {plan.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">

            {/* UPLOAD BOX */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-3 block">Upload Gambar Kamu</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />

              {!imagePreview ? (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-56 rounded-2xl border-2 border-dashed border-white/20 bg-black/30 cursor-pointer hover:border-teal-400/50 hover:bg-black/40 transition-all"
                >
                  <div className="text-4xl mb-2">📤</div>
                  <p className="text-white/60 text-sm">Klik untuk upload gambar</p>
                  <p className="text-white/30 text-xs mt-1">JPG, PNG, max 5MB</p>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-56 object-cover rounded-2xl"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-red-500/80 flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                  <label
                    htmlFor="image-upload"
                    className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-xs cursor-pointer"
                  >
                    🔄 Ganti
                  </label>
                </div>
              )}
            </div>

            {/* ANIMATION TYPE */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <label className="text-white/60 text-sm mb-3 block">Pilih Efek Animasi</label>
              <div className="grid grid-cols-2 gap-3">
                {ANIMATION_TYPES.map((a) => (
                  <button key={a.id} onClick={() => setAnimType(a.id)}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      animType === a.id ? "bg-teal-500/40 border-teal-400" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}>
                    <div className="font-bold text-sm">{a.label}</div>
                    <div className="text-xs text-white/50 mt-0.5">{a.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button onClick={generate} disabled={loading || !imageFile}
              className="w-full py-3 rounded-xl font-bold bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ Membuat video animasi... (bisa 30-60 detik)" : "🎬 Generate Video Animasi"}
            </button>
          </div>

          {/* RESULT */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <h2 className="text-teal-400 font-bold text-lg mb-4">🎬 Hasil Video</h2>

            {loading && (
              <div className="rounded-2xl bg-white/10 w-full aspect-[9/16] flex flex-col items-center justify-center gap-3 animate-pulse">
                <div className="text-4xl">🎬</div>
                <p className="text-white/40 text-sm text-center px-4">Sedang membuat animasi...</p>
                <p className="text-white/20 text-xs">Proses ini butuh waktu 30-60 detik</p>
              </div>
            )}

            {!loading && videoUrl && (
              <div>
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full rounded-2xl"
                />
                <a
                  href={videoUrl}
                  download="animasi-ai.mp4"
                  className="block mt-4 text-center py-3 rounded-xl bg-green-600 hover:bg-green-700 font-bold"
                >
                  ⬇ Download Video
                </a>
              </div>
            )}

            {!loading && !videoUrl && (
              <div className="rounded-2xl bg-white/5 w-full aspect-[9/16] flex flex-col items-center justify-center gap-3 border border-white/10">
                <div className="text-4xl opacity-30">🎞️</div>
                <p className="text-white/30 text-sm text-center px-4">
                  Upload gambar dan klik Generate untuk melihat hasilnya di sini
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}