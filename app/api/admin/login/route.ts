import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
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