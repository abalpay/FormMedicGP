export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  providerNumber: string;
  qualifications: string;
  practiceName: string;
  practiceAddress: string;
  practicePhone: string;
  practiceAbn: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDetails {
  customerName: string;
  dateOfBirth: string;
  crn?: string;
  address: string;
}

export interface FormField {
  label?: string;
  type: 'text' | 'date' | 'number' | 'radio' | 'checkbox';
  inputType?: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox';
  reviewControl?: 'auto' | 'select' | 'segmented';
  pdfField: string | string[];
  pdfFieldType?:
    | 'text'
    | 'checkbox'
    | 'radio'
    | 'split-date'
    | 'split-chars'
    | 'date-text';
  pdfOptions?: Record<string, string>;
  reviewEditable?: boolean;
  optionLabels?: Record<string, string>;
  validation?: {
    required?: boolean;
    enum?: string[];
    pattern?: string;
    min?: number;
    max?: number;
    maxLength?: number;
  };
  required?: boolean;
  optional?: boolean;
  options?: string[];
  default?: string;
  conditional?: string;
  llmInstruction?: string;
}

export interface FormSection {
  source: 'manual_entry' | 'doctor_profile' | 'llm_extraction';
  fields: Record<string, FormField>;
}

export interface FormSchema {
  formId: string;
  formName: string;
  formVersion?: string;
  templatePath: string;
  dictationTips?: string[];
  allowedUnmappedPdfFields?: string[];
  sections: Record<string, FormSection>;
  systemPromptAdditions: string;
}

export interface ExtractedFormData {
  [key: string]: string | number | boolean | string[] | null;
}

export interface ReviewFieldConfig {
  key: string;
  label: string;
  sectionId: string;
  sectionTitle: string;
  type: FormField['type'];
  inputType: NonNullable<FormField['inputType']>;
  reviewControl?: 'select' | 'segmented';
  required: boolean;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export interface ReviewSchema {
  formId: string;
  formName: string;
  sections: Array<{
    id: string;
    title: string;
    fields: ReviewFieldConfig[];
  }>;
}

export type FormStatus = 'active' | 'deferred';

export interface FormRegistryEntry {
  id: string;
  label: string;
  description: string;
  version: string;
  templatePath: string;
  schemaPath: string;
  status: FormStatus;
  deferred: boolean;
}

export interface FormCatalogItem {
  id: string;
  label: string;
  description: string;
  version: string;
  status: FormStatus;
  deferred: boolean;
  dictationTips: string[];
}
