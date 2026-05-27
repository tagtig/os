-- tagtig OS · App-User-Verwaltung
-- Eigene User-Tabelle (unabhängig von Supabase Auth)

create table if not exists public.app_users (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  name                text not null default '',
  password_hash       text,                -- null = Einladung noch nicht akzeptiert
  role                text not null default 'user'
                      check (role in ('admin', 'user')),
  is_active           boolean not null default true,
  invite_token        text unique,         -- null = kein offener Invite
  invite_expires_at   timestamptz,
  invited_by          uuid references public.app_users(id) on delete set null,
  last_login_at       timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists app_users_email_idx
  on public.app_users (lower(email));

create index if not exists app_users_invite_token_idx
  on public.app_users (invite_token)
  where invite_token is not null;

drop trigger if exists app_users_set_updated_at on public.app_users;
create trigger app_users_set_updated_at
  before update on public.app_users
  for each row execute function public.set_updated_at();
