import type { FormSchema } from '@/types';
import SU415Schema from './SU415.json';

const schemas: Record<string, FormSchema> = {
  SU415: SU415Schema as FormSchema,
};

export function getFormSchema(formId: string): FormSchema | null {
  return schemas[formId] ?? null;
}

export function getAllFormSchemas(): FormSchema[] {
  return Object.values(schemas);
}

export function getAvailableFormIds(): string[] {
  return Object.keys(schemas);
}
