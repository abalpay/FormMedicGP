'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import {
  getPatientDetailsFormConfig,
  getPatientDetailsValidationSchema,
} from '@/lib/patient-details-config';
import { shouldRenderPatientDetailsSectionTitle } from '@/lib/patient-details-heading';
import type { PatientDetails } from '@/types';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface PatientDetailsFormProps {
  formType?: string | null;
  initialValues?: Partial<PatientDetails>;
  onSubmit: (data: PatientDetails) => void;
  onBack: () => void;
}

export function PatientDetailsForm({
  formType,
  initialValues,
  onSubmit,
  onBack,
}: PatientDetailsFormProps) {
  const schema = useMemo(
    () => getPatientDetailsValidationSchema(formType),
    [formType]
  );
  const formConfig = useMemo(
    () => getPatientDetailsFormConfig(formType),
    [formType]
  );

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PatientDetails>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground">{formConfig.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formConfig.description.replace('&apos;', "'")}
        </p>
      </div>

      <div className="space-y-6">
        {formConfig.sections.map((section) => {
          const shouldRenderSectionTitle = shouldRenderPatientDetailsSectionTitle(
            formConfig.title,
            section.title,
            formConfig.sections.length
          );

          return (
            <section key={section.id} className="space-y-4">
              <div>
                {shouldRenderSectionTitle ? (
                  <h4 className="text-sm font-medium text-foreground">
                    {section.title}
                  </h4>
                ) : null}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {section.description}
                </p>
              </div>

              <div className="space-y-4">
                {section.fields.map((field) => {
                  const error = errors[field.key];
                  const isOptional = !field.required;

                  return (
                    <div key={String(field.key)} className="space-y-2">
                      <Label htmlFor={String(field.key)}>
                        {field.label}{' '}
                        {isOptional ? (
                          <span className="text-muted-foreground">(optional)</span>
                        ) : null}
                      </Label>

                      {field.inputType === 'address' ? (
                        <AddressAutocomplete
                          id={String(field.key)}
                          value={watch(field.key) ?? ''}
                          onChange={(value) =>
                            setValue(field.key, value, { shouldValidate: true })
                          }
                        />
                      ) : (
                        <Input
                          id={String(field.key)}
                          type={
                            field.inputType === 'date'
                              ? 'date'
                              : field.inputType === 'email'
                                ? 'email'
                                : field.inputType === 'tel'
                                  ? 'tel'
                                  : 'text'
                          }
                          max={field.inputType === 'date' ? todayIso : undefined}
                          placeholder={field.placeholder}
                          {...register(field.key)}
                        />
                      )}

                      {error && (
                        <p className="text-xs text-destructive">
                          {error.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {formType === 'SA332A' && (
        <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
          <p className="text-xs text-muted-foreground">
            For SA332A, make sure customer (carer) and cared person details are
            entered as different people when applicable.
          </p>
        </div>
      )}

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
