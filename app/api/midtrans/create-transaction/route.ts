import { NextRequest, NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { createClient } from '@supabase/supabase-js';
import { getPlanPrice } from '@/lib/plans';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, email, plan: rawPlan } = await req.json();
    const plan = typeof rawPlan === 'string' ? rawPlan.toLowerCase() : rawPlan;

    // ===== VALIDASI HARGA DI SERVER — JANGAN PERCAYA `amount` DARI CLIENT =====
    const amount = getPlanPrice(plan);
    if (amount === null) {
      return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 });
    }
    if (amount === 0) {
      return NextResponse.json({ error: 'Paket gratis tidak memerlukan transaksi' }, { status: 400 });
    }

const validEmail = email && email.includes('@') ? email : 'user@example.com';
const orderId = `ORD-${Date.now()}`;

const { data: orderData, error: orderError } = await supabase.from('orders').insert({
  order_id: orderId,
  user_id,
  plan,
  amount,
  status: 'pending',
});
console.log('Order insert result:', orderData, orderError);
const transaction = await snap.createTransaction({
  transaction_details: {
    order_id: orderId,
    gross_amount: amount,
  },
  customer_details: {
    email: validEmail,
  },
  item_details: [
    {
      id: plan,
      price: amount,
      quantity: 1,
      name: `Paket ${plan}`,
    },
  ],
});

    return NextResponse.json({
      token: transaction.token,
      orderId,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat transaksi' },
      { status: 500 }
    );
  }
}"// redeploy"