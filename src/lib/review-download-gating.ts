type Comparable =
  | null
  | undefined
  | string
  | number
  | boolean
  | Comparable[]
  | { [key: string]: Comparable };

function deepEqual(a: Comparable, b: Comparable): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== typeof b) return false;
  if (a == null || b == null) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object') {
    if (Array.isArray(b)) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b as Record<string, Comparable>);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual((a as Record<string, Comparable>)[key], (b as Record<string, Comparable>)[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
}

export function hasUnappliedEdits(
  lastAppliedData: Record<string, unknown> | null | undefined,
  currentData: Record<string, unknown> | null | undefined
): boolean {
  if (!lastAppliedData && !currentData) return false;
  if (!lastAppliedData || !currentData) return true;
  return !deepEqual(
    lastAppliedData as Comparable,
    currentData as Comparable
  );
}

interface EvaluateReviewDownloadStateInput {
  hasPdfBlob: boolean;
  validationErrors: Record<string, string>;
  hasUnappliedEdits: boolean;
}

type ReviewDownloadBlockReason =
  | 'missing_pdf'
  | 'validation_errors'
  | 'unapplied_edits';

export function evaluateReviewDownloadState({
  hasPdfBlob,
  validationErrors,
  hasUnappliedEdits: unapplied,
}: EvaluateReviewDownloadStateInput): {
  canDownload: boolean;
  reason: ReviewDownloadBlockReason | null;
} {
  if (!hasPdfBlob) {
    return { canDownload: false, reason: 'missing_pdf' };
  }
  if (Object.keys(validationErrors).length > 0) {
    return { canDownload: false, reason: 'validation_errors' };
  }
  if (unapplied) {
    return { canDownload: false, reason: 'unapplied_edits' };
  }
  return { canDownload: true, reason: null };
}
