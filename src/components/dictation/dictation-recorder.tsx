'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createDeepgramLiveSocketConfig,
  getDeepgramStopMessages,
} from '@/lib/deepgram-live-config';
import {
  applyDeepgramTranscriptMessage,
  formatDeepgramDisplayText,
  INITIAL_DEEPGRAM_TRANSCRIPT_STATE,
  type DeepgramTranscriptState,
} from '@/lib/deepgram-transcript';

type RecordingState = 'idle' | 'recording' | 'stopped';

interface DictationRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
  onRecordingStateChange: (state: RecordingState) => void;
}

const FORCE_SOCKET_CLOSE_TIMEOUT_MS = 2000;

export function DictationRecorder({
  onTranscriptionUpdate,
  onRecordingStateChange,
}: DictationRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const queuedChunksRef = useRef<Blob[]>([]);
  const transcriptStateRef = useRef<DeepgramTranscriptState>(
    INITIAL_DEEPGRAM_TRANSCRIPT_STATE
  );

  const updateState = useCallback(
    (newState: RecordingState) => {
      setState(newState);
      onRecordingStateChange(newState);
    },
    [onRecordingStateChange]
  );

  const clearSocketCloseTimeout = useCallback(() => {
    if (socketCloseTimeoutRef.current) {
      clearTimeout(socketCloseTimeoutRef.current);
      socketCloseTimeoutRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    let stream: MediaStream | null = null;
    try {
      // Get temporary Deepgram token
      const tokenRes = await fetch('/api/deepgram-token', { method: 'POST' });
      if (!tokenRes.ok) {
        const errText = await tokenRes.text().catch(() => '');
        throw new Error(
          `Deepgram token request failed (${tokenRes.status}) ${errText}`.trim()
        );
      }

      const tokenData = await tokenRes.json();
      const token = tokenData?.token as string | undefined;
      if (!token) {
        throw new Error('Deepgram token response was missing token');
      }

      queuedChunksRef.current = [];
      transcriptStateRef.current = INITIAL_DEEPGRAM_TRANSCRIPT_STATE;

      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const preferredMimeType = 'audio/webm;codecs=opus';
      const mediaRecorder = MediaRecorder.isTypeSupported(preferredMimeType)
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const { url, protocols } = createDeepgramLiveSocketConfig(token);
      const socket = new WebSocket(url, protocols);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('Deepgram WebSocket connected');
        const queuedChunks = queuedChunksRef.current;
        queuedChunksRef.current = [];
        for (const chunk of queuedChunks) {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(chunk);
          }
        }
      };

      socket.onmessage = (event) => {
        if (typeof event.data !== 'string') return;

        try {
          const msg = JSON.parse(event.data) as {
            type?: string;
            channel?: {
              alternatives?: Array<{
                transcript?: string;
              }>;
            };
            is_final?: boolean;
          };

          if (msg.type === 'Error') {
            console.error('Deepgram message error:', msg);
            return;
          }

          const nextState = applyDeepgramTranscriptMessage(
            transcriptStateRef.current,
            msg
          );
          if (nextState !== transcriptStateRef.current) {
            transcriptStateRef.current = nextState;
            onTranscriptionUpdate(formatDeepgramDisplayText(nextState));
          }
        } catch {
          // Ignore non-JSON messages.
        }
      };

      socket.onerror = (err) => {
        console.error('Deepgram WebSocket error:', err);
      };

      socket.onclose = (event) => {
        clearSocketCloseTimeout();
        console.log('Deepgram WebSocket closed:', event.code, event.reason);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size <= 0) return;

        const currentSocket = socketRef.current;
        if (!currentSocket) return;

        if (currentSocket.readyState === WebSocket.OPEN) {
          currentSocket.send(event.data);
          return;
        }

        if (currentSocket.readyState === WebSocket.CONNECTING) {
          queuedChunksRef.current.push(event.data);
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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
      mediaRecorderRef.current = null;
      toast.error('Unable to start live dictation. Please try again.');
    }
  }, [updateState, onTranscriptionUpdate, clearSocketCloseTimeout]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      const [finalizeMessage, closeStreamMessage] = getDeepgramStopMessages();
      try {
        socket.send(finalizeMessage);
        socket.send(closeStreamMessage);
      } catch (err) {
        console.error('Failed to finalize Deepgram stream:', err);
        socket.close();
      }

      clearSocketCloseTimeout();
      socketCloseTimeoutRef.current = setTimeout(() => {
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      }, FORCE_SOCKET_CLOSE_TIMEOUT_MS);
    } else if (socket?.readyState === WebSocket.CONNECTING) {
      socket.close();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    updateState('stopped');
  }, [updateState, clearSocketCloseTimeout]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearSocketCloseTimeout();
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop();
      }
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      if (
        socketRef.current?.readyState === WebSocket.OPEN ||
        socketRef.current?.readyState === WebSocket.CONNECTING
      ) {
        socketRef.current.close();
      }
    };
  }, [clearSocketCloseTimeout]);

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
            queuedChunksRef.current = [];
            transcriptStateRef.current = INITIAL_DEEPGRAM_TRANSCRIPT_STATE;
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
