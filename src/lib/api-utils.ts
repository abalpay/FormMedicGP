import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { DoctorProfile } from '@/types';
import type { Database } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { mapDoctorProfileRow } from '@/lib/backend-mappers';

type DoctorProfileRow = Database['public']['Tables']['doctor_profiles']['Row'];

export interface AuthContext {
  user: User;
  doctorProfile: DoctorProfile | null;
  doctorProfileRow: DoctorProfileRow | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export interface AuthLiteContext {
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export interface DoctorIdContext {
  user: User;
  doctorId: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export type AuthenticatedHandler<TContext = unknown> = (args: {
  request: Request;
  context: TContext;
  auth: AuthContext;
}) => Promise<Response>;

export type AuthLiteHandler<TContext = unknown> = (args: {
  request: Request;
  context: TContext;
  auth: AuthLiteContext;
}) => Promise<Response>;

export type DoctorIdHandler<TContext = unknown> = (args: {
  request: Request;
  context: TContext;
  auth: DoctorIdContext;
}) => Promise<Response>;

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  return { user, supabase };
}

async function getDoctorIdForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { doctorId: null as string | null, error };
  }

  return { doctorId: data?.id ?? null, error: null };
}

export function withAuthUser<TContext = unknown>(
  handler: AuthLiteHandler<TContext>
) {
  return async (request: Request, context: TContext): Promise<Response> => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult) {
        return apiError('Unauthorized', 401);
      }

      return await handler({
        request,
        context,
        auth: authResult,
      });
    } catch (error) {
      console.error('[api-utils] unexpected auth wrapper error', error);
      return apiError('Internal server error', 500);
    }
  };
}

export function withDoctorId<TContext = unknown>(
  handler: DoctorIdHandler<TContext>
) {
  return async (request: Request, context: TContext): Promise<Response> => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult) {
        return apiError('Unauthorized', 401);
      }

      const { user, supabase } = authResult;
      const { doctorId, error } = await getDoctorIdForUser(supabase, user.id);

      if (error) {
        return apiError('Failed to load doctor profile', 500);
      }

      if (!doctorId) {
        return apiError('Doctor profile not found', 404);
      }

      return await handler({
        request,
        context,
        auth: {
          user,
          doctorId,
          supabase,
        },
      });
    } catch (error) {
      console.error('[api-utils] unexpected auth wrapper error', error);
      return apiError('Internal server error', 500);
    }
  };
}

export function withDoctorProfile<TContext = unknown>(
  handler: AuthenticatedHandler<TContext>
) {
  return async (request: Request, context: TContext): Promise<Response> => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult) {
        return apiError('Unauthorized', 401);
      }

      const { user, supabase } = authResult;
      const { data: doctorProfileRow, error: profileError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        return apiError('Failed to load doctor profile', 500);
      }

      const doctorProfile = doctorProfileRow
        ? mapDoctorProfileRow(doctorProfileRow)
        : null;

      return await handler({
        request,
        context,
        auth: {
          user,
          doctorProfile,
          doctorProfileRow,
          supabase,
        },
      });
    } catch (error) {
      console.error('[api-utils] unexpected auth wrapper error', error);
      return apiError('Internal server error', 500);
    }
  };
}

// Backwards-compatible aliases used across existing routes.
export const withAuth = withDoctorProfile;
export const withAuthLite = withAuthUser;
