'use client';

import { useEffect } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDeepgramRecorder, type RecordingState } from '@/lib/use-deepgram-recorder';

interface DictationRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
  onRecordingStateChange: (state: RecordingState) => void;
}

export type { RecordingState };

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function DictationRecorder({
  onTranscriptionUpdate,
  onRecordingStateChange,
}: DictationRecorderProps) {
  const { state, isStarting, duration, startRecording, stopRecording, reset } =
    useDeepgramRecorder({ onTranscriptionUpdate });

  useEffect(() => {
    onRecordingStateChange(state);
  }, [state, onRecordingStateChange]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Outer ring for idle state */}
      <div
        className={cn(
          'rounded-full p-1.5 transition-all duration-300',
          state === 'idle' && 'ring-2 ring-primary/20',
          state === 'recording' && 'ring-0'
        )}
      >
        <button
          type="button"
          onClick={state === 'recording' ? stopRecording : startRecording}
          disabled={state === 'stopped' || isStarting}
          className={cn(
            'flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            state === 'idle' &&
              'gradient-teal text-white hover:shadow-[0_0_32px_oklch(0.47_0.1_175/0.3)]',
            state === 'recording' &&
              'bg-destructive text-white recording-pulse-rings',
            state === 'stopped' &&
              'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {state === 'recording' ? (
            <Square className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>

      <div className="text-center">
        {state === 'idle' && (
          <p className="text-sm text-muted-foreground">Tap to record</p>
        )}
        {state === 'recording' && (
          <p className="text-lg font-semibold text-destructive font-[family-name:var(--font-display)] tabular-nums">
            {formatDuration(duration)}
          </p>
        )}
        {state === 'stopped' && (
          <p className="text-sm text-muted-foreground">
            Recorded {formatDuration(duration)}
          </p>
        )}
      </div>

      {state === 'stopped' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            reset();
            onTranscriptionUpdate('');
          }}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Record again
        </Button>
      )}
    </div>
  );
}
