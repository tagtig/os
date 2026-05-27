'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ChannelBarChart } from '@/components/charts/ChannelBarChart';
import { VolumeLineChart } from '@/components/charts/VolumeLineChart';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  byChannel,
  byKey,
  defaultAnalyticsRange,
  filterRange,
  pct,
  totals,
  volumeByDay,
  volumeByWeek,
} from '@/lib/kpis';
import type { OutreachActivity } from '@/lib/outreach';

export function AnalyticsClient({ rows }: { rows: OutreachActivity[] }) {
  const def = defaultAnalyticsRange();
  const [from, setFrom] = useState(def.from);
  const [to, setTo] = useState(def.to);
  const [rateMode, setRateMode] = useState<'reply' | 'meeting'>('reply');
  const [volumeGranularity, setVolumeGranularity] = useState<'day' | 'week'>('day');

  const filtered = useMemo(() => filterRange(rows, { from, to }), [rows, from, to]);
  const t = useMemo(() => totals(filtered), [filtered]);
  const channels = useMemo(() => byChannel(filtered), [filtered]);
  const vps = useMemo(() => byKey(filtered, 'value_prop'), [filtered]);
  const icps = useMemo(() => byKey(filtered, 'icp_segment'), [filtered]);
  const volume = useMemo(() => {
    if (volumeGranularity === 'day') {
      return volumeByDay(filtered).map((d) => ({ label: d.date, count: d.count }));
    }
    return volumeByWeek(filtered).map((d) => ({ label: d.week, count: d.count }));
  }, [filtered, volumeGranularity]);

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Noch keine Daten"
        description="Sobald du Outreach-Aktivitäten loggst, erscheinen hier deine KPIs."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-card p-3">
        <span className="font-mono text-[11px] uppercase tracking-section text-ink-secondary">
          Zeitraum
        </span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="input w-44"
        />
        <span className="text-ink-muted">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="input w-44"
        />
        <button
          type="button"
          onClick={() => {
            const r = defaultAnalyticsRange();
            setFrom(r.from);
            setTo(r.to);
          }}
          className="btn-ghost text-[13px]"
        >
          Letzte 90 Tage
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Aktivitäten" value={t.total} />
        <StatCard label="Replies" value={t.replies} />
        <StatCard label="Reply-Rate" value={pct(t.replyRate)} accent />
        <StatCard label="Meeting-Rate" value={pct(t.meetingRate)} />
      </div>

      <Card>
        <CardHeader
          title={`${rateMode === 'reply' ? 'Reply-Rate' : 'Meeting-Rate'} pro Kanal`}
          subtitle="Welcher Kanal konvertiert am besten?"
          action={
            <div className="inline-flex rounded-button border border-line p-0.5 text-[13px]">
              <button
                type="button"
                onClick={() => setRateMode('reply')}
                className={`rounded-[6px] px-3 py-1.5 transition-colors ${
                  rateMode === 'reply' ? 'bg-dark text-ink-on-dark' : 'text-ink-secondary'
                }`}
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setRateMode('meeting')}
                className={`rounded-[6px] px-3 py-1.5 transition-colors ${
                  rateMode === 'meeting' ? 'bg-dark text-ink-on-dark' : 'text-ink-secondary'
                }`}
              >
                Meeting
              </button>
            </div>
          }
        />
        {channels.length === 0 ? (
          <p className="text-sm text-ink-secondary">Keine Daten im gewählten Zeitraum.</p>
        ) : (
          <>
            <ChannelBarChart data={channels} mode={rateMode} />
            <KpiTable
              rows={channels.map((c) => ({
                label: c.label,
                total: c.total,
                replyRate: c.replyRate,
                meetingRate: c.meetingRate,
              }))}
              labelHead="Kanal"
            />
          </>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Performance pro Value Prop" subtitle="Welche Value Prop sticht heraus?" />
          {vps.length === 0 ? (
            <p className="text-sm text-ink-secondary">Keine Daten.</p>
          ) : (
            <KpiTable rows={vps} labelHead="Value Prop" />
          )}
        </Card>
        <Card>
          <CardHeader title="Performance pro ICP" subtitle="Welche Zielgruppe reagiert am besten?" />
          {icps.length === 0 ? (
            <p className="text-sm text-ink-secondary">Keine Daten.</p>
          ) : (
            <KpiTable rows={icps} labelHead="ICP Segment" />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Volumen-Trend"
          subtitle="Aktivitäten pro Zeitraum."
          action={
            <div className="inline-flex rounded-button border border-line p-0.5 text-[13px]">
              <button
                type="button"
                onClick={() => setVolumeGranularity('day')}
                className={`rounded-[6px] px-3 py-1.5 transition-colors ${
                  volumeGranularity === 'day' ? 'bg-dark text-ink-on-dark' : 'text-ink-secondary'
                }`}
              >
                Tag
              </button>
              <button
                type="button"
                onClick={() => setVolumeGranularity('week')}
                className={`rounded-[6px] px-3 py-1.5 transition-colors ${
                  volumeGranularity === 'week' ? 'bg-dark text-ink-on-dark' : 'text-ink-secondary'
                }`}
              >
                Woche
              </button>
            </div>
          }
        />
        {volume.length === 0 ? (
          <p className="text-sm text-ink-secondary">Keine Daten.</p>
        ) : (
          <VolumeLineChart data={volume} xKey="label" />
        )}
      </Card>
    </div>
  );
}

function KpiTable({
  rows,
  labelHead,
}: {
  rows: Array<{ label: string; total: number; replyRate: number; meetingRate: number }>;
  labelHead: string;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-button border border-line">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            {[labelHead, 'Volumen', 'Reply-Rate', 'Meeting-Rate'].map((h) => (
              <th
                key={h}
                className="border-b border-line bg-subtle px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-section text-ink-secondary"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="[&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-line">
              <td className="px-4 py-2.5 text-sm font-medium text-ink-primary">{r.label}</td>
              <td className="px-4 py-2.5 text-sm tabular-nums text-ink-secondary">{r.total}</td>
              <td className="px-4 py-2.5 text-sm font-semibold tabular-nums text-accent">
                {pct(r.replyRate)}
              </td>
              <td className="px-4 py-2.5 text-sm tabular-nums text-ink-primary">
                {pct(r.meetingRate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
