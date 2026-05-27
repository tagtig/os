import { NextResponse } from 'next/server';
import { AUTH_COOKIE, COOKIE_MAX_AGE, appPassword, issueToken } from '@/lib/auth';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const password = (body as { password?: string })?.password ?? '';
  if (!appPassword() || password !== appPassword()) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }
  const token = await issueToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
