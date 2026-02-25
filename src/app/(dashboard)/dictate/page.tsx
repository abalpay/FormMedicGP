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
      // TODO: Call /api/process-form with transcription + patient details
      // For now, simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock result — will be replaced with real API call
      setExtractedData({
        diagnosis: 'Demo — backend not yet connected',
      });

      setStep('review');
      router.push('/forms/demo-review');
    } catch {
      toast.error('Failed to process form. Please try again.');
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
          {/* Transcription area */}
          <TranscriptionDisplay
            text={transcription}
            isRecording={recordingState === 'recording'}
            isEditable={recordingState === 'stopped'}
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
