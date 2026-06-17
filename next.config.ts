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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://snap-assets.sandbox.midtrans.com https://www.google.com https://www.gstatic.com https://recaptcha.net",
              "frame-src 'self' https://app.sandbox.midtrans.com https://www.google.com https://recaptcha.net",
              "connect-src 'self' https://api.sandbox.midtrans.com https://*.supabase.co wss://*.supabase.co https://www.google.com",
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