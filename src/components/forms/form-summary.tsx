'use client';

import { Fragment, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
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
import type { ReviewFieldConfig, ReviewSchema } from '@/types';

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

function isBlankValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function isFieldVisible(field: ReviewFieldConfig, data: Record<string, unknown>): boolean {
  if (field.conditional) {
    const match = field.conditional.match(/^(\w+)\s*===\s*'([^']*)'$/);
    if (match) {
      const refValue = String(data[match[1]] ?? '').trim();
      if (refValue !== match[2]) return false;
    }
  }
  if (field.hiddenWhenEmpty) {
    const refValue = data[field.hiddenWhenEmpty];
    if (refValue == null || String(refValue).trim() === '') return false;
  }
  return true;
}

function defaultGroupLabel(group: string): string {
  return group
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (m) => m.toUpperCase());
}

const GROUP_LABELS: Record<string, string> = {
  claimAndCertificate: 'Claim And Certificate',
  physicalCapacity: 'Physical Capacity',
  mentalCapacity: 'Mental Capacity',
};

function renderFieldControl({
  field,
  fieldId,
  labelId,
  value,
  hasError,
  describedBy,
  onChange,
}: {
  field: ReviewFieldConfig;
  fieldId: string;
  labelId: string;
  value: string;
  hasError: boolean;
  describedBy: string;
  onChange: (key: string, value: string) => void;
}) {
  const hasUnknownOption =
    field.options.length > 0 &&
    value !== '' &&
    !field.options.some((option) => option.value === value);
  const renderControl = field.reviewControl ?? (field.inputType === 'select' ? 'select' : undefined);

  if (field.inputType === 'textarea') {
    return (
      <Textarea
        id={fieldId}
        value={value}
        className={cn(
          hasError ? 'border-destructive' : '',
          field.highlight ? 'min-h-[120px]' : ''
        )}
        aria-invalid={hasError}
        aria-describedby={describedBy || undefined}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    );
  }

  if (renderControl === 'segmented' && field.options.length > 0) {
    return (
      <div className="space-y-2">
        <div
          id={fieldId}
          role="radiogroup"
          aria-labelledby={labelId}
          aria-invalid={hasError}
          aria-describedby={describedBy || undefined}
          className={cn(
            'grid gap-2 rounded-md border p-1',
            field.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            hasError ? 'border-destructive' : 'border-input'
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
                  'rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 border',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-foreground border-transparent hover:bg-muted'
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
    );
  }

  if (field.inputType === 'select' && field.options.length > 0) {
    return (
      <div className="space-y-2">
        <Select
          value={hasUnknownOption || value === '' ? undefined : value}
          onValueChange={(next) => onChange(field.key, next)}
        >
          <SelectTrigger
            id={fieldId}
            className={cn('w-full', hasError ? 'border-destructive' : '')}
            aria-invalid={hasError}
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
    );
  }

  if (field.inputType === 'date') {
    return (
      <DatePicker
        id={fieldId}
        value={value || null}
        onChange={(v) => onChange(field.key, v ?? '')}
        isInvalid={hasError}
      />
    );
  }

  return (
    <Input
      id={fieldId}
      type={field.inputType === 'number' ? 'number' : 'text'}
      value={value}
      className={hasError ? 'border-destructive' : ''}
      aria-invalid={hasError}
      aria-describedby={describedBy || undefined}
      onChange={(e) => onChange(field.key, e.target.value)}
    />
  );
}

export function FormSummary({
  schema,
  data,
  missingFields = [],
  errors = {},
  onChange,
}: FormSummaryProps) {
  const [showTechnicalFields, setShowTechnicalFields] = useState(false);

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

  const requiredMissing = new Set<string>();
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (!field.required) continue;
      if (!isFieldVisible(field, data)) continue;
      if (isBlankValue(data[field.key])) requiredMissing.add(field.key);
    }
  }

  const issueCount = requiredMissing.size + Object.keys(errors).length;
  const isComplete = issueCount === 0;
  const isCapacityForm = schema.formId === 'CAPACITY';
  const technicalSections = schema.sections.filter(
    (section) =>
      section.id === 'advancedTemplate' || section.fields.some((field) => field.advanced)
  );
  const technicalFieldCount = technicalSections.reduce(
    (count, section) => count + section.fields.length,
    0
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-[family-name:var(--font-display)]">Mapped Fields</CardTitle>
        <div className="flex items-center gap-2">
          {!isCapacityForm && technicalFieldCount > 0 && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              onClick={() => setShowTechnicalFields((current) => !current)}
            >
              {showTechnicalFields
                ? 'Hide technical fields'
                : `Show technical fields (${technicalFieldCount})`}
            </button>
          )}
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
                {issueCount} issue{issueCount === 1 ? '' : 's'}
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {schema.sections.map((section) => {
          if (section.fields.length === 0) return null;

          const isAdvancedSection =
            section.id === 'advancedTemplate' ||
            section.fields.some((field) => field.advanced);

          if (isCapacityForm && isAdvancedSection) {
            return null;
          }

          if (isAdvancedSection && !showTechnicalFields) {
            return null;
          }

          const visibleFields = section.fields.filter((field) =>
            isFieldVisible(field, data)
          );

          const groupedFields: Array<{
            key: string;
            title: string | null;
            fields: ReviewFieldConfig[];
          }> = [];
          for (const field of visibleFields) {
            const groupKey = field.group ?? '__default';
            const current = groupedFields[groupedFields.length - 1];
            if (current && current.key === groupKey) {
              current.fields.push(field);
              continue;
            }

            groupedFields.push({
              key: groupKey,
              title:
                groupKey === '__default'
                  ? null
                  : GROUP_LABELS[groupKey] ?? defaultGroupLabel(groupKey),
              fields: [field],
            });
          }

          const sectionBody = (
            <div className="space-y-4">
              {groupedFields.map((group) => (
                <div key={`${section.id}-${group.key}`} className="space-y-3">
                  {group.title ? (
                    <h4 className="text-xs font-semibold text-foreground">
                      {group.title}
                    </h4>
                  ) : null}
                  {(() => {
                    const firstFieldOptions = group.fields[0]?.options ?? [];
                    const firstFieldValues = firstFieldOptions
                      .map((option) => option.value)
                      .join('|');
                    const isMatrixGroup =
                      (group.key === 'physicalCapacity' || group.key === 'mentalCapacity') &&
                      group.fields.length > 0 &&
                      group.fields.every((field) => {
                        const renderControl =
                          field.reviewControl ??
                          (field.inputType === 'select' ? 'select' : undefined);
                        const fieldValues = field.options.map((option) => option.value).join('|');
                        return (
                          renderControl === 'segmented' &&
                          field.options.length > 0 &&
                          fieldValues === firstFieldValues
                        );
                      });

                    if (isMatrixGroup) {
                      return (
                        <div className="overflow-x-auto rounded-md border border-input">
                          <table className="w-full min-w-[560px] text-sm">
                            <thead className="bg-muted/40">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Function
                                </th>
                                {firstFieldOptions.map((option) => (
                                  <th
                                    key={`${section.id}-${group.key}-${option.value}`}
                                    className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                  >
                                    {option.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {group.fields.map((field) => {
                                const value = stringifyValue(data[field.key]);
                                const requiredError =
                                  requiredMissing.has(field.key) && !errors[field.key]
                                    ? `${field.label} is required.`
                                    : undefined;
                                const errorText = errors[field.key] ?? requiredError;
                                const hasError = Boolean(errorText);
                                const isMissingHint = missingFields.includes(field.key);
                                const fieldId = makeFieldId(section.id, field.key);
                                const errorId = `${fieldId}-error`;
                                const hintId = `${fieldId}-hint`;

                                return (
                                  <Fragment key={`${section.id}-${field.key}`}>
                                    <tr
                                      className="border-t border-border/70 first:border-t-0 hover:bg-muted/30 transition-colors"
                                    >
                                      <th
                                        id={`${fieldId}-label`}
                                        className="px-3 py-2 text-left text-xs font-medium text-foreground"
                                      >
                                        {field.label}
                                        {field.required ? ' *' : ''}
                                      </th>
                                      {field.options.map((option) => {
                                        const isSelected = option.value === value;
                                        return (
                                          <td
                                            key={`${field.key}-${option.value}`}
                                            className="px-2 py-2 text-center"
                                          >
                                            <button
                                              type="button"
                                              role="radio"
                                              aria-checked={isSelected}
                                              aria-labelledby={`${fieldId}-label`}
                                              aria-describedby={
                                                hasError
                                                  ? errorId
                                                  : isMissingHint
                                                    ? hintId
                                                    : undefined
                                              }
                                              className={cn(
                                                'min-w-[112px] rounded-sm border px-2 py-1.5 text-xs transition-colors',
                                                isSelected
                                                  ? 'bg-primary text-primary-foreground border-primary'
                                                  : 'bg-background text-foreground border-input hover:bg-muted'
                                              )}
                                              onClick={() => onChange(field.key, option.value)}
                                            >
                                              {option.label}
                                            </button>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                    {hasError && (
                                      <tr>
                                        <td
                                          colSpan={field.options.length + 1}
                                          className="px-3 pb-2 text-xs text-destructive"
                                        >
                                          <p id={errorId}>{errorText}</p>
                                        </td>
                                      </tr>
                                    )}
                                    {!hasError && isMissingHint && (
                                      <tr>
                                        <td
                                          colSpan={field.options.length + 1}
                                          className="px-3 pb-2 text-xs text-warning"
                                        >
                                          <p id={hintId}>
                                            This field was not confidently extracted and should be
                                            reviewed.
                                          </p>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    return (
                      <div className="grid gap-4">
                        {group.fields.map((field) => {
                          const value = stringifyValue(data[field.key]);
                          const requiredError =
                            requiredMissing.has(field.key) && !errors[field.key]
                              ? `${field.label} is required.`
                              : undefined;
                          const errorText = errors[field.key] ?? requiredError;
                          const hasError = Boolean(errorText);
                          const isMissingHint = missingFields.includes(field.key);
                          const fieldId = makeFieldId(section.id, field.key);
                          const labelId = `${fieldId}-label`;
                          const errorId = `${fieldId}-error`;
                          const hintId = `${fieldId}-hint`;
                          const describedBy = [
                            hasError ? errorId : '',
                            !hasError && isMissingHint ? hintId : '',
                          ]
                            .filter(Boolean)
                            .join(' ');

                          const fieldContent = (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <Label
                                  id={labelId}
                                  htmlFor={fieldId}
                                  className="text-xs text-muted-foreground"
                                >
                                  {field.label}
                                  {field.required ? ' *' : ''}
                                </Label>
                                {field.tooltip && (
                                  <span title={field.tooltip} className="shrink-0 cursor-help">
                                    <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
                                  </span>
                                )}
                                {field.highlight && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    AI Generated
                                  </Badge>
                                )}
                              </div>

                              {renderFieldControl({
                                field,
                                fieldId,
                                labelId,
                                value,
                                hasError,
                                describedBy,
                                onChange,
                              })}

                              {hasError && (
                                <p id={errorId} className="text-xs text-destructive">
                                  {errorText}
                                </p>
                              )}
                              {!hasError && isMissingHint && (
                                <p id={hintId} className="text-xs text-warning">
                                  This field was not confidently extracted and should be reviewed.
                                </p>
                              )}
                              {!hasError && !isMissingHint && field.emptyHint && isBlankValue(data[field.key]) && (
                                <p className="text-xs text-muted-foreground/60 italic">
                                  {field.emptyHint}
                                </p>
                              )}
                            </div>
                          );

                          return (
                            <div
                              key={`${section.id}-${field.key}`}
                              className={
                                field.highlight
                                  ? 'bg-primary/5 border border-primary/10 rounded-lg p-3'
                                  : ''
                              }
                            >
                              {fieldContent}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          );

          if (isAdvancedSection) {
            return (
              <details
                key={section.id}
                className="rounded-md border border-border/70 bg-muted/20 p-3"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                  {section.title}
                </summary>
                <p className="mt-1 text-xs text-muted-foreground">
                  Low-level template fields for edge cases.
                </p>
                <div className="mt-4">{sectionBody}</div>
              </details>
            );
          }

          if (section.initiallyCollapsed) {
            return (
              <details key={section.id} className="group">
                <summary className="flex items-center gap-1.5 cursor-pointer list-none text-sm font-semibold text-muted-foreground pl-3 border-l-2 border-primary/30">
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
                  {section.title}
                </summary>
                <div className="mt-3">{sectionBody}</div>
              </details>
            );
          }

          return (
            <section key={section.id} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground pl-3 border-l-2 border-primary/30">
                {section.title}
              </h3>
              {sectionBody}
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
