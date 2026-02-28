import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

interface RateLimitCheckInput {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export async function checkDistributedRateLimit(
  client: SupabaseClient<Database>,
  input: RateLimitCheckInput
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.ceil(input.windowMs / 1000));
  const { data, error } = await client
    .rpc('check_rate_limit', {
      p_key: input.key,
      p_limit: input.limit,
      p_window_seconds: windowSeconds,
    })
    .single();

  if (error) {
    throw new Error(error.message ?? 'Rate limit RPC failed');
  }
  if (!data) {
    throw new Error('Rate limit RPC returned no data');
  }

  const resetAt = Date.parse(data.reset_at);
  if (!Number.isFinite(resetAt)) {
    throw new Error('Rate limit RPC returned invalid reset_at');
  }

  return {
    allowed: Boolean(data.allowed),
    limit: Number(data.request_limit),
    remaining: Math.max(0, Number(data.remaining)),
    resetAt,
    retryAfterSeconds: Math.max(0, Number(data.retry_after_seconds)),
  };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim();
  if (cloudflareIp) return cloudflareIp;

  return 'unknown';
}

export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
  };
}
