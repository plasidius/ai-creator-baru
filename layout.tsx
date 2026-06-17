import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AI Suite',
    description: 'Platform AI Tools',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id">
 <body className={inter.className}>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
          {children}
        </GoogleReCaptchaProvider>
      </body>
        </html>
    );
}