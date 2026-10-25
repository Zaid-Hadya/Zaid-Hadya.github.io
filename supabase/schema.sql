-- Run this in Supabase SQL Editor. RLS ensures each student can access only their own records.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
create table if not exists public.lesson_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, course_slug, lesson_slug)
);
create table if not exists public.activity_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  activity_id text not null,
  passed boolean not null default false,
  score integer,
  attempted_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.activity_attempts enable row level security;
create policy "Students can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Students can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Students can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Students can read own lesson progress" on public.lesson_progress for select to authenticated using (auth.uid() = user_id);
create policy "Students can insert own lesson progress" on public.lesson_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "Students can update own lesson progress" on public.lesson_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Students can read own attempts" on public.activity_attempts for select to authenticated using (auth.uid() = user_id);
create policy "Students can insert own attempts" on public.activity_attempts for insert to authenticated with check (auth.uid() = user_id);
