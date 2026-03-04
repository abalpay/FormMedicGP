import Link from 'next/link';
import { FilePlus, FileText, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DoctorProfile, SavedFormSummary } from '@/types';
import { isDashboardProfileComplete } from '@/lib/doctor-profile-requirements';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface DashboardContentProps {
  profile: DoctorProfile | null;
  forms: SavedFormSummary[];
  todayFormsCount: number;
}

export function DashboardContent({
  profile,
  forms,
  todayFormsCount,
}: DashboardContentProps) {
  const doctorName = profile?.name || 'Doctor';
  const showProfileBanner =
    !profile || !isDashboardProfileComplete(profile);

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="dashboard-content">
      {/* Welcome */}
      <div className="animate-fade-in-up rounded-2xl gradient-teal px-6 py-5 text-white">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Welcome back, {doctorName}
        </h2>
        <p className="text-sm text-white/80 mt-1.5 max-w-lg">
          Complete government forms in under 2 minutes with AI-powered dictation.
        </p>
      </div>

      {/* Profile setup banner */}
      {showProfileBanner && (
        <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Set up your profile to get started
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your provider details will auto-fill on every form.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings">
                  Set up
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <Link href="/dashboard/forms/new" className="group">
          <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-ring">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.25)] transition-all duration-200">
                <FilePlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground font-[family-name:var(--font-display)]">New Form</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a form, enter patient details, and describe.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground font-[family-name:var(--font-display)]">Forms Today</h3>
                <Badge variant="secondary" className="text-xs">
                  {todayFormsCount}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {todayFormsCount === 0
                  ? 'No forms completed today.'
                  : `${todayFormsCount} form${todayFormsCount !== 1 ? 's' : ''} completed today.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent forms */}
      <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Recent Forms
        </h3>

        {forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/60 mb-4">
                <FileText className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                No forms yet. Create your first form to get started.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/forms/new">
                  <FilePlus className="w-4 h-4 mr-1.5" />
                  New Form
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {forms.map((form) => (
                  <Link
                    key={form.id}
                    href={`/dashboard/saved/${form.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors"
                  >
                    <Badge variant="outline" className="text-xs shrink-0">
                      {form.formType}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      {form.patientName ? (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {form.patientName}
                            </p>
                            {form.patientDob && (
                              <span className="text-xs text-muted-foreground shrink-0">
                                · DOB: {formatDate(form.patientDob)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {form.formName}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-foreground truncate">
                          {form.formName}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(form.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {forms.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/saved">
                View All Forms
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
