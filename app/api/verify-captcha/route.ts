import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secretKey}&response=${token}`,
  });

  const data = await res.json();

  if (data.success && data.score > 0.5) {
    return NextResponse.json({ success: true, score: data.score });
  }

  return NextResponse.json({ success: false, score: data.score });
}