import { DoctorProfileForm } from '@/components/forms/doctor-profile-form';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Doctor Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your details will auto-fill on every form you generate.
        </p>
      </div>
      <DoctorProfileForm />
    </div>
  );
}
