import type { FormSchema } from '@/types';
import CAPACITYSchema from './CAPACITY.json';
import MA002Schema from './MA002.json';
import SA332ASchema from './SA332A.json';
import SA478Schema from './SA478.json';
import SU415Schema from './SU415.json';
import CAPACITYManifest from './manifests/CAPACITY.json';
import MA002Manifest from './manifests/MA002.json';
import SA332AManifest from './manifests/SA332A.json';
import SA478Manifest from './manifests/SA478.json';
import SU415Manifest from './manifests/SU415.json';

const schemas: Record<string, FormSchema> = {
  CAPACITY: CAPACITYSchema as FormSchema,
  MA002: MA002Schema as FormSchema,
  SA332A: SA332ASchema as FormSchema,
  SA478: SA478Schema as FormSchema,
  SU415: SU415Schema as FormSchema,
};

interface FormManifestField {
  name: string;
  fieldType: string;
  isText: boolean;
  isCheckbox: boolean;
  isRadio: boolean;
  isChoice: boolean;
  choices: string[];
  mappingName: string;
  alternativeName: string;
  page: number;
}

export interface FormManifest {
  formId: string;
  generatedAt: string;
  fields: FormManifestField[];
}

const manifests: Record<string, FormManifest> = {
  CAPACITY: CAPACITYManifest as FormManifest,
  MA002: MA002Manifest as FormManifest,
  SA332A: SA332AManifest as FormManifest,
  SA478: SA478Manifest as FormManifest,
  SU415: SU415Manifest as FormManifest,
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

export function getFormManifest(formId: string): FormManifest | null {
  return manifests[formId] ?? null;
}
