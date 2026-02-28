import { getCurrentDoctorProfile } from '@/lib/supabase/auth';
import { mapPatientListRow } from '@/lib/backend-mappers';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { DoctorProfileForm } from '@/components/forms/doctor-profile-form';
import { PatientList } from '@/components/patients/patient-list';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const INITIAL_PATIENTS_LIMIT = 25;
type PatientListRow = Pick<
  Database['public']['Tables']['patients']['Row'],
  'id' | 'customer_name' | 'date_of_birth' | 'address' | 'updated_at'
>;

export default async function SettingsPage() {
  const profile = await getCurrentDoctorProfile();
  let initialPatients: ReturnType<typeof mapPatientListRow>[] = [];
  let initialNextCursor: string | null = null;

  if (profile) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('patients')
      .select('id, customer_name, date_of_birth, address, updated_at')
      .eq('doctor_id', profile.id)
      .order('updated_at', { ascending: false })
      .order('id', { ascending: false })
      .range(0, INITIAL_PATIENTS_LIMIT);

    const rows = data ?? [];
    const hasMore = rows.length > INITIAL_PATIENTS_LIMIT;
    const pageRows = hasMore ? rows.slice(0, INITIAL_PATIENTS_LIMIT) : rows;

    initialPatients = pageRows.map((row) => mapPatientListRow(row as PatientListRow));
    initialNextCursor = hasMore ? String(INITIAL_PATIENTS_LIMIT) : null;
  }

  return (
    <div className="max-w-2xl mx-auto" data-testid="settings-page">
      <div className="mb-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">
          Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Manage your profile and saved patients.
        </p>
      </div>

      <Tabs defaultValue="profile" className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <DoctorProfileForm initialData={profile} />
        </TabsContent>

        <TabsContent value="patients" className="mt-6">
          <PatientList
            initialPatients={initialPatients}
            initialNextCursor={initialNextCursor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
