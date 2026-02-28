-- Fix: invited users get email as name because Supabase stores
-- the invite name under 'name', not 'full_name'.
-- Check both keys before falling back to empty string (never email).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.doctor_profiles (user_id, name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      ''
    )
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;
