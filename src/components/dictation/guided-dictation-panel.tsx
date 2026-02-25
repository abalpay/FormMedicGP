'use client';

import { ClipboardList } from 'lucide-react';
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
import type { DictationGuideQuestion, DictationGuideSection } from '@/types';

interface GuidedDictationPanelProps {
  sections: DictationGuideSection[];
  answers: Record<string, string>;
  missingRequiredKeys: string[];
  onAnswerChange: (key: string, value: string) => void;
}

function renderQuestionControl({
  question,
  value,
  hasError,
  onAnswerChange,
}: {
  question: DictationGuideQuestion;
  value: string;
  hasError: boolean;
  onAnswerChange: (key: string, value: string) => void;
}) {
  if (question.inputType === 'segmented' && question.options?.length) {
    return (
      <div
        className={cn(
          'grid gap-2 rounded-md border p-1',
          question.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          hasError ? 'border-destructive' : 'border-input'
        )}
      >
        {question.options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                'rounded-sm border px-3 py-2 text-left text-sm transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-transparent hover:bg-muted'
              )}
              onClick={() => onAnswerChange(question.key, option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.inputType === 'select' && question.options?.length) {
    return (
      <div className="space-y-2">
        <Select
          value={value || undefined}
          onValueChange={(next) => onAnswerChange(question.key, next)}
        >
          <SelectTrigger className={cn('w-full', hasError ? 'border-destructive' : '')}>
            <SelectValue placeholder={`Select ${question.label}`} />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            onClick={() => onAnswerChange(question.key, '')}
          >
            Clear selection
          </button>
        )}
      </div>
    );
  }

  if (question.inputType === 'date') {
    return (
      <Input
        type="date"
        value={value}
        className={hasError ? 'border-destructive' : ''}
        onChange={(event) => onAnswerChange(question.key, event.target.value)}
      />
    );
  }

  return (
    <Textarea
      value={value}
      rows={3}
      placeholder={question.placeholder}
      className={hasError ? 'border-destructive' : ''}
      onChange={(event) => onAnswerChange(question.key, event.target.value)}
    />
  );
}

export function GuidedDictationPanel({
  sections,
  answers,
  missingRequiredKeys,
  onAnswerChange,
}: GuidedDictationPanelProps) {
  const questions = sections.flatMap((section) => section.questions);
  const requiredQuestions = questions.filter((question) => question.requiredForBestFill);

  const answeredCount = questions.filter((question) => {
    const value = answers[question.key];
    return typeof value === 'string' && value.trim().length > 0;
  }).length;

  const answeredRequiredCount = requiredQuestions.filter((question) => {
    const value = answers[question.key];
    return typeof value === 'string' && value.trim().length > 0;
  }).length;

  const missingSet = new Set(missingRequiredKeys);

  return (
    <Card id="guided-dictation-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Guided Dictation
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {answeredCount}/{questions.length} answered
            </Badge>
            <Badge variant="secondary">
              {answeredRequiredCount}/{requiredQuestions.length} high-value
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {sections.map((section) => (
          <section key={section.id} className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {section.title}
              </h3>
              {section.description ? (
                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              ) : null}
            </div>

            <div className="grid gap-4">
              {section.questions.map((question) => {
                const value = answers[question.key] ?? '';
                const hasError = missingSet.has(question.key);
                return (
                  <div key={question.key} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {question.label}
                      {question.requiredForBestFill ? ' *' : ''}
                    </Label>
                    {question.description ? (
                      <p className="text-xs text-muted-foreground">{question.description}</p>
                    ) : null}
                    {renderQuestionControl({
                      question,
                      value,
                      hasError,
                      onAnswerChange,
                    })}
                    {hasError ? (
                      <p className="text-xs text-warning">
                        Recommended for best autofill quality.
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
