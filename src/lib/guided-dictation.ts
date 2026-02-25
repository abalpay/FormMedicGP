import type {
  DictationGuideQuestion,
  DictationGuideSection,
  ExtractedFormData,
  FormSchema,
} from '@/types';

function normalizeGuidedAnswers(
  guidedAnswers?: Record<string, string>
): Record<string, string> {
  if (!guidedAnswers) return {};

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(guidedAnswers)) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    normalized[key] = trimmed;
  }
  return normalized;
}

function getGuidedQuestions(guide?: DictationGuideSection[]): DictationGuideQuestion[] {
  return (guide ?? []).flatMap((section) => section.questions ?? []);
}

function getDisplayValue(question: DictationGuideQuestion, value: string): string {
  const option = question.options?.find((candidate) => candidate.value === value);
  if (!option) return value;
  return `${option.label} (${option.value})`;
}

function getGuidedOverrides(
  questions: DictationGuideQuestion[],
  answers: Record<string, string>
): Record<string, string> {
  const overrides: Record<string, string> = {};

  for (const question of questions) {
    const value = answers[question.key];
    if (!value) continue;

    const configuredOverrides = question.valueOverrides?.[value];
    if (configuredOverrides && Object.keys(configuredOverrides).length > 0) {
      Object.assign(overrides, configuredOverrides);
      continue;
    }

    if (question.targetFieldKey) {
      overrides[question.targetFieldKey] = value;
    }

    if (question.targetFieldKeys && question.targetFieldKeys.length > 0) {
      for (const fieldKey of question.targetFieldKeys) {
        overrides[fieldKey] = value;
      }
    }
  }

  return overrides;
}

export function getMissingRequiredGuidedQuestionKeys(
  guide: DictationGuideSection[] | undefined,
  guidedAnswers?: Record<string, string>
): string[] {
  const answers = normalizeGuidedAnswers(guidedAnswers);
  const questions = getGuidedQuestions(guide);

  return questions
    .filter((question) => question.requiredForBestFill)
    .map((question) => question.key)
    .filter((questionKey) => !answers[questionKey]);
}

export function shouldShowGuidedSoftGate(
  guide: DictationGuideSection[] | undefined,
  guidedAnswers?: Record<string, string>
): boolean {
  return getMissingRequiredGuidedQuestionKeys(guide, guidedAnswers).length > 0;
}

export function mergeGuidedOverrides(
  extractedData: ExtractedFormData,
  guidedOverrides: Record<string, string>
): ExtractedFormData {
  if (Object.keys(guidedOverrides).length === 0) {
    return extractedData;
  }
  return { ...extractedData, ...guidedOverrides };
}

export function buildGuidedExtractionPayload({
  transcription,
  schema,
  guidedAnswers,
}: {
  transcription: string;
  schema: FormSchema;
  guidedAnswers?: Record<string, string>;
}): {
  transcriptionForLlm: string;
  guidedOverrides: Record<string, string>;
  normalizedAnswers: Record<string, string>;
} {
  const guide = schema.dictationGuide;
  const normalizedAnswers = normalizeGuidedAnswers(guidedAnswers);
  const questions = getGuidedQuestions(guide);

  if (questions.length === 0 || Object.keys(normalizedAnswers).length === 0) {
    return {
      transcriptionForLlm: transcription,
      guidedOverrides: {},
      normalizedAnswers,
    };
  }

  const guidedLines: string[] = [];
  for (const question of questions) {
    const value = normalizedAnswers[question.key];
    if (!value) continue;
    guidedLines.push(`- ${question.label}: ${getDisplayValue(question, value)}`);
  }

  const guidedOverrides = getGuidedOverrides(questions, normalizedAnswers);

  if (guidedLines.length === 0) {
    return {
      transcriptionForLlm: transcription,
      guidedOverrides,
      normalizedAnswers,
    };
  }

  const transcriptionForLlm = `${transcription.trimEnd()}\n\nGUIDED ANSWERS:\n${guidedLines.join('\n')}`;

  return {
    transcriptionForLlm,
    guidedOverrides,
    normalizedAnswers,
  };
}
