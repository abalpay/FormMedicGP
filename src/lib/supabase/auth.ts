import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import type { DoctorProfile, SavedFormSummary } from '@/types';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { mapDoctorProfileRow, mapDashboardFormRow, mapSavedFormSummaryRow, type DashboardFormRow, type SavedFormSummaryRow } from '@/lib/backend-mappers';
import type { Database } from '@/types/database';

type DoctorProfileRow = Database['public']['Tables']['doctor_profiles']['Row'];

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
});

export const getCurrentDoctorProfile = cache(async (): Promise<DoctorProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapDoctorProfileRow(data);
});

export async function getSavedFormSummaries(doctorId: string): Promise<SavedFormSummary[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('saved_forms')
    .select('id, form_type, form_name, status, created_at, updated_at, patients(customer_name)')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as SavedFormSummaryRow[]).map(mapSavedFormSummaryRow);
}

export const getDashboardData = cache(async () => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc('get_dashboard_data');

  if (error || !data) {
    return {
      profile: null,
      recentForms: [] as SavedFormSummary[],
      todayFormsCount: 0,
    };
  }

  const raw = data as {
    profile: DoctorProfileRow | null;
    recent_forms: DashboardFormRow[] | null;
    today_forms_count: number | null;
  };

  return {
    profile: raw.profile ? mapDoctorProfileRow(raw.profile) : null,
    recentForms: (raw.recent_forms ?? []).map(mapDashboardFormRow),
    todayFormsCount: raw.today_forms_count ?? 0,
  };
});

export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
