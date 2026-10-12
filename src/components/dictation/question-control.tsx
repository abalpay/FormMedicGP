'use client';

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
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { InlineMicButton } from '@/components/dictation/inline-mic-button';
import type { DictationGuideQuestion } from '@/types';

interface QuestionControlProps {
  question: DictationGuideQuestion;
  value: string;
  hasError?: boolean;
  onAnswerChange: (key: string, value: string) => void;
  isMainRecorderActive?: boolean;
}

export function QuestionControl({
  question,
  value,
  hasError = false,
  onAnswerChange,
  isMainRecorderActive,
}: QuestionControlProps) {
  if (question.inputType === 'segmented' && question.options?.length) {
    return (
      <div
        className={cn(
          'grid gap-2 rounded-md border p-1',
          question.options.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
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
          <SelectTrigger
            className={cn('w-full', hasError ? 'border-destructive' : '')}
          >
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

  if (question.inputType === 'number') {
    return (
      <Input
        type="number"
        min={0}
        value={value}
        placeholder={question.placeholder}
        className={cn('w-32', hasError ? 'border-destructive' : '')}
        onChange={(event) => onAnswerChange(question.key, event.target.value)}
      />
    );
  }

  if (question.inputType === 'date') {
    return (
      <DatePicker
        value={value || null}
        onChange={(v) => onAnswerChange(question.key, v ?? '')}
        isInvalid={hasError}
      />
    );
  }

  return (
    <div className="flex gap-1.5 items-start">
      <Textarea
        value={value}
        rows={3}
        placeholder={question.placeholder}
        className={cn('flex-1', hasError ? 'border-destructive' : '')}
        onChange={(event) => onAnswerChange(question.key, event.target.value)}
      />
      <InlineMicButton
        currentValue={value}
        onValueChange={(v) => onAnswerChange(question.key, v)}
        disabled={isMainRecorderActive}
      />
    </div>
  );
}

interface QuestionFieldProps extends QuestionControlProps {
  showRequired?: boolean;
}

export function QuestionField({
  question,
  value,
  hasError = false,
  onAnswerChange,
  isMainRecorderActive,
  showRequired,
}: QuestionFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className={cn('text-xs', hasError ? 'text-warning' : 'text-muted-foreground')}>
        {question.label}
        {showRequired && question.requiredForBestFill ? ' *' : ''}
      </Label>
      {question.description ? (
        <p className="text-xs text-muted-foreground">{question.description}</p>
      ) : null}
      <QuestionControl
        question={question}
        value={value}
        hasError={hasError}
        onAnswerChange={onAnswerChange}
        isMainRecorderActive={isMainRecorderActive}
      />
      {hasError ? (
        <p className="text-xs text-warning">
          Recommended for best autofill quality.
        </p>
      ) : null}
    </div>
  );
}
