import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkDistributedRateLimit,
  getClientIp,
  getRateLimitHeaders,
} from '@/lib/rate-limit';
import { z } from 'zod';

const waitlistSchema = z.object({
  email: z.string().email(),
});

const WAITLIST_RATE_LIMIT = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
};

export async function POST(request: Request) {
  const supabase = await createClient();

  let rateLimit;
  try {
    rateLimit = await checkDistributedRateLimit(supabase, {
      key: `waitlist:${getClientIp(request)}`,
      limit: WAITLIST_RATE_LIMIT.limit,
      windowMs: WAITLIST_RATE_LIMIT.windowMs,
    });
  } catch (error) {
    console.error('[waitlist] rate limit error', error);
    return NextResponse.json(
      { error: 'Unable to process request right now. Please try again.' },
      { status: 503 }
    );
  }

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...getRateLimitHeaders(rateLimit),
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const parsed = waitlistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please provide a valid email address' },
      { status: 400, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const { error } = await supabase
    .from('waitlist')
    .insert({ email: parsed.data.email });

  // Return success even if email already exists (unique constraint)
  // to avoid revealing whether an email is already registered
  if (error && error.code !== '23505') {
    console.error('[waitlist] insert error', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  return NextResponse.json(
    { success: true },
    { headers: getRateLimitHeaders(rateLimit) }
  );
}
