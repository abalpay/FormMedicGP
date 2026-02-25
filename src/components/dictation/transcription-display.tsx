'use client';

import { Textarea } from '@/components/ui/textarea';

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
          className="resize-none text-sm"
          placeholder="Your transcription will appear here..."
        />
      ) : (
        <div className="rounded-md border border-border bg-muted/30 p-4 min-h-[200px]">
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
