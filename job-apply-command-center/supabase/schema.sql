create table if not exists public.profiles (
  id uuid primary key default auth.uid(),
  name text, email text, phone text, linkedin text, headline text, summary text, achievements text, resume_url text,
  updated_at timestamp with time zone default now()
);
create table if not exists public.jobs (
  id uuid primary key,
  user_id uuid default auth.uid(),
  company text not null,
  title text not null,
  location text,
  url text,
  focus text,
  priority text,
  status text,
  notes text,
  applied_date date,
  followup_date date,
  referral_name text,
  referral_contact text,
  interview_date date,
  interview_notes text,
  resume_url text,
  created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own jobs" on public.jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', true) on conflict (id) do nothing;
create policy "Users upload own resumes" on storage.objects for insert with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users read resumes" on storage.objects for select using (bucket_id = 'resumes');
