import 'server-only';

import { readFileSync } from 'fs';
import { join } from 'path';
import { PDFDocument } from 'pdf-lib';
import type { FormSchema } from '@/types';

const textFieldMultilineMapCache = new Map<string, Promise<Record<string, boolean>>>();

export function getTemplateTextFieldMultilineMap(
  schema: FormSchema
): Promise<Record<string, boolean>> {
  const templatePath = join(process.cwd(), 'src', 'lib', 'schemas', schema.templatePath);
  const cached = textFieldMultilineMapCache.get(templatePath);
  if (cached) return cached;

  const loadPromise = (async () => {
    try {
      const bytes = readFileSync(templatePath);
      const doc = await PDFDocument.load(bytes, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
      });
      const form = doc.getForm();
      const map: Record<string, boolean> = {};

      for (const field of form.getFields()) {
        if (field.constructor.name !== 'PDFTextField') continue;

        try {
          map[field.getName()] = form.getTextField(field.getName()).isMultiline();
        } catch {
          // Ignore problematic fields and continue.
        }
      }

      return map;
    } catch (error) {
      console.warn(
        '[pdf-field-metadata] failed to load template metadata:',
        error instanceof Error ? error.message : String(error)
      );
      return {};
    }
  })();

  textFieldMultilineMapCache.set(templatePath, loadPromise);
  return loadPromise;
}
