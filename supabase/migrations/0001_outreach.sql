-- tagtig OS · Outreach Tracker schema
-- Run once in Supabase SQL editor.

create extension if not exists "pgcrypto";

do $$ begin
  create type outreach_channel as enum ('email', 'linkedin', 'phone', 'event', 'referral', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type outreach_status as enum (
    'sent',
    'opened',
    'replied',
    'meeting_booked',
    'meeting_done',
    'won',
    'lost',
    'no_response'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.outreach_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  activity_date date not null,
  owner text not null,
  channel outreach_channel not null,

  target_person text not null,
  target_role text,
  target_company text not null,

  icp_segment text not null,
  value_prop text not null,

  status outreach_status not null default 'sent',
  result_notes text,

  follow_up_date date,
  follow_up_done boolean not null default false
);

create index if not exists outreach_activities_activity_date_idx
  on public.outreach_activities (activity_date desc);

create index if not exists outreach_activities_follow_up_idx
  on public.outreach_activities (follow_up_date)
  where follow_up_done = false;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists outreach_set_updated_at on public.outreach_activities;
create trigger outreach_set_updated_at
  before update on public.outreach_activities
  for each row execute function public.set_updated_at();
