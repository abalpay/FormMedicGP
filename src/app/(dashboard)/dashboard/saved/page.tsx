import { redirect } from 'next/navigation';
import { getCurrentDoctorProfile } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { mapSavedFormSummaryRow, type SavedFormSummaryRow } from '@/lib/backend-mappers';
import { SavedFormsList } from '@/components/saved/saved-forms-list';

export default async function AllFormsPage() {
  const profile = await getCurrentDoctorProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();

  // Fetch initial page
  const { data, count } = await supabase
    .from('saved_forms')
    .select(
      'id, form_type, form_name, status, created_at, updated_at, patient_name, patient_dob, patients(customer_name)',
      { count: 'exact' }
    )
    .eq('doctor_id', profile.id)
    .order('created_at', { ascending: false })
    .range(0, 19);

  const forms = ((data ?? []) as SavedFormSummaryRow[]).map(mapSavedFormSummaryRow);

  // Get distinct form types for filter dropdown
  const { data: typeRows } = await supabase
    .from('saved_forms')
    .select('form_type')
    .eq('doctor_id', profile.id);

  const formTypes = [...new Set((typeRows ?? []).map((r) => r.form_type))].sort();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          All Forms
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and search all your saved forms.
        </p>
      </div>
      <SavedFormsList
        initialForms={forms}
        initialTotal={count ?? 0}
        formTypes={formTypes}
      />
    </div>
  );
}
