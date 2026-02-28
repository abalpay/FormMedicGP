'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
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
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            If an account exists with that email, we&apos;ve sent a password
            reset link. Check your inbox and follow the instructions.
          </p>
        </div>
        <Button variant="outline" asChild className="mt-2">
          <Link href="/login">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

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

        <Button
          type="submit"
          className="w-full h-11 font-semibold gradient-teal text-white border-0 shadow-[0_2px_12px_oklch(0.47_0.1_175/0.3)] hover:shadow-[0_4px_20px_oklch(0.47_0.1_175/0.4)] hover:opacity-95 transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
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
