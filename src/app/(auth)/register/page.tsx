'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleGoogleSignUp = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsGoogleLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      toast.error(error.message);
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (typeof window === 'undefined') {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setShowConfirmation(true);
  };

  if (showConfirmation) {
    return (
      <div className="space-y-5 text-center animate-fade-in-up">
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            We&apos;ve sent a confirmation link to your email address.
            Click the link to activate your account.
          </p>
        </div>
        <Button variant="outline" asChild className="mt-2">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get started with FormMedic for free.
        </p>
      </div>

      {/* Google OAuth */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 font-medium"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isSubmitting}
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground/60 uppercase tracking-wider font-medium">
            or
          </span>
        </div>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[13px] font-medium">
            Full name
          </Label>
          <Input
            id="name"
            placeholder="Dr. Jane Smith"
            autoComplete="name"
            className="h-11 input-focus-glow"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

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
          <Label htmlFor="password" className="text-[13px] font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            className="h-11 input-focus-glow"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold gradient-teal text-white border-0 shadow-[0_2px_12px_oklch(0.47_0.1_175/0.3)] hover:shadow-[0_4px_20px_oklch(0.47_0.1_175/0.4)] hover:opacity-95 transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary hover:underline font-semibold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
