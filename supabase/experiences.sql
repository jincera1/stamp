-- Suggested experiences table for conversational logging (run in Supabase SQL editor).
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New stamp',
  description text not null,
  place text,
  tags text[],
  occurred_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.experiences enable row level security;

create policy "Users can insert own experiences"
  on public.experiences for insert
  with check (auth.uid() = user_id);

create policy "Users can read own experiences"
  on public.experiences for select
  using (auth.uid() = user_id);

-- Discover feed: any signed-in user can browse stamps (MVP: all rows visible to auth users).
create policy "Authenticated users can read experiences for discover"
  on public.experiences for select
  using (auth.uid() is not null);
