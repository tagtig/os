'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  CHANNELS,
  CHANNEL_LABELS,
  STATUSES,
  STATUS_LABELS,
  type OutreachActivity,
  type OutreachInput,
} from '@/lib/outreach';
import { todayIso } from '@/lib/utils';

type Props = {
  initial?: OutreachActivity;
  team: string[];
  icpOptions: string[];
  valuePropOptions: string[];
};

export function OutreachForm({ initial, team, icpOptions, valuePropOptions }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  // Werte aus initial einschließen (auch wenn nicht mehr in Settings),
  // damit der Edit-Modus nichts wegblendet.
  const icpChoices = unique([
    ...(initial?.icp_segment ? [initial.icp_segment] : []),
    ...icpOptions,
  ]);
  const vpChoices = unique([
    ...(initial?.value_prop ? [initial.value_prop] : []),
    ...valuePropOptions,
  ]);

  const [form, setForm] = useState<OutreachInput>(() => ({
    activity_date: initial?.activity_date ?? todayIso(),
    owner: initial?.owner ?? team[0] ?? '',
    channel: initial?.channel ?? 'email',
    target_person: initial?.target_person ?? '',
    target_role: initial?.target_role ?? '',
    target_company: initial?.target_company ?? '',
    icp_segment: initial?.icp_segment ?? icpChoices[0] ?? '',
    value_prop: initial?.value_prop ?? vpChoices[0] ?? '',
    status: initial?.status ?? 'sent',
    result_notes: initial?.result_notes ?? '',
    follow_up_date: initial?.follow_up_date ?? '',
    follow_up_done: initial?.follow_up_done ?? false,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof OutreachInput>(key: K, val: OutreachInput[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const url = isEdit ? `/api/outreach/${initial!.id}` : '/api/outreach';
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? 'Fehler beim Speichern');
      setBusy(false);
      return;
    }
    router.push('/outreach');
    router.refresh();
  }

  async function onDelete() {
    if (!initial) return;
    if (!confirm('Diese Aktivität löschen?')) return;
    setBusy(true);
    const res = await fetch(`/api/outreach/${initial.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Löschen fehlgeschlagen');
      setBusy(false);
      return;
    }
    router.push('/outreach');
    router.refresh();
  }

  const noIcp = icpChoices.length === 0;
  const noVp = vpChoices.length === 0;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="card grid grid-cols-2 gap-x-6 gap-y-5">
        <Field label="Datum">
          <input
            type="date"
            required
            value={form.activity_date}
            onChange={(e) => update('activity_date', e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Owner">
          <select
            value={form.owner}
            onChange={(e) => update('owner', e.target.value)}
            className="select"
          >
            {team.length === 0 && <option value="">– Kein Team konfiguriert –</option>}
            {team.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Kanal">
          <select
            value={form.channel}
            onChange={(e) => update('channel', e.target.value as OutreachInput['channel'])}
            className="select"
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {CHANNEL_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value as OutreachInput['status'])}
            className="select"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Zielperson">
          <input
            required
            value={form.target_person}
            onChange={(e) => update('target_person', e.target.value)}
            className="input"
            placeholder="z.B. Max Mustermann"
          />
        </Field>
        <Field label="Rolle (optional)">
          <input
            value={form.target_role ?? ''}
            onChange={(e) => update('target_role', e.target.value)}
            className="input"
            placeholder="z.B. Head of Talent"
          />
        </Field>

        <Field label="Unternehmen" colSpan={2}>
          <input
            required
            value={form.target_company}
            onChange={(e) => update('target_company', e.target.value)}
            className="input"
            placeholder="z.B. Beispiel GmbH"
          />
        </Field>

        <Field
          label="ICP Segment"
          hint={
            noIcp ? (
              <Link href="/settings" className="text-accent hover:text-accent-hover">
                In Einstellungen anlegen →
              </Link>
            ) : null
          }
        >
          <select
            required
            value={form.icp_segment}
            onChange={(e) => update('icp_segment', e.target.value)}
            className="select"
            disabled={noIcp}
          >
            {noIcp && <option value="">– Bitte in Einstellungen anlegen –</option>}
            {icpChoices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Value Prop"
          hint={
            noVp ? (
              <Link href="/settings" className="text-accent hover:text-accent-hover">
                In Einstellungen anlegen →
              </Link>
            ) : null
          }
        >
          <select
            required
            value={form.value_prop}
            onChange={(e) => update('value_prop', e.target.value)}
            className="select"
            disabled={noVp}
          >
            {noVp && <option value="">– Bitte in Einstellungen anlegen –</option>}
            {vpChoices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ergebnis / Notizen" colSpan={2}>
          <textarea
            rows={3}
            value={form.result_notes ?? ''}
            onChange={(e) => update('result_notes', e.target.value)}
            className="textarea"
            placeholder="Was kam zurück? Reaktion, Einwände, nächste Schritte…"
          />
        </Field>

        <Field label="Follow-up Datum">
          <input
            type="date"
            value={form.follow_up_date ?? ''}
            onChange={(e) => update('follow_up_date', e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Follow-up erledigt">
          <label className="flex h-[42px] items-center gap-2 rounded-button bg-subtle px-4 text-sm">
            <input
              type="checkbox"
              checked={!!form.follow_up_done}
              onChange={(e) => update('follow_up_done', e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-ink-secondary">Follow-up wurde erledigt</span>
          </label>
        </Field>
      </div>

      <p className="text-[12px] text-ink-muted">
        ICP Segmente und Value Props werden in{' '}
        <Link href="/settings" className="text-accent hover:text-accent-hover">
          Einstellungen
        </Link>{' '}
        gepflegt.
      </p>

      {error && <p className="text-sm text-status-rejected">{error}</p>}

      <div className="flex items-center justify-between">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="btn-ghost text-status-rejected hover:bg-status-rejected/10"
            >
              Löschen
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push('/outreach')}
            className="btn-secondary"
          >
            Abbrechen
          </button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Speichern…' : isEdit ? 'Speichern' : 'Anlegen'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  colSpan,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  colSpan?: 1 | 2;
  hint?: React.ReactNode;
}) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : 'col-span-1'}>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="label !mb-0">{label}</span>
        {hint && <span className="text-[11px]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
