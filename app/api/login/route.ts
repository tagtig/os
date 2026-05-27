import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE, COOKIE_MAX_AGE, appPassword, issueToken } from '@/lib/auth';
import { getUserByEmail, updateLastLogin } from '@/lib/supabase/users-repo';
import { verifyPassword } from '@/lib/password';

/** Liest Body als JSON oder als HTML-Form (application/x-www-form-urlencoded). */
async function parseBody(req: NextRequest): Promise<{ email?: string; password?: string; redirect?: string }> {
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const data = await req.json().catch(() => ({}));
    return data as { email?: string; password?: string; redirect?: string };
  }
  // HTML-Form POST
  const formData = await req.formData().catch(() => new FormData());
  return {
    email: (formData.get('email') as string | null) ?? undefined,
    password: (formData.get('password') as string | null) ?? undefined,
    redirect: (formData.get('redirect') as string | null) ?? undefined,
  };
}

function loginUrl(req: NextRequest, error: string, redirect?: string): URL {
  const url = new URL('/login', req.url);
  url.searchParams.set('error', error);
  if (redirect?.startsWith('/')) url.searchParams.set('redirect', redirect);
  return url;
}

export async function POST(req: NextRequest) {
  let email: string | undefined;
  let password: string | undefined;
  let redirectTo: string | undefined;

  try {
    ({ email, password, redirect: redirectTo } = await parseBody(req));
  } catch {
    return NextResponse.redirect(loginUrl(req, 'invalid_body'), { status: 303 });
  }

  if (!password) {
    return NextResponse.redirect(loginUrl(req, 'missing_fields', redirectTo), { status: 303 });
  }

  let userId: string;
  let role: 'admin' | 'user' = 'admin';

  if (email?.trim()) {
    // Email + Passwort Login via DB
    const user = await getUserByEmail(email.trim()).catch(() => null);

    if (!user || !user.is_active) {
      return NextResponse.redirect(loginUrl(req, 'invalid_credentials', redirectTo), { status: 303 });
    }

    if (!user.password_hash) {
      return NextResponse.redirect(loginUrl(req, 'invite_pending', redirectTo), { status: 303 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.redirect(loginUrl(req, 'invalid_credentials', redirectTo), { status: 303 });
    }

    userId = user.id;
    role = user.role;
    await updateLastLogin(userId).catch(() => {});
  } else if (appPassword() && password === appPassword()) {
    // Legacy: geteiltes APP_PASSWORD → Admin
    userId = 'legacy-admin';
    role = 'admin';
  } else {
    return NextResponse.redirect(loginUrl(req, 'invalid_credentials', redirectTo), { status: 303 });
  }

  const token = await issueToken(userId, role);
  const dest = redirectTo?.startsWith('/') ? redirectTo : '/dashboard';

  // Server-seitiger 303-Redirect + Set-Cookie in einer Response
  // → Browser speichert Cookie garantiert, bevor er zur nächsten Seite navigiert
  const res = NextResponse.redirect(new URL(dest, req.url), { status: 303 });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
