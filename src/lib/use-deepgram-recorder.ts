'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  createDeepgramLiveSocketConfig,
  getDeepgramKeepAliveMessage,
  getDeepgramStopMessages,
} from '@/lib/deepgram-live-config';
import {
  applyDeepgramTranscriptMessage,
  formatDeepgramDisplayText,
  INITIAL_DEEPGRAM_TRANSCRIPT_STATE,
  type DeepgramTranscriptState,
} from '@/lib/deepgram-transcript';

export type RecordingState = 'idle' | 'recording' | 'stopped';

export interface UseDeepgramRecorderOptions {
  onTranscriptionUpdate: (text: string) => void;
  /** When true, resets to idle after stopping (useful for inline mic). */
  autoReset?: boolean;
}

const FORCE_SOCKET_CLOSE_TIMEOUT_MS = 2000;
const KEEPALIVE_INTERVAL_MS = 8000;

export function useDeepgramRecorder({
  onTranscriptionUpdate,
  autoReset = false,
}: UseDeepgramRecorderOptions) {
  const [state, setState] = useState<RecordingState>('idle');
  const [isStarting, setIsStarting] = useState(false);
  const [duration, setDuration] = useState(0);

  const isStartingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queuedChunksRef = useRef<Blob[]>([]);
  const transcriptStateRef = useRef<DeepgramTranscriptState>(
    INITIAL_DEEPGRAM_TRANSCRIPT_STATE
  );
  const stateRef = useRef<RecordingState>(state);
  const onTranscriptionUpdateRef = useRef(onTranscriptionUpdate);

  useEffect(() => {
    onTranscriptionUpdateRef.current = onTranscriptionUpdate;
  }, [onTranscriptionUpdate]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const clearSocketCloseTimeout = useCallback(() => {
    if (socketCloseTimeoutRef.current) {
      clearTimeout(socketCloseTimeoutRef.current);
      socketCloseTimeoutRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isStartingRef.current || stateRef.current !== 'idle') return;
    isStartingRef.current = true;
    setIsStarting(true);

    let stream: MediaStream | null = null;
    try {
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

        clearKeepAlive();
        keepAliveRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(getDeepgramKeepAliveMessage());
          }
        }, KEEPALIVE_INTERVAL_MS);
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
            onTranscriptionUpdateRef.current(formatDeepgramDisplayText(nextState));
          }
        } catch {
          // Ignore non-JSON messages.
        }
      };

      socket.onerror = (err) => {
        console.error('Deepgram WebSocket error:', err);
        toast.error('Live transcription error — you can type your notes manually.');
      };

      socket.onclose = (event) => {
        clearKeepAlive();
        clearSocketCloseTimeout();
        console.log('Deepgram WebSocket closed:', event.code, event.reason);
        if (event.code !== 1000 && stateRef.current === 'recording') {
          toast.error('Live transcription disconnected — you can type your notes manually.');
        }
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

      mediaRecorder.start(250);
      setState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      isStartingRef.current = false;
      setIsStarting(false);
    } catch (err) {
      console.error('Failed to start recording:', err);
      clearKeepAlive();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
      mediaRecorderRef.current = null;
      isStartingRef.current = false;
      setIsStarting(false);
      toast.error('Unable to start live dictation. Please try again.');
    }
  }, [clearSocketCloseTimeout, clearKeepAlive]);

  const stopRecording = useCallback(() => {
    clearKeepAlive();

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

    if (autoReset) {
      setState('idle');
    } else {
      setState('stopped');
    }
  }, [clearSocketCloseTimeout, clearKeepAlive, autoReset]);

  const reset = useCallback(() => {
    setDuration(0);
    queuedChunksRef.current = [];
    transcriptStateRef.current = INITIAL_DEEPGRAM_TRANSCRIPT_STATE;
    setState('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearKeepAlive();
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
  }, [clearKeepAlive, clearSocketCloseTimeout]);

  return { state, isStarting, duration, startRecording, stopRecording, reset };
}
