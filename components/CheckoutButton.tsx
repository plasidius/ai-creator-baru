'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    userId: string;
    email: string;
    plan: string;
    amount: number;
}

declare global {
    interface Window {
        snap: {
            pay: (token: string, options: object) => void;
        };
    }
}

export default function CheckoutButton({ userId, email, plan, amount }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey || '');
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/midtrans/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, email, plan, amount }),
            });

            const text = await res.text();
            if (!text) {
                alert('Server error. Cek terminal!');
                setLoading(false);
                return;
            }
            const data = JSON.parse(text);

            if (!data.token) {
                alert('Gagal mendapat token: ' + (data.error || 'Unknown error'));
                setLoading(false);
                return;
            }

            window.snap.pay(data.token, {
                onSuccess: () => {
                    router.push('/dashboard?payment=success');
                },
                onPending: () => {
                    router.push('/dashboard?payment=pending');
                },
                onError: () => {
                    alert('Pembayaran gagal! Silakan coba lagi.');
                    setLoading(false);
                },
                onClose: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memproses...
                </span>
            ) : (
                `Upgrade ke ${plan}`
            )}
        </button>
    );
}