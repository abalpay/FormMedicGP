create or replace function public.get_dashboard_data()
returns json
language sql
stable
security invoker
as $$
  select json_build_object(
    'profile', (
      select row_to_json(p.*)
      from doctor_profiles p
      where p.user_id = auth.uid()
      limit 1
    ),
    'forms', coalesce((
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
        where sf.doctor_id = (
          select id from doctor_profiles where user_id = auth.uid() limit 1
        )
        order by sf.created_at desc
      ) f
    ), '[]'::json)
  );
$$;
