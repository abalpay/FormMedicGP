'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const patientDetailsSchema = z.object({
  customerName: z.string().min(2, 'Patient name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  crn: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
});

type PatientDetailsValues = z.infer<typeof patientDetailsSchema>;

interface PatientDetailsFormProps {
  onSubmit: (data: PatientDetailsValues) => void;
  onBack: () => void;
}

export function PatientDetailsForm({ onSubmit, onBack }: PatientDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientDetailsValues>({
    resolver: zodResolver(patientDetailsSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground">Patient Details</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Enter the patient&apos;s identifying information.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Patient Name</Label>
          <Input
            id="customerName"
            placeholder="John Smith"
            {...register('customerName')}
          />
          {errors.customerName && (
            <p className="text-xs text-destructive">{errors.customerName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth')}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="crn">
              CRN <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="crn"
              placeholder="123456789A"
              {...register('crn')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="123 Main St, Sydney NSW 2000"
            {...register('address')}
          />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          )}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Patient details are processed in your browser and never stored on our
          servers. They are only used to fill the PDF form.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          Continue to Dictation
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </form>
  );
}
