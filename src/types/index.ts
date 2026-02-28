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
  caredPersonName?: string;
  caredPersonDateOfBirth?: string;
  caredPersonCrn?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface Patient {
  id: string;
  doctorId: string;
  customerName: string;
  dateOfBirth: string | null;
  crn: string;
  address: string;
  phone: string;
  email: string;
  caredPersonName: string;
  caredPersonDob: string | null;
  caredPersonCrn: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientListItem {
  id: string;
  customerName: string;
  dateOfBirth: string | null;
  address: string;
  updatedAt: string;
}

export interface SavedForm {
  id: string;
  doctorId: string;
  patientId: string | null;
  formType: string;
  formName: string;
  extractedData: Record<string, unknown>;
  pdfBase64: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type SavedFormMeta = Omit<SavedForm, 'pdfBase64'>;

export interface SavedFormSummary {
  id: string;
  formType: string;
  formName: string;
  patientName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  label?: string;
  type: 'text' | 'date' | 'number' | 'radio' | 'checkbox';
  inputType?: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox';
  reviewControl?: 'auto' | 'select' | 'segmented';
  reviewGroup?: string;
  pdfField: string | string[];
  pdfFieldType?:
    | 'text'
    | 'checkbox'
    | 'radio'
    | 'checkbox-group'
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
    dateMax?: 'today' | string;
  };
  required?: boolean;
  optional?: boolean;
  options?: string[];
  default?: string;
  conditional?: string;
  hiddenWhenEmpty?: string;
  emptyHint?: string;
  tooltip?: string;
  highlight?: boolean;
  llmInstruction?: string;
  /** When this text field is non-empty, auto-tick the named PDF checkbox. */
  linkedCheckbox?: string;
}

export interface FormSection {
  source: 'manual_entry' | 'doctor_profile' | 'llm_extraction';
  fields: Record<string, FormField>;
}

export interface DictationGuideOption {
  value: string;
  label: string;
}

export interface DictationGuideQuestion {
  key: string;
  label: string;
  inputType: 'segmented' | 'select' | 'date' | 'textarea' | 'number';
  description?: string;
  placeholder?: string;
  options?: DictationGuideOption[];
  targetFieldKey?: string;
  targetFieldKeys?: string[];
  valueOverrides?: Record<string, Record<string, string>>;
  requiredForBestFill?: boolean;
  visibleWhen?: { key: string; equals: string | string[] };
  defaultValue?: string;
}

export interface DictationGuideSection {
  id: string;
  title: string;
  description?: string;
  questions: DictationGuideQuestion[];
}

export interface FormSchema {
  formId: string;
  formName: string;
  formVersion?: string;
  templatePath: string;
  dictationTips?: string[];
  dictationGuide?: DictationGuideSection[];
  allowedUnmappedPdfFields?: string[];
  advancedUnmappedPdfFields?: string[];
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
  advanced?: boolean;
  group?: string;
  required: boolean;
  conditional?: string;
  hiddenWhenEmpty?: string;
  emptyHint?: string;
  tooltip?: string;
  highlight?: boolean;
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
    initiallyCollapsed?: boolean;
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
  dictationGuide?: DictationGuideSection[];
}
