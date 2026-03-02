import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboardPath =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';

  if (!user && isDashboardPath) {
    const redirectUrl = new URL('/login', request.url);
    if (pathname !== '/dashboard') {
      redirectUrl.searchParams.set('next', pathname);
    }
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (!user && pathname === '/set-password') {
    const redirectResponse = NextResponse.redirect(
      new URL('/login', request.url)
    );
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (user && isAuthPage) {
    const redirectResponse = NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/set-password',
  ],
};
