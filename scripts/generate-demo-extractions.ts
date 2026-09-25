/**
 * Precompute Claude extractions for the public /demo page (zero API calls at runtime).
 *
 * Usage: pnpm demo:cache [--force]
 *   (= npx tsx --conditions=react-server --env-file=.env.local scripts/generate-demo-extractions.ts)
 *
 * Skips cases whose JSON already exists unless --force is passed.
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { getFormManifest, getFormSchema } from '@/lib/schemas';
import { buildGuidedExtractionPayload, mergeGuidedOverrides } from '@/lib/guided-dictation';
import { deidentify } from '@/lib/deidentify';
import { EXTRACTION_MODEL, extractFormData } from '@/lib/llm';
import { getTemplateTextFieldMultilineMap } from '@/lib/pdf-field-metadata';
import { buildReviewSchema } from '@/lib/review-schema';
import { getMissingRequiredClinicalFields } from '@/lib/demo/missing-fields';
import type { ExtractedFormData, PatientDetails } from '@/types';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'src', 'lib', 'demo', 'extractions');

interface DemoInput {
  scenario: string;
  formType: string;
  formLabel: string;
  patientDetails: PatientDetails;
  guidedAnswers: Record<string, string>;
  clinicalNarrative: string;
}

const CASES: Array<{ caseId: string; file: string }> = [
  { caseId: 'SU415', file: 'tests/form-review/fixtures/SU415.json' },
  { caseId: 'SU415_BRIEF', file: 'scripts/demo-cases/SU415_BRIEF.json' },
  { caseId: 'SA478', file: 'tests/form-review/fixtures/SA478.json' },
  { caseId: 'MA002', file: 'tests/form-review/fixtures/MA002.json' },
  { caseId: 'CAPACITY', file: 'tests/form-review/fixtures/CAPACITY.json' },
];

const anthropic = new Anthropic();

async function extractEvidence(
  deidentifiedText: string,
  llmData: ExtractedFormData
): Promise<Record<string, string>> {
  const response = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 1500,
    // Simple quoting task: no thinking, so the 1500-token cap is all output.
    thinking: { type: 'disabled' },
    messages: [
      {
        role: 'user',
        content: `For each field in the extracted JSON below, copy the shortest verbatim substring of the clinical notes that supports its value. Copy characters exactly (same case, punctuation, spacing). Use an empty string if no passage supports it.

Return ONLY a JSON object mapping each field key to its quote. No markdown fences.

Extracted JSON:
${JSON.stringify(llmData, null, 2)}

---
Clinical Notes:
${deidentifiedText}`,
      },
    ],
  });
  if (response.stop_reason !== 'end_turn') {
    throw new Error(`evidence call stopped with ${response.stop_reason}`);
  }
  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') return {};
  const raw = block.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const evidence: Record<string, string> = {};
  for (const [key, quote] of Object.entries(parsed)) {
    if (typeof quote === 'string' && quote.trim() && deidentifiedText.includes(quote)) {
      evidence[key] = quote;
    }
  }
  return evidence;
}

function nonBlank(values: Array<string | undefined>): string[] {
  return values.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
}

async function generate(caseId: string, input: DemoInput) {
  const schema = getFormSchema(input.formType);
  if (!schema) throw new Error(`Unknown form type ${input.formType}`);
  const manifest = getFormManifest(input.formType);
  const p = input.patientDetails;

  const { transcriptionForLlm, guidedOverrides } = buildGuidedExtractionPayload({
    transcription: input.clinicalNarrative,
    schema,
    guidedAnswers: input.guidedAnswers,
  });
  const { deidentifiedText } = deidentify(transcriptionForLlm, {
    patientNames: nonBlank([p.customerName, p.caredPersonName]),
    dateOfBirths: nonBlank([p.dateOfBirth, p.caredPersonDateOfBirth]),
    addresses: nonBlank([p.address]),
    emails: nonBlank([p.customerEmail]),
  });
  const { data: llmData } = await extractFormData(deidentifiedText, schema);
  const merged = mergeGuidedOverrides(llmData, guidedOverrides);
  const missingFields = getMissingRequiredClinicalFields(schema, merged);
  const evidence = await extractEvidence(deidentifiedText, llmData);

  const textFieldMultilineMap = await getTemplateTextFieldMultilineMap(schema);
  const reviewSchema = buildReviewSchema(schema, {
    manifestFields: manifest?.fields ?? [],
    textFieldMultilineMap,
    defaultUnmappedPdfFields: schema.allowedUnmappedPdfFields ?? [],
    advancedUnmappedPdfFields: schema.advancedUnmappedPdfFields ?? [],
  });

  return {
    caseId,
    formType: input.formType,
    formLabel: input.formLabel,
    scenario: input.scenario,
    model: EXTRACTION_MODEL,
    generatedAt: new Date().toISOString(),
    transcript: input.clinicalNarrative,
    guidedAnswers: input.guidedAnswers,
    patientDetails: input.patientDetails,
    deidentifiedText,
    llmData,
    missingFields,
    evidence,
    reviewSchema,
  };
}

async function main() {
  const force = process.argv.includes('--force');
  for (const { caseId, file } of CASES) {
    const outPath = join(OUT_DIR, `${caseId}.json`);
    if (!force && existsSync(outPath)) {
      console.log(`${caseId}: skipped (exists; use --force)`);
      continue;
    }
    const input = JSON.parse(readFileSync(join(ROOT, file), 'utf8')) as DemoInput;
    const result = await generate(caseId, input);
    writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
    console.log(
      `${caseId}: ${Object.keys(result.llmData).length} fields, ${Object.keys(result.evidence).length} evidence quotes, missing [${result.missingFields.join(', ')}]`
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
