import {
  CHANNEL_LABELS,
  MEETING_STATUSES,
  POSITIVE_STATUSES,
  type Channel,
  type OutreachActivity,
  type Status,
} from './outreach';

export type DateRange = { from: string; to: string };

export function inRange(row: OutreachActivity, range?: DateRange | null): boolean {
  if (!range) return true;
  return row.activity_date >= range.from && row.activity_date <= range.to;
}

export function filterRange(rows: OutreachActivity[], range?: DateRange | null): OutreachActivity[] {
  return rows.filter((r) => inRange(r, range));
}

export function isReply(s: Status): boolean {
  return POSITIVE_STATUSES.includes(s);
}

export function isMeeting(s: Status): boolean {
  return MEETING_STATUSES.includes(s);
}

export function totals(rows: OutreachActivity[]) {
  const total = rows.length;
  const replies = rows.filter((r) => isReply(r.status)).length;
  const meetings = rows.filter((r) => isMeeting(r.status)).length;
  return {
    total,
    replies,
    meetings,
    replyRate: total > 0 ? replies / total : 0,
    meetingRate: total > 0 ? meetings / total : 0,
  };
}

export function byChannel(rows: OutreachActivity[]) {
  const map = new Map<Channel, OutreachActivity[]>();
  for (const r of rows) {
    const arr = map.get(r.channel) ?? [];
    arr.push(r);
    map.set(r.channel, arr);
  }
  return Array.from(map.entries())
    .map(([channel, list]) => {
      const t = totals(list);
      return {
        channel,
        label: CHANNEL_LABELS[channel],
        total: t.total,
        replies: t.replies,
        meetings: t.meetings,
        replyRate: t.replyRate,
        meetingRate: t.meetingRate,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function byKey<K extends 'value_prop' | 'icp_segment'>(
  rows: OutreachActivity[],
  key: K,
) {
  const map = new Map<string, OutreachActivity[]>();
  for (const r of rows) {
    const k = r[key];
    const arr = map.get(k) ?? [];
    arr.push(r);
    map.set(k, arr);
  }
  return Array.from(map.entries())
    .map(([label, list]) => {
      const t = totals(list);
      return {
        label,
        total: t.total,
        replies: t.replies,
        meetings: t.meetings,
        replyRate: t.replyRate,
        meetingRate: t.meetingRate,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function volumeByDay(rows: OutreachActivity[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.activity_date, (map.get(r.activity_date) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function volumeByWeek(rows: OutreachActivity[]): { week: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const w = isoWeek(r.activity_date);
    map.set(w, (map.get(w) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

function isoWeek(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function monthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: iso(start), to: iso(end) };
}

export function defaultAnalyticsRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 89);
  return { from: iso(from), to: iso(to) };
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}
