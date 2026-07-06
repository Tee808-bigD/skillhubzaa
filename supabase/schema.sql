create extension if not exists pgcrypto;

create type public.account_type as enum ('client', 'professional');
create type public.booking_status as enum ('pending', 'accepted', 'declined', 'completed', 'cancelled');
create type public.reaction_type as enum ('like', 'heart', 'laugh', 'wow', 'sad', 'angry');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 120),
  account_type public.account_type not null default 'client',
  bio text check (char_length(coalesce(bio, '')) <= 500),
  skill text check (char_length(coalesce(skill, '')) <= 120),
  location text check (char_length(coalesce(location, '')) <= 120),
  avatar_url text,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  description text not null check (char_length(description) between 10 and 1200),
  category text not null check (char_length(category) between 2 and 80),
  price_cents integer check (price_cents is null or price_cents >= 0),
  location text check (char_length(coalesce(location, '')) <= 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  attachments text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 800),
  created_at timestamptz not null default now()
);

create table public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction public.reaction_type not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  status public.booking_status not null default 'pending',
  scheduled_for timestamptz,
  note text check (char_length(coalesce(note, '')) <= 800),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'post', 'comment', 'service', 'message')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 5 and 500),
  created_at timestamptz not null default now()
);

create index profiles_account_type_idx on public.profiles(account_type);
create index services_provider_idx on public.services(provider_id);
create index services_category_idx on public.services(category);
create index posts_created_at_idx on public.posts(created_at desc);
create index comments_post_idx on public.comments(post_id, created_at);
create index bookings_client_idx on public.bookings(client_id);
create index messages_participants_idx on public.messages(sender_id, recipient_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger services_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger posts_updated_at before update on public.posts for each row execute function public.set_updated_at();
create trigger bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, account_type, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'account_type')::public.account_type, 'client'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_new_user();

create or replace view public.post_feed with (security_invoker = true) as
select
  p.id,
  p.body,
  p.attachments,
  p.created_at,
  json_build_object(
    'id', pr.id,
    'full_name', pr.full_name,
    'avatar_url', pr.avatar_url,
    'skill', pr.skill
  ) as author,
  coalesce((select count(*) from public.comments c where c.post_id = p.id), 0) as comment_count,
  coalesce((select count(*) from public.reactions r where r.post_id = p.id), 0) as reaction_count
from public.posts p
join public.profiles pr on pr.id = p.author_id
order by p.created_at desc;

create or replace view public.services_with_provider with (security_invoker = true) as
select
  s.*,
  json_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'rating_avg', p.rating_avg,
    'rating_count', p.rating_count,
    'location', p.location
  ) as provider
from public.services s
join public.profiles p on p.id = s.provider_id;

create or replace view public.messages_with_profiles with (security_invoker = true) as
select
  m.*,
  json_build_object('id', sender.id, 'full_name', sender.full_name, 'avatar_url', sender.avatar_url) as sender,
  json_build_object('id', recipient.id, 'full_name', recipient.full_name, 'avatar_url', recipient.avatar_url) as recipient
from public.messages m
join public.profiles sender on sender.id = m.sender_id
join public.profiles recipient on recipient.id = m.recipient_id
order by m.created_at desc;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

create policy "profiles are readable to authenticated users" on public.profiles for select to authenticated using (true);
create policy "users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "services are readable" on public.services for select to authenticated using (is_active or provider_id = auth.uid());
create policy "professionals can create own services" on public.services for insert to authenticated with check (provider_id = auth.uid());
create policy "providers can update own services" on public.services for update to authenticated using (provider_id = auth.uid()) with check (provider_id = auth.uid());

create policy "posts are readable" on public.posts for select to authenticated using (true);
create policy "users can create posts" on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy "authors can update own posts" on public.posts for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors can delete own posts" on public.posts for delete to authenticated using (author_id = auth.uid());

create policy "comments are readable" on public.comments for select to authenticated using (true);
create policy "users can comment" on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy "comment authors can delete" on public.comments for delete to authenticated using (author_id = auth.uid());

create policy "reactions are readable" on public.reactions for select to authenticated using (true);
create policy "users can react" on public.reactions for insert to authenticated with check (user_id = auth.uid());
create policy "users can change own reactions" on public.reactions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users can remove own reactions" on public.reactions for delete to authenticated using (user_id = auth.uid());

create policy "booking parties can read" on public.bookings for select to authenticated using (
  client_id = auth.uid() or exists (select 1 from public.services s where s.id = service_id and s.provider_id = auth.uid())
);
create policy "clients can book services" on public.bookings for insert to authenticated with check (client_id = auth.uid());
create policy "booking parties can update" on public.bookings for update to authenticated using (
  client_id = auth.uid() or exists (select 1 from public.services s where s.id = service_id and s.provider_id = auth.uid())
);

create policy "message parties can read" on public.messages for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "users can send messages" on public.messages for insert to authenticated with check (sender_id = auth.uid());
create policy "recipients can mark read" on public.messages for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create policy "users can create reports" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
