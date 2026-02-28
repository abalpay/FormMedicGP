# Phase 1: Database Schema & Migrations

## Objective

Create Supabase migration files that set up the database tables, RLS policies, indexes, and helper functions needed for FormDoctor.

## Tasks

- [ ] 1.1 Initialize Supabase project structure (`supabase/` directory with `config.toml` if not present)
- [ ] 1.2 Create migration: `doctor_profiles` table
- [ ] 1.3 Create migration: `patients` table
- [ ] 1.4 Create migration: `saved_forms` table
- [ ] 1.5 Create RLS policies for all tables
- [ ] 1.6 Create indexes for common queries
- [ ] 1.7 Create `updated_at` trigger function
- [ ] 1.8 Generate TypeScript types from schema (output to `src/types/database.ts`)

## Table Schemas

### `doctor_profiles`
```sql
CREATE TABLE public.doctor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  provider_number text DEFAULT '',
  qualifications text DEFAULT '',
  practice_name text DEFAULT '',
  practice_address text DEFAULT '',
  practice_phone text DEFAULT '',
  practice_abn text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

### `patients`
```sql
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES public.doctor_profiles(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  date_of_birth date,
  crn text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  cared_person_name text DEFAULT '',
  cared_person_dob date,
  cared_person_crn text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

### `saved_forms`
```sql
CREATE TABLE public.saved_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES public.doctor_profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  form_type text NOT NULL,
  form_name text NOT NULL,
  extracted_data jsonb NOT NULL DEFAULT '{}',
  pdf_base64 text NOT NULL,
  status text DEFAULT 'completed' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

## RLS Policies

Enable RLS on all tables. Policies:

### `doctor_profiles`
```sql
-- Doctors can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.doctor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.doctor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.doctor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### `patients`
```sql
-- Doctors can CRUD their own patients (via doctor_profiles.user_id join)
CREATE POLICY "Doctors can view own patients" ON public.patients
  FOR SELECT USING (
    doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can insert own patients" ON public.patients
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can update own patients" ON public.patients
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can delete own patients" ON public.patients
  FOR DELETE USING (
    doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid())
  );
```

### `saved_forms`
```sql
-- Same pattern as patients
CREATE POLICY "Doctors can view own forms" ON public.saved_forms
  FOR SELECT USING (
    doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can insert own forms" ON public.saved_forms
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can update own forms" ON public.saved_forms
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Doctors can delete own forms" ON public.saved_forms
  FOR DELETE USING (
    doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid())
  );
```

## Indexes

```sql
CREATE INDEX idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);
CREATE INDEX idx_patients_doctor_id ON public.patients(doctor_id);
CREATE INDEX idx_patients_customer_name ON public.patients(customer_name);
CREATE INDEX idx_saved_forms_doctor_id ON public.saved_forms(doctor_id);
CREATE INDEX idx_saved_forms_patient_id ON public.saved_forms(patient_id);
CREATE INDEX idx_saved_forms_created_at ON public.saved_forms(created_at DESC);
```

## Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.saved_forms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## TypeScript Types

Generate a `src/types/database.ts` file with TypeScript types that match the schema. Include Row, Insert, and Update types for each table. This should be compatible with the Supabase JS client's generic type parameter.

## Acceptance Criteria

- All migrations apply cleanly with `supabase db push` or `supabase migration up`
- RLS is enabled on all three tables
- All policies work correctly (tested via Supabase dashboard or SQL)
- TypeScript types are generated and importable
