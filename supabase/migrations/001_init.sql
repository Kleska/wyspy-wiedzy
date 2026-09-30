-- Wyspy Wiedzy — baza w Supabase.
-- Uruchom w: Supabase → SQL Editor → New query → wklej → Run.
--
-- Jedna tabela dokumentów JSON. Aplikacja tylko dopisuje odpowiedzi (attempt) i sesje,
-- więc urządzenia synchronizują się bez konfliktów. Każde konto widzi wyłącznie swoje dane (RLS).

create table if not exists public.ww_docs (
  family_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('profile', 'topic', 'attempt', 'session', 'redemption', 'settings')),
  id text not null check (length(id) between 1 and 120),
  data jsonb not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (family_id, kind, id)
);

create index if not exists ww_docs_sync_idx on public.ww_docs (family_id, server_updated_at);

-- Znacznik czasu nadaje serwer (nie zegar urządzenia) — na nim opiera się synchronizacja.
create or replace function public.ww_touch() returns trigger
language plpgsql as $$
begin
  new.server_updated_at := clock_timestamp();
  return new;
end $$;

drop trigger if exists ww_docs_touch on public.ww_docs;
create trigger ww_docs_touch before insert or update on public.ww_docs
  for each row execute function public.ww_touch();

alter table public.ww_docs enable row level security;

drop policy if exists ww_docs_select on public.ww_docs;
drop policy if exists ww_docs_insert on public.ww_docs;
drop policy if exists ww_docs_update on public.ww_docs;
drop policy if exists ww_docs_delete on public.ww_docs;

create policy ww_docs_select on public.ww_docs for select to authenticated using (family_id = auth.uid());
create policy ww_docs_insert on public.ww_docs for insert to authenticated with check (family_id = auth.uid());
create policy ww_docs_update on public.ww_docs for update to authenticated using (family_id = auth.uid()) with check (family_id = auth.uid());
create policy ww_docs_delete on public.ww_docs for delete to authenticated using (family_id = auth.uid());

-- Limit rozmiaru pojedynczego dokumentu (ochrona przed przypadkowym zapchaniem bazy).
alter table public.ww_docs drop constraint if exists ww_docs_size;
alter table public.ww_docs add constraint ww_docs_size check (pg_column_size(data) < 512000);

-- Widoki do własnych analiz w SQL Editorze (np. które zadania sprawiają kłopot).
create or replace view public.ww_attempts with (security_invoker = true) as
select
  family_id,
  data ->> 'profileId' as profile_id,
  data ->> 'topicId' as topic_id,
  data ->> 'exerciseId' as exercise_id,
  (data ->> 'correct')::boolean as correct,
  (data ->> 'retry')::boolean as retry,
  (data ->> 'ms')::int as ms,
  (data ->> 'at')::timestamptz as at
from public.ww_docs where kind = 'attempt';

create or replace view public.ww_sessions with (security_invoker = true) as
select
  family_id,
  data ->> 'profileId' as profile_id,
  data ->> 'topicId' as topic_id,
  (data ->> 'startedAt')::timestamptz as started_at,
  (data ->> 'activeSeconds')::int as active_seconds,
  (data ->> 'completed')::boolean as completed
from public.ww_docs where kind = 'session';
