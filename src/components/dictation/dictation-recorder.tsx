'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RecordingState = 'idle' | 'recording' | 'stopped';

interface DictationRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
  onRecordingStateChange: (state: RecordingState) => void;
}

export function DictationRecorder({
  onTranscriptionUpdate,
  onRecordingStateChange,
}: DictationRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateState = useCallback(
    (newState: RecordingState) => {
      setState(newState);
      onRecordingStateChange(newState);
    },
    [onRecordingStateChange]
  );

  const startRecording = useCallback(async () => {
    try {
      // Get temporary Deepgram token
      const tokenRes = await fetch('/api/deepgram-token', { method: 'POST' });
      if (!tokenRes.ok) {
        // Fallback: use demo mode with simulated transcription
        console.warn('Deepgram token not available — using demo mode');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      // TODO: Connect to Deepgram WebSocket with temp token
      // wss://api.deepgram.com/v1/listen?model=nova-3-medical
      // For now, just record audio locally

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      mediaRecorder.start(250); // Send chunks every 250ms
      updateState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [updateState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    updateState('stopped');
  }, [updateState]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop();
      }
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={state === 'recording' ? stopRecording : startRecording}
        disabled={state === 'stopped'}
        className={cn(
          'flex items-center justify-center w-16 h-16 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          state === 'idle' &&
            'bg-primary text-primary-foreground hover:bg-primary/90',
          state === 'recording' &&
            'bg-destructive text-white recording-pulse',
          state === 'stopped' &&
            'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        {state === 'recording' ? (
          <Square className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      <div className="text-center">
        {state === 'idle' && (
          <p className="text-sm text-muted-foreground">Tap to record</p>
        )}
        {state === 'recording' && (
          <p className="text-sm font-medium text-destructive">
            Recording: {formatDuration(duration)}
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
            setDuration(0);
            onTranscriptionUpdate('');
            updateState('idle');
          }}
        >
          Record again
        </Button>
      )}
    </div>
  );
}
