import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'plasidius7@gmail.com',
      subject: 'Test Email dari AI Suite',
      html: '<p>Email test berhasil! 🎉</p>',
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}