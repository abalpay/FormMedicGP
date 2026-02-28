'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Patient } from '@/types';

interface PatientEditDialogProps {
  patientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

interface PatientFormValues {
  customerName: string;
  dateOfBirth: string;
  crn: string;
  address: string;
  phone: string;
  email: string;
  caredPersonName: string;
  caredPersonDob: string;
  caredPersonCrn: string;
}

const EMPTY_VALUES: PatientFormValues = {
  customerName: '',
  dateOfBirth: '',
  crn: '',
  address: '',
  phone: '',
  email: '',
  caredPersonName: '',
  caredPersonDob: '',
  caredPersonCrn: '',
};

export function PatientEditDialog({
  patientId,
  open,
  onOpenChange,
  onUpdated,
}: PatientEditDialogProps) {
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open || !patientId) {
      return;
    }

    async function loadPatient() {
      setIsLoadingPatient(true);
      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) {
          throw new Error('Failed to load patient');
        }

        const { patient } = (await res.json()) as { patient: Patient };
        reset({
          customerName: patient.customerName,
          dateOfBirth: patient.dateOfBirth ?? '',
          crn: patient.crn,
          address: patient.address,
          phone: patient.phone,
          email: patient.email,
          caredPersonName: patient.caredPersonName,
          caredPersonDob: patient.caredPersonDob ?? '',
          caredPersonCrn: patient.caredPersonCrn,
        });
      } catch {
        toast.error('Failed to load patient details');
        onOpenChange(false);
      } finally {
        setIsLoadingPatient(false);
      }
    }

    loadPatient();
  }, [open, onOpenChange, patientId, reset]);

  const onSubmit = async (data: PatientFormValues) => {
    if (!patientId) return;
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: data.customerName,
          dateOfBirth: data.dateOfBirth || null,
          crn: data.crn,
          address: data.address,
          phone: data.phone,
          email: data.email,
          caredPersonName: data.caredPersonName,
          caredPersonDob: data.caredPersonDob || null,
          caredPersonCrn: data.caredPersonCrn,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Patient updated');
      onOpenChange(false);
      onUpdated();
    } catch {
      toast.error('Failed to update patient');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>

        {isLoadingPatient ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customerName">Name</Label>
              <Input
                id="edit-customerName"
                {...register('customerName', { required: 'Name is required' })}
              />
              {errors.customerName && (
                <p className="text-xs text-destructive">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
              <DatePicker
                id="edit-dateOfBirth"
                value={watch('dateOfBirth') || null}
                onChange={(value) => setValue('dateOfBirth', value ?? '')}
                mode="dob"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-crn">
                CRN <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input id="edit-crn" {...register('crn')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" {...register('address')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="edit-phone" type="tel" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">
                  Email <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="edit-email" type="email" {...register('email')} />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <p className="text-xs font-medium text-muted-foreground">
                Cared Person (if applicable)
              </p>
              <div className="space-y-2">
                <Label htmlFor="edit-caredPersonName">
                  Cared Person Name{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="edit-caredPersonName" {...register('caredPersonName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-caredPersonDob">
                  Cared Person DOB{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <DatePicker
                  id="edit-caredPersonDob"
                  value={watch('caredPersonDob') || null}
                  onChange={(value) => setValue('caredPersonDob', value ?? '')}
                  mode="dob"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-caredPersonCrn">
                  Cared Person CRN{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="edit-caredPersonCrn" {...register('caredPersonCrn')} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
