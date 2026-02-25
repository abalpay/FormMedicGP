import { DoctorProfileForm } from '@/components/forms/doctor-profile-form';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">
          Doctor Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Your details will auto-fill on every form you generate.
        </p>
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <DoctorProfileForm />
      </div>
    </div>
  );
}
