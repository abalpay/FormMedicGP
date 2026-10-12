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
    if (!isQuestionVisible(question, answers)) continue;
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
    .filter((question) => question.requiredForBestFill && isQuestionVisible(question, answers))
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

/**
 * Returns the list of target field keys that a question covers in extractedData.
 * Uses coveredFields if explicitly set, otherwise derives from targetFieldKey/targetFieldKeys/valueOverrides.
 */
function getQuestionTargetFields(question: DictationGuideQuestion): string[] {
  if (question.coveredFields && question.coveredFields.length > 0) {
    return question.coveredFields;
  }

  if (question.valueOverrides) {
    const fields = new Set<string>();
    for (const overrideMap of Object.values(question.valueOverrides)) {
      for (const key of Object.keys(overrideMap)) {
        fields.add(key);
      }
    }
    if (fields.size > 0) return [...fields];
  }

  const fields: string[] = [];
  if (question.targetFieldKey) fields.push(question.targetFieldKey);
  if (question.targetFieldKeys) fields.push(...question.targetFieldKeys);
  return fields;
}

function isFieldPopulated(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Given a schema and extractedData from LLM, returns dictation guide questions
 * whose target fields are empty — i.e. the AI couldn't fill them from the transcript.
 * Only returns requiredForBestFill questions. Excludes clinicalNarrative textarea questions.
 * Respects visibleWhen conditions (evaluated against the extractedData, not guided answers).
 */
export function getFollowUpQuestions(
  schema: FormSchema,
  extractedData: Record<string, unknown>
): {
  sections: DictationGuideSection[];
  totalFields: number;
  filledFields: number;
  /** Answers keyed by guided question key (not field key), for visibleWhen evaluation. */
  visibilityAnswers: Record<string, string>;
} {
  const guide = schema.dictationGuide;
  if (!guide || guide.length === 0) {
    return { sections: [], totalFields: 0, filledFields: 0, visibilityAnswers: {} };
  }

  let totalFields = 0;
  let filledFields = 0;

  // Build answersProxy keyed by GUIDED question keys (not field keys).
  // visibleWhen.key references question keys (e.g. "permanentOrTemporary"),
  // so we must map each question's targetFieldKey value back to the question key.
  const allQuestions = guide.flatMap((s) => s.questions);
  const answersProxy: Record<string, string> = {};
  for (const q of allQuestions) {
    // Try targetFieldKey first, then fall back to question.key matching a field key
    const fieldKey = q.targetFieldKey ?? q.key;
    const val = extractedData[fieldKey];
    if (typeof val === 'string' && val.trim()) {
      answersProxy[q.key] = val;
    }
  }

  const followUpSections: DictationGuideSection[] = [];

  for (const section of guide) {
    const followUpQuestions: DictationGuideQuestion[] = [];

    for (const question of section.questions) {
      // Skip clinicalNarrative textarea questions — those were the initial input
      if (question.inputType === 'textarea') continue;

      const targetFields = getQuestionTargetFields(question);
      if (targetFields.length === 0) continue;

      // Respect visibleWhen before counting stats — invisible questions shouldn't inflate totals
      if (!isQuestionVisible(question, answersProxy)) continue;

      // Count coverage stats
      totalFields += targetFields.length;
      const filledCount = targetFields.filter((f) => isFieldPopulated(extractedData[f])).length;
      filledFields += filledCount;

      if (filledCount === targetFields.length) continue; // all filled, no follow-up needed

      // Only show follow-ups for required questions
      if (!question.requiredForBestFill) continue;

      followUpQuestions.push(question);
    }

    if (followUpQuestions.length > 0) {
      followUpSections.push({
        ...section,
        questions: followUpQuestions,
      });
    }
  }

  return { sections: followUpSections, totalFields, filledFields, visibilityAnswers: answersProxy };
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
