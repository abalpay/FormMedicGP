import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkDistributedRateLimit,
  getClientIp,
} from '../src/lib/rate-limit.ts';

test('distributed limiter calls check_rate_limit RPC with expected payload', async () => {
  const calls = [];
  const mockClient = {
    rpc(fn, args) {
      calls.push({ fn, args });
      return {
        single: async () => ({
          data: {
            allowed: true,
            request_limit: 5,
            remaining: 4,
            reset_at: '2026-01-01T00:00:30.000Z',
            retry_after_seconds: 0,
          },
          error: null,
        }),
      };
    },
  };

  const result = await checkDistributedRateLimit(mockClient, {
    key: 'waitlist:203.0.113.10',
    limit: 5,
    windowMs: 30_000,
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].fn, 'check_rate_limit');
  assert.deepEqual(calls[0].args, {
    p_key: 'waitlist:203.0.113.10',
    p_limit: 5,
    p_window_seconds: 30,
  });
  assert.equal(result.allowed, true);
  assert.equal(result.limit, 5);
  assert.equal(result.remaining, 4);
  assert.equal(result.retryAfterSeconds, 0);
  assert.equal(result.resetAt, Date.parse('2026-01-01T00:00:30.000Z'));
});

test('distributed limiter throws when RPC returns an error', async () => {
  const mockClient = {
    rpc() {
      return {
        single: async () => ({
          data: null,
          error: { message: 'db error' },
        }),
      };
    },
  };

  await assert.rejects(
    () =>
      checkDistributedRateLimit(mockClient, {
        key: 'deepgram:user-1:203.0.113.10',
        limit: 30,
        windowMs: 600_000,
      }),
    /db error/
  );
});

test('getClientIp uses first x-forwarded-for value and falls back safely', () => {
  const requestWithForwarded = new Request('https://example.com', {
    headers: {
      'x-forwarded-for': '203.0.113.10, 10.0.0.2',
    },
  });
  assert.equal(getClientIp(requestWithForwarded), '203.0.113.10');

  const requestWithRealIp = new Request('https://example.com', {
    headers: {
      'x-real-ip': '198.51.100.8',
    },
  });
  assert.equal(getClientIp(requestWithRealIp), '198.51.100.8');

  const requestWithoutIp = new Request('https://example.com');
  assert.equal(getClientIp(requestWithoutIp), 'unknown');
});
