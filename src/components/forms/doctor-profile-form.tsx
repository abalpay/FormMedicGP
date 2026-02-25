'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data: DoctorProfileValues) => {
    // TODO: Save to Supabase doctor_profiles table
    console.log('Doctor profile:', data);
    toast.success('Profile saved successfully');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Doctor details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Doctor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Dr. Jane Smith"
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

      <Separator />

      {/* Practice details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Practice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="practiceName">Practice Name</Label>
            <Input
              id="practiceName"
              placeholder="Sunrise Medical Centre"
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
            <Input
              id="practiceAddress"
              placeholder="123 Main St, Sydney NSW 2000"
              {...register('practiceAddress')}
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
