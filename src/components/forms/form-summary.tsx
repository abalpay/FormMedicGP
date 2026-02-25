'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FormSummaryProps {
  data: Record<string, unknown>;
  missingFields?: string[];
}

const fieldLabels: Record<string, string> = {
  diagnosis: 'Diagnosis',
  workCapacity: 'Work Capacity',
  hoursPerWeek: 'Hours/Week',
  conditionDuration: 'Duration',
  incapacityStartDate: 'Start Date',
  incapacityEndDate: 'End Date',
  terminalIllness: 'Terminal Illness',
};

export function FormSummary({ data, missingFields = [] }: FormSummaryProps) {
  const isComplete = missingFields.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Extracted Fields</CardTitle>
        <Badge variant={isComplete ? 'default' : 'secondary'} className={isComplete ? 'bg-success text-success-foreground' : ''}>
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
      <CardContent>
        <div className="divide-y divide-border">
          {Object.entries(data).map(([key, value]) => {
            if (key === 'missingFields') return null;
            const label = fieldLabels[key] ?? key;
            return (
              <div key={key} className="flex items-start justify-between py-2.5">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                  {String(value ?? '—')}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
