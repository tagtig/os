import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';

export async function GET(req: Request) {
  const url = new URL('/login', req.url);
  const res = NextResponse.redirect(url);
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
