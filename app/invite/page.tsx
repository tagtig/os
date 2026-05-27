'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InvitePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="card flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="font-sans text-[40px] font-bold leading-none tracking-tight text-accent">
            tagtig
          </span>
          <span className="font-mono text-[11px] uppercase tracking-section text-ink-secondary">
            Einladung annehmen
          </span>
        </div>
        <Suspense fallback={<div className="text-sm text-ink-secondary">Lade…</div>}>
          <InviteForm />
        </Suspense>
      </div>
    </main>
  );
}

function InviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <p className="text-sm text-status-rejected">
        Ungültiger Einladungslink. Bitte frag deinen Admin nach einem neuen Link.
      </p>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben.');
      return;
    }
    setBusy(true);
    setError(null);

    const res = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name: name.trim(), password }),
    });

    if (res.ok) {
      router.push('/login?invited=1');
    } else {
      const data = await res.json().catch(() => ({}));
      const msgs: Record<string, string> = {
        token_invalid: 'Dieser Einladungslink ist ungültig oder abgelaufen. Bitte frag deinen Admin nach einem neuen.',
        missing_fields: 'Bitte alle Felder ausfüllen.',
        password_too_short: 'Passwort muss mindestens 8 Zeichen haben.',
      };
      setError(msgs[data.error] ?? 'Fehler beim Einrichten des Accounts.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-ink-secondary">
        Richte deinen tagtig OS Account ein. Du kannst dich danach mit deiner
        E-Mail und diesem Passwort anmelden.
      </p>

      <label className="label" htmlFor="name">
        Dein Name
      </label>
      <input
        id="name"
        type="text"
        autoFocus
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
        placeholder="Vorname Nachname"
        required
      />

      <label className="label" htmlFor="pw">
        Passwort
      </label>
      <input
        id="pw"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
        placeholder="Mindestens 8 Zeichen"
        required
      />

      <label className="label" htmlFor="pw2">
        Passwort bestätigen
      </label>
      <input
        id="pw2"
        type="password"
        autoComplete="new-password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        className="input"
        placeholder="••••••••"
        required
      />

      {error && <p className="text-sm text-status-rejected">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary mt-2">
        {busy ? 'Bitte warten…' : 'Account einrichten'}
      </button>
    </form>
  );
}
