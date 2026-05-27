'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { TaxonomyItem, TaxonomyKind } from '@/lib/taxonomy';
import { TAXONOMY_LABELS } from '@/lib/taxonomy';

type Props = {
  kind: TaxonomyKind;
  items: TaxonomyItem[];
  /** id → Anzahl Aktivitäten, die diesen Eintrag verwenden. */
  usage: Record<string, number>;
};

export function TaxonomyEditor({ kind, items, usage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const label = TAXONOMY_LABELS[kind];

  async function add() {
    const name = draft.trim();
    if (!name) return;
    setError(null);
    const res = await fetch(`/api/taxonomy/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(
        body?.error === 'duplicate_name' || String(body?.error).includes('duplicate')
          ? `Diese ${label.singular} existiert bereits.`
          : body?.error ?? 'Fehler beim Anlegen',
      );
      return;
    }
    setDraft('');
    startTransition(() => router.refresh());
  }

  async function save(id: string) {
    const name = editingValue.trim();
    if (!name) return;
    setError(null);
    const res = await fetch(`/api/taxonomy/${kind}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? 'Fehler beim Speichern');
      return;
    }
    setEditingId(null);
    setEditingValue('');
    startTransition(() => router.refresh());
  }

  async function remove(item: TaxonomyItem) {
    const count = usage[item.id] ?? 0;
    const msg =
      count > 0
        ? `"${item.name}" wird in ${count} Aktivität${count === 1 ? '' : 'en'} verwendet. Wirklich löschen? Die Aktivitäten behalten den Namen, lassen sich aber nicht mehr neu auswählen.`
        : `"${item.name}" wirklich löschen?`;
    if (!confirm(msg)) return;
    setError(null);
    const res = await fetch(`/api/taxonomy/${kind}/${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? 'Fehler beim Löschen');
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-sm text-ink-secondary">
          Noch keine {label.plural} angelegt. Füge unten den ersten Eintrag hinzu.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const count = usage[item.id] ?? 0;
            return (
              <li
                key={item.id}
                className="group grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-button border border-line bg-card px-3 py-2.5 transition-colors hover:border-line-strong"
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') save(item.id);
                      if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditingValue('');
                      }
                    }}
                    className="input h-9"
                  />
                ) : (
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink-primary">
                      {item.name}
                    </div>
                    {count > 0 && (
                      <div className="font-mono text-[10px] text-ink-muted">
                        in {count} Aktivität{count === 1 ? '' : 'en'} genutzt
                      </div>
                    )}
                  </div>
                )}

                {!isEditing && (
                  <span className="font-mono text-[10px] tabular-nums text-ink-muted">
                    {count}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => save(item.id)}
                        disabled={pending}
                        className="btn-ghost h-8 px-2 text-[12px] text-accent"
                      >
                        Speichern
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingValue('');
                        }}
                        className="btn-ghost h-8 px-2 text-[12px]"
                      >
                        Abbrechen
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingValue(item.name);
                        }}
                        className="btn-ghost h-8 px-2 text-[12px]"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        className="btn-ghost h-8 px-2 text-[12px] text-status-rejected hover:bg-status-rejected/10"
                      >
                        Löschen
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex items-center gap-2 border-t border-line pt-4"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Neue ${label.singular} hinzufügen…`}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={pending || draft.trim() === ''}
          className="btn-primary disabled:opacity-50"
        >
          + Hinzufügen
        </button>
      </form>

      {error && <p className="text-sm text-status-rejected">{error}</p>}
    </div>
  );
}
