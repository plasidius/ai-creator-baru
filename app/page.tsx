"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Tool = {
  href: string;
  iconEmoji: string;
  title: string;
  desc: string;
  badge: string | null;
  badgeColor: string;
  linkColor: string;
  category: string;
  extraBadge?: string;
  bgColor: string;
};

const TOOLS: Tool[] = [
  { href: "/tiktok", iconEmoji: "🎵", title: "TikTok AI Script", desc: "Generate script viral TikTok otomatis dengan AI", badge: "Popular", badgeColor: "bg-purple-500", linkColor: "text-purple-400", category: "Konten", bgColor: "#000000" },
  { href: "/shorts", iconEmoji: "▶️", title: "YouTube Shorts", desc: "Script + thumbnail + video preview untuk Shorts", badge: null, badgeColor: "", linkColor: "text-red-400", category: "Konten", bgColor: "#FF0000" },
  { href: "/voice", iconEmoji: "🎤", title: "Voice Script", desc: "Script untuk voice over konten profesional", badge: null, badgeColor: "", linkColor: "text-blue-400", category: "Konten", bgColor: "#3B82F6" },
  { href: "/hook", iconEmoji: "🔥", title: "Hook Library", desc: "Generate 10 hook pembuka konten viral sekaligus", badge: "New", badgeColor: "bg-green-500", linkColor: "text-purple-400", category: "Konten", bgColor: "#EF4444" },
  { href: "/fb-pro", iconEmoji: "📘", title: "FB Pro – Kreator Reels", desc: "Script + hook + caption + hashtag untuk Reels", badge: "New", badgeColor: "bg-green-500", linkColor: "text-blue-400", category: "Konten", bgColor: "#1877F2", extraBadge: "PRO" },
  { href: "/affiliate", iconEmoji: "🛒", title: "Affiliate Caption", desc: "Caption affiliate viral untuk TikTok Shop & Shopee", badge: "Popular", badgeColor: "bg-purple-500", linkColor: "text-orange-400", category: "Bisnis", bgColor: "#F97316" },
  { href: "/wa-reply", iconEmoji: "💬", title: "Auto Reply WA", desc: "Template balasan WhatsApp CS & closing otomatis", badge: "New", badgeColor: "bg-green-500", linkColor: "text-green-400", category: "Bisnis", bgColor: "#25D366" },
  { href: "/objection", iconEmoji: "🤔", title: "Objection Handler", desc: "Jawaban otomatis untuk calon pembeli yang ragu-ragu", badge: "New", badgeColor: "bg-green-500", linkColor: "text-orange-400", category: "Bisnis", bgColor: "#F59E0B" },
  { href: "/repurpose", iconEmoji: "🔁", title: "Content Repurpose", desc: "Ubah 1 konten jadi 5 format sekaligus", badge: "New", badgeColor: "bg-green-500", linkColor: "text-blue-400", category: "Marketing", bgColor: "#3B82F6" },
  { href: "/trending", iconEmoji: "📈", title: "Trending Topic Finder", desc: "Temukan topik viral terbaru dari semua platform", badge: "Popular", badgeColor: "bg-purple-500", linkColor: "text-green-400", category: "Marketing", bgColor: "#059669" },
  { href: "/video-animation", iconEmoji: "🎬", title: "AI Video Animation", desc: "Ubah script menjadi video animasi otomatis", badge: "New", badgeColor: "bg-green-500", linkColor: "text-purple-400", category: "Video", bgColor: "#7C3AED" },
  { href: "/talking-avatar", iconEmoji: "🤖", title: "Talking Avatar", desc: "Avatar AI berbicara sesuai script dan voice over", badge: "New", badgeColor: "bg-green-500", linkColor: "text-blue-400", category: "Video", bgColor: "#0891B2" },
  { href: "/character-animation", iconEmoji: "🎭", title: "Character Animation", desc: "Buat karakter kartun bergerak dari prompt", badge: "New", badgeColor: "bg-green-500", linkColor: "text-purple-400", category: "Video", bgColor: "#9333EA" },
  { href: "/story-animation", iconEmoji: "📖", title: "Story Animation", desc: "Ubah cerita menjadi video animasi lengkap", badge: "New", badgeColor: "bg-green-500", linkColor: "text-orange-400", category: "Video", bgColor: "#D97706" },
  { href: "/image-to-animation", iconEmoji: "🖼️", title: "Image to Animation", desc: "Jadikan foto statis bergerak dengan efek animasi", badge: "New", badgeColor: "bg-green-500", linkColor: "text-teal-400", category: "Video", bgColor: "#059669" },
  { href: "/voice-to-video", iconEmoji: "🎙️", title: "Voice to Video", desc: "Upload suara, AI buat video otomatis", badge: "New", badgeColor: "bg-green-500", linkColor: "text-green-400", category: "Video", bgColor: "#059669" },
  { href: "/reels-generator", iconEmoji: "📱", title: "Reels Video Generator", desc: "Script → Voice → Subtitle → Video Reels otomatis", badge: "New", badgeColor: "bg-green-500", linkColor: "text-pink-400", category: "Video", bgColor: "#DB2777" },
  { href: "/text-to-video", iconEmoji: "✨", title: "Text to Video", desc: "Ketik ide, AI hasilkan video pendek siap pakai", badge: "New", badgeColor: "bg-green-500", linkColor: "text-yellow-400", category: "Video", bgColor: "#D97706" },
];

const CATEGORY_INFO = [
  { id: "Konten", label: "Konten", emoji: "📝", desc: "Buat script, ide, hook, dan optimasi konten viral dengan AI.", color: "from-blue-900/60 to-blue-800/30", border: "border-blue-500/20", btnColor: "bg-blue-600/30 hover:bg-blue-600/50 text-blue-300" },
  { id: "Bisnis", label: "Bisnis", emoji: "💼", desc: "Tingkatkan penjualan dan layanan pelanggan dengan otomasi AI.", color: "from-green-900/60 to-green-800/30", border: "border-green-500/20", btnColor: "bg-green-600/30 hover:bg-green-600/50 text-green-300" },
  { id: "Marketing", label: "Marketing", emoji: "📣", desc: "Promosikan konten dan jangkau audiens lebih luas dengan strategi AI.", color: "from-purple-900/60 to-purple-800/30", border: "border-purple-500/20", btnColor: "bg-purple-600/30 hover:bg-purple-600/50 text-purple-300" },
  { id: "Video", label: "Video", emoji: "🎬", desc: "Buat video, animasi, avatar, dan konten visual otomatis dengan AI.", color: "from-orange-900/60 to-orange-800/30", border: "border-orange-500/20", btnColor: "bg-orange-600/30 hover:bg-orange-600/50 text-orange-300" },
];

const SIDEBAR_ITEMS = [
  { id: "Semua", label: "Semua Tools", emoji: "⚡" },
  { id: "Konten", label: "Konten", emoji: "📝" },
  { id: "Bisnis", label: "Bisnis", emoji: "💼" },
  { id: "Marketing", label: "Marketing", emoji: "📣" },
  { id: "Video", label: "Video", emoji: "🎬" },
];

export default function Dashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPlan, setUserPlan] = useState("free");
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [proUsers, setProUsers] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Cek Supabase session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, plan, usage_count")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserName(profile.name || user.email?.split("@")[0] || "");
          setUserPlan(profile.plan || "free");
          setUsageCount(profile.usage_count || 0);
          setUsageLimit(profile.plan === "premium" ? 999999 : profile.plan === "pro" ? 100 : 10);
        }

        // Ambil total users & pro users
        const { count: total } = await supabase.from("profiles").select("*", { count: "exact", head: true });
        const { count: pro } = await supabase.from("profiles").select("*", { count: "exact", head: true }).neq("plan", "free");
        setTotalUsers(total || 0);
        setProUsers(pro || 0);
      } else {
        // Fallback localStorage
        const stored = localStorage.getItem("ai_suite_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserName(parsed.name || parsed.email?.split("@")[0] || "");
          setUserEmail(parsed.email || "");
        }
      }
    }
    fetchData();
  }, []);

  function handleLogout() {
    supabase.auth.signOut();
    localStorage.removeItem("ai_suite_user");
    document.cookie = "ai_suite_session=; path=/; max-age=0";
    router.push("/login");
  }

  const filtered = TOOLS.filter((t) => {
    const matchCat = category === "Semua" || t.category === category;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const catCounts: Record<string, number> = {
    Semua: TOOLS.length,
    Konten: TOOLS.filter(t => t.category === "Konten").length,
    Bisnis: TOOLS.filter(t => t.category === "Bisnis").length,
    Marketing: TOOLS.filter(t => t.category === "Marketing").length,
    Video: TOOLS.filter(t => t.category === "Video").length,
  };

  return (
    <div className="min-h-screen text-white flex" style={{ backgroundColor: "#0a0b0f" }}>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 flex flex-col border-r border-white/5 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: "#0d0e14" }}>

        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-fuchsia-500/30">
              🤖
            </div>
            <div>
              <div className="font-black text-base leading-none">AI Suite</div>
              <div className="text-white/40 text-xs mt-0.5">Indonesia Creator Tools</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Semua Tools */}
          <button onClick={() => { setCategory("Semua"); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${category === "Semua" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">⚡</span>
              <span>Semua Tools</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-black ${category === "Semua" ? "bg-white/20" : "bg-white/10"}`}>{catCounts.Semua}</span>
          </button>

          <div className="pt-3 pb-1">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-4">Kategori</p>
          </div>

          {SIDEBAR_ITEMS.slice(1).map((item) => (
            <button key={item.id} onClick={() => { setCategory(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${category === item.id ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span>{item.label}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-black ${category === item.id ? "bg-white/20" : "bg-white/10"}`}>{catCounts[item.id]}</span>
            </button>
          ))}
        </nav>

        {/* Upgrade Box */}
        <div className="p-4 border-t border-white/5">
          {userPlan === "free" ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-900/50 to-violet-900/50 border border-fuchsia-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💎</span>
                <span className="font-black text-sm">Upgrade ke Pro</span>
              </div>
              <p className="text-white/50 text-xs mb-3">Akses semua fitur premium dan tingkatkan produktivitas konten Anda.</p>
              <a href="/pricing" className="block w-full py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-xs font-black text-center shadow-lg hover:opacity-90 transition-all">
                Upgrade Sekarang
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <p className="font-black text-sm">{userPlan.toUpperCase()}</p>
                  <p className="text-white/50 text-xs">Akun aktif</p>
                </div>
              </div>
            </div>
          )}

          {/* Pengguna Hari Ini */}
          <div className="mt-3 p-4 rounded-2xl border border-white/5" style={{ backgroundColor: "#13141a" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400">⚡</span>
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Pengguna Hari Ini</span>
            </div>
            <div className="text-2xl font-black text-white mb-0.5">{totalUsers}</div>
            <div className="text-white/40 text-xs">Total pengguna terdaftar</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-fuchsia-400 font-bold">👑 {proUsers} Pengguna Pro</span>
            </div>
            <a href="/pricing" className="mt-3 block w-full py-2 rounded-xl border border-white/10 text-white/50 text-xs text-center hover:bg-white/5 transition-all">
              Lihat Riwayat
            </a>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center text-sm font-black flex-shrink-0">
                {userName.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{userName || "User"}</p>
                <p className="text-white/40 text-xs truncate">{userEmail}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0 text-lg">
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP BAR */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-5 py-4 border-b border-white/5" style={{ backgroundColor: "#0a0b0f" }}>
          {/* Mobile menu */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white">
            ☰
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tools atau fitur..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl text-sm outline-none text-white placeholder:text-white/30 border border-white/10 focus:border-violet-500/50 transition-colors"
              style={{ backgroundColor: "#13141a" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs">✕</button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <a href="/pricing"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-black shadow-lg shadow-fuchsia-500/30 hover:opacity-90 transition-all flex items-center gap-2">
              💎 Upgrade
            </a>
            <button className="w-9 h-9 rounded-2xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all relative"
              style={{ backgroundColor: "#13141a" }}>
              🔔
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-fuchsia-500 rounded-full" />
            </button>
            <button onClick={handleLogout}
              className="px-3 py-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all flex items-center gap-1.5"
              style={{ backgroundColor: "#13141a" }}>
              🚪 Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* Show category cards when "Semua" and no search */}
          {category === "Semua" && !search ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">Pilih Kategori</h1>
                <p className="text-white/50">Pilih kategori untuk menemukan tools AI yang sesuai dengan kebutuhan Anda.</p>
              </div>

              {/* Category Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {CATEGORY_INFO.map((cat) => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className={`relative p-8 rounded-3xl border text-left transition-all hover:scale-[1.02] overflow-hidden bg-gradient-to-br ${cat.color} ${cat.border}`}>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black mb-2">{cat.label}</h2>
                      <p className="text-white/60 text-sm mb-4 max-w-xs">{cat.desc}</p>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${cat.btnColor}`}>
                        {catCounts[cat.id]} Tools <span>›</span>
                      </span>
                    </div>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none">
                      {cat.emoji}
                    </div>
                  </button>
                ))}
              </div>

              {/* Bottom Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 border border-violet-500/20 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🏆</span>
                  <div>
                    <p className="font-black text-lg">{TOOLS.length} AI Tools Siap Membantu Anda</p>
                    <p className="text-white/50 text-sm">Hemat waktu, tingkatkan kreativitas, dan hasilkan konten terbaik dengan AI.</p>
                  </div>
                </div>
                <span className="text-5xl">🚀</span>
              </div>
            </>
          ) : (
            <>
              {/* Category header */}
              {category !== "Semua" && (
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setCategory("Semua")} className="text-white/40 hover:text-white text-sm transition-colors">
                    ← Semua Kategori
                  </button>
                  <span className="text-white/20">/</span>
                  <span className="font-black">{category}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold">{catCounts[category]} tools</span>
                </div>
              )}

              {search && (
                <div className="mb-6">
                  <h2 className="text-lg font-black">Hasil pencarian: &quot;{search}&quot;</h2>
                  <p className="text-white/40 text-sm">{filtered.length} tools ditemukan</p>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="text-center py-24 text-white/30">
                  <div className="text-5xl mb-4">🔍</div>
                  <p>Tidak ada tools untuk &quot;{search}&quot;</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filtered.map((tool) => (
                    <a key={tool.href} href={tool.href}
                      className="group relative flex flex-col p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] hover:border-white/20"
                      style={{ backgroundColor: "#13141a", borderColor: "rgba(255,255,255,0.07)" }}>

                      {tool.badge && (
                        <span className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold text-white ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      )}

                      <div className="mb-3 flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ backgroundColor: tool.bgColor }}>
                          {tool.iconEmoji}
                        </div>
                        {tool.extraBadge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-black text-white bg-blue-600">{tool.extraBadge}</span>
                        )}
                      </div>

                      <h2 className="font-bold text-sm text-white mb-1 leading-tight">{tool.title}</h2>
                      <p className="text-white/45 text-xs leading-relaxed flex-1">{tool.desc}</p>

                      <div className={`mt-3 text-xs font-semibold flex items-center gap-1 ${tool.linkColor} group-hover:gap-2 transition-all`}>
                        Buka tool <span>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* FOOTER */}
        <footer className="px-6 py-4 border-t border-white/5 text-center text-white/20 text-xs">
          Powered by Claude AI • Made with ❤️ for Indonesian Creators 🇮🇩 • © 2026 AI Content Suite
        </footer>
      </div>
    </div>
  );
}