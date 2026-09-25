export interface RedactionSegment {
  /** Original text for this span. */
  text: string;
  /** Set when de-identification replaced `text` with this placeholder. */
  placeholder?: string;
}

const PLACEHOLDER_RE = /(\[[A-Z_]+\])/g;

/**
 * Aligns the original text with its de-identified version: the literal runs
 * between placeholders are unchanged substrings of the original, so whatever
 * sits between them there is the redacted identifier.
 */
export function buildRedactionSegments(original: string, deidentifiedText: string): RedactionSegment[] {
  const parts = deidentifiedText.split(PLACEHOLDER_RE);
  const segments: RedactionSegment[] = [];
  let cursor = 0;

  for (let i = 0; i < parts.length; i += 2) {
    const literal = parts[i];
    if (literal) {
      segments.push({ text: literal });
      cursor += literal.length;
    }
    const placeholder = parts[i + 1];
    if (!placeholder) break;
    const next = parts[i + 2];
    const isLast = i + 2 === parts.length - 1;
    // Last placeholder ends where the trailing literal starts; otherwise stop at the next literal run.
    // Directly adjacent placeholders can't be split, so the first gets '' and
    // the next one carries both originals (final redacted output is unaffected).
    const end = isLast ? original.length - next.length : next ? original.indexOf(next, cursor) : cursor;
    segments.push({ text: original.slice(cursor, end === -1 ? original.length : end), placeholder });
    cursor = end === -1 ? original.length : end;
  }
  return segments;
}
