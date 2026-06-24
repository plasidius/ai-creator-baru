// Set NEXT_PUBLIC_MIDTRANS_ENV=production di Vercel saat sudah live transaksi asli.
// Default tetap "sandbox" supaya aman saat development.
const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production";

// Domain Midtrans Snap berbeda antara sandbox dan production
const midtransAppDomain = isProduction
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";

const midtransSnapAssetsDomain = isProduction
  ? "https://snap-assets.midtrans.com"
  : "https://snap-assets.sandbox.midtrans.com";

const midtransApiDomain = isProduction
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${midtransAppDomain} ${midtransSnapAssetsDomain} ${midtransApiDomain} https://pay.google.com https://gwk.gopayapi.com https://www.google.com https://www.gstatic.com https://recaptcha.net`,
              `frame-src 'self' ${midtransAppDomain} https://pay.google.com https://www.google.com https://recaptcha.net`,
              `connect-src 'self' ${midtransApiDomain} https://pay.google.com https://gwk.gopayapi.com https://*.supabase.co wss://*.supabase.co https://www.google.com`,
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;