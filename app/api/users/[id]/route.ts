import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { updateUser, deleteUser, regenerateInviteToken } from '@/lib/supabase/users-repo';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const h = await headers();
  const currentUserId = h.get('x-user-id');
  if (h.get('x-user-role') !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({})) as {
    action?: string;
    name?: string;
    role?: string;
    is_active?: boolean;
  };

  // Einladungslink neu generieren
  if (body.action === 'resend_invite') {
    const token = await regenerateInviteToken(id);
    if (!token) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ invite_token: token });
  }

  // Eigene Rolle kann nicht verändert werden
  if (id === currentUserId && body.role) {
    return NextResponse.json({ error: 'cannot_change_own_role' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.role !== undefined && ['admin', 'user'].includes(body.role)) patch.role = body.role;
  if (body.is_active !== undefined) patch.is_active = body.is_active;

  const updated = await updateUser(id, patch as Parameters<typeof updateUser>[1]);
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const h = await headers();
  const currentUserId = h.get('x-user-id');
  if (h.get('x-user-role') !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id } = await params;

  if (id === currentUserId) {
    return NextResponse.json({ error: 'cannot_delete_self' }, { status: 400 });
  }

  const ok = await deleteUser(id);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return new Response(null, { status: 204 });
}
