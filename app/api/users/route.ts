import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { listUsers, createUserWithInvite } from '@/lib/supabase/users-repo';

export async function GET() {
  const h = await headers();
  if (h.get('x-user-role') !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const users = await listUsers().catch(() => []);
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const h = await headers();
  const currentUserId = h.get('x-user-id');
  if (h.get('x-user-role') !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { email, name, role } = (body ?? {}) as {
    email?: string;
    name?: string;
    role?: string;
  };

  if (!email?.trim() || !name?.trim() || !['admin', 'user'].includes(role ?? '')) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  try {
    const user = await createUserWithInvite(
      email.trim(),
      name.trim(),
      role as 'admin' | 'user',
      currentUserId,
    );
    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('unique') || (e as { code?: string })?.code === '23505') {
      return NextResponse.json({ error: 'email_exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
