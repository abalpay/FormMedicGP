'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StepIndicator } from '@/components/ui/step-indicator';
import { DictationRecorder } from '@/components/dictation/dictation-recorder';
import { TranscriptionDisplay } from '@/components/dictation/transcription-display';
import { DictationTips } from '@/components/dictation/dictation-tips';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
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
    patientDetails,
    transcription,
    setTranscription,
    setStep,
    setExtractedData,
    setPdfBlobUrl,
  } = useFormFlowStore();

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscriptionUpdate = useCallback(
    (text: string) => {
      setTranscription(text);
    },
    [setTranscription]
  );

  const handleRecordingStateChange = useCallback(
    (state: RecordingState) => {
      setRecordingState(state);
    },
    []
  );

  const handleProcessForm = async () => {
    if (!transcription.trim()) {
      toast.error('Please record or type your clinical notes first.');
      return;
    }

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
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? `Server error (${res.status})`);
      }

      const { extractedData, missingFields, pdfBase64 } = await res.json();

      // Store extracted data (include missingFields for the review page)
      setExtractedData({ ...extractedData, missingFields });

      // Convert base64 PDF to Blob URL
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

  const formLabel =
    selectedFormType === 'SU415'
      ? 'SU415 — Centrelink Medical Certificate'
      : selectedFormType ?? 'No form selected';

  return (
    <div className="max-w-2xl space-y-6">
      <StepIndicator steps={steps} currentStep={2} />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Form:</span>
        <Badge variant="secondary">{formLabel}</Badge>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Transcription area — editable when not actively recording */}
          <TranscriptionDisplay
            text={transcription}
            isRecording={recordingState === 'recording'}
            isEditable={recordingState !== 'recording'}
            onChange={handleTranscriptionUpdate}
          />

          <Separator />

          {/* Recorder */}
          <DictationRecorder
            onTranscriptionUpdate={handleTranscriptionUpdate}
            onRecordingStateChange={handleRecordingStateChange}
          />
        </CardContent>
      </Card>

      {/* Tips */}
      <DictationTips />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/forms/new">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Link>
        </Button>
        <Button
          onClick={handleProcessForm}
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
