import { supabase } from './server';
import type { TaxonomyItem, TaxonomyKind } from '../taxonomy';
import {
  demoIcpCreate,
  demoIcpDelete,
  demoIcpStore,
  demoIcpUpdate,
  demoVpCreate,
  demoVpDelete,
  demoValuePropStore,
  demoVpUpdate,
} from '../demo-data';

function demoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function tableFor(kind: TaxonomyKind): string {
  return kind === 'icp' ? 'icp_segments' : 'value_props';
}

function demoStoreFor(kind: TaxonomyKind): TaxonomyItem[] {
  return kind === 'icp' ? demoIcpStore() : demoValuePropStore();
}

export async function listTaxonomy(kind: TaxonomyKind): Promise<TaxonomyItem[]> {
  if (demoMode()) {
    return demoStoreFor(kind)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }
  const { data, error } = await supabase()
    .from(tableFor(kind))
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as TaxonomyItem[];
}

export async function createTaxonomy(kind: TaxonomyKind, name: string): Promise<TaxonomyItem> {
  if (demoMode()) {
    const store = demoStoreFor(kind);
    if (store.some((i) => i.name.toLowerCase() === name.trim().toLowerCase())) {
      throw new Error('duplicate_name');
    }
    return kind === 'icp' ? demoIcpCreate(name) : demoVpCreate(name);
  }
  const { data, error } = await supabase()
    .from(tableFor(kind))
    .insert({ name: name.trim() })
    .select('*')
    .single();
  if (error) throw error;
  return data as TaxonomyItem;
}

export async function updateTaxonomy(
  kind: TaxonomyKind,
  id: string,
  name: string,
): Promise<TaxonomyItem> {
  if (demoMode()) {
    const row = kind === 'icp' ? demoIcpUpdate(id, name) : demoVpUpdate(id, name);
    if (!row) throw new Error('not_found');
    return row;
  }
  const { data, error } = await supabase()
    .from(tableFor(kind))
    .update({ name: name.trim() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as TaxonomyItem;
}

export async function deleteTaxonomy(kind: TaxonomyKind, id: string): Promise<void> {
  if (demoMode()) {
    const ok = kind === 'icp' ? demoIcpDelete(id) : demoVpDelete(id);
    if (!ok) throw new Error('not_found');
    return;
  }
  const { error } = await supabase().from(tableFor(kind)).delete().eq('id', id);
  if (error) throw error;
}
