import { getCurrentDoctorProfile, getSavedFormSummaries } from '@/lib/supabase/auth';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export default async function DashboardPage() {
  const [profile, forms] = await Promise.all([
    getCurrentDoctorProfile(),
    getSavedFormSummaries(),
  ]);

  return <DashboardContent profile={profile} forms={forms} />;
}
