import test from 'node:test';
import assert from 'node:assert/strict';

import { getRecorderErrorMessage } from '../src/lib/recorder-error-message.ts';

test('maps permission errors to a mic-blocked message', () => {
  for (const name of ['NotAllowedError', 'PermissionDeniedError', 'SecurityError']) {
    const message = getRecorderErrorMessage({ name });
    assert.match(message, /microphone access is blocked/i);
  }
});

test('maps missing-device errors to a no-microphone message', () => {
  for (const name of ['NotFoundError', 'OverconstrainedError']) {
    const message = getRecorderErrorMessage({ name });
    assert.match(message, /no microphone was found/i);
  }
});

test('maps Deepgram token failures to a server-unavailable message', () => {
  const message = getRecorderErrorMessage(
    new Error('Deepgram token request failed (500)')
  );
  assert.match(message, /unavailable right now \(server\)/i);

  const missingTokenMessage = getRecorderErrorMessage(
    new Error('Deepgram token response was missing token')
  );
  assert.match(missingTokenMessage, /unavailable right now \(server\)/i);
});

test('falls back to the generic message for anything else', () => {
  assert.equal(
    getRecorderErrorMessage(new Error('boom')),
    'Unable to start live dictation. Please try again.'
  );
  assert.equal(
    getRecorderErrorMessage(undefined),
    'Unable to start live dictation. Please try again.'
  );
});
