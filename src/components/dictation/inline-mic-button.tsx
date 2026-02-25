'use client';

import { useRef, useCallback } from 'react';
import { Mic, Square, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeepgramRecorder } from '@/lib/use-deepgram-recorder';

interface InlineMicButtonProps {
  currentValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function InlineMicButton({
  currentValue,
  onValueChange,
  disabled = false,
}: InlineMicButtonProps) {
  const snapshotRef = useRef('');

  const handleTranscriptionUpdate = useCallback(
    (text: string) => {
      const snapshot = snapshotRef.current;
      const separator = snapshot.trim() ? ' ' : '';
      onValueChange(snapshot + separator + text);
    },
    [onValueChange]
  );

  const { state, isStarting, startRecording, stopRecording } =
    useDeepgramRecorder({
      onTranscriptionUpdate: handleTranscriptionUpdate,
      autoReset: true,
    });

  const isRecording = state === 'recording';

  const handleClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      snapshotRef.current = currentValue;
      startRecording();
    }
  }, [isRecording, currentValue, startRecording, stopRecording]);

  return (
    <button
      type="button"
      disabled={disabled || isStarting}
      onClick={handleClick}
      title={isRecording ? 'Stop dictating' : 'AI Dictate'}
      className={cn(
        'relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 self-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed',
        !isRecording &&
          'gradient-teal text-white shadow-[0_2px_8px_oklch(0.47_0.1_175/0.3)] hover:shadow-[0_2px_16px_oklch(0.47_0.1_175/0.45)] hover:scale-105',
        isRecording &&
          'bg-destructive text-white recording-pulse'
      )}
    >
      {isRecording ? (
        <Square className="h-3.5 w-3.5" />
      ) : (
        <>
          <Mic className="h-4 w-4" />
          <Sparkles className="absolute -top-1.5 -right-1.5 h-3 w-3 text-[oklch(0.47_0.1_175)] drop-shadow-[0_0_2px_oklch(0.47_0.1_175/0.5)]" />
        </>
      )}
    </button>
  );
}
