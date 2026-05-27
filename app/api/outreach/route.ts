import { NextResponse } from 'next/server';
import { outreachSchema } from '@/lib/outreach';
import { createOutreach, listOutreach } from '@/lib/supabase/outreach-repo';

export async function GET() {
  try {
    const rows = await listOutreach();
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const parsed = outreachSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'invalid_input' }, { status: 400 });
  }
  try {
    const row = await createOutreach(parsed.data);
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'unknown_error';
}
