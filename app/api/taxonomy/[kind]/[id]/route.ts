import { NextResponse } from 'next/server';
import { taxonomyInputSchema, type TaxonomyKind } from '@/lib/taxonomy';
import { deleteTaxonomy, updateTaxonomy } from '@/lib/supabase/taxonomy-repo';

type Ctx = { params: Promise<{ kind: string; id: string }> };

function parseKind(raw: string): TaxonomyKind | null {
  if (raw === 'icp' || raw === 'value_prop') return raw;
  return null;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { kind, id } = await ctx.params;
  const k = parseKind(kind);
  if (!k) return NextResponse.json({ error: 'invalid_kind' }, { status: 400 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const parsed = taxonomyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'invalid_input' },
      { status: 400 },
    );
  }
  try {
    const row = await updateTaxonomy(k, id, parsed.data.name);
    return NextResponse.json({ data: row });
  } catch (err) {
    return NextResponse.json({ error: msg(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { kind, id } = await ctx.params;
  const k = parseKind(kind);
  if (!k) return NextResponse.json({ error: 'invalid_kind' }, { status: 400 });
  try {
    await deleteTaxonomy(k, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: msg(err) }, { status: 500 });
  }
}

function msg(err: unknown): string {
  return err instanceof Error ? err.message : 'unknown_error';
}
