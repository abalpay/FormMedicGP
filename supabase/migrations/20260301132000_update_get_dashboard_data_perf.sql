create or replace function public.get_dashboard_data(recent_limit integer default 20)
returns json
language sql
stable
security invoker
as $$
  with current_doctor as (
    select id
    from doctor_profiles
    where user_id = auth.uid()
    limit 1
  )
  select json_build_object(
    'profile', (
      select row_to_json(p.*)
      from doctor_profiles p
      where p.user_id = auth.uid()
      limit 1
    ),
    'today_forms_count', coalesce((
      select count(*)
      from saved_forms sf
      where sf.doctor_id = (select id from current_doctor)
      and (sf.created_at at time zone 'Australia/Melbourne')::date = (now() at time zone 'Australia/Melbourne')::date
    ), 0),
    'recent_forms', coalesce((
      select json_agg(row_to_json(f))
      from (
        select
          sf.id,
          sf.form_type,
          sf.form_name,
          sf.status,
          sf.created_at,
          sf.updated_at,
          pt.customer_name as patient_name
        from saved_forms sf
        left join patients pt on pt.id = sf.patient_id
        where sf.doctor_id = (select id from current_doctor)
        order by sf.created_at desc
        limit greatest(1, least(coalesce(recent_limit, 20), 100))
      ) f
    ), '[]'::json)
  );
$$;
