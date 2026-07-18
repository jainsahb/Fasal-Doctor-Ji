create table if not exists public.scans (
  id bigint generated always as identity primary key,
  crop text not null,
  region text not null,
  stage text not null,
  language text not null check (language in ('en', 'hi')),
  disease text not null,
  scientific_name text not null,
  confidence integer not null check (confidence between 0 and 100),
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists scans_created_at_idx on public.scans (created_at desc);
