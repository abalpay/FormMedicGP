'use client';

import { ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionField } from '@/components/dictation/question-control';
import type { DictationGuideQuestion, DictationGuideSection } from '@/types';

interface GuidedDictationPanelProps {
  sections: DictationGuideSection[];
  answers: Record<string, string>;
  missingRequiredKeys: string[];
  onAnswerChange: (key: string, value: string) => void;
  isMainRecorderActive?: boolean;
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

export function GuidedDictationPanel({
  sections,
  answers,
  missingRequiredKeys,
  onAnswerChange,
  isMainRecorderActive,
}: GuidedDictationPanelProps) {
  const questions = sections.flatMap((section) => section.questions);
  const visibleQuestions = questions.filter((q) => isQuestionVisible(q, answers));
  const requiredQuestions = visibleQuestions.filter((q) => q.requiredForBestFill);

  const answeredCount = visibleQuestions.filter((question) => {
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
              {answeredCount}/{visibleQuestions.length} answered
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
                if (!isQuestionVisible(question, answers)) return null;
                const value = answers[question.key] ?? '';
                const hasError = missingSet.has(question.key);
                return (
                  <QuestionField
                    key={question.key}
                    question={question}
                    value={value}
                    hasError={hasError}
                    onAnswerChange={onAnswerChange}
                    isMainRecorderActive={isMainRecorderActive}
                    showRequired
                  />
                );
              })}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
