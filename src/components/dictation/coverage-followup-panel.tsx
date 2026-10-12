'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { QuestionField } from '@/components/dictation/question-control';
import type { DictationGuideQuestion, DictationGuideSection, FormSchema } from '@/types';

interface CoverageFollowUpPanelProps {
  schema: FormSchema;
  extractedData: Record<string, unknown>;
  followUpSections: DictationGuideSection[];
  totalFields: number;
  filledFields: number;
  /** Answers keyed by guided question key, derived from LLM extractedData. Used for visibleWhen. */
  visibilityAnswers: Record<string, string>;
  followUpAnswers: Record<string, string>;
  onFollowUpAnswerChange: (key: string, value: string) => void;
  onExtractedValueEdit: (fieldKey: string, value: string) => void;
}

function isQuestionVisible(
  question: DictationGuideQuestion,
  answers: Record<string, string>
): boolean {
  if (!question.visibleWhen) return true;
  const { key, equals } = question.visibleWhen;
  const current = answers[key] ?? '';
  if (Array.isArray(equals)) return equals.includes(current);
  return current === equals;
}

function getFieldLabel(schema: FormSchema, fieldKey: string): string {
  for (const section of Object.values(schema.sections)) {
    const field = section.fields[fieldKey];
    if (field?.label) return field.label;
  }
  // Fallback: humanize the key
  return fieldKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

interface ExtractedValueRowProps {
  fieldKey: string;
  label: string;
  value: string;
  onEdit: (fieldKey: string, value: string) => void;
}

function ExtractedValueRow({ fieldKey, label, value, onEdit }: ExtractedValueRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  // Sync edit buffer when parent value changes and we're not actively editing
  useEffect(() => {
    if (!isEditing) setEditValue(value);
  }, [value, isEditing]);

  const handleSave = () => {
    onEdit(fieldKey, editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <span className="text-xs text-muted-foreground w-1/3 shrink-0">{label}</span>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="h-7 text-xs"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
      <span className="text-xs text-muted-foreground w-1/3 shrink-0">{label}</span>
      <span className="text-xs text-foreground flex-1 truncate">{value}</span>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
      >
        <Pencil className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  );
}

export function CoverageFollowUpPanel({
  schema,
  extractedData,
  followUpSections,
  totalFields,
  filledFields,
  visibilityAnswers,
  followUpAnswers,
  onFollowUpAnswerChange,
  onExtractedValueEdit,
}: CoverageFollowUpPanelProps) {
  const [showExtracted, setShowExtracted] = useState(false);

  const coveragePercent = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  // Merge LLM-derived visibility context with user follow-up answers (user answers win)
  const mergedVisibility = useMemo(
    () => ({ ...visibilityAnswers, ...followUpAnswers }),
    [visibilityAnswers, followUpAnswers]
  );

  const hasFollowUps = followUpSections.some((s) =>
    s.questions.some((q) => isQuestionVisible(q, mergedVisibility))
  );

  // Build list of extracted values to display
  const extractedEntries: { key: string; label: string; value: string }[] = [];
  for (const [key, val] of Object.entries(extractedData)) {
    if (typeof val === 'string' && val.trim()) {
      extractedEntries.push({
        key,
        label: getFieldLabel(schema, key),
        value: val,
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Coverage summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI Extraction Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Filled {filledFields} of {totalFields} guided fields from your notes
            </span>
            <Badge variant={coveragePercent >= 80 ? 'default' : 'secondary'}>
              {coveragePercent}%
            </Badge>
          </div>
          <Progress value={coveragePercent} className="h-2" />

          {/* Expandable extracted values */}
          {extractedEntries.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowExtracted(!showExtracted)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showExtracted ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
                {showExtracted ? 'Hide' : 'Show'} extracted values ({extractedEntries.length})
              </button>
              {showExtracted && (
                <div className="mt-2 divide-y divide-border">
                  {extractedEntries.map((entry) => (
                    <ExtractedValueRow
                      key={entry.key}
                      fieldKey={entry.key}
                      label={entry.label}
                      value={entry.value}
                      onEdit={onExtractedValueEdit}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-up questions */}
      {hasFollowUps && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Follow-up Questions
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              A few details we couldn&apos;t extract from your notes. Answer these for the best result.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {followUpSections.map((section) => (
              <section key={section.id} className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {section.title}
                  </h3>
                  {section.description ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {section.description}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-4">
                  {section.questions.map((question) => {
                    if (!isQuestionVisible(question, mergedVisibility)) return null;
                    const value = followUpAnswers[question.key] ?? '';
                    return (
                      <QuestionField
                        key={question.key}
                        question={question}
                        value={value}
                        onAnswerChange={onFollowUpAnswerChange}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
