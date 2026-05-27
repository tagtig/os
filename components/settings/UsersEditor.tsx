'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { AppUserPublic } from '@/lib/supabase/users-repo';

type Props = {
  users: AppUserPublic[];
  currentUserId: string;
};

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', user: 'Benutzer' };

export function UsersEditor({ users, currentUserId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function inviteUser() {
    const email = inviteEmail.trim();
    const name = inviteName.trim();
    if (!email || !name) return;
    setError(null);
    setInviteLink(null);

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role: inviteRole }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msgs: Record<string, string> = {
        email_exists: 'Diese E-Mail ist bereits registriert.',
        forbidden: 'Keine Berechtigung.',
        missing_fields: 'Bitte alle Felder ausfüllen.',
      };
      setError(msgs[body.error] ?? body.error ?? 'Fehler beim Einladen.');
      return;
    }

    const user = await res.json();
    const link = `${window.location.origin}/invite?token=${user.invite_token}`;
    setInviteLink(link);
    setInviteEmail('');
    setInviteName('');
    startTransition(() => router.refresh());
  }

  async function changeRole(id: string, role: 'admin' | 'user') {
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    startTransition(() => router.refresh());
  }

  async function resendInvite(id: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resend_invite' }),
    });
    if (res.ok) {
      const body = await res.json();
      setInviteLink(`${window.location.origin}/invite?token=${body.invite_token}`);
    }
  }

  async function removeUser(id: string, name: string) {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Benutzerliste */}
      {users.length === 0 ? (
        <p className="text-sm text-ink-secondary">Noch keine Benutzer.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {users.map((u) => {
            const isMe = u.id === currentUserId;
            const hasPendingInvite = !!u.invite_token;

            return (
              <li
                key={u.id}
                className="group grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-button border border-line bg-card px-3 py-2.5 transition-colors hover:border-line-strong"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-subtle font-mono text-[12px] font-semibold text-ink-secondary">
                  {(u.name || u.email).slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-ink-primary">
                      {u.name || u.email}
                    </span>
                    <span
                      className={`rounded-pill px-1.5 py-0.5 font-mono text-[10px] font-medium ${
                        u.role === 'admin'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-subtle text-ink-secondary'
                      }`}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                    {hasPendingInvite && (
                      <span className="rounded-pill bg-status-feedback/10 px-1.5 py-0.5 font-mono text-[10px] text-status-feedback">
                        Einladung offen
                      </span>
                    )}
                    {isMe && (
                      <span className="font-mono text-[10px] text-ink-muted">(du)</span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-ink-muted">{u.email}</div>
                </div>

                {/* Aktionen (nur für andere User) */}
                {!isMe && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {hasPendingInvite && (
                      <button
                        type="button"
                        onClick={() => resendInvite(u.id)}
                        disabled={pending}
                        className="btn-ghost h-8 px-2 text-[12px] text-accent"
                      >
                        Link neu
                      </button>
                    )}
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as 'admin' | 'user')}
                      disabled={pending}
                      className="h-8 rounded-button border border-line bg-card px-2 text-[12px] text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="user">Benutzer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeUser(u.id, u.name || u.email)}
                      disabled={pending}
                      className="btn-ghost h-8 px-2 text-[12px] text-status-rejected hover:bg-status-rejected/10"
                    >
                      Löschen
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Einladungslink */}
      {inviteLink && (
        <div className="rounded-button border border-accent/30 bg-accent/5 p-3">
          <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
            Einladungslink — 7 Tage gültig
          </div>
          <p className="mb-2 text-xs text-ink-secondary">
            Teile diesen Link per E-Mail oder Slack mit der Person:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-subtle px-2 py-1.5 font-mono text-[11px] text-ink-primary">
              {inviteLink}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
              }}
              className="btn-ghost h-8 shrink-0 px-2 text-[12px]"
            >
              Kopieren
            </button>
          </div>
        </div>
      )}

      {/* Einladen */}
      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-secondary">
          Neuen Benutzer einladen
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Name"
            className="input min-w-[120px] flex-1"
          />
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            type="email"
            placeholder="E-Mail"
            className="input min-w-[160px] flex-1"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'admin' | 'user')}
            className="h-11 rounded-button border border-line bg-card px-3 text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="user">Benutzer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="button"
            onClick={inviteUser}
            disabled={pending || !inviteEmail.trim() || !inviteName.trim()}
            className="btn-primary disabled:opacity-50"
          >
            + Einladen
          </button>
        </div>
        {error && <p className="text-sm text-status-rejected">{error}</p>}
      </div>
    </div>
  );
}
