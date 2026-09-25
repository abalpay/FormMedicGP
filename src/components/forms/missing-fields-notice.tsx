import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import type { ReviewSchema } from '@/types';

interface MissingFieldsNoticeProps {
  missingFields: string[];
  reviewSchema: ReviewSchema | null;
  data: Record<string, unknown>;
}

/** Required fields the LLM couldn't fill that are still blank. */
export function MissingFieldsNotice({ missingFields, reviewSchema, data }: MissingFieldsNoticeProps) {
  const outstandingMissing = useMemo(() => {
    const labels = new Map<string, string>();
    for (const section of reviewSchema?.sections ?? []) {
      for (const field of section.fields) labels.set(field.key, field.label);
    }
    return missingFields
      .filter((key) => {
        const value = data[key];
        return value == null || String(value).trim() === '';
      })
      .map((key) => labels.get(key) ?? key);
  }, [missingFields, reviewSchema, data]);

  if (outstandingMissing.length === 0) return null;

  return (
    <div className="flex gap-2.5 p-3 rounded-lg border border-warning/30 bg-warning/5" role="status">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-foreground">
          {outstandingMissing.length} required field{outstandingMissing.length === 1 ? '' : 's'}{' '}
          {outstandingMissing.length === 1 ? "wasn't" : "weren't"} in your dictation
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {outstandingMissing.join(', ')}
        </p>
      </div>
    </div>
  );
}
