create extension if not exists pg_trgm;

create index if not exists idx_saved_forms_doctor_created_at_desc
  on public.saved_forms(doctor_id, created_at desc);

create index if not exists idx_patients_doctor_updated_at_desc
  on public.patients(doctor_id, updated_at desc);

create index if not exists idx_patients_customer_name_trgm
  on public.patients using gin (customer_name gin_trgm_ops);
