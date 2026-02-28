'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { StepIndicator } from '@/components/ui/step-indicator';
import { FormSelector } from '@/components/forms/form-selector';
import { PatientDetailsForm } from '@/components/forms/patient-details-form';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
import { formDetailsToPatientBody } from '@/lib/patient-mappers';
import { Badge } from '@/components/ui/badge';
import type { FormCatalogItem, PatientDetails } from '@/types';
import { toast } from 'sonner';

import { Sparkles } from 'lucide-react';

const steps = [
  { label: 'Select Form' },
  { label: 'Patient Details' },
  { label: 'Describe', icon: Sparkles },
  { label: 'Review' },
];

interface NewFormContentProps {
  catalog: FormCatalogItem[];
}

export function NewFormContent({ catalog }: NewFormContentProps) {
  const router = useRouter();
  const { selectedFormType, selectedFormLabel, patientDetails, currentStep: storeStep, setFormType, setPatientDetails, setStep } =
    useFormFlowStore();
  const [currentStep, setCurrentStep] = useState(() => {
    if (storeStep === 'patient-details' || storeStep === 'dictate') return 1;
    return 0;
  });
  const [selectedFormId, setSelectedFormId] = useState<string | null>(selectedFormType);
  const [savePatient, setSavePatient] = useState(false);

  const handleFormSelect = (formId: string, label: string) => {
    setSelectedFormId(formId);
    setFormType(formId, label);
    setCurrentStep(1);
  };

  const handlePatientDetailsSubmit = async (data: PatientDetails) => {
    if (savePatient) {
      try {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formDetailsToPatientBody(data)),
        });
        if (res.ok) toast.success('Patient saved');
        else toast.error('Failed to save patient');
      } catch {
        toast.error('Failed to save patient');
      }
    }
    setPatientDetails(data);
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
        <div className="animate-fade-in-up">
          <FormSelector
            selectedFormId={selectedFormId}
            onSelect={handleFormSelect}
            forms={catalog}
          />
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
