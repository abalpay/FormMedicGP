'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { PracticeAutocomplete } from '@/components/ui/practice-autocomplete';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  GP_QUALIFICATION_OPTIONS,
  parseQualificationsValue,
  setOtherQualifications,
  toggleKnownQualification,
  type KnownQualification,
} from '@/lib/doctor-profile-qualifications';
import { cn } from '@/lib/utils';

const doctorProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  providerNumber: z
    .string()
    .min(1, 'Provider number is required')
    .regex(
      /^\d{6}[A-Za-z]{2}$/,
      'Provider number must be 6 digits followed by 2 letters (e.g. 123456AB)'
    ),
  qualifications: z.string().min(1, 'Select at least one qualification'),
  practiceName: z.string().min(2, 'Practice name is required'),
  practiceAddress: z.string().min(5, 'Practice address is required'),
  practicePhone: z.string(),
});

type DoctorProfileValues = z.infer<typeof doctorProfileSchema>;

import type { DoctorProfile } from '@/types';

interface DoctorProfileFormProps {
  initialData?: DoctorProfile | null;
}

export function DoctorProfileForm({ initialData }: DoctorProfileFormProps) {
  const [isLoading, setIsLoading] = useState(!initialData);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorProfileValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: initialData
      ? {
          name: initialData.name ?? '',
          providerNumber: initialData.providerNumber ?? '',
          qualifications: initialData.qualifications ?? '',
          practiceName: initialData.practiceName ?? '',
          practiceAddress: initialData.practiceAddress ?? '',
          practicePhone: initialData.practicePhone ?? '',
        }
      : {
          name: '',
          providerNumber: '',
          qualifications: '',
          practiceName: '',
          practiceAddress: '',
          practicePhone: '',
        },
  });

  const qualificationsValue = watch('qualifications') ?? '';
  const parsedQualifications = useMemo(
    () => parseQualificationsValue(qualificationsValue),
    [qualificationsValue]
  );
  const selectedKnownQualifications = parsedQualifications.selectedKnown;
  const otherQualificationsInput = parsedQualifications.otherQualifications.join(', ');

  useEffect(() => {
    if (initialData !== undefined) return; // Skip fetch when server data provided
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
        });
      } catch {
        toast.error('Failed to load your profile');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [reset, initialData]);

  const handleQualificationToggle = (qualification: KnownQualification) => {
    const nextValue = toggleKnownQualification(qualificationsValue, qualification);
    setValue('qualifications', nextValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleOtherQualificationsChange = (value: string) => {
    const nextValue = setOtherQualifications(qualificationsValue, value);
    setValue('qualifications', nextValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: DoctorProfileValues) => {
    try {
      const payload = {
        ...data,
        name: data.name.trim(),
        providerNumber: data.providerNumber.trim().toUpperCase(),
        qualifications: data.qualifications.trim(),
        practiceName: data.practiceName.trim(),
        practiceAddress: data.practiceAddress.trim(),
        practicePhone: data.practicePhone.trim(),
      };

      const res = await fetch('/api/doctor-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      <p className="text-xs text-muted-foreground">
        Fields marked <span className="text-destructive">*</span> are required.
      </p>
      {/* Doctor details */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-display)]">Doctor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Dr. Jane Smith"
                autoComplete="name"
                className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerNumber">
                Provider Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="providerNumber"
                placeholder="123456AB"
                inputMode="text"
                spellCheck="false"
                autoComplete="off"
                className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
                {...register('providerNumber')}
              />
              <p className="text-xs text-muted-foreground">
                Required to generate most forms.
              </p>
              {errors.providerNumber && (
                <p className="text-xs text-destructive">
                  {errors.providerNumber.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>
              Qualifications <span className="text-destructive">*</span>
            </Label>
            <input type="hidden" {...register('qualifications')} />
            <div className="flex flex-wrap gap-2">
              {GP_QUALIFICATION_OPTIONS.map((option) => {
                const isSelected = selectedKnownQualifications.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-pressed={isSelected}
                    className={cn(
                      isSelected &&
                        'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    )}
                    onClick={() => handleQualificationToggle(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <Input
              id="qualificationsOther"
              placeholder="Other (e.g. Skin Cancer Cert)"
              value={otherQualificationsInput}
              onChange={(event) =>
                handleOtherQualificationsChange(event.target.value)
              }
              className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
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
            <Label htmlFor="practiceName">
              Practice Name <span className="text-destructive">*</span>
            </Label>
            <PracticeAutocomplete
              id="practiceName"
              value={watch('practiceName') ?? ''}
              onChange={(value) =>
                setValue('practiceName', value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              onAddressSelect={(address) => {
                const currentAddress = getValues('practiceAddress')?.trim() ?? '';
                if (!currentAddress || currentAddress !== address) {
                  setValue('practiceAddress', address, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
              placeholder="Sunrise Medical Centre"
              className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
            />
            <p className="text-xs text-muted-foreground">
              Select a suggested practice to auto-fill address.
            </p>
            {errors.practiceName && (
              <p className="text-xs text-destructive">
                {errors.practiceName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="practiceAddress">
              Practice Address <span className="text-destructive">*</span>
            </Label>
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
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
                {...register('practicePhone')}
              />
              {errors.practicePhone && (
                <p className="text-xs text-destructive">
                  {errors.practicePhone.message}
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
