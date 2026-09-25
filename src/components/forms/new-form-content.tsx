'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { StepIndicator } from '@/components/ui/step-indicator';
import { FormSelector } from '@/components/forms/form-selector';
import { PatientDetailsForm } from '@/components/forms/patient-details-form';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
import { formDetailsToPatientBody } from '@/lib/patient-mappers';
import { Badge } from '@/components/ui/badge';
import { getFormSchema } from '@/lib/schemas';
import {
  formatDoctorProfileFieldLabel,
  getMissingDoctorProfileFields,
} from '@/lib/doctor-profile-requirements';
import type { DoctorProfile, FormCatalogItem, Patient, PatientDetails } from '@/types';
import { toast } from 'sonner';

import { AlertCircle, Sparkles } from 'lucide-react';

const steps = [
  { label: 'Select Form' },
  { label: 'Patient Details' },
  { label: 'Describe', icon: Sparkles },
  { label: 'Review' },
];

interface NewFormContentProps {
  catalog: FormCatalogItem[];
  doctorProfile: DoctorProfile | null;
}

export function NewFormContent({ catalog, doctorProfile }: NewFormContentProps) {
  const router = useRouter();
  const { selectedFormType, selectedFormLabel, patientDetails, patientId, currentStep: storeStep, setFormType, setPatientDetails, setStep } =
    useFormFlowStore();
  const [currentStep, setCurrentStep] = useState(() => {
    if (storeStep === 'patient-details' || storeStep === 'dictate') return 1;
    return 0;
  });
  const [selectedFormId, setSelectedFormId] = useState<string | null>(selectedFormType);
  const [savePatient, setSavePatient] = useState(false);
  const [missingProfileFields, setMissingProfileFields] = useState<
    ReturnType<typeof getMissingDoctorProfileFields>
  >([]);

  const handleFormSelect = (formId: string, label: string) => {
    setSelectedFormId(formId);

    const schema = getFormSchema(formId);
    const missing = schema ? getMissingDoctorProfileFields(schema, doctorProfile) : [];
    if (missing.length > 0) {
      setMissingProfileFields(missing);
      return;
    }

    setMissingProfileFields([]);
    setFormType(formId, label);
    setCurrentStep(1);
  };

  const handlePatientDetailsSubmit = async (
    data: PatientDetails,
    selectedPatientId: string | null
  ) => {
    let linkedPatientId = selectedPatientId;
    // A picked patient is already saved — never POST a duplicate.
    if (savePatient && !linkedPatientId) {
      try {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formDetailsToPatientBody(data)),
        });
        if (res.ok) {
          const { patient } = (await res.json()) as { patient: Patient };
          linkedPatientId = patient.id;
          toast.success('Patient saved');
        } else toast.error('Failed to save patient');
      } catch {
        toast.error('Failed to save patient');
      }
    }
    setPatientDetails(data, linkedPatientId);
    setStep('dictate');
    router.push('/dashboard/dictate');
  };

  const handleBackToFormSelection = () => {
    setCurrentStep(0);
  };

  return (
    <div className={currentStep === 0 ? 'max-w-4xl mx-auto space-y-6' : 'max-w-2xl mx-auto space-y-6'}>
      <StepIndicator steps={steps} currentStep={currentStep} />

      {currentStep === 0 && (
        <div className="animate-fade-in-up space-y-4">
          <FormSelector
            selectedFormId={selectedFormId}
            onSelect={handleFormSelect}
            forms={catalog}
          />
          {missingProfileFields.length > 0 && (
            <div className="flex gap-2.5 p-3 rounded-lg border border-warning/30 bg-warning/5" role="status">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
              <div className="min-w-0 text-sm">
                <p className="font-medium text-foreground">
                  Complete your profile before using this form
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Missing: {missingProfileFields.map(formatDoctorProfileFieldLabel).join(', ')}.{' '}
                  <Link href="/dashboard/settings" className="underline underline-offset-2 hover:text-foreground">
                    Update in Settings
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Form:</span>
          <Badge variant="secondary">{selectedFormLabel ?? selectedFormType}</Badge>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="animate-fade-in-up">
              <PatientDetailsForm
                formType={selectedFormType}
                initialValues={patientDetails}
                initialPatientId={patientId}
                onSubmit={handlePatientDetailsSubmit}
                onBack={handleBackToFormSelection}
                showSaveOption
                onSavePatientChange={setSavePatient}
              />
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
