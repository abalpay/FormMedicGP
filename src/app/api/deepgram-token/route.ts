import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-utils';
import { generateDeepgramToken } from '@/lib/deepgram';
import {
  checkDistributedRateLimit,
  getClientIp,
  getRateLimitHeaders,
} from '@/lib/rate-limit';

const DEEPGRAM_TOKEN_RATE_LIMIT = {
  limit: 30,
  windowMs: 10 * 60 * 1000,
};

export const POST = withAuth(async ({ request, auth }) => {
  const ip = getClientIp(request);
  const key =
    ip === 'unknown'
      ? `deepgram-token:${auth.user.id}`
      : `deepgram-token:${auth.user.id}:${ip}`;
  let rateLimit;
  try {
    rateLimit = await checkDistributedRateLimit(auth.supabase, {
      key,
      limit: DEEPGRAM_TOKEN_RATE_LIMIT.limit,
      windowMs: DEEPGRAM_TOKEN_RATE_LIMIT.windowMs,
    });
  } catch (error) {
    console.error('[deepgram-token] rate limit error', error);
    return NextResponse.json(
      { error: 'Unable to process token request right now. Please try again.' },
      { status: 503 }
    );
  }

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many token requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          ...getRateLimitHeaders(rateLimit),
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const token = await generateDeepgramToken();
    return NextResponse.json({ token }, { headers: getRateLimitHeaders(rateLimit) });
  } catch (err) {
    console.error('[deepgram-token] Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate Deepgram token' },
      { status: 500, headers: getRateLimitHeaders(rateLimit) }
    );
  }
});
