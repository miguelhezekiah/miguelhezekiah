
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  year text not null,
  category text not null,
  role text not null,
  location text not null,
  summary text not null,
  body text[] not null default '{}',
  tags text[] not null default '{}',
  metrics jsonb not null default '[]'::jsonb,
  hero_image_url text,
  gallery_urls text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.writing (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  date text not null,
  read_time text not null,
  tag text not null,
  excerpt text not null,
  body text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  org text not null,
  years text not null,
  note text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.writing enable row level security;
alter table public.experience enable row level security;

create policy "public read projects" on public.projects for select using (true);
create policy "public read writing" on public.writing for select using (true);
create policy "public read experience" on public.experience for select using (true);

insert into storage.buckets (id, name, public) values ('portfolio-assets', 'portfolio-assets', true);

create policy "public read portfolio-assets"
  on storage.objects for select
  using (bucket_id = 'portfolio-assets');
