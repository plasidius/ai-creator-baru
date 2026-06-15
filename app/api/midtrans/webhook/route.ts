import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

const MidtransClient = require('midtrans-client');
const { createClient } = require('@supabase/supabase-js');

const snap = new MidtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notification = await snap.transaction.notification(body);
    const { order_id, transaction_status, fraud_status } = notification;

    let status = 'pending';
    if (transaction_status === 'capture' && fraud_status === 'accept') {
      status = 'paid';
    } else if (transaction_status === 'settlement') {
      status = 'paid';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      status = 'failed';
    }

    await supabase.from('orders').update({ status }).eq('order_id', order_id);

    if (status === 'paid') {
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, plan')
        .eq('order_id', order_id)
        .single();

      if (order) {
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 30);

        await supabase
          .from('profiles')
          .update({ plan: order.plan, expired_at: expiredAt.toISOString() })
          .eq('id', order.user_id);

        // Ambil email user
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, name')
          .eq('id', order.user_id)
          .single();

        // Kirim email notifikasi
        if (profile?.email) {
          await resend.emails.send({
            from: 'AI Suite <onboarding@resend.dev>',
            to: profile.email,
            subject: `✅ Pembayaran Berhasil - Paket ${order.plan}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #7c3aed;">🎉 Pembayaran Berhasil!</h1>
                <p>Halo <strong>${profile.name || 'User'}</strong>,</p>
                <p>Terima kasih! Pembayaran kamu untuk <strong>Paket ${order.plan}</strong> telah berhasil diproses.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0;">Detail Transaksi:</h3>
                  <p style="margin: 5px 0;">📦 Paket: <strong>${order.plan}</strong></p>
                  <p style="margin: 5px 0;">📅 Aktif hingga: <strong>${expiredAt.toLocaleDateString('id-ID')}</strong></p>
                  <p style="margin: 5px 0;">🔖 Order ID: <strong>${order_id}</strong></p>
                </div>
                <p>Akun kamu sudah diupgrade! Silakan login untuk menikmati fitur premium.</p>
                <a href="https://ai-creator-baru-mglj.vercel.app/dashboard" 
                   style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 10px;">
                  Buka Dashboard
                </a>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                  AI Suite Indonesia Creator
                </p>
              </div>
            `,
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}