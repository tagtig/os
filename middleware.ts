import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE, authEnabled, verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = new Set(['/login', '/api/login']);
const PUBLIC_PREFIXES = ['/invite', '/api/invite'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Demo-Modus ohne Auth-Konfiguration → alles durchlassen
  if (!authEnabled()) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = await verifyToken(token);

  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // User-Infos via Request-Header weitergeben (lesbar in Server Components via headers())
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
