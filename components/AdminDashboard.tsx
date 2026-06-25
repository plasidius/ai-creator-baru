"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// =====================================================================
// Tipe data dari /api/admin/stats
// =====================================================================
type AdminStats = {
  users: { total: number; byPlan: Record<string, number> };
  revenue: { total: number; thisMonth: number; byPlan: Record<string, number> };
  usage: { totalGenerateToday: number };
  recentOrders: { order_id: string; plan: string; amount: number; status: string; created_at: string }[];
};

// Catatan: chart konsumsi token 7 hari & gauge latency masih pakai data
// statis di bawah karena belum ada tabel log token/latency di database.
// Begitu ada endpoint logging token per provider, ganti TOKEN_USAGE
// dengan hasil fetch juga.
const TOKEN_USAGE = [
  { day: "Sen", anthropic: 42000, openai: 18000 },
  { day: "Sel", anthropic: 51000, openai: 22000 },
  { day: "Rab", anthropic: 47000, openai: 19500 },
  { day: "Kam", anthropic: 63000, openai: 27000 },
  { day: "Jum", anthropic: 58000, openai: 24000 },
  { day: "Sab", anthropic: 39000, openai: 16000 },
  { day: "Min", anthropic: 71000, openai: 31000 },
];

const LATENCY = [
  { label: "Anthropic", ms: 820, max: 2000, color: "#00d4ff" },
  { label: "OpenAI", ms: 1140, max: 2000, color: "#7c9aff" },
  { label: "Replicate", ms: 1620, max: 2000, color: "#ff6b9d" },
];

const PLAN_META: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "#3a4252" },
  pro: { label: "Pro", color: "#00d4ff" },
  premium: { label: "Premium", color: "#7c9aff" },
};

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "layout-grid" },
  { id: "users", label: "Pengguna", icon: "users" },
  { id: "transactions", label: "Transaksi", icon: "receipt" },
  { id: "tools", label: "AI Tools", icon: "sparkles" },
  { id: "settings", label: "Pengaturan", icon: "settings" },
];

function Icon({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, JSX.Element> = {
    "layout-grid": (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="9" r="2.3" />
        <path d="M21 20c0-2.6-1.7-4.8-4-5.6" />
      </>
    ),
    receipt: (
      <>
        <path d="M6 2h12v20l-2.5-1.5L13 22l-2.5-1.5L8 22l-2-1.5V2Z" />
        <path d="M9 7h6M9 11h6M9 15h4" />
      </>
    ),
    sparkles: (
      <>
        <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
        <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1L15 3h-6l-.3 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4L4.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1L9 21h6l.3-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6Z" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

function StatCard({
  label,
  value,
  delta,
  positive = true,
  showArrow = false,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  showArrow?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#1d2433] bg-[#0d1119] p-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#00d4ff] opacity-[0.04] blur-2xl" />
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#5b6678] font-semibold mb-3">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#e8edf5] tabular-nums">{value}</p>
      <p
        className={`mt-2 text-xs font-medium ${
          showArrow ? (positive ? "text-[#00d4ff]" : "text-[#ff6b9d]") : "text-[#5b6678]"
        }`}
      >
        {showArrow && (positive ? "▲ " : "▼ ")}
        {delta}
      </p>
    </div>
  );
}

// Gauge setengah lingkaran untuk latency per provider
function LatencyGauge({
  label,
  ms,
  max,
  color,
}: {
  label: string;
  ms: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(ms / max, 1);
  const angle = pct * 180; // 0–180 derajat
  const r = 42;
  const cx = 50;
  const cy = 50;
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r * Math.cos(Math.PI - (angle * Math.PI) / 180);
  const endY = cy - r * Math.sin(Math.PI - (angle * Math.PI) / 180);
  const largeArc = angle > 180 ? 1 : 0;

  const status = ms < 1000 ? "Optimal" : ms < 1500 ? "Normal" : "Tinggi";

  return (
    <div className="flex flex-col items-center rounded-2xl border border-[#1d2433] bg-[#0d1119] p-5">
      <svg viewBox="0 0 100 58" className="w-full max-w-[150px]">
        <path
          d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1a212f"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <p className="text-xl font-bold text-[#e8edf5] tabular-nums -mt-2">
        {ms}
        <span className="text-xs text-[#5b6678] font-medium ml-1">ms</span>
      </p>
      <p className="text-[11px] text-[#5b6678] font-medium mt-1">{label}</p>
      <span
        className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ color, backgroundColor: `${color}1a` }}
      >
        {status}
      </span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#1d2433] bg-[#0d1119] px-3.5 py-2.5 shadow-2xl">
      <p className="text-[11px] text-[#5b6678] font-semibold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-[#8a93a3] capitalize">{p.dataKey}</span>
          <span className="text-[#e8edf5] font-semibold tabular-nums ml-auto">
            {p.value.toLocaleString("id-ID")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          throw new Error(
            res.status === 401 ? "Sesi admin habis, silakan login ulang" : "Gagal memuat data"
          );
        }
        const data = await res.json();
        setStats(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const plans = useMemo(() => {
    if (!stats) return [];
    return Object.entries(PLAN_META).map(([id, meta]) => ({
      id,
      label: meta.label,
      color: meta.color,
      users: stats.users.byPlan[id] ?? 0,
      revenue: stats.revenue.byPlan[id] ?? 0,
    }));
  }, [stats]);

  const totalUsers = stats?.users.total ?? 0;
  const totalRevenue = stats?.revenue.total ?? 0;
  const totalGenerateToday = stats?.usage.totalGenerateToday ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a10] text-[#5b6678]">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-4 h-4 border-2 border-[#1d2433] border-t-[#00d4ff] rounded-full animate-spin" />
          Memuat data dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a10]">
        <div className="text-center">
          <p className="text-[#ff6b9d] font-semibold mb-2">{error}</p>
          <p className="text-xs text-[#5b6678]">
            Coba muat ulang halaman, atau login kembali kalau sesi sudah habis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#070a10] text-[#e8edf5]">
      {/* ============ SIDEBAR ============ */}
      <aside className="w-60 shrink-0 border-r border-[#161b26] flex flex-col py-6">
        <div className="flex items-center gap-2.5 px-6 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#00d4ff] flex items-center justify-center shadow-[0_0_18px_#00d4ff66]">
            <Icon name="sparkles" className="w-4 h-4 text-[#070a10]" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">AI Suite</p>
            <p className="text-[10px] text-[#5b6678] leading-none mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#00d4ff] bg-[#00d4ff0f]"
                    : "text-[#6b7484] hover:text-[#aab2c0] hover:bg-[#11151f]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                )}
                <Icon name={item.icon} className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6b7484] hover:text-[#ff6b9d] hover:bg-[#11151f] transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between px-8 py-6 border-b border-[#161b26]">
          <div>
            <h1 className="text-xl font-bold">Overview</h1>
            <p className="text-sm text-[#5b6678] mt-0.5">
              Ringkasan performa & metrik AI Suite hari ini
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d1119] border border-[#1d2433]">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-[#00e09c] opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#00e09c]" />
            </span>
            <span className="text-xs font-medium text-[#8a93a3]">
              Sistem normal
            </span>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* STAT CARDS */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Total Pengguna"
              value={totalUsers.toLocaleString("id-ID")}
              delta="data real-time"
            />
            <StatCard
              label="Total Revenue"
              value={`Rp ${(totalRevenue / 1000).toLocaleString("id-ID")}rb`}
              delta={`Rp ${((stats?.revenue.thisMonth ?? 0) / 1000).toLocaleString("id-ID")}rb bulan ini`}
            />
            <StatCard
              label="Generate Hari Ini"
              value={totalGenerateToday.toLocaleString("id-ID")}
              delta="akumulasi semua user"
            />
            <StatCard
              label="Order Terbaru"
              value={String(stats?.recentOrders.length ?? 0)}
              delta="10 transaksi terakhir"
            />
          </div>

          {/* CHART + LATENCY ROW */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 rounded-2xl border border-[#1d2433] bg-[#0d1119] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-sm">Konsumsi Token AI</h2>
                  <p className="text-xs text-[#5b6678] mt-0.5">
                    7 hari terakhir · Anthropic vs OpenAI
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-[#8a93a3]">
                    <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />
                    Anthropic
                  </span>
                  <span className="flex items-center gap-1.5 text-[#8a93a3]">
                    <span className="w-2 h-2 rounded-full bg-[#7c9aff]" />
                    OpenAI
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={TOKEN_USAGE}>
                  <defs>
                    <linearGradient id="gradAnthropic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOpenai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c9aff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7c9aff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#161b26" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#5b6678", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#5b6678", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="anthropic"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    fill="url(#gradAnthropic)"
                  />
                  <Area
                    type="monotone"
                    dataKey="openai"
                    stroke="#7c9aff"
                    strokeWidth={2}
                    fill="url(#gradOpenai)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-[#1d2433] bg-[#0d1119] p-6">
              <h2 className="font-bold text-sm mb-1">Latensi Sistem</h2>
              <p className="text-xs text-[#5b6678] mb-5">Rata-rata respons API</p>
              <div className="grid grid-cols-1 gap-3">
                {LATENCY.map((l) => (
                  <LatencyGauge key={l.label} {...l} />
                ))}
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION GRID */}
          <div className="rounded-2xl border border-[#1d2433] bg-[#0d1119] p-6">
            <h2 className="font-bold text-sm mb-1">Distribusi Paket</h2>
            <p className="text-xs text-[#5b6678] mb-6">
              Jumlah pengguna & kontribusi revenue per paket
            </p>
            <div className="grid grid-cols-3 gap-4">
              {plans.map((plan) => {
                const pct = totalUsers > 0 ? (plan.users / totalUsers) * 100 : 0;
                return (
                  <div
                    key={plan.id}
                    className="rounded-xl border border-[#1d2433] p-5 bg-[#0a0e15]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          color: plan.color,
                          backgroundColor: `${plan.color}1a`,
                        }}
                      >
                        {plan.label}
                      </span>
                      <span className="text-xs text-[#5b6678] tabular-nums">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">
                      {plan.users.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-[#5b6678] mt-1">pengguna</p>
                    <div className="mt-4 h-1.5 rounded-full bg-[#161b26] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: plan.color,
                          boxShadow: `0 0 8px ${plan.color}88`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-[#8a93a3] mt-3">
                      Rp {plan.revenue.toLocaleString("id-ID")}
                      <span className="text-[#5b6678]"> total revenue</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}