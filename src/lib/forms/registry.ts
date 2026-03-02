import 'server-only';

import { getFormSchema } from '@/lib/schemas';
import type { FormCatalogItem, FormRegistryEntry } from '@/types';

const ALL_FORM_REGISTRY: FormRegistryEntry[] = [
  {
    id: 'SU415',
    label: 'Centrelink Medical Certificate (SU415)',
    description:
      'Temporary incapacity medical certificate with diagnosis, prognosis, treatment and work capacity details.',
    version: '2024-12',
    templatePath: 'templates/SU415.pdf',
    schemaPath: 'src/lib/schemas/SU415.json',
    status: 'active',
    deferred: false,
  },
  {
    id: 'SA478',
    label: 'Disability Support Pension Medical Evidence (SA478)',
    description:
      'Medical evidence form for DSP assessment focusing on functional impact and supporting clinical evidence.',
    version: '2026-01',
    templatePath: 'templates/SA478.pdf',
    schemaPath: 'src/lib/schemas/SA478.json',
    status: 'active',
    deferred: false,
  },
  {
    id: 'SA332A',
    label: 'Carer Payment/Allowance Medical Report 16+ (SA332A)',
    description:
      'Medical report supporting Carer Payment and/or Carer Allowance claims for a person aged 16 years or over.',
    version: '2025-04',
    templatePath: 'templates/SA332A.pdf',
    schemaPath: 'src/lib/schemas/SA332A.json',
    status: 'active',
    deferred: false,
  },
  {
    id: 'MA002',
    label: 'Mobility Allowance Medical Report (MA002)',
    description:
      'Mobility allowance report capturing diagnosis, functional mobility impact, and treatment context.',
    version: '2006-06',
    templatePath: 'templates/MA002.pdf',
    schemaPath: 'src/lib/schemas/MA002.json',
    status: 'active',
    deferred: false,
  },
  {
    id: 'CAPACITY',
    label: 'Certificate of Capacity (Victoria TAC/WorkCover)',
    description:
      'Victorian certificate covering diagnosis, capacity windows, work restrictions, and treatment plan.',
    version: '2024-11',
    templatePath: 'templates/CAPACITY.pdf',
    schemaPath: 'src/lib/schemas/CAPACITY.json',
    status: 'active',
    deferred: false,
  },
  {
    id: 'NDIS_ACCESS',
    label: 'NDIS Access Request — Supporting Evidence Form',
    description:
      'NDIS access request supporting evidence covering impairments, assessments, and functional impact across 6 domains.',
    version: '1.1-2020-04',
    templatePath: 'templates/NDIS_ACCESS.pdf',
    schemaPath: 'src/lib/schemas/NDIS_ACCESS.json',
    status: 'active',
    deferred: false,
  },
];

export function isMultiFormRegistryEnabled(): boolean {
  return process.env.MULTI_FORM_REGISTRY_V1 !== 'false';
}

export function getFormRegistry(includeDeferred = false): FormRegistryEntry[] {
  const enabled = isMultiFormRegistryEnabled();

  const filtered = ALL_FORM_REGISTRY.filter((form) => {
    if (!enabled && form.id !== 'SU415') {
      return false;
    }
    if (!includeDeferred && form.deferred) {
      return false;
    }
    return true;
  });

  return filtered;
}

export function getFormCatalog(includeDeferred = false): FormCatalogItem[] {
  return getFormRegistry(includeDeferred).map((form) => {
    const schema = getFormSchema(form.id);

    return {
      id: form.id,
      label: form.label,
      description: form.description,
      version: form.version,
      status: form.status,
      deferred: form.deferred,
      dictationTips: schema?.dictationTips ?? [],
      dictationGuide: schema?.dictationGuide,
    };
  });
}
