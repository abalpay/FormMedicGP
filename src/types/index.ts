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
  type: 'text' | 'date' | 'number' | 'radio' | 'checkbox';
  pdfField: string;
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
  templatePath: string;
  sections: Record<string, FormSection>;
  systemPromptAdditions: string;
}

export interface ExtractedFormData {
  [key: string]: string | number | boolean | string[] | null;
}
