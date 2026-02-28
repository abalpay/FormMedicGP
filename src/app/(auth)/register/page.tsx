'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

export default function RegisterPage() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error || 'Something went wrong. Please try again.');
        return;
      }

      setShowConfirmation(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  if (showConfirmation) {
    return (
      <div className="space-y-5 text-center animate-fade-in-up">
        <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-[family-name:var(--font-display)]">
            You&apos;re on the list!
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            We&apos;ll be in touch when spots open up.
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
          Join the Waitlist
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          FormBridge GP is currently invite-only. Leave your email and
          we&apos;ll notify you when spots open up.
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
          variant="teal"
          className="w-full h-11 font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            'Join Waitlist'
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
