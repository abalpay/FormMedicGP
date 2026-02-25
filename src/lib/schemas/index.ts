import type { FormSchema } from '@/types';
import CAPACITYSchema from './CAPACITY.json';
import MA002Schema from './MA002.json';
import SA332ASchema from './SA332A.json';
import SA478Schema from './SA478.json';
import SU415Schema from './SU415.json';

const schemas: Record<string, FormSchema> = {
  CAPACITY: CAPACITYSchema as FormSchema,
  MA002: MA002Schema as FormSchema,
  SA332A: SA332ASchema as FormSchema,
  SA478: SA478Schema as FormSchema,
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
