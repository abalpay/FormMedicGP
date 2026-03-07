import { z } from 'zod';
import type { PatientDetails } from '@/types';

export type PatientDetailsInputType =
  | 'text'
  | 'date'
  | 'address'
  | 'email'
  | 'tel';

export interface PatientDetailsFieldConfig {
  key: keyof PatientDetails;
  label: string;
  inputType: PatientDetailsInputType;
  required: boolean;
  placeholder?: string;
}

export interface PatientDetailsSectionConfig {
  id: 'customer' | 'caredPerson';
  title: string;
  description: string;
  fields: PatientDetailsFieldConfig[];
}

export interface PatientDetailsFormConfig {
  title: string;
  description: string;
  sections: PatientDetailsSectionConfig[];
}

const BASE_SHAPE = {
  customerName: z.string().min(2, 'Patient name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  crn: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  caredPersonName: z.string().optional(),
  caredPersonDateOfBirth: z.string().optional(),
  caredPersonCrn: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z
    .string()
    .optional()
    .refine(
      (value) => !value || /\S+@\S+\.\S+/.test(value),
      'A valid email address is required'
    ),
  patientGuardian: z.string().optional(),
  patientPhone: z.string().optional(),
  ndisNumber: z.string().optional(),
} satisfies Record<keyof PatientDetails, z.ZodTypeAny>;

function isFutureIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  return date.getTime() > todayUtc.getTime();
}

function hasFirstAndLastName(value: string): boolean {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length >= 2;
}

export function isCarerForm(formType: string | null | undefined): boolean {
  return formType === 'SA332A';
}

export function isNdisForm(formType: string | null | undefined): boolean {
  return formType === 'NDIS_ACCESS';
}

export function getPatientDetailsValidationSchema(
  formType: string | null | undefined
) {
  return z.object(BASE_SHAPE).superRefine((data, ctx) => {
    if (isFutureIsoDate(data.dateOfBirth)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dateOfBirth'],
        message: 'Date of birth must not be in the future.',
      });
    }

    if (formType === 'CAPACITY' && !hasFirstAndLastName(data.customerName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customerName'],
        message: 'Please enter first and last name for this form.',
      });
    }

    if (!isCarerForm(formType)) return;

    if (!data.caredPersonName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['caredPersonName'],
        message: 'Cared person name is required',
      });
    }
    if (!data.caredPersonDateOfBirth?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['caredPersonDateOfBirth'],
        message: 'Cared person date of birth is required',
      });
    }
  });
}

export function getPatientDetailsFormConfig(
  formType: string | null | undefined
): PatientDetailsFormConfig {
  if (isNdisForm(formType)) {
    return {
      title: 'Participant Details',
      description: "Enter the NDIS participant's identifying information.",
      sections: [
        {
          id: 'customer',
          title: 'Participant Details',
          description: 'These fields fill the NDIS participant identity section.',
          fields: [
            {
              key: 'customerName',
              label: 'Participant Name',
              inputType: 'text',
              required: true,
              placeholder: 'John Smith',
            },
            {
              key: 'dateOfBirth',
              label: 'Date of Birth',
              inputType: 'date',
              required: true,
            },
            {
              key: 'patientGuardian',
              label: 'Parent/Guardian/Carer/Representative',
              inputType: 'text',
              required: false,
              placeholder: 'Jane Smith (mother)',
            },
            {
              key: 'patientPhone',
              label: 'Phone',
              inputType: 'tel',
              required: false,
              placeholder: '04xx xxx xxx',
            },
            {
              key: 'ndisNumber',
              label: 'NDIS Number',
              inputType: 'text',
              required: false,
              placeholder: '4xxxxxxxxx',
            },
            {
              key: 'address',
              label: 'Address',
              inputType: 'address',
              required: true,
            },
          ],
        },
      ],
    };
  }

  if (isCarerForm(formType)) {
    return {
      title: 'Customer and Cared Person Details',
      description:
        'Enter both the customer (carer) details and the person being cared for.',
      sections: [
        {
          id: 'customer',
          title: 'Customer (Carer) Details',
          description: 'These fields fill the SA332A customer section.',
          fields: [
            {
              key: 'customerName',
              label: 'Customer (Carer) Name',
              inputType: 'text',
              required: true,
              placeholder: 'Jane Carer',
            },
            {
              key: 'dateOfBirth',
              label: 'Customer Date of Birth',
              inputType: 'date',
              required: true,
            },
            {
              key: 'crn',
              label: 'Customer CRN',
              inputType: 'text',
              required: false,
              placeholder: '123456789A',
            },
            {
              key: 'address',
              label: 'Customer Address',
              inputType: 'address',
              required: true,
            },
            {
              key: 'customerPhone',
              label: 'Customer Phone',
              inputType: 'tel',
              required: false,
              placeholder: '04xx xxx xxx',
            },
            {
              key: 'customerEmail',
              label: 'Customer Email',
              inputType: 'email',
              required: false,
              placeholder: 'name@example.com',
            },
          ],
        },
        {
          id: 'caredPerson',
          title: 'Person Being Cared For',
          description:
            'These fields must be the cared person, not the customer.',
          fields: [
            {
              key: 'caredPersonName',
              label: 'Cared Person Name',
              inputType: 'text',
              required: true,
              placeholder: 'Tom Patient',
            },
            {
              key: 'caredPersonDateOfBirth',
              label: 'Cared Person Date of Birth',
              inputType: 'date',
              required: true,
            },
            {
              key: 'caredPersonCrn',
              label: 'Cared Person CRN',
              inputType: 'text',
              required: false,
              placeholder: '123456789A',
            },
          ],
        },
      ],
    };
  }

  return {
    title: 'Patient Details',
    description: 'Enter the patient&apos;s identifying information.',
    sections: [
      {
        id: 'customer',
        title: 'Patient Details',
        description: 'These fields are used to fill patient identity sections.',
        fields: [
          {
            key: 'customerName',
            label: 'Patient Name',
            inputType: 'text',
            required: true,
            placeholder: formType === 'CAPACITY' ? 'John Smith (first and last)' : 'John Smith',
          },
          {
            key: 'dateOfBirth',
            label: 'Date of Birth',
            inputType: 'date',
            required: true,
          },
          {
            key: 'crn',
            label: 'CRN',
            inputType: 'text',
            required: false,
            placeholder: '123456789A',
          },
          {
            key: 'address',
            label: 'Address',
            inputType: 'address',
            required: true,
          },
        ],
      },
    ],
  };
}
