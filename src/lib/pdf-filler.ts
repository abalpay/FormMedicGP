import 'server-only';

import type { ExtractedFormData, FormSchema } from '@/types';

export async function fillPdf(
  schema: FormSchema,
  data: ExtractedFormData
): Promise<Uint8Array> {
  // TODO: Use pdf-lib to:
  // 1. Load blank PDF template from public/templates/
  // 2. Get form fields
  // 3. Fill text fields, check checkboxes, select radio buttons
  // 4. Flatten form (prevent further editing)
  // 5. Return filled PDF bytes
  throw new Error('Not implemented');
}
