import type { OutreachActivity } from './outreach';
import type { TaxonomyItem } from './taxonomy';

const today = new Date();
function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function plus(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const SEED: Omit<OutreachActivity, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    activity_date: daysAgo(1),
    owner: 'Ben',
    channel: 'linkedin',
    target_person: 'Lena Hofmann',
    target_role: 'Head of Talent',
    target_company: 'Brightline SaaS',
    icp_segment: 'SaaS Series B',
    value_prop: 'Time-to-Hire 30%↓',
    status: 'meeting_booked',
    result_notes: 'Antwort innerhalb von 3h, Meeting für nächste Woche.',
    follow_up_date: plus(5),
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(2),
    owner: 'Ben',
    channel: 'email',
    target_person: 'Tobias Reuter',
    target_role: 'VP People',
    target_company: 'Northwind Logistics',
    icp_segment: 'Industrial Mid-Market',
    value_prop: 'Spezialisten-Pool für Operations',
    status: 'replied',
    result_notes: null,
    follow_up_date: plus(2),
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(3),
    owner: 'Christian',
    channel: 'phone',
    target_person: 'Annika Vogel',
    target_role: 'Recruiting Manager',
    target_company: 'OmegaPay',
    icp_segment: 'Fintech Growth',
    value_prop: 'Time-to-Hire 30%↓',
    status: 'meeting_done',
    result_notes: 'Sehr offen, Q3-Budget vorhanden. Demo terminieren.',
    follow_up_date: plus(1),
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(5),
    owner: 'Ben',
    channel: 'linkedin',
    target_person: 'Markus Lehmann',
    target_role: 'Talent Acquisition Lead',
    target_company: 'Stride Mobility',
    icp_segment: 'SaaS Series B',
    value_prop: 'Spezialisten-Pool für Operations',
    status: 'no_response',
    result_notes: null,
    follow_up_date: null,
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(6),
    owner: 'Christian',
    channel: 'email',
    target_person: 'Sandra Klein',
    target_role: 'CHRO',
    target_company: 'Northcloud Group',
    icp_segment: 'Enterprise Tech',
    value_prop: 'Quality-of-Hire Score',
    status: 'opened',
    result_notes: 'Sequence Day 2',
    follow_up_date: daysAgo(1),
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(7),
    owner: 'Ben',
    channel: 'event',
    target_person: 'David Brunner',
    target_role: 'CEO',
    target_company: 'Loop Robotics',
    icp_segment: 'Industrial Mid-Market',
    value_prop: 'Time-to-Hire 30%↓',
    status: 'won',
    result_notes: 'Vertrag unterschrieben — 3 Mandate.',
    follow_up_date: null,
    follow_up_done: true,
  },
  {
    activity_date: daysAgo(9),
    owner: 'Ben',
    channel: 'email',
    target_person: 'Eva Steiner',
    target_role: 'HRBP',
    target_company: 'PixelForge',
    icp_segment: 'Fintech Growth',
    value_prop: 'Quality-of-Hire Score',
    status: 'lost',
    result_notes: 'Nutzen interne Lösung, kein Bedarf.',
    follow_up_date: null,
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(10),
    owner: 'Christian',
    channel: 'linkedin',
    target_person: 'Julia März',
    target_role: 'Head of People',
    target_company: 'Cloudpath',
    icp_segment: 'SaaS Series B',
    value_prop: 'Time-to-Hire 30%↓',
    status: 'replied',
    result_notes: 'Termin in 2 Wochen.',
    follow_up_date: plus(7),
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(12),
    owner: 'Ben',
    channel: 'referral',
    target_person: 'Niklas Berger',
    target_role: 'COO',
    target_company: 'Bauer & Söhne',
    icp_segment: 'Industrial Mid-Market',
    value_prop: 'Spezialisten-Pool für Operations',
    status: 'meeting_booked',
    result_notes: 'Empfehlung von Loop Robotics.',
    follow_up_date: plus(3),
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(14),
    owner: 'Christian',
    channel: 'phone',
    target_person: 'Sabine Krüger',
    target_role: 'Talent Director',
    target_company: 'Helios Group',
    icp_segment: 'Enterprise Tech',
    value_prop: 'Quality-of-Hire Score',
    status: 'no_response',
    result_notes: null,
    follow_up_date: null,
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(18),
    owner: 'Ben',
    channel: 'email',
    target_person: 'Florian Adler',
    target_role: 'CTO',
    target_company: 'Quantle',
    icp_segment: 'SaaS Series B',
    value_prop: 'Time-to-Hire 30%↓',
    status: 'meeting_done',
    result_notes: 'Sehr interessiert, will Pilot.',
    follow_up_date: plus(2),
    follow_up_done: false,
  },
  {
    activity_date: daysAgo(22),
    owner: 'Christian',
    channel: 'linkedin',
    target_person: 'Carla Wolf',
    target_role: 'Head of Recruiting',
    target_company: 'Nordics Bank',
    icp_segment: 'Fintech Growth',
    value_prop: 'Quality-of-Hire Score',
    status: 'sent',
    result_notes: null,
    follow_up_date: null,
    follow_up_done: false,
  },
];

// Demo-Stores leben auf globalThis, damit sie sich Module-Instanzen teilen,
// die Next.js dev-mode pro Route bundlet. Nur fürs lokale Testen relevant.
type DemoState = {
  outreach: OutreachActivity[] | null;
  icp: TaxonomyItem[] | null;
  vp: TaxonomyItem[] | null;
};

function state(): DemoState {
  const g = globalThis as unknown as { __tagtigDemoState?: DemoState };
  if (!g.__tagtigDemoState) {
    g.__tagtigDemoState = { outreach: null, icp: null, vp: null };
  }
  return g.__tagtigDemoState;
}

export function demoStore(): OutreachActivity[] {
  const s = state();
  if (s.outreach) return s.outreach;
  s.outreach = SEED.map((row, i) => ({
    ...row,
    id: `demo-${i + 1}`,
    created_at: new Date(row.activity_date + 'T10:00:00Z').toISOString(),
    updated_at: new Date(row.activity_date + 'T10:00:00Z').toISOString(),
  }));
  return s.outreach;
}

export function demoCreate(input: Omit<OutreachActivity, 'id' | 'created_at' | 'updated_at'>): OutreachActivity {
  const store = demoStore();
  const now = new Date().toISOString();
  const row: OutreachActivity = {
    ...input,
    id: `demo-${Date.now()}`,
    created_at: now,
    updated_at: now,
  };
  store.unshift(row);
  return row;
}

export function demoUpdate(id: string, input: Omit<OutreachActivity, 'id' | 'created_at' | 'updated_at'>): OutreachActivity | null {
  const store = demoStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  store[idx] = { ...store[idx], ...input, updated_at: now };
  return store[idx];
}

export function demoDelete(id: string): boolean {
  const store = demoStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function demoGet(id: string): OutreachActivity | null {
  return demoStore().find((r) => r.id === id) ?? null;
}

// ---------- Taxonomy (ICP Segmente + Value Props) ----------

const ICP_SEED = ['SaaS Series B', 'Industrial Mid-Market', 'Fintech Growth', 'Enterprise Tech'];
const VP_SEED = [
  'Time-to-Hire 30%↓',
  'Spezialisten-Pool für Operations',
  'Quality-of-Hire Score',
];

function seedTaxonomy(names: string[]): TaxonomyItem[] {
  const now = new Date().toISOString();
  return names.map((name, i) => ({
    id: `demo-tax-${i + 1}-${name.replace(/\s+/g, '-').toLowerCase()}`,
    name,
    created_at: now,
    updated_at: now,
  }));
}

export function demoIcpStore(): TaxonomyItem[] {
  const s = state();
  if (!s.icp) s.icp = seedTaxonomy(ICP_SEED);
  return s.icp;
}

export function demoValuePropStore(): TaxonomyItem[] {
  const s = state();
  if (!s.vp) s.vp = seedTaxonomy(VP_SEED);
  return s.vp;
}

function taxonomyCreate(store: TaxonomyItem[], name: string): TaxonomyItem {
  const now = new Date().toISOString();
  const item: TaxonomyItem = {
    id: `demo-tax-${Date.now()}`,
    name: name.trim(),
    created_at: now,
    updated_at: now,
  };
  store.push(item);
  return item;
}

function taxonomyUpdate(store: TaxonomyItem[], id: string, name: string): TaxonomyItem | null {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], name: name.trim(), updated_at: new Date().toISOString() };
  return store[idx];
}

function taxonomyDelete(store: TaxonomyItem[], id: string): boolean {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export const demoIcpCreate = (name: string) => taxonomyCreate(demoIcpStore(), name);
export const demoIcpUpdate = (id: string, name: string) =>
  taxonomyUpdate(demoIcpStore(), id, name);
export const demoIcpDelete = (id: string) => taxonomyDelete(demoIcpStore(), id);

export const demoVpCreate = (name: string) => taxonomyCreate(demoValuePropStore(), name);
export const demoVpUpdate = (id: string, name: string) =>
  taxonomyUpdate(demoValuePropStore(), id, name);
export const demoVpDelete = (id: string) => taxonomyDelete(demoValuePropStore(), id);
