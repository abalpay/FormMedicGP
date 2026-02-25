'use client';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TranscriptionDisplayProps {
  text: string;
  isRecording: boolean;
  isEditable: boolean;
  onChange: (text: string) => void;
}

export function TranscriptionDisplay({
  text,
  isRecording,
  isEditable,
  onChange,
}: TranscriptionDisplayProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {isRecording ? 'Live Transcription' : 'Transcription'}
      </label>
      {isEditable ? (
        <Textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          className="resize-none text-sm shadow-inner focus:shadow-[inset_0_2px_4px_oklch(0_0_0/0.04),0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
          placeholder="Your transcription will appear here..."
        />
      ) : (
        <div
          className={cn(
            'rounded-xl border bg-muted/30 p-4 min-h-[200px] shadow-inner transition-all duration-300',
            isRecording && 'border-primary/40 bg-primary/5'
          )}
        >
          {text ? (
            <p className="text-sm text-foreground whitespace-pre-wrap">{text}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {isRecording
                ? 'Listening...'
                : 'Press record to start. Speak naturally about the patient\u2019s condition.'}
            </p>
          )}
          {isRecording && text && (
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      )}
    </div>
  );
}
