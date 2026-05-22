-- ============================================================
-- BudgetFlow — Full Database Schema + Row Level Security
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Profiles (extends auth.users — one row per signed-up user)
create table if not exists profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  theme       text not null default 'dark' check (theme in ('dark', 'light')),
  created_at  timestamptz not null default now()
);

-- Budget settings (one row per user, upserted on change)
create table if not exists budget_settings (
  user_id    uuid references profiles(id) on delete cascade primary key,
  allowance  numeric not null default 0 check (allowance >= 0),
  updated_at timestamptz not null default now()
);

-- Budget entries (transactions: expense / income / savings)
create table if not exists budget_entries (
  id         text primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  date       date not null,
  timestamp  timestamptz not null,
  type       text not null check (type in ('expense', 'income', 'savings')),
  category   text,
  amount     numeric not null check (amount >= 0),
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists budget_entries_user_date on budget_entries (user_id, date desc);

-- Services (user-defined services offered)
create table if not exists services (
  id         text primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  name       text not null,
  price      numeric not null default 0 check (price >= 0),
  color      text not null,
  emoji      text not null,
  created_at timestamptz not null
);
create index if not exists services_user_id on services (user_id);

-- Customers (student / client registry per user)
create table if not exists customers (
  id         text primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  name       text not null,
  created_at timestamptz not null
);
create index if not exists customers_user_id on customers (user_id);

-- Collection entries (transaction log for services)
create table if not exists collection_entries (
  id            text primary key,
  user_id       uuid references profiles(id) on delete cascade not null,
  service_id    text references services(id) on delete set null,
  service_name  text not null,
  service_color text not null,
  service_emoji text not null,
  amount        numeric not null check (amount >= 0),
  customer_id   text references customers(id) on delete set null,
  customer_name text,
  timestamp     timestamptz not null,
  date          date not null
);
create index if not exists collection_entries_user_date on collection_entries (user_id, date desc);

-- Soda challenge state (one row per user, upserted on check-in)
create table if not exists soda_challenge (
  user_id        uuid references profiles(id) on delete cascade primary key,
  streak         int not null default 0 check (streak >= 0),
  longest_streak int not null default 0 check (longest_streak >= 0),
  checked_days   date[] not null default '{}',
  last_checked   date,
  start_date     date,
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — every user sees only their own rows
-- ============================================================

alter table profiles          enable row level security;
alter table budget_settings   enable row level security;
alter table budget_entries    enable row level security;
alter table services          enable row level security;
alter table customers         enable row level security;
alter table collection_entries enable row level security;
alter table soda_challenge    enable row level security;

-- profiles: own row only
create policy "profiles_select" on profiles for select using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- budget_settings
create policy "budget_settings_all" on budget_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- budget_entries
create policy "budget_entries_all" on budget_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- services
create policy "services_all" on services
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- customers
create policy "customers_all" on customers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- collection_entries
create policy "collection_entries_all" on collection_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- soda_challenge
create policy "soda_challenge_all" on soda_challenge
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
