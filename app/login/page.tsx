'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="card flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="font-sans text-[40px] font-bold leading-none tracking-tight text-accent">
            tagtig
          </span>
          <span className="font-mono text-[11px] uppercase tracking-section text-ink-secondary">
            OS · Internal
          </span>
        </div>
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

const REASON_LABELS: Record<string, string> = {
  no_cookie: 'Sitzung abgelaufen – bitte neu anmelden.',
  invalid_token: 'Sitzung ungültig – bitte neu anmelden.',
  exception: 'Auth-Fehler – bitte neu anmelden.',
};

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';
  const invited = params.get('invited') === '1';
  const reason = params.get('reason') ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const body: Record<string, string> = { password };
    if (email.trim()) body.email = email.trim();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      // Vollständiger Seitenaufruf → Cookie garantiert für alle Folge-Requests verfügbar
      window.location.href = redirect.startsWith('/') ? redirect : '/dashboard';
    } else {
      const data = await res.json().catch(() => ({}));
      const msgs: Record<string, string> = {
        invalid_credentials: 'E-Mail oder Passwort falsch.',
        invite_pending: 'Account noch nicht eingerichtet – bitte Einladungslink nutzen.',
      };
      setError(msgs[data.error] ?? `Login fehlgeschlagen (${data.error ?? 'unbekannt'}).`);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {invited && (
        <p className="rounded-button bg-status-interview/10 px-3 py-2 text-sm text-status-interview">
          Account eingerichtet! Melde dich jetzt an.
        </p>
      )}

      {reason && REASON_LABELS[reason] && (
        <p className="rounded-button bg-status-feedback/10 px-3 py-2 text-sm text-status-feedback">
          {REASON_LABELS[reason]}
        </p>
      )}

      <label className="label" htmlFor="email">
        E-Mail
      </label>
      <input
        id="email"
        type="email"
        autoFocus
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
        placeholder="name@tagtig.com"
      />

      <label className="label" htmlFor="pw">
        Passwort
      </label>
      <input
        id="pw"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
        placeholder="••••••••"
        required
      />
      {error && <p className="text-sm text-status-rejected">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary mt-2">
        {busy ? 'Bitte warten…' : 'Anmelden'}
      </button>
    </form>
  );
}

function LoginFormFallback() {
  return (
    <div className="flex flex-col gap-3">
      <span className="label">E-Mail</span>
      <div className="input opacity-50" />
      <span className="label">Passwort</span>
      <div className="input opacity-50" />
      <div className="btn-primary mt-2 opacity-50">Anmelden</div>
    </div>
  );
}
