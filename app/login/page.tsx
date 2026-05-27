'use client';

import { Suspense, useState } from 'react';
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

const ERROR_LABELS: Record<string, string> = {
  invalid_credentials: 'E-Mail oder Passwort falsch.',
  invite_pending: 'Account noch nicht eingerichtet – bitte Einladungslink nutzen.',
  missing_fields: 'Bitte Passwort eingeben.',
};

const REASON_LABELS: Record<string, string> = {
  no_cookie: 'Sitzung abgelaufen.',
  invalid_token: 'Sitzung ungültig.',
  exception: 'Technischer Fehler – bitte neu anmelden.',
};

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';
  const invited = params.get('invited') === '1';
  const reason = params.get('reason') ?? '';
  const errorCode = params.get('error') ?? '';

  const [busy, setBusy] = useState(false);

  return (
    /*
     * Klassisches HTML-Form mit action="/api/login" und method="POST".
     * Der Server setzt das Cookie direkt in der Redirect-Response → kein
     * fetch()-Timing-Problem mehr. Fehler kommen als ?error=... zurück.
     */
    <form
      action="/api/login"
      method="POST"
      className="flex flex-col gap-3"
      onSubmit={() => setBusy(true)}
    >
      {/* Redirect-Ziel als hidden field */}
      <input type="hidden" name="redirect" value={redirect.startsWith('/') ? redirect : '/dashboard'} />

      {invited && (
        <p className="rounded-button bg-status-interview/10 px-3 py-2 text-sm text-status-interview">
          Account eingerichtet! Melde dich jetzt an.
        </p>
      )}

      {reason && REASON_LABELS[reason] && (
        <p className="rounded-button bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {REASON_LABELS[reason]}
        </p>
      )}

      {errorCode && (
        <p className="text-sm text-status-rejected">
          {ERROR_LABELS[errorCode] ?? `Fehler: ${errorCode}`}
        </p>
      )}

      <label className="label" htmlFor="email">
        E-Mail
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoFocus
        autoComplete="email"
        className="input"
        placeholder="name@tagtig.com"
      />

      <label className="label" htmlFor="pw">
        Passwort
      </label>
      <input
        id="pw"
        name="password"
        type="password"
        autoComplete="current-password"
        className="input"
        placeholder="••••••••"
        required
      />

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
