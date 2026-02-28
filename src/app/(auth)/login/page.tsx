'use client';

import { Suspense, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const nextPath = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    router.prefetch(nextPath);
  }, [router, nextPath]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (typeof window === 'undefined') {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    startTransition(() => {
      router.replace(nextPath);
      router.refresh();
    });
  };

  // Show error from callback if present
  const callbackError = searchParams.get('error');
  if (callbackError) {
    toast.error('Authentication failed. Please try again.', {
      id: 'auth-callback-error',
    });
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to continue to FormBridge GP.
        </p>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="doctor@clinic.com.au"
            autoComplete="email"
            className="h-11 input-focus-glow"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-11 input-focus-glow"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="teal" className="w-full h-11 font-semibold"
          disabled={isSubmitting || isNavigating}
        >
          {isSubmitting || isNavigating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-primary hover:underline font-semibold"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
