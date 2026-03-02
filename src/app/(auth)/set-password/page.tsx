'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const setPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

export default function SetPasswordPage() {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  useEffect(() => {
    if (!isRedirecting) return;

    const timeoutId = window.setTimeout(() => {
      window.location.assign('/dashboard');
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isRedirecting]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data: SetPasswordFormData) => {
    if (typeof window === 'undefined') {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Password set successfully');
    setIsRedirecting(true);
    router.prefetch('/dashboard');

    startTransition(() => {
      router.replace('/dashboard');
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
          Set your password
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a secure password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[13px] font-medium">
            New password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11 input-focus-glow"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[13px] font-medium">
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="h-11 input-focus-glow"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="teal"
          className="w-full h-11 font-semibold"
          disabled={isSubmitting || isNavigating || isRedirecting}
        >
          {isSubmitting || isNavigating || isRedirecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Setting password...
            </>
          ) : (
            'Set password'
          )}
        </Button>
      </form>
    </div>
  );
}
