create table if not exists public.portfolio_content (
  id text primary key check (id = 'portfolio'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

-- Do not add anon/authenticated policies. The site accesses this table only
-- from the server with SUPABASE_SERVICE_ROLE_KEY.
