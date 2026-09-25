import { getFormCatalog } from '@/lib/forms/registry';
import { getCurrentDoctorProfile } from '@/lib/supabase/auth';
import { NewFormContent } from '@/components/forms/new-form-content';

export default async function NewFormPage() {
  const catalog = getFormCatalog();
  const doctorProfile = await getCurrentDoctorProfile();
  return <NewFormContent catalog={catalog} doctorProfile={doctorProfile} />;
}
