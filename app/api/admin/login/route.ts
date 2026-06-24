import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ratelimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  // Rate limit lebih ketat untuk login admin (anti brute-force)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  const { success } = await ratelimit.limit(`admin-login:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan login. Coba lagi nanti.' },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const cookieStore = await cookies();
    cookieStore.set('admin_email', email, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}