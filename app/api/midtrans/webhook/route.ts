import { NextRequest, NextResponse } from 'next/server';

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
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}