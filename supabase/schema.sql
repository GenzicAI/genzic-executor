-- NicheLead AI — Supabase schema
-- Run in the Supabase SQL editor. Tables are niche-aware via the `niche` column
-- so a single schema scales to 30+ industries without migrations.

create extension if not exists "pgcrypto";

-- Industries registry (mirrors lib/niches; optional source of truth for admin UIs)
create table if not exists public.niches (
  id          text primary key,
  label       text not null,
  accent      text not null,
  created_at  timestamptz not null default now()
);

-- Leads
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users (id) on delete cascade,
  niche       text not null references public.niches (id),
  name        text not null,
  location    text,
  score       int  not null default 0 check (score between 0 and 100),
  status      text not null default 'new'
              check (status in ('new','qualified','contacted','converted')),
  summary     text,
  image_url   text,
  tags        text[] not null default '{}',
  attrs       jsonb  not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists leads_owner_niche_idx on public.leads (owner_id, niche);
create index if not exists leads_score_idx on public.leads (score desc);

-- Outreach log (one row per email/SMS dispatched through Zapier)
create table if not exists public.outreach (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users (id) on delete cascade,
  lead_id      uuid references public.leads (id) on delete set null,
  niche        text not null,
  channel      text not null check (channel in ('email','sms')),
  template_id  text,
  subject      text,
  body         text,
  status       text not null default 'queued',
  created_at   timestamptz not null default now()
);

-- Campaigns
create table if not exists public.campaigns (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users (id) on delete cascade,
  niche        text not null,
  name         text not null,
  channel      text not null check (channel in ('email','sms')),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Row Level Security: each user only sees their own data.
alter table public.leads      enable row level security;
alter table public.outreach   enable row level security;
alter table public.campaigns  enable row level security;

create policy "own leads"      on public.leads      for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "own outreach"   on public.outreach   for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "own campaigns"  on public.campaigns  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Niches readable by everyone (reference data).
alter table public.niches enable row level security;
create policy "niches are public" on public.niches for select using (true);

insert into public.niches (id, label, accent) values
  ('personal-trainer', 'Personal Trainer',    '152 100% 39%'),
  ('esthetician',      'Esthetician',          '330 81% 60%'),
  ('roofing',          'Roofing Contractor',   '24 95% 53%'),
  ('realtor',          'Realtor',              '217 91% 60%')
on conflict (id) do nothing;
