'use client';

import { DoctorProfileForm } from '@/components/forms/doctor-profile-form';
import { PatientList } from '@/components/patients/patient-list';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">
          Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Manage your profile and saved patients.
        </p>
      </div>

      <Tabs defaultValue="profile" className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <DoctorProfileForm />
        </TabsContent>

        <TabsContent value="patients" className="mt-6">
          <PatientList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
