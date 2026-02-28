import { getCurrentDoctorProfile, getSavedFormSummaries } from '@/lib/supabase/auth';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export default async function DashboardPage() {
  const profile = await getCurrentDoctorProfile();
  const forms = profile ? await getSavedFormSummaries(profile.id) : [];

  return <DashboardContent profile={profile} forms={forms} />;
}
