const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://snap-assets.sandbox.midtrans.com; frame-src 'self' https://app.sandbox.midtrans.com; connect-src 'self' https://api.sandbox.midtrans.com https://*.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;