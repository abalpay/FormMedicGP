-- Seed test data for local development.
-- Creates an email/password user and updates the auto-created doctor profile row.

do $$
declare
  seed_email constant text := 'test@test.com';
  seed_password constant text := 'testtest';
  seed_user_id uuid;
begin
  select id
  into seed_user_id
  from auth.users
  where email = seed_email
  limit 1;

  if seed_user_id is null then
    seed_user_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change_token_current,
      reauthentication_token,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      seed_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      seed_email,
      crypt(seed_password, gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'sub', seed_user_id::text,
        'email', seed_email,
        'full_name', 'Dr. Test User',
        'name', 'Dr. Test User',
        'email_verified', true,
        'phone_verified', false
      ),
      now(),
      now()
    );

    insert into auth.identities (
      user_id,
      identity_data,
      provider,
      provider_id,
      created_at,
      updated_at
    )
    values (
      seed_user_id,
      jsonb_build_object(
        'sub', seed_user_id::text,
        'email', seed_email,
        'full_name', 'Dr. Test User',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      seed_user_id::text,
      now(),
      now()
    )
    on conflict (provider_id, provider) do nothing;
  end if;

  -- Row is created by public.on_auth_user_created trigger; update details only.
  update public.doctor_profiles
  set
    name = 'Dr. Test User',
    provider_number = '123456AB',
    qualifications = 'MBBS, FRACGP',
    practice_name = 'Sunrise Medical Centre',
    practice_address = '123 Collins St, Melbourne VIC 3000',
    practice_phone = '03 9876 5432'
  where user_id = seed_user_id;
end;
$$;
