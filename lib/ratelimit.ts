import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Koneksi ke Upstash Redis (ambil otomatis dari env var)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter untuk endpoint AI tools (misal: 10 request per 60 detik per user/IP)
export const aiToolRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "ratelimit:ai-tool",
  analytics: true, // bisa lihat statistik di dashboard Upstash
});

// Rate limiter lebih ketat untuk login/auth (mencegah brute-force)
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "ratelimit:auth",
  analytics: true,
});

// Rate limiter longgar untuk akses umum (anti-spam dasar)
export const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  prefix: "ratelimit:global",
  analytics: true,
});