'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import {
  getPatientDetailsFormConfig,
  getPatientDetailsValidationSchema,
} from '@/lib/patient-details-config';
import { shouldRenderPatientDetailsSectionTitle } from '@/lib/patient-details-heading';
import { PatientSearchCombobox } from '@/components/forms/patient-search-combobox';
import { patientToFormDetails } from '@/lib/patient-mappers';
import type { Patient, PatientDetails } from '@/types';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface PatientDetailsFormProps {
  formType?: string | null;
  initialValues?: Partial<PatientDetails>;
  onSubmit: (data: PatientDetails) => void;
  onBack: () => void;
  showSaveOption?: boolean;
  onSavePatientChange?: (save: boolean) => void;
}

export function PatientDetailsForm({
  formType,
  initialValues,
  onSubmit,
  onBack,
  showSaveOption,
  onSavePatientChange,
}: PatientDetailsFormProps) {
  const schema = useMemo(
    () => getPatientDetailsValidationSchema(formType),
    [formType]
  );
  const formConfig = useMemo(
    () => getPatientDetailsFormConfig(formType),
    [formType]
  );

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

  const handlePatientSelect = (patient: Patient) => {
    const formDetails = patientToFormDetails(patient);
    reset(formDetails);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground">{formConfig.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formConfig.description.replace('&apos;', "'")}
        </p>
      </div>

      {/* Patient search */}
      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-3 space-y-2">
        <p className="text-xs text-muted-foreground">
          Have a saved patient? Search to auto-fill.
        </p>
        <PatientSearchCombobox onSelect={handlePatientSelect} />
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
                  <h4 className="text-sm font-medium text-foreground pl-3 border-l-2 border-primary/40">
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
                      ) : field.inputType === 'date' ? (
                        <DatePicker
                          id={String(field.key)}
                          value={watch(field.key) || null}
                          onChange={(value) =>
                            setValue(field.key, value ?? '', { shouldValidate: true })
                          }
                          mode="dob"
                          isInvalid={Boolean(errors[field.key])}
                        />
                      ) : (
                        <Input
                          id={String(field.key)}
                          type={
                            field.inputType === 'email'
                              ? 'email'
                              : field.inputType === 'tel'
                                ? 'tel'
                                : 'text'
                          }
                          placeholder={field.placeholder}
                          className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
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

      {/* Privacy notice — only shown when save option is off */}
      {!showSaveOption && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Patient details are processed in your browser and never stored on our
            servers. They are only used to fill the PDF form.
          </p>
        </div>
      )}

      {/* Sticky pill footer */}
      <div className="sticky bottom-4 z-20 mx-auto max-w-md w-full px-5 py-2.5 rounded-full border bg-background/80 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            {showSaveOption && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-muted-foreground/30"
                  onChange={(e) => onSavePatientChange?.(e.target.checked)}
                />
                Save patient
              </label>
            )}
            <Button type="submit">
              Continue to Describe
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
