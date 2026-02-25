'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FormSummaryProps {
  data: Record<string, unknown>;
  missingFields?: string[];
}

const EXCLUDED_KEYS = new Set(['missingFields']);

const SECTIONS = [
  {
    title: 'Clinical Assessment',
    keys: [
      'primaryDiagnosis',
      'primaryOnsetDate',
      'primaryPrognosis',
      'terminalIllness',
      'seriousIllness',
      'secondaryDiagnosis',
      'secondaryOnsetDate',
      'secondaryPrognosis',
      'functionalImpact',
      'treatment',
      'otherConditions',
      'incapacityStartDate',
      'incapacityEndDate',
      'workCapacity',
      'hoursPerWeek',
    ],
  },
  {
    title: 'Patient Details',
    keys: [
      'familyName',
      'firstName',
      'secondName',
      'dateOfBirth',
      'crn',
      'address1',
      'address2',
      'address3',
      'postcode',
    ],
  },
  {
    title: 'Doctor Details',
    keys: [
      'doctorName',
      'qualifications',
      'providerNumber',
      'surgeryName',
      'doctorAddress1',
      'doctorAddress2',
      'doctorAddress3',
      'doctorPostcode',
      'phone',
      'dateSigned',
    ],
  },
] as const;

const fieldLabels: Record<string, string> = {
  primaryDiagnosis: 'Primary Diagnosis',
  primaryOnsetDate: 'Onset Date',
  primaryPrognosis: 'Prognosis',
  terminalIllness: 'Terminal Illness',
  seriousIllness: 'Serious Illness',
  secondaryDiagnosis: 'Secondary Diagnosis',
  secondaryOnsetDate: 'Onset Date',
  secondaryPrognosis: 'Prognosis',
  functionalImpact: 'Functional Impact',
  treatment: 'Treatment',
  otherConditions: 'Other Conditions',
  incapacityStartDate: 'Incapacity Start Date',
  incapacityEndDate: 'Incapacity End Date',
  workCapacity: 'Work Capacity',
  hoursPerWeek: 'Hours per Week',
  familyName: 'Family Name',
  firstName: 'First Name',
  secondName: 'Second Name',
  dateOfBirth: 'Date of Birth',
  crn: 'CRN',
  address1: 'Address Line 1',
  address2: 'Address Line 2',
  address3: 'Address Line 3',
  postcode: 'Postcode',
  doctorName: 'Doctor Name',
  qualifications: 'Qualifications',
  providerNumber: 'Provider Number',
  surgeryName: 'Surgery / Practice Name',
  doctorAddress1: 'Address Line 1',
  doctorAddress2: 'Address Line 2',
  doctorAddress3: 'Address Line 3',
  doctorPostcode: 'Postcode',
  phone: 'Phone',
  dateSigned: 'Date Signed',
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;

  const str = String(value);

  // ISO date → AU format
  if (ISO_DATE_RE.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  }

  // yes/no
  if (str === 'yes') return 'Yes';
  if (str === 'no') return 'No';

  // snake_case enum → Title Case
  if (str.includes('_')) {
    return str
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return str;
}

export function FormSummary({ data, missingFields = [] }: FormSummaryProps) {
  const isComplete = missingFields.length === 0;

  // Collect keys that don't belong to any section
  const sectionKeySet = new Set<string>(SECTIONS.flatMap((s) => [...s.keys]));
  const ungroupedKeys = Object.keys(data).filter(
    (k) => !sectionKeySet.has(k) && !EXCLUDED_KEYS.has(k),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Extracted Fields</CardTitle>
        <Badge
          variant={isComplete ? 'default' : 'secondary'}
          className={isComplete ? 'bg-success text-success-foreground' : ''}
        >
          {isComplete ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              {missingFields.length} missing
            </>
          )}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {SECTIONS.map((section) => {
          const rows = section.keys
            .filter((key) => key in data && formatValue(data[key]) !== null)
            .map((key) => ({ key, label: fieldLabels[key] ?? key, display: formatValue(data[key])! }));

          if (rows.length === 0) return null;

          return (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {section.title}
              </h3>
              <div className="divide-y divide-border">
                {rows.map(({ key, label, display }) => (
                  <div key={key} className="flex items-start justify-between py-2.5">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                      {display}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {ungroupedKeys.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Other
            </h3>
            <div className="divide-y divide-border">
              {ungroupedKeys
                .filter((key) => formatValue(data[key]) !== null)
                .map((key) => (
                  <div key={key} className="flex items-start justify-between py-2.5">
                    <span className="text-sm text-muted-foreground">
                      {fieldLabels[key] ?? key}
                    </span>
                    <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                      {formatValue(data[key])}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
