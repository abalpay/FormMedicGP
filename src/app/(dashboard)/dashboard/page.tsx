'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus, FileText, Settings, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { DoctorProfile, SavedFormSummary } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isProfileComplete(profile: DoctorProfile): boolean {
  return Boolean(
    profile.name &&
    profile.providerNumber &&
    profile.qualifications &&
    profile.practiceName &&
    profile.practiceAddress &&
    profile.practicePhone &&
    profile.practiceAbn
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [forms, setForms] = useState<SavedFormSummary[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [formsError, setFormsError] = useState(false);

  const fetchProfile = async () => {
    setProfileError(false);
    setIsLoadingProfile(true);
    try {
      const res = await fetch('/api/doctor-profile');
      if (res.status === 404) {
        setProfile(null);
        return;
      }
      if (!res.ok) throw new Error();
      const { profile: p } = await res.json();
      setProfile(p);
    } catch {
      setProfileError(true);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchForms = async () => {
    setFormsError(false);
    setIsLoadingForms(true);
    try {
      const res = await fetch('/api/saved-forms');
      if (!res.ok) throw new Error();
      const { forms: f } = await res.json();
      setForms(f);
    } catch {
      setFormsError(true);
    } finally {
      setIsLoadingForms(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchForms();
  }, []);

  const doctorName = profile?.name || 'Doctor';
  const showProfileBanner = !isLoadingProfile && (!profile || !isProfileComplete(profile));

  const todayForms = forms.filter((f) => {
    const created = new Date(f.createdAt);
    const now = new Date();
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate()
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in-up rounded-2xl gradient-teal px-6 py-5 text-white">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          {isLoadingProfile ? (
            <Skeleton className="h-8 w-64 bg-white/20" />
          ) : (
            `Welcome back, ${doctorName}`
          )}
        </h2>
        <p className="text-sm text-white/80 mt-1.5 max-w-lg">
          Complete government forms in under 2 minutes with AI-powered dictation.
        </p>
      </div>

      {/* Profile setup banner — only shown when profile incomplete */}
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
                {isLoadingForms ? (
                  <Skeleton className="h-5 w-6" />
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {todayForms.length}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoadingForms
                  ? 'Loading...'
                  : todayForms.length === 0
                    ? 'No forms completed today.'
                    : `${todayForms.length} form${todayForms.length !== 1 ? 's' : ''} completed today.`}
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

        {isLoadingForms ? (
          <Card>
            <CardContent className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : formsError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="w-8 h-8 text-destructive/60 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Failed to load forms.</p>
              <Button variant="outline" size="sm" onClick={() => { fetchForms(); toast.info('Retrying...'); }}>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : forms.length === 0 ? (
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
                      <p className="text-sm font-medium text-foreground truncate">
                        {form.formName}
                      </p>
                      {form.patientName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {form.patientName}
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
      </div>
    </div>
  );
}
