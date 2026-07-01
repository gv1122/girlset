create sequence if not exists anon_seq start 1;

create or replace function claim_anon_number()
returns int
language sql
as $$
  select nextval('anon_seq')::int;
$$;

create table if not exists messages (
  id bigint generated always as identity primary key,
  anon_number int not null,           -- 0 = main girlset account
  body text not null check (char_length(body) <= 60),
  is_official boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on messages (created_at desc);

alter table messages enable row level security;

create policy "messages are readable by everyone"
  on messages for select
  using (true);

create policy "anyone can post a message"
  on messages for insert
  with check (
    char_length(body) <= 60
    and (anon_number <> 0)
  );

create policy "service role manages official + pinned messages"
  on messages for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter publication supabase_realtime add table messages;

create table if not exists admin_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into admin_settings (key, value) values
  ('links', '{"presave_url": "", "subscribe_url": ""}'),
  ('banned_words', '[]'),
  ('flag_settings', '{"webcam_nsfw_enabled": true, "webcam_nsfw_threshold": 0.75, "chat_filter_enabled": true}')
on conflict (key) do nothing;

alter table admin_settings enable row level security;

create policy "settings are readable by everyone"
  on admin_settings for select
  using (true);

create policy "only service role can write settings"
  on admin_settings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists flags (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('webcam_nsfw', 'chat_report')),
  message_id bigint references messages (id) on delete set null,
  anon_number int,
  confidence numeric,
  note text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table flags enable row level security;

create policy "anyone can create a flag"
  on flags for insert
  with check (true);

create policy "only service role can read or update flags"
  on flags for select
  using (auth.role() = 'service_role');

create table if not exists subscribers (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table subscribers enable row level security;

create policy "anyone can subscribe"
  on subscribers for insert
  with check (true);

create policy "only service role can read subscribers"
  on subscribers for select
  using (auth.role() = 'service_role');