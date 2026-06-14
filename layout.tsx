import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

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
                {children}
            </body>
        </html>
    );
}