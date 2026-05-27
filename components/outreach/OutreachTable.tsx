'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChannelBadge } from './ChannelBadge';
import { StatusBadge } from './StatusBadge';
import {
  CHANNELS,
  CHANNEL_LABELS,
  STATUSES,
  STATUS_LABELS,
  type OutreachActivity,
} from '@/lib/outreach';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';

export function OutreachTable({ rows, owners }: { rows: OutreachActivity[]; owners: string[] }) {
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [owner, setOwner] = useState<string>('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (channel && r.channel !== channel) return false;
      if (status && r.status !== status) return false;
      if (owner && r.owner !== owner) return false;
      if (!q) return true;
      return [r.target_person, r.target_company, r.icp_segment, r.value_prop, r.result_notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, channel, status, owner]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-card p-3">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
            ⌕
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Person, Company, ICP, Value Prop…"
            className="input pl-9"
          />
        </div>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="select w-44">
          <option value="">Alle Kanäle</option>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select w-48">
          <option value="">Alle Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select value={owner} onChange={(e) => setOwner(e.target.value)} className="select w-40">
          <option value="">Alle Owner</option>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Keine Aktivitäten"
          description="Ändere Filter oder lege deine erste Outreach-Aktivität an."
          action={
            <Link href="/outreach/new" className="btn-primary mt-2">
              + Neue Aktivität
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-card">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                {['Datum', 'Owner', 'Kanal', 'Zielperson', 'Company', 'ICP', 'Value Prop', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="border-b border-line bg-subtle px-5 py-3.5 text-left font-mono text-[11px] font-medium uppercase tracking-section text-ink-secondary whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer transition-colors hover:bg-subtle [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-line"
                  onClick={() => {
                    window.location.href = `/outreach/${r.id}`;
                  }}
                >
                  <td className="px-5 py-4 text-sm">{formatDate(r.activity_date)}</td>
                  <td className="px-5 py-4 text-sm">{r.owner}</td>
                  <td className="px-5 py-4">
                    <ChannelBadge channel={r.channel} />
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <div className="font-semibold text-ink-primary">{r.target_person}</div>
                    {r.target_role && (
                      <div className="text-xs text-ink-secondary">{r.target_role}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm">{r.target_company}</td>
                  <td className="px-5 py-4 text-sm text-ink-secondary">{r.icp_segment}</td>
                  <td className="px-5 py-4 text-sm text-ink-secondary">{r.value_prop}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-ink-muted">
        {filtered.length} {filtered.length === 1 ? 'Aktivität' : 'Aktivitäten'} angezeigt
      </div>
    </div>
  );
}
