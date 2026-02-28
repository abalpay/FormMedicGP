import type { FormField, FormSchema } from '@/types';

const DOCTOR_SCHEMA_TO_PROFILE_KEY: Record<string, keyof DoctorProfileLike> = {
  doctorName: 'name',
  providerNumber: 'providerNumber',
  qualifications: 'qualifications',
  surgeryName: 'practiceName',
  doctorAddress1: 'practiceAddress',
  doctorAddress2: 'practiceAddress',
  doctorAddress3: 'practiceAddress',
  doctorPostcode: 'practiceAddress',
  phone: 'practicePhone',
  doctorPhoneAreaCode: 'practicePhone',
  doctorPhoneNumber: 'practicePhone',
};

interface DoctorProfileLike {
  name?: string;
  providerNumber?: string;
  qualifications?: string;
  practiceName?: string;
  practiceAddress?: string;
  practicePhone?: string;
}

function isRequiredField(field: FormField): boolean {
  return Boolean(field.required || field.validation?.required);
}

function mapDoctorFieldToProfileKey(fieldKey: string): keyof DoctorProfileLike | null {
  return DOCTOR_SCHEMA_TO_PROFILE_KEY[fieldKey] ?? null;
}

export function getRequiredDoctorProfileFields(
  schema: Pick<FormSchema, 'sections'>
): Array<keyof DoctorProfileLike> {
  const doctorSection = Object.values(schema.sections).find(
    (section) => section.source === 'doctor_profile'
  );

  if (!doctorSection) {
    return [];
  }

  const required: Array<keyof DoctorProfileLike> = [];
  const seen = new Set<keyof DoctorProfileLike>();

  for (const [fieldKey, field] of Object.entries(doctorSection.fields)) {
    if (!isRequiredField(field)) {
      continue;
    }

    const profileKey = mapDoctorFieldToProfileKey(fieldKey);
    if (!profileKey || seen.has(profileKey)) {
      continue;
    }

    seen.add(profileKey);
    required.push(profileKey);
  }

  return required;
}

export function getMissingDoctorProfileFields(
  schema: Pick<FormSchema, 'sections'>,
  profile: DoctorProfileLike | null | undefined
): Array<keyof DoctorProfileLike> {
  if (!profile) {
    return getRequiredDoctorProfileFields(schema);
  }

  return getRequiredDoctorProfileFields(schema).filter((key) => {
    const value = profile[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });
}

export function formatDoctorProfileFieldLabel(
  field: keyof DoctorProfileLike
): string {
  switch (field) {
    case 'name':
      return 'name';
    case 'providerNumber':
      return 'provider number';
    case 'qualifications':
      return 'qualifications';
    case 'practiceName':
      return 'practice name';
    case 'practiceAddress':
      return 'practice address';
    case 'practicePhone':
      return 'practice phone';
    default:
      return field;
  }
}

