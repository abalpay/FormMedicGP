function normalizeTitle(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function shouldRenderPatientDetailsSectionTitle(
  formTitle: string,
  sectionTitle: string,
  totalSections: number
): boolean {
  if (totalSections > 1) {
    return true;
  }

  return normalizeTitle(formTitle) !== normalizeTitle(sectionTitle);
}
