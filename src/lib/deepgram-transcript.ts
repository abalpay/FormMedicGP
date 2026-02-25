export interface DeepgramTranscriptState {
  committed: string;
  interim: string;
}

interface DeepgramLikeMessage {
  channel?: {
    alternatives?: Array<{
      transcript?: string;
    }>;
  };
  is_final?: boolean;
}

export const INITIAL_DEEPGRAM_TRANSCRIPT_STATE: DeepgramTranscriptState = {
  committed: '',
  interim: '',
};

function appendSegment(text: string, segment: string): string {
  if (!text) return segment;
  if (!segment) return text;
  return `${text} ${segment}`;
}

function readTranscriptSegment(message: DeepgramLikeMessage): string {
  const raw = message?.channel?.alternatives?.[0]?.transcript;
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

export function applyDeepgramTranscriptMessage(
  state: DeepgramTranscriptState,
  message: DeepgramLikeMessage
): DeepgramTranscriptState {
  const segment = readTranscriptSegment(message);
  if (!segment) return state;

  if (message.is_final) {
    return {
      committed: appendSegment(state.committed, segment),
      interim: '',
    };
  }

  return {
    committed: state.committed,
    interim: segment,
  };
}

export function formatDeepgramDisplayText(
  state: DeepgramTranscriptState
): string {
  return appendSegment(state.committed, state.interim);
}
