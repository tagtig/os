# tagtig OS

Internes Operations-Tool für tagtig. Erstes Modul: **Outreach Tracker** — alle Outreach-Aktivitäten (E-Mail / LinkedIn / Telefon / …) loggen und KPIs auswerten (Reply-Rate, Meeting-Rate, Performance pro Kanal / ICP / Value Prop).

Design folgt dem bestehenden tagtig-Design-System (Sidebar + Cards, Instrument Sans/Serif, Accent `#D45BA8`).

## Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS mit tagtig-Tokens
- Supabase (Postgres) — Persistenz
- Recharts — Charts
- Auth: einfaches Shared-Password via Env-Var (httpOnly-Cookie, HMAC-signiert)

## Lokales Setup

### 1. Dependencies installieren

```bash
cd tagtig-os
npm install
```

### 2. Supabase-Projekt aufsetzen

1. Kostenloses Projekt auf [supabase.com](https://supabase.com) anlegen.
2. SQL-Editor öffnen, Inhalt von [supabase/migrations/0001_outreach.sql](supabase/migrations/0001_outreach.sql) ausführen.
3. `Settings → API` → `Project URL` und `service_role` Key kopieren (nicht den `anon` Key!).

### 3. Env-Vars setzen

```bash
cp .env.local.example .env.local
```

Dann `.env.local` befüllen:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
APP_PASSWORD=irgendein-sicheres-passwort
AUTH_SECRET=mindestens-16-zufaellige-zeichen
NEXT_PUBLIC_TEAM=Ben,Christian
```

`AUTH_SECRET` z.B. mit `openssl rand -hex 32` erzeugen.

### 4. Dev-Server starten

```bash
npm run dev
```

→ <http://localhost:3000> · Login mit `APP_PASSWORD`.

## Deployment auf Vercel

1. Repo nach GitHub pushen.
2. Auf [vercel.com](https://vercel.com) `Add New → Project` → Repo verbinden.
3. Framework wird automatisch als **Next.js** erkannt.
4. In den Project Settings → Environment Variables alle Variablen aus `.env.local.example` setzen (Production + Preview).
5. Deploy.

Falls die App nicht öffentlich erreichbar sein soll, in Vercel zusätzlich **Deployment Protection → Password Protection** aktivieren.

## Projektstruktur

```
app/
  (app)/                  Geschützte App-Routen (Sidebar-Layout)
    dashboard/            Übersicht + KPI-Cards
    outreach/             Liste / Neu / Edit
    analytics/            KPI-Auswertungen mit Charts
    layout.tsx            App-Shell
  api/
    login/                Passwort-Login (setzt Cookie)
    outreach/             CRUD (GET/POST/PATCH/DELETE)
  login/                  Login-Seite
  logout/                 Logout-Route
components/
  shell/                  Sidebar, PageHeader
  ui/                     Button, Card, StatCard, Badge, Avatar, EmptyState
  outreach/               Table, Form, ChannelBadge, StatusBadge
  charts/                 Recharts-Wrapper im tagtig-Look
lib/
  outreach.ts             Enums, Labels, Zod-Schema
  kpis.ts                 KPI-Berechnungen (pure)
  auth.ts                 Cookie-Signing
  utils.ts                Date-Format, Team-Liste, cn()
  supabase/
    server.ts             Server-Client
    outreach-repo.ts      CRUD-Repository
supabase/
  migrations/             SQL-Migrationen
middleware.ts             Auth-Gate
tailwind.config.ts        tagtig-Tokens
```

## Was kommt als nächstes

Die App-Shell ist so gebaut, dass weitere Operations-Module einfach in der Sidebar ergänzt werden können (z.B. Recruiting-Ops, Onboarding, Reporting). Dafür in `components/shell/Sidebar.tsx` einen neuen Sidebar-Section-Block hinzufügen und ein weiteres `(app)/<modul>`-Verzeichnis anlegen.
