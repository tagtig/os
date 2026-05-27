import { type NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, authEnabled, verifyToken, appPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;

  let tokenResult: string;
  let payload = null;

  try {
    payload = await verifyToken(token);
    tokenResult = payload ? 'valid' : 'invalid';
  } catch (err) {
    tokenResult = `exception: ${String(err)}`;
  }

  return NextResponse.json({
    authEnabled: authEnabled(),
    hasCookie: !!token,
    tokenLength: token?.length ?? 0,
    tokenPreview: token ? token.slice(0, 30) + '...' : null,
    tokenResult,
    userId: payload?.userId ?? null,
    role: payload?.role ?? null,
    hasAppPassword: !!appPassword(),
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
