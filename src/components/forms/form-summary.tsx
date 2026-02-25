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

                  return (
                    <div key={`${section.id}-${field.key}`} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {field.label}
                        {field.required ? ' *' : ''}
                      </Label>

                      {field.inputType === 'textarea' ? (
                        <Textarea
                          value={value}
                          className={hasError || isMissing ? 'border-destructive' : ''}
                          onChange={(e) => onChange(field.key, e.target.value)}
                        />
                      ) : field.inputType === 'select' && field.options.length > 0 ? (
                        <Select
                          value={value}
                          onValueChange={(next) => onChange(field.key, next)}
                        >
                          <SelectTrigger
                            className={hasError || isMissing ? 'border-destructive' : ''}
                          >
                            <SelectValue placeholder={`Select ${field.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.inputType === 'number' ? 'number' : field.inputType === 'date' ? 'date' : 'text'}
                          value={value}
                          className={hasError || isMissing ? 'border-destructive' : ''}
                          onChange={(e) => onChange(field.key, e.target.value)}
                        />
                      )}

                      {hasError && (
                        <p className="text-xs text-destructive">{errors[field.key]}</p>
                      )}
                      {!hasError && isMissing && (
                        <p className="text-xs text-warning">
                          This field was not confidently extracted and should be reviewed.
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
