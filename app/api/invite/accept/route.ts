import { NextResponse } from 'next/server';
import { getUserByInviteToken, acceptInvite } from '@/lib/supabase/users-repo';
import { hashPassword } from '@/lib/password';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { token, name, password } = (body ?? {}) as {
    token?: string;
    name?: string;
    password?: string;
  };

  if (!token?.trim() || !name?.trim() || !password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'password_too_short' }, { status: 400 });
  }

  const user = await getUserByInviteToken(token).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: 'token_invalid' }, { status: 400 });
  }

  if (user.invite_expires_at && new Date(user.invite_expires_at) < new Date()) {
    return NextResponse.json({ error: 'token_invalid' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await acceptInvite(token, name.trim(), passwordHash);

  return NextResponse.json({ ok: true });
}
