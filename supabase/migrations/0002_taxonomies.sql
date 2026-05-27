-- tagtig OS · Taxonomy tables (ICP Segmente + Value Props)
-- Run in Supabase SQL editor after 0001_outreach.sql.

create table if not exists public.icp_segments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.value_props (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists icp_segments_name_idx on public.icp_segments (name);
create index if not exists value_props_name_idx on public.value_props (name);

drop trigger if exists icp_segments_set_updated_at on public.icp_segments;
create trigger icp_segments_set_updated_at
  before update on public.icp_segments
  for each row execute function public.set_updated_at();

drop trigger if exists value_props_set_updated_at on public.value_props;
create trigger value_props_set_updated_at
  before update on public.value_props
  for each row execute function public.set_updated_at();
