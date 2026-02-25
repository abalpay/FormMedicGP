import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import type { FormSchema, ExtractedFormData } from '@/types';

const anthropic = new Anthropic();

export async function extractFormData(
  deidentifiedText: string,
  schema: FormSchema
): Promise<{
  data: ExtractedFormData;
  missingFields: string[];
}> {
  const clinicalSection = schema.sections.clinical;
  if (!clinicalSection) {
    throw new Error(`Schema ${schema.formId} has no clinical section`);
  }

  const fieldDescriptions = Object.entries(clinicalSection.fields)
    .map(([key, field]) => {
      let desc = `- "${key}" (${field.type})`;
      if (field.options) desc += ` — options: ${field.options.join(', ')}`;
      if (field.required) desc += ' [REQUIRED]';
      if (field.default) desc += ` — default: "${field.default}"`;
      if (field.llmInstruction) desc += `\n  Instruction: ${field.llmInstruction}`;
      return desc;
    })
    .join('\n');

  const today = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are a medical form assistant that extracts structured data from clinical dictation notes.

Rules:
- Extract ONLY the fields listed below — do not invent fields.
- Use the exact field keys provided.
- For radio fields, use one of the listed options exactly.
- For date fields, use YYYY-MM-DD format.
- Use best-guess inference when evidence is moderate and clinically reasonable.
- If information is truly unknown or unsupported, omit the field.
- Apply defaults only when the field has a default and no information contradicts it.
- Today's date is ${today}.

${schema.systemPromptAdditions}`;

  const userPrompt = `Extract the following fields from the clinical notes below.

Fields to extract:
${fieldDescriptions}

Return a JSON object with ONLY the fields you can confidently extract. Do not wrap in markdown code fences.

---
Clinical Notes:
${deidentifiedText}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Strip markdown code fences if present
  let raw = textBlock.text.trim();
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const data: ExtractedFormData = JSON.parse(raw);

  // Determine missing required fields
  const missingFields: string[] = [];
  for (const [key, field] of Object.entries(clinicalSection.fields)) {
    if (field.required && data[key] == null) {
      missingFields.push(key);
    }
  }

  return { data, missingFields };
}
