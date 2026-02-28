import { getDashboardData } from '@/lib/supabase/auth';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export default async function DashboardPage() {
  const { profile, recentForms, todayFormsCount } = await getDashboardData();

  return (
    <DashboardContent
      profile={profile}
      forms={recentForms}
      todayFormsCount={todayFormsCount}
    />
  );
}
