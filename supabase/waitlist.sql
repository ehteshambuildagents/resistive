-- Resistive waitlist schema.
-- Idempotent: safe to re-run, and it upgrades an earlier install of this table
-- in place rather than requiring a drop. Apply in the Supabase SQL editor.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 254),
  company text not null check (char_length(company) between 1 and 160),
  monthly_ad_spend text,
  marketing_consent boolean not null default false,
  consent_text text,
  status text not null default 'waitlist',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade an existing table to this shape, one column at a time.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'waitlist'
               and column_name = 'consent_updates')
     and not exists (select 1 from information_schema.columns
                     where table_schema = 'public' and table_name = 'waitlist'
                       and column_name = 'marketing_consent') then
    alter table public.waitlist rename column consent_updates to marketing_consent;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'waitlist'
               and column_name = 'monthly_paid_social_spend')
     and not exists (select 1 from information_schema.columns
                     where table_schema = 'public' and table_name = 'waitlist'
                       and column_name = 'monthly_ad_spend') then
    alter table public.waitlist rename column monthly_paid_social_spend to monthly_ad_spend;
  end if;
end $$;

alter table public.waitlist add column if not exists consent_text text;
alter table public.waitlist add column if not exists status text not null default 'waitlist';
alter table public.waitlist add column if not exists source text not null default 'website';
alter table public.waitlist add column if not exists updated_at timestamptz not null default now();

-- The server always normalises before inserting; this guarantees it anyway, so
-- a direct insert can never create a case-variant duplicate.
alter table public.waitlist
  add column if not exists email_normalized text
  generated always as (lower(btrim(email))) stored;

create unique index if not exists waitlist_email_normalized_key
  on public.waitlist (email_normalized);

-- Only the documented lifecycle states are accepted.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'waitlist_status_check') then
    alter table public.waitlist add constraint waitlist_status_check
      check (status in ('waitlist','qualified','design_partner','invited','customer','unsubscribed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'waitlist_spend_check') then
    alter table public.waitlist add constraint waitlist_spend_check
      check (monthly_ad_spend is null or monthly_ad_spend in
        ('Under $10K','$10K–$50K','$50K–$100K','$100K–$500K','$500K+'));
  end if;
end $$;

create or replace function public.waitlist_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists waitlist_set_updated_at on public.waitlist;
create trigger waitlist_set_updated_at
  before update on public.waitlist
  for each row execute function public.waitlist_touch_updated_at();

-- Writes happen server-side with the service role, which bypasses RLS.
-- No public policy is created, so the anon key cannot read or write this table.
alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
