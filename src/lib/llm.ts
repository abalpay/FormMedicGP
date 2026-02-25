import 'server-only';

import type { FormSchema, ExtractedFormData } from '@/types';

export async function extractFormData(
  deidentifiedText: string,
  schema: FormSchema
): Promise<{
  data: ExtractedFormData;
  missingFields: string[];
}> {
  // TODO: Call Claude API with de-identified text + form schema
  // - System prompt from schema.systemPromptAdditions
  // - Return structured JSON matching form fields
  // - Include missingFields array for incomplete data
  throw new Error('Not implemented');
}
