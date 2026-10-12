'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StepIndicator } from '@/components/ui/step-indicator';
import { CoverageFollowUpPanel } from '@/components/dictation/coverage-followup-panel';
import {
  getFollowUpQuestions,
  buildGuidedExtractionPayload,
} from '@/lib/guided-dictation';
import { getFormSchema } from '@/lib/schemas';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
import type { ReviewSchema } from '@/types';
import { toast } from 'sonner';

const steps = [
  { label: 'Select Form' },
  { label: 'Patient Details' },
  { label: 'Describe', icon: Sparkles },
  { label: 'Follow-up' },
  { label: 'Review' },
];

interface FollowUpPageContentProps {
  formCatalog: { id: string; label: string }[];
}

export function FollowUpPageContent({ formCatalog }: FollowUpPageContentProps) {
  const router = useRouter();
  const selectedFormType = useFormFlowStore((s) => s.selectedFormType);
  const selectedFormLabel = useFormFlowStore((s) => s.selectedFormLabel);
  const patientDetails = useFormFlowStore((s) => s.patientDetails);
  const extractedData = useFormFlowStore((s) => s.extractedData);
  const initialExtraction = useFormFlowStore((s) => s.initialExtraction);
  const followUpAnswers = useFormFlowStore((s) => s.followUpAnswers);
  const setFollowUpAnswer = useFormFlowStore((s) => s.setFollowUpAnswer);
  const setExtractedData = useFormFlowStore((s) => s.setExtractedData);
  const setReviewSchema = useFormFlowStore((s) => s.setReviewSchema);
  const setPdfBlobUrl = useFormFlowStore((s) => s.setPdfBlobUrl);
  const setStep = useFormFlowStore((s) => s.setStep);

  const [isProcessing, setIsProcessing] = useState(false);

  const selectedForm = formCatalog.find((form) => form.id === selectedFormType);
  const formLabel = selectedForm
    ? `${selectedForm.id} — ${selectedForm.label}`
    : selectedFormLabel
      ? `${selectedFormType} — ${selectedFormLabel}`
      : selectedFormType ?? 'No form selected';

  const schema = useMemo(
    () => (selectedFormType ? getFormSchema(selectedFormType) : null),
    [selectedFormType]
  );

  // Compute follow-up questions from the initial extraction
  const followUpResult = useMemo(() => {
    if (!schema || !initialExtraction) {
      return {
        sections: [],
        totalFields: 0,
        filledFields: 0,
        visibilityAnswers: {},
      };
    }
    return getFollowUpQuestions(schema, initialExtraction);
  }, [schema, initialExtraction]);

  const hasFollowUps = followUpResult.sections.length > 0;

  const handleExtractedValueEdit = useCallback(
    (fieldKey: string, value: string) => {
      if (!extractedData) return;
      setExtractedData({ ...extractedData, [fieldKey]: value });
    },
    [extractedData, setExtractedData]
  );

  const handleFinalize = async () => {
    if (!selectedFormType || !extractedData || !schema) return;

    setIsProcessing(true);

    try {
      // Build guided overrides from follow-up answers
      const { guidedOverrides } = buildGuidedExtractionPayload({
        transcription: '',
        schema,
        guidedAnswers: followUpAnswers,
      });

      const res = await fetch('/api/process-form/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: selectedFormType,
          extractedData,
          followUpOverrides: guidedOverrides,
          patientDetails,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? `Server error (${res.status})`);
      }

      const {
        extractedData: finalData,
        pdfBase64,
        reviewSchema,
      } = (await res.json()) as {
        extractedData: Record<string, unknown>;
        pdfBase64?: string;
        reviewSchema?: ReviewSchema;
      };

      setExtractedData(finalData);
      setReviewSchema(reviewSchema ?? null);

      if (pdfBase64) {
        const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: 'application/pdf' });
        setPdfBlobUrl(URL.createObjectURL(blob));
      }

      setStep('review');
      router.push('/dashboard/forms/review');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to finalize form';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // If no extraction data, redirect back
  if (!extractedData || !schema) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <StepIndicator steps={steps} currentStep={3} />
        <div className="text-center py-12 text-muted-foreground">
          <p>
            No extraction data available. Please go back and describe the
            patient first.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard/dictate">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Describe
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <StepIndicator steps={steps} currentStep={3} />

      <div className="flex items-center gap-2 animate-fade-in-up">
        <span className="text-sm text-muted-foreground">Form:</span>
        <Badge variant="secondary">{formLabel}</Badge>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <CoverageFollowUpPanel
          schema={schema}
          extractedData={extractedData}
          followUpSections={followUpResult.sections}
          totalFields={followUpResult.totalFields}
          filledFields={followUpResult.filledFields}
          visibilityAnswers={followUpResult.visibilityAnswers}
          followUpAnswers={followUpAnswers}
          onFollowUpAnswerChange={setFollowUpAnswer}
          onExtractedValueEdit={handleExtractedValueEdit}
        />
      </div>

      {/* Sticky pill footer */}
      <div
        className="sticky bottom-4 z-20 mx-auto max-w-xl w-full px-5 py-2.5 rounded-full border bg-background/80 backdrop-blur-md shadow-lg animate-fade-in-up"
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/dictate">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Link>
          </Button>
          <Button onClick={handleFinalize} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                {hasFollowUps ? 'Finalize' : 'Continue to Review'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
