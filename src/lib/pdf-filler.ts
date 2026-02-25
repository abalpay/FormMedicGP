/**
 * Server-only PDF filler — wraps the isomorphic core with Node.js file I/O.
 * Only import this from server-side code (API routes, server components).
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { fillPdfFromBytes } from './pdf-fill-core.ts';
import type { ExtractedFormData, FormSchema } from '@/types';

export { fillPdfFromBytes };

let templateCache: { path: string; bytes: Uint8Array } | null = null;

function loadTemplate(templatePath: string): Uint8Array {
  const fullPath = join(process.cwd(), 'src', 'lib', 'schemas', templatePath);
  if (templateCache?.path === fullPath) {
    return templateCache.bytes;
  }
  const bytes = readFileSync(fullPath);
  templateCache = { path: fullPath, bytes: new Uint8Array(bytes) };
  return templateCache.bytes;
}

export async function fillPdf(
  schema: FormSchema,
  data: ExtractedFormData
): Promise<Uint8Array> {
  const templateBytes = loadTemplate(schema.templatePath);
  return fillPdfFromBytes(templateBytes, schema, data);
}
