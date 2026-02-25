'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/ui/step-indicator';
import { FormSelector } from '@/components/forms/form-selector';
import { PatientDetailsForm } from '@/components/forms/patient-details-form';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
import type { PatientDetails } from '@/types';
import { ArrowRight } from 'lucide-react';

const steps = [
  { label: 'Select Form' },
  { label: 'Patient Details' },
  { label: 'Dictate' },
  { label: 'Review' },
];

export default function NewFormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const { selectedFormType, patientDetails, setFormType, setPatientDetails, setStep } =
    useFormFlowStore();

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
  };

  const handleContinueToPatientDetails = () => {
    if (selectedFormId) {
      setFormType(selectedFormId);
      setCurrentStep(1);
    }
  };

  const handlePatientDetailsSubmit = (data: PatientDetails) => {
    setPatientDetails(data);
    setStep('dictate');
    router.push('/dictate');
  };

  const handleBackToFormSelection = () => {
    setCurrentStep(0);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <FormSelector
                selectedFormId={selectedFormId}
                onSelect={handleFormSelect}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleContinueToPatientDetails}
                  disabled={!selectedFormId}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <PatientDetailsForm
              formType={selectedFormType}
              initialValues={patientDetails}
              onSubmit={handlePatientDetailsSubmit}
              onBack={handleBackToFormSelection}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
