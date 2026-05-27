import { NextResponse } from 'next/server';
import { taxonomyInputSchema, type TaxonomyKind } from '@/lib/taxonomy';
import { createTaxonomy, listTaxonomy } from '@/lib/supabase/taxonomy-repo';

type Ctx = { params: Promise<{ kind: string }> };

function parseKind(raw: string): TaxonomyKind | null {
  if (raw === 'icp' || raw === 'value_prop') return raw;
  return null;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { kind } = await ctx.params;
  const k = parseKind(kind);
  if (!k) return NextResponse.json({ error: 'invalid_kind' }, { status: 400 });
  try {
    return NextResponse.json({ data: await listTaxonomy(k) });
  } catch (err) {
    return NextResponse.json({ error: msg(err) }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: Ctx) {
  const { kind } = await ctx.params;
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
    const row = await createTaxonomy(k, parsed.data.name);
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (err) {
    const message = msg(err);
    const status = message === 'duplicate_name' || message.includes('duplicate') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

function msg(err: unknown): string {
  return err instanceof Error ? err.message : 'unknown_error';
}
