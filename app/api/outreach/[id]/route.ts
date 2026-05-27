import { NextResponse } from 'next/server';
import { outreachSchema } from '@/lib/outreach';
import { deleteOutreach, getOutreach, updateOutreach } from '@/lib/supabase/outreach-repo';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const row = await getOutreach(id);
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (err) {
    return NextResponse.json({ error: msg(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const parsed = outreachSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'invalid_input' },
      { status: 400 },
    );
  }
  try {
    const row = await updateOutreach(id, parsed.data);
    return NextResponse.json({ data: row });
  } catch (err) {
    return NextResponse.json({ error: msg(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await deleteOutreach(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: msg(err) }, { status: 500 });
  }
}

function msg(err: unknown): string {
  return err instanceof Error ? err.message : 'unknown_error';
}
