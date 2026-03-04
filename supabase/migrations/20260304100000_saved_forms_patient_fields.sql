-- Add denormalized patient fields to saved_forms for display without JOIN
ALTER TABLE public.saved_forms
  ADD COLUMN IF NOT EXISTS patient_name text,
  ADD COLUMN IF NOT EXISTS patient_dob text;

-- Backfill from extracted_data for existing rows
UPDATE public.saved_forms
SET
  patient_name = COALESCE(
    extracted_data->>'fullName',
    extracted_data->>'customerName'
  ),
  patient_dob = extracted_data->>'dateOfBirth'
WHERE patient_name IS NULL;

-- Update the RPC to include new fields
CREATE OR REPLACE FUNCTION public.get_dashboard_data(recent_limit integer DEFAULT 20)
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH current_doctor AS (
    SELECT id
    FROM doctor_profiles
    WHERE user_id = auth.uid()
    LIMIT 1
  )
  SELECT json_build_object(
    'profile', (
      SELECT row_to_json(p.*)
      FROM doctor_profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    ),
    'today_forms_count', COALESCE((
      SELECT count(*)
      FROM saved_forms sf
      WHERE sf.doctor_id = (SELECT id FROM current_doctor)
      AND (sf.created_at AT TIME ZONE 'Australia/Melbourne')::date = (now() AT TIME ZONE 'Australia/Melbourne')::date
    ), 0),
    'recent_forms', COALESCE((
      SELECT json_agg(row_to_json(f))
      FROM (
        SELECT
          sf.id,
          sf.form_type,
          sf.form_name,
          sf.status,
          sf.created_at,
          sf.updated_at,
          sf.patient_name,
          sf.patient_dob
        FROM saved_forms sf
        WHERE sf.doctor_id = (SELECT id FROM current_doctor)
        ORDER BY sf.created_at DESC
        LIMIT greatest(1, least(COALESCE(recent_limit, 20), 100))
      ) f
    ), '[]'::json)
  );
$$;
