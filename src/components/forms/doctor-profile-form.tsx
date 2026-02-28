'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const doctorProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  providerNumber: z
    .string()
    .regex(/^\d{6}[A-Z]{2}$/, 'Provider number must be 6 digits followed by 2 letters (e.g. 123456AB)'),
  qualifications: z.string().min(2, 'Qualifications are required'),
  practiceName: z.string().min(2, 'Practice name is required'),
  practiceAddress: z.string().min(5, 'Practice address is required'),
  practicePhone: z.string().min(8, 'Phone number is required'),
  practiceAbn: z
    .string()
    .regex(/^\d{11}$/, 'ABN must be exactly 11 digits'),
});

type DoctorProfileValues = z.infer<typeof doctorProfileSchema>;

export function DoctorProfileForm() {
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorProfileValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      name: '',
      providerNumber: '',
      qualifications: '',
      practiceName: '',
      practiceAddress: '',
      practicePhone: '',
      practiceAbn: '',
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/doctor-profile');
        if (res.status === 404) return; // No profile yet — keep defaults
        if (!res.ok) throw new Error('Failed to load profile');
        const { profile } = await res.json();
        reset({
          name: profile.name ?? '',
          providerNumber: profile.providerNumber ?? '',
          qualifications: profile.qualifications ?? '',
          practiceName: profile.practiceName ?? '',
          practiceAddress: profile.practiceAddress ?? '',
          practicePhone: profile.practicePhone ?? '',
          practiceAbn: profile.practiceAbn ?? '',
        });
      } catch {
        toast.error('Failed to load your profile');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  const onSubmit = async (data: DoctorProfileValues) => {
    try {
      const res = await fetch('/api/doctor-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to save profile');
      }
      toast.success('Profile saved successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Doctor details */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-display)]">Doctor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Dr. Jane Smith"
                className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerNumber">Provider Number</Label>
              <Input
                id="providerNumber"
                placeholder="123456AB"
                className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
                {...register('providerNumber')}
              />
              {errors.providerNumber && (
                <p className="text-xs text-destructive">
                  {errors.providerNumber.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications</Label>
            <Input
              id="qualifications"
              placeholder="MBBS, FRACGP"
              className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
              {...register('qualifications')}
            />
            {errors.qualifications && (
              <p className="text-xs text-destructive">
                {errors.qualifications.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Practice details */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-display)]">Practice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="practiceName">Practice Name</Label>
            <Input
              id="practiceName"
              placeholder="Sunrise Medical Centre"
              className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
              {...register('practiceName')}
            />
            {errors.practiceName && (
              <p className="text-xs text-destructive">
                {errors.practiceName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="practiceAddress">Practice Address</Label>
            <AddressAutocomplete
              id="practiceAddress"
              value={watch('practiceAddress') ?? ''}
              onChange={(val) => setValue('practiceAddress', val, { shouldValidate: true })}
            />
            {errors.practiceAddress && (
              <p className="text-xs text-destructive">
                {errors.practiceAddress.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="practicePhone">Phone</Label>
              <Input
                id="practicePhone"
                placeholder="02 9876 5432"
                className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
                {...register('practicePhone')}
              />
              {errors.practicePhone && (
                <p className="text-xs text-destructive">
                  {errors.practicePhone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="practiceAbn">ABN</Label>
              <Input
                id="practiceAbn"
                placeholder="12345678901"
                className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
                {...register('practiceAbn')}
              />
              {errors.practiceAbn && (
                <p className="text-xs text-destructive">
                  {errors.practiceAbn.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-1.5" />
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
