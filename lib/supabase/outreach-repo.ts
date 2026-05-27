import { supabase } from './server';
import type { OutreachActivity, OutreachInput } from '../outreach';
import { demoCreate, demoDelete, demoGet, demoStore, demoUpdate } from '../demo-data';

const TABLE = 'outreach_activities';

function demoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function isDemoMode(): boolean {
  return demoMode();
}

export async function listOutreach(): Promise<OutreachActivity[]> {
  if (demoMode()) {
    return demoStore()
      .slice()
      .sort((a, b) => b.activity_date.localeCompare(a.activity_date));
  }
  const { data, error } = await supabase()
    .from(TABLE)
    .select('*')
    .order('activity_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OutreachActivity[];
}

export async function getOutreach(id: string): Promise<OutreachActivity | null> {
  if (demoMode()) return demoGet(id);
  const { data, error } = await supabase().from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as OutreachActivity | null) ?? null;
}

export async function createOutreach(input: OutreachInput): Promise<OutreachActivity> {
  const payload = normalize(input);
  if (demoMode()) return demoCreate(payload);
  const { data, error } = await supabase().from(TABLE).insert(payload).select('*').single();
  if (error) throw error;
  return data as OutreachActivity;
}

export async function updateOutreach(id: string, input: OutreachInput): Promise<OutreachActivity> {
  const payload = normalize(input);
  if (demoMode()) {
    const row = demoUpdate(id, payload);
    if (!row) throw new Error('not_found');
    return row;
  }
  const { data, error } = await supabase()
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as OutreachActivity;
}

export async function deleteOutreach(id: string): Promise<void> {
  if (demoMode()) {
    if (!demoDelete(id)) throw new Error('not_found');
    return;
  }
  const { error } = await supabase().from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

function normalize(input: OutreachInput): Omit<OutreachActivity, 'id' | 'created_at' | 'updated_at'> {
  return {
    activity_date: input.activity_date,
    owner: input.owner.trim(),
    channel: input.channel,
    target_person: input.target_person.trim(),
    target_role: input.target_role?.trim() || null,
    target_company: input.target_company.trim(),
    icp_segment: input.icp_segment.trim(),
    value_prop: input.value_prop.trim(),
    status: input.status,
    result_notes: input.result_notes?.trim() || null,
    follow_up_date: input.follow_up_date || null,
    follow_up_done: input.follow_up_done ?? false,
  };
}
