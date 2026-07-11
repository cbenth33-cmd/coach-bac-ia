-- Phase 2 : comptes utilisateurs, synchronisation multi-appareils, anti-abus chat.
-- Appliquée en production le 11/07/2026.

create table public.account_state (
  owner uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.account_state enable row level security;
create policy "chaque utilisateur lit son propre etat" on public.account_state for select using (auth.uid() = owner);
create policy "chaque utilisateur ecrit son propre etat" on public.account_state for insert with check (auth.uid() = owner);
create policy "chaque utilisateur modifie son propre etat" on public.account_state for update using (auth.uid() = owner) with check (auth.uid() = owner);
create policy "chaque utilisateur supprime son propre etat" on public.account_state for delete using (auth.uid() = owner);

create table public.chat_usage (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);
alter table public.chat_usage enable row level security;

create or replace function public.bump_chat_usage(p_key text, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into public.chat_usage(key, window_start, count)
  values (p_key, date_trunc('hour', now()), 1)
  on conflict (key, window_start) do update set count = chat_usage.count + 1
  returning count into c;
  return c <= p_limit;
end $$;
revoke execute on function public.bump_chat_usage(text, int) from public, anon, authenticated;
grant execute on function public.bump_chat_usage(text, int) to service_role;
create index chat_usage_window_idx on public.chat_usage (window_start);
