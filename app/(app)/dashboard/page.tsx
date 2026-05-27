import Link from 'next/link';
import { PageHeader } from '@/components/shell/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { ChannelBadge } from '@/components/outreach/ChannelBadge';
import { StatusBadge } from '@/components/outreach/StatusBadge';
import { listOutreach } from '@/lib/supabase/outreach-repo';
import { filterRange, monthRange, pct, totals } from '@/lib/kpis';
import { formatDate, formatRelative, todayIso } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const rows = await listOutreach().catch(() => []);
  const thisMonth = filterRange(rows, monthRange());
  const m = totals(thisMonth);
  const today = todayIso();
  const openFollowUps = rows
    .filter((r) => r.follow_up_date && !r.follow_up_done)
    .sort((a, b) => (a.follow_up_date ?? '').localeCompare(b.follow_up_date ?? ''));
  const recent = rows.slice(0, 10);

  return (
    <>
      <PageHeader
        title="Willkommen zurück"
        subtitle="Aktueller Stand deiner Outreach-Pipeline."
        actions={
          <Link href="/outreach/new" className="btn-primary">
            + Neue Aktivität
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-4 gap-4">
        <StatCard label="Aktivitäten (Monat)" value={m.total} icon="◇" />
        <StatCard
          label="Reply-Rate (Monat)"
          value={pct(m.replyRate)}
          icon="↩"
          accent
        />
        <StatCard label="Meetings (Monat)" value={m.meetings} icon="☎" />
        <StatCard
          label="Offene Follow-ups"
          value={openFollowUps.length}
          icon="⚑"
          trend={
            openFollowUps.filter((f) => (f.follow_up_date ?? '') <= today).length > 0 ? (
              <span className="text-status-rejected">
                {openFollowUps.filter((f) => (f.follow_up_date ?? '') <= today).length} überfällig
              </span>
            ) : (
              'alles im Zeitplan'
            )
          }
        />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        <Card>
          <CardHeader
            title="Letzte Aktivitäten"
            subtitle="Die 10 zuletzt geloggten Outreach-Aktionen."
            action={
              <Link href="/outreach" className="text-[13px] font-medium text-accent hover:text-accent-hover">
                Alle ansehen →
              </Link>
            }
          />
          {recent.length === 0 ? (
            <div className="py-6 text-center text-sm text-ink-secondary">
              Noch keine Aktivitäten. <Link href="/outreach/new" className="text-accent">Logge die erste →</Link>
            </div>
          ) : (
            <ul className="flex flex-col">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start gap-3 border-b border-line py-3 last:border-b-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle font-mono text-[11px] font-semibold text-ink-secondary">
                    {r.owner.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/outreach/${r.id}`}
                      className="block text-sm leading-tight text-ink-primary hover:text-accent"
                    >
                      <strong>{r.owner}</strong> · {r.target_person} ({r.target_company})
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
                      <ChannelBadge channel={r.channel} />
                      <StatusBadge status={r.status} />
                      <span className="font-mono text-[11px] text-ink-muted">
                        {formatRelative(r.created_at)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Anstehende Follow-ups"
            subtitle="Reminder für offene Outreach."
          />
          {openFollowUps.length === 0 ? (
            <div className="flex items-center gap-3 py-3 text-sm text-ink-secondary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-status-interview/15 text-xs font-bold text-status-interview">
                ✓
              </span>
              Keine offenen Follow-ups
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {openFollowUps.slice(0, 8).map((r) => {
                const overdue = (r.follow_up_date ?? '') < today;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/outreach/${r.id}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-button p-2.5 hover:bg-subtle"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink-primary">
                          {r.target_person} · {r.target_company}
                        </div>
                        <div className="text-xs text-ink-secondary">{r.owner}</div>
                      </div>
                      <div
                        className={`font-mono text-[11px] ${overdue ? 'text-status-rejected' : 'text-ink-muted'}`}
                      >
                        {formatDate(r.follow_up_date)}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
