/** Maps a startRecording() failure to a specific, actionable message for the toast. */
export function getRecorderErrorMessage(err: unknown): string {
  const name = (err as { name?: string } | null | undefined)?.name;

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return 'Microphone access is blocked. Allow the microphone for this site in your browser and try again.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No microphone was found on this device.';
  }

  const message = err instanceof Error ? err.message : '';
  if (message.startsWith('Deepgram token')) {
    return 'Live transcription is unavailable right now (server). You can type your notes instead.';
  }

  return 'Unable to start live dictation. Please try again.';
}
