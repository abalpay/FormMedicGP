import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyDeepgramTranscriptMessage,
  formatDeepgramDisplayText,
  INITIAL_DEEPGRAM_TRANSCRIPT_STATE,
} from '../src/lib/deepgram-transcript.ts';

test('shows interim transcript while speaking', () => {
  const next = applyDeepgramTranscriptMessage(INITIAL_DEEPGRAM_TRANSCRIPT_STATE, {
    channel: { alternatives: [{ transcript: 'patient has back pain' }] },
    is_final: false,
  });

  assert.equal(next.committed, '');
  assert.equal(next.interim, 'patient has back pain');
  assert.equal(formatDeepgramDisplayText(next), 'patient has back pain');
});

test('commits final transcript and clears interim', () => {
  const withInterim = applyDeepgramTranscriptMessage(
    INITIAL_DEEPGRAM_TRANSCRIPT_STATE,
    {
      channel: { alternatives: [{ transcript: 'patient has back pain' }] },
      is_final: false,
    }
  );

  const withFinal = applyDeepgramTranscriptMessage(withInterim, {
    channel: { alternatives: [{ transcript: 'patient has back pain' }] },
    is_final: true,
  });

  assert.equal(withFinal.committed, 'patient has back pain');
  assert.equal(withFinal.interim, '');
  assert.equal(formatDeepgramDisplayText(withFinal), 'patient has back pain');
});

test('appends subsequent final transcripts with spacing', () => {
  const first = applyDeepgramTranscriptMessage(INITIAL_DEEPGRAM_TRANSCRIPT_STATE, {
    channel: { alternatives: [{ transcript: 'first sentence' }] },
    is_final: true,
  });

  const second = applyDeepgramTranscriptMessage(first, {
    channel: { alternatives: [{ transcript: 'second sentence' }] },
    is_final: true,
  });

  assert.equal(second.committed, 'first sentence second sentence');
  assert.equal(formatDeepgramDisplayText(second), 'first sentence second sentence');
});
