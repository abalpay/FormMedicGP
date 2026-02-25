'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { StepIndicator } from '@/components/ui/step-indicator';
import { DictationRecorder } from '@/components/dictation/dictation-recorder';
import { TranscriptionDisplay } from '@/components/dictation/transcription-display';
import { DictationTips } from '@/components/dictation/dictation-tips';
import { GuidedDictationPanel } from '@/components/dictation/guided-dictation-panel';
import {
  getMissingRequiredGuidedQuestionKeys,
  shouldShowGuidedSoftGate,
} from '@/lib/guided-dictation';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
import type { FormCatalogItem, ReviewSchema } from '@/types';
import { toast } from 'sonner';

const steps = [
  { label: 'Select Form' },
  { label: 'Patient Details' },
  { label: 'Dictate' },
  { label: 'Review' },
];

type RecordingState = 'idle' | 'recording' | 'stopped';

export default function DictatePage() {
  const router = useRouter();
  const {
    selectedFormType,
    selectedFormLabel,
    patientDetails,
    transcription,
    guidedAnswers,
    setTranscription,
    setGuidedAnswer,
    setGuidedAnswers,
    setStep,
    setExtractedData,
    setMissingFields,
    setReviewSchema,
    setPdfBlobUrl,
  } = useFormFlowStore();

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formCatalog, setFormCatalog] = useState<FormCatalogItem[]>([]);
  const [showGuidedWarning, setShowGuidedWarning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      try {
        const res = await fetch('/api/forms', { cache: 'no-store' });
        if (!res.ok) return;
        const body = (await res.json()) as { forms?: FormCatalogItem[] };
        if (!cancelled) {
          setFormCatalog(body.forms ?? []);
        }
      } catch {
        // Non-blocking fetch for display tips.
      }
    }
    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTranscriptionUpdate = useCallback(
    (text: string) => {
      setTranscription(text);
    },
    [setTranscription]
  );

  const handleRecordingStateChange = useCallback((state: RecordingState) => {
    setRecordingState(state);
  }, []);

  const selectedForm = formCatalog.find((form) => form.id === selectedFormType);
  const formLabel = selectedForm
    ? `${selectedForm.id} — ${selectedForm.label}`
    : selectedFormLabel
      ? `${selectedFormType} — ${selectedFormLabel}`
      : selectedFormType ?? 'No form selected';
  const activeTips = selectedForm?.dictationTips;

  const isCapacityGuided = selectedFormType === 'CAPACITY';
  const activeGuide = useMemo(
    () => (isCapacityGuided ? selectedForm?.dictationGuide ?? [] : []),
    [isCapacityGuided, selectedForm?.dictationGuide]
  );

  const missingRequiredGuideKeys = useMemo(
    () => getMissingRequiredGuidedQuestionKeys(activeGuide, guidedAnswers),
    [activeGuide, guidedAnswers]
  );

  const missingGuideLabels = useMemo(() => {
    const labelByKey = new Map(
      activeGuide
        .flatMap((section) => section.questions)
        .map((question) => [question.key, question.label])
    );

    return missingRequiredGuideKeys.map((key) => labelByKey.get(key) ?? key);
  }, [activeGuide, missingRequiredGuideKeys]);

  useEffect(() => {
    if (!isCapacityGuided && Object.keys(guidedAnswers).length > 0) {
      setGuidedAnswers({});
    }
  }, [guidedAnswers, isCapacityGuided, setGuidedAnswers]);

  useEffect(() => {
    if (showGuidedWarning && missingRequiredGuideKeys.length === 0) {
      setShowGuidedWarning(false);
    }
  }, [missingRequiredGuideKeys.length, showGuidedWarning]);

  const handleProcessForm = async (forceContinue = false) => {
    if (!transcription.trim()) {
      toast.error('Please record or type your clinical notes first.');
      return;
    }

    if (
      isCapacityGuided &&
      !forceContinue &&
      shouldShowGuidedSoftGate(activeGuide, guidedAnswers)
    ) {
      setShowGuidedWarning(true);
      return;
    }

    setShowGuidedWarning(false);
    setIsProcessing(true);
    setStep('processing');

    try {
      const res = await fetch('/api/process-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription,
          patientDetails,
          formType: selectedFormType,
          guidedAnswers: isCapacityGuided ? guidedAnswers : undefined,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? `Server error (${res.status})`);
      }

      const { extractedData, missingFields, pdfBase64, reviewSchema } =
        (await res.json()) as {
          extractedData: Record<string, unknown>;
          missingFields: string[];
          pdfBase64?: string;
          reviewSchema?: ReviewSchema;
        };

      setExtractedData(extractedData);
      setMissingFields(missingFields ?? []);
      setReviewSchema(reviewSchema ?? null);

      if (pdfBase64) {
        const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: 'application/pdf' });
        setPdfBlobUrl(URL.createObjectURL(blob));
      }

      setStep('review');
      router.push('/forms/review');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to process form';
      toast.error(message);
      setStep('dictate');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <StepIndicator steps={steps} currentStep={2} />

      <div className="flex items-center gap-2 animate-fade-in-up">
        <span className="text-sm text-muted-foreground">Form:</span>
        <Badge variant="secondary">{formLabel}</Badge>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <DictationTips tips={activeTips} formName={selectedForm?.id} />
      </div>

      {isCapacityGuided && activeGuide.length > 0 ? (
        <div className="animate-fade-in-up" style={{ animationDelay: '75ms' }}>
          <GuidedDictationPanel
            sections={activeGuide}
            answers={guidedAnswers}
            missingRequiredKeys={showGuidedWarning ? missingRequiredGuideKeys : []}
            onAnswerChange={setGuidedAnswer}
          />
        </div>
      ) : null}

      {showGuidedWarning ? (
        <Card className="border-warning/30 bg-warning/5 animate-fade-in-up" style={{ animationDelay: '90ms' }}>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-foreground flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-warning" />
              Guided prompts can improve autofill quality for this CAPACITY form.
            </p>
            <p className="text-xs text-muted-foreground">
              Missing high-value prompts:
            </p>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
              {missingGuideLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document
                    .getElementById('guided-dictation-panel')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                Fill Missing Prompts
              </Button>
              <Button type="button" size="sm" onClick={() => handleProcessForm(true)}>
                Continue Anyway
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="shadow-sm animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <CardContent className="p-6 space-y-6">
          <TranscriptionDisplay
            text={transcription}
            isRecording={recordingState === 'recording'}
            isEditable={recordingState !== 'recording'}
            onChange={handleTranscriptionUpdate}
          />

          <DictationRecorder
            onTranscriptionUpdate={handleTranscriptionUpdate}
            onRecordingStateChange={handleRecordingStateChange}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <Button variant="ghost" asChild>
          <Link href="/forms/new">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Link>
        </Button>
        <Button
          onClick={() => handleProcessForm(false)}
          disabled={
            !transcription.trim() || recordingState === 'recording' || isProcessing
          }
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Process Form
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
