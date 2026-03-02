import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

function getSafeRedirectPath(next: string | null): string {
  if (next && next.startsWith('/')) {
    return next;
  }
  return '/dashboard';
}

function buildLoginErrorUrl(origin: string, reason: string): URL {
  const url = new URL('/login', origin);
  url.searchParams.set('error', reason);
  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const redirectPath = getSafeRedirectPath(requestUrl.searchParams.get('next'));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        buildLoginErrorUrl(requestUrl.origin, 'oauth_callback_failed')
      );
    }
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    if (error) {
      return NextResponse.redirect(
        buildLoginErrorUrl(requestUrl.origin, 'email_verification_failed')
      );
    }

    if (type === 'invite') {
      return NextResponse.redirect(new URL('/set-password', requestUrl.origin));
    }

    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  }

  return NextResponse.redirect(buildLoginErrorUrl(requestUrl.origin, 'missing_code'));
}

