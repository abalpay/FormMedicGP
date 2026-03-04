import { redirect, notFound } from 'next/navigation';
import { getCurrentDoctorProfile } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { mapSavedFormMetaRow } from '@/lib/backend-mappers';
import { SavedFormDetail } from '@/components/saved/saved-form-detail';

export default async function SavedFormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentDoctorProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('saved_forms')
    .select('id, doctor_id, patient_id, form_type, form_name, status, created_at, updated_at, extracted_data, patient_name, patient_dob')
    .eq('id', id)
    .eq('doctor_id', profile.id)
    .maybeSingle();

  if (error || !data) notFound();

  return <SavedFormDetail form={mapSavedFormMetaRow(data)} />;
}
