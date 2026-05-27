import { NextResponse } from 'next/server';
import { AUTH_COOKIE, COOKIE_MAX_AGE, appPassword, issueToken } from '@/lib/auth';
import { getUserByEmail, updateLastLogin } from '@/lib/supabase/users-repo';
import { verifyPassword } from '@/lib/password';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  if (!password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  let userId: string;
  let role: 'admin' | 'user' = 'admin';

  if (email) {
    // Email + Passwort Login
    const user = await getUserByEmail(email).catch(() => null);

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    if (!user.password_hash) {
      // Einladung wurde noch nicht angenommen
      return NextResponse.json({ error: 'invite_pending' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    userId = user.id;
    role = user.role;
    await updateLastLogin(userId).catch(() => {});
  } else if (appPassword() && password === appPassword()) {
    // Legacy: geteiltes Passwort → Admin
    userId = 'legacy-admin';
    role = 'admin';
  } else {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  const token = await issueToken(userId, role);
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
