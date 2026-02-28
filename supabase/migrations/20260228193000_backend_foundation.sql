create extension if not exists pgcrypto;

create table public.doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,
  name text not null default '',
  provider_number text not null default '',
  qualifications text not null default '',
  practice_name text not null default '',
  practice_address text not null default '',
  practice_phone text not null default '',
  practice_abn text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint idx_doctor_profiles_user_id unique (user_id)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null
    references public.doctor_profiles(id) on delete cascade,
  customer_name text not null,
  date_of_birth date,
  crn text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  cared_person_name text not null default '',
  cared_person_dob date,
  cared_person_crn text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_forms (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null
    references public.doctor_profiles(id) on delete cascade,
  patient_id uuid
    references public.patients(id) on delete set null,
  form_type text not null,
  form_name text not null,
  extracted_data jsonb not null default '{}'::jsonb,
  pdf_base64 text not null,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_doctor_profiles_updated_at
before update on public.doctor_profiles
for each row execute function public.handle_updated_at();

create trigger set_patients_updated_at
before update on public.patients
for each row execute function public.handle_updated_at();

create trigger set_saved_forms_updated_at
before update on public.saved_forms
for each row execute function public.handle_updated_at();

alter table public.doctor_profiles enable row level security;
alter table public.patients enable row level security;
alter table public.saved_forms enable row level security;

create policy "Users can view own profile" on public.doctor_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can update own profile" on public.doctor_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can insert own profile" on public.doctor_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Doctors can view own patients" on public.patients
  for select
  to authenticated
  using (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  );

create policy "Doctors can insert own patients" on public.patients
  for insert
  to authenticated
  with check (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  );

create policy "Doctors can update own patients" on public.patients
  for update
  to authenticated
  using (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  )
  with check (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  );

create policy "Doctors can delete own patients" on public.patients
  for delete
  to authenticated
  using (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  );

create policy "Doctors can view own forms" on public.saved_forms
  for select
  to authenticated
  using (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  );

create policy "Doctors can insert own forms" on public.saved_forms
  for insert
  to authenticated
  with check (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  );

create policy "Doctors can update own forms" on public.saved_forms
  for update
  to authenticated
  using (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  )
  with check (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  );

create policy "Doctors can delete own forms" on public.saved_forms
  for delete
  to authenticated
  using (
    doctor_id in (
      select id
      from public.doctor_profiles
      where user_id = (select auth.uid())
    )
  );

create index idx_patients_doctor_id on public.patients(doctor_id);
create index idx_patients_customer_name on public.patients(customer_name);
create index idx_saved_forms_doctor_id on public.saved_forms(doctor_id);
create index idx_saved_forms_patient_id on public.saved_forms(patient_id);
create index idx_saved_forms_created_at on public.saved_forms(created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.doctor_profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email, ''))
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
