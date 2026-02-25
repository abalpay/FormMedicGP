'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ReviewSchema } from '@/types';

interface FormSummaryProps {
  schema: ReviewSchema | null;
  data: Record<string, unknown>;
  missingFields?: string[];
  errors?: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

function stringifyValue(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function makeFieldId(sectionId: string, fieldKey: string): string {
  return `field-${sectionId}-${fieldKey}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function FormSummary({
  schema,
  data,
  missingFields = [],
  errors = {},
  onChange,
}: FormSummaryProps) {
  if (!schema) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mapped Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Schema metadata is unavailable for this form.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isComplete = missingFields.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Mapped Fields</CardTitle>
        <Badge
          variant={isComplete ? 'default' : 'secondary'}
          className={isComplete ? 'bg-success text-success-foreground' : ''}
        >
          {isComplete ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              {missingFields.length} missing
            </>
          )}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {schema.sections.map((section) => {
          if (section.fields.length === 0) return null;

          return (
            <section key={section.id} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {section.title}
              </h3>
              <div className="grid gap-4">
                {section.fields.map((field) => {
                  const value = stringifyValue(data[field.key]);
                  const hasError = Boolean(errors[field.key]);
                  const isMissing = missingFields.includes(field.key);
                  const fieldId = makeFieldId(section.id, field.key);
                  const labelId = `${fieldId}-label`;
                  const errorId = `${fieldId}-error`;
                  const hintId = `${fieldId}-hint`;
                  const unknownId = `${fieldId}-unknown`;
                  const hasUnknownOption =
                    field.options.length > 0 &&
                    value !== '' &&
                    !field.options.some((option) => option.value === value);
                  const describedBy = [
                    hasError ? errorId : '',
                    !hasError && isMissing ? hintId : '',
                    hasUnknownOption ? unknownId : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  const renderControl = field.reviewControl ?? (field.inputType === 'select' ? 'select' : undefined);

                  return (
                    <div key={`${section.id}-${field.key}`} className="space-y-1.5">
                      <Label
                        id={labelId}
                        htmlFor={renderControl === 'segmented' ? undefined : fieldId}
                        className="text-xs text-muted-foreground"
                      >
                        {field.label}
                        {field.required ? ' *' : ''}
                      </Label>

                      {field.inputType === 'textarea' ? (
                        <Textarea
                          id={fieldId}
                          value={value}
                          className={hasError || isMissing ? 'border-destructive' : ''}
                          aria-invalid={hasError || isMissing}
                          aria-describedby={describedBy || undefined}
                          onChange={(e) => onChange(field.key, e.target.value)}
                        />
                      ) : renderControl === 'segmented' && field.options.length > 0 ? (
                        <div className="space-y-2">
                          <div
                            id={fieldId}
                            role="radiogroup"
                            aria-labelledby={labelId}
                            aria-invalid={hasError || isMissing}
                            aria-describedby={describedBy || undefined}
                            className={cn(
                              'grid gap-2 rounded-md border p-1',
                              field.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2',
                              hasError || isMissing ? 'border-destructive' : 'border-input'
                            )}
                          >
                            {field.options.map((option) => {
                              const isSelected = option.value === value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  className={cn(
                                    'rounded-sm px-3 py-2 text-left text-sm transition-colors',
                                    isSelected
                                      ? 'bg-secondary text-secondary-foreground shadow-sm'
                                      : 'text-foreground hover:bg-muted'
                                  )}
                                  onClick={() => onChange(field.key, option.value)}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                          {!field.required && value !== '' && (
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline w-fit"
                              onClick={() => onChange(field.key, '')}
                            >
                              Clear selection
                            </button>
                          )}
                        </div>
                      ) : field.inputType === 'select' && field.options.length > 0 ? (
                        <div className="space-y-2">
                        <Select
                          value={hasUnknownOption || value === '' ? undefined : value}
                          onValueChange={(next) => onChange(field.key, next)}
                        >
                          <SelectTrigger
                            id={fieldId}
                            className={cn(
                              'w-full',
                              hasError || isMissing ? 'border-destructive' : ''
                            )}
                            aria-invalid={hasError || isMissing}
                            aria-describedby={describedBy || undefined}
                          >
                            <SelectValue placeholder={`Select ${field.label}`} />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="w-[var(--radix-select-trigger-width)]"
                          >
                            {field.options.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="focus:bg-secondary focus:text-secondary-foreground data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                          {!field.required && value !== '' && (
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline w-fit"
                              onClick={() => onChange(field.key, '')}
                            >
                              Clear selection
                            </button>
                          )}
                        </div>
                      ) : (
                        <Input
                          id={fieldId}
                          type={field.inputType === 'number' ? 'number' : field.inputType === 'date' ? 'date' : 'text'}
                          value={value}
                          className={hasError || isMissing ? 'border-destructive' : ''}
                          aria-invalid={hasError || isMissing}
                          aria-describedby={describedBy || undefined}
                          onChange={(e) => onChange(field.key, e.target.value)}
                        />
                      )}

                      {hasError && (
                        <p id={errorId} className="text-xs text-destructive">
                          {errors[field.key]}
                        </p>
                      )}
                      {!hasError && isMissing && (
                        <p id={hintId} className="text-xs text-warning">
                          This field was not confidently extracted and should be reviewed.
                        </p>
                      )}
                      {hasUnknownOption && (
                        <p id={unknownId} className="text-xs text-warning">
                          Current value &quot;{value}&quot; is no longer valid for this
                          field. Please reselect or clear it.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
