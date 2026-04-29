create extension if not exists pgcrypto;

create table if not exists public.blog_comments (
    id uuid primary key default gen_random_uuid(),
    slug text not null check (slug ~ '^[A-Za-z0-9-]+$' and char_length(slug) between 1 and 180),
    name text not null check (char_length(btrim(name)) between 1 and 50),
    message text not null check (char_length(btrim(message)) between 1 and 1000),
    created_at timestamptz not null default now()
);

create index if not exists blog_comments_slug_created_at_idx
    on public.blog_comments (slug, created_at desc);

alter table public.blog_comments enable row level security;

drop policy if exists "Public can read blog comments" on public.blog_comments;
create policy "Public can read blog comments"
    on public.blog_comments
    for select
    using (true);

drop policy if exists "Public can add blog comments" on public.blog_comments;
create policy "Public can add blog comments"
    on public.blog_comments
    for insert
    with check (
        slug ~ '^[A-Za-z0-9-]+$'
        and char_length(slug) between 1 and 180
        and char_length(btrim(name)) between 1 and 50
        and char_length(btrim(message)) between 1 and 1000
    );

create table if not exists public.blog_likes (
    slug text primary key check (slug ~ '^[A-Za-z0-9-]+$' and char_length(slug) between 1 and 180),
    like_count integer not null default 0 check (like_count >= 0),
    updated_at timestamptz not null default now()
);

alter table public.blog_likes enable row level security;

drop policy if exists "Public can read blog likes" on public.blog_likes;
create policy "Public can read blog likes"
    on public.blog_likes
    for select
    using (true);

create or replace function public.increment_blog_like(target_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    new_count integer;
begin
    if target_slug is null or target_slug !~ '^[A-Za-z0-9-]+$' or char_length(target_slug) > 180 then
        raise exception 'Invalid slug';
    end if;

    insert into public.blog_likes as likes (slug, like_count, updated_at)
    values (target_slug, 1, now())
    on conflict (slug) do update
        set like_count = likes.like_count + 1,
            updated_at = now()
    returning like_count into new_count;

    return new_count;
end;
$$;

create or replace function public.decrement_blog_like(target_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    new_count integer;
begin
    if target_slug is null or target_slug !~ '^[A-Za-z0-9-]+$' or char_length(target_slug) > 180 then
        raise exception 'Invalid slug';
    end if;

    insert into public.blog_likes as likes (slug, like_count, updated_at)
    values (target_slug, 0, now())
    on conflict (slug) do update
        set like_count = greatest(likes.like_count - 1, 0),
            updated_at = now()
    returning like_count into new_count;

    return new_count;
end;
$$;

grant execute on function public.increment_blog_like(text) to anon, authenticated;
grant execute on function public.decrement_blog_like(text) to anon, authenticated;
