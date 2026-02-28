import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { getCurrentUser } from '@/lib/supabase/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const userName = user?.user_metadata?.name as string | undefined;
  const userEmail = user?.email;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header userName={userName} userEmail={userEmail} />
        <main className="flex-1 flex flex-col overflow-y-auto p-4 lg:p-6 bg-content-gradient">
          {children}
        </main>
      </div>
    </div>
  );
}
