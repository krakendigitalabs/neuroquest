import { NextRequest, NextResponse } from 'next/server';
import { SUPERADMIN_COOKIE_NAME } from '@/lib/superadmin-config';

export async function POST(request: NextRequest) {
  const { pin } = await request.json();
  const expectedPin = process.env.SUPERADMIN_PIN?.trim();

  if (!expectedPin || expectedPin.length !== 3) {
    return NextResponse.json(
      { error: 'superadmin-pin-not-configured' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (pin !== expectedPin) {
    return NextResponse.json(
      { error: 'invalid-pin' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(SUPERADMIN_COOKIE_NAME, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
