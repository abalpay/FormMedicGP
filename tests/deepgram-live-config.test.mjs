import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createDeepgramLiveSocketConfig,
  getDeepgramKeepAliveMessage,
  getDeepgramStopMessages,
} from '../src/lib/deepgram-live-config.ts';

test('uses bearer websocket subprotocol for access tokens', () => {
  const token = 'temporary_access_token';
  const config = createDeepgramLiveSocketConfig(token);

  assert.deepEqual(config.protocols, ['bearer', token]);
});

test('uses expected live transcription query parameters', () => {
  const config = createDeepgramLiveSocketConfig('token');
  const url = new URL(config.url);

  assert.equal(url.origin, 'wss://api.deepgram.com');
  assert.equal(url.pathname, '/v1/listen');
  assert.equal(url.searchParams.get('model'), 'nova-3-medical');
  assert.equal(url.searchParams.get('language'), 'en-AU');
  assert.equal(url.searchParams.get('punctuate'), 'true');
  assert.equal(url.searchParams.get('smart_format'), 'true');
  assert.equal(url.searchParams.get('interim_results'), 'true');
  assert.equal(url.searchParams.get('utterance_end_ms'), '1000');
});

test('returns valid KeepAlive message', () => {
  const msg = getDeepgramKeepAliveMessage();
  assert.deepEqual(JSON.parse(msg), { type: 'KeepAlive' });
});

test('sends finalize then close-stream messages on stop', () => {
  const messages = getDeepgramStopMessages();
  assert.deepEqual(messages, [
    JSON.stringify({ type: 'Finalize' }),
    JSON.stringify({ type: 'CloseStream' }),
  ]);
});
