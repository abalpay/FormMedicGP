import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { injectFixture } from './helpers/store-injector';
import { runFieldAudit } from './helpers/field-audit';
import { generateReport } from './helpers/report-generator';
import type { FormFixture } from './fixtures/types';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, 'output');

function loadFixtures(): { formId: string; fixture: FormFixture }[] {
  const formIds = ['SU415', 'SA478', 'SA332A', 'MA002', 'CAPACITY'];
  return formIds.map((formId) => {
    const fixturePath = path.join(FIXTURES_DIR, `${formId}.json`);
    const fixture: FormFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    return { formId, fixture };
  });
}

for (const { formId, fixture } of loadFixtures()) {
  test(`${formId} — ${fixture.scenario}`, async ({ page }) => {
    // 1. Navigate to dictate page — storageState handles auth
    await page.goto('/dashboard/dictate');

    // 2. Inject fixture state into Zustand store
    await injectFixture(page, fixture);

    // 3. Wait for the dictate page to render with the selected form
    //    The guided dictation panel appears when a form with dictationGuide is selected
    await page.waitForTimeout(500); // Allow React to re-render with injected state

    // 4. Take dictation screenshot
    const dictationScreenshot = await page.screenshot({ fullPage: true });

    // 5. Intercept the /api/process-form response to capture pdfBase64
    let capturedPdfBase64: string | null = null;
    let capturedApiError: string | null = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/process-form') && !response.url().includes('/regenerate')) {
        try {
          const body = await response.json();
          if (body.pdfBase64) {
            capturedPdfBase64 = body.pdfBase64;
          }
          if (body.error) {
            capturedApiError = body.error;
          }
        } catch {
          // ignore parse errors
        }
      }
    });

    // 6. Click "Process Form" button
    const processButton = page.getByRole('button', { name: 'Process Form' });
    await expect(processButton).toBeVisible({ timeout: 5_000 });
    await processButton.click();

    // 7. Wait for navigation to review page (LLM call may take up to 90s)
    await page.waitForURL('**/forms/review', { timeout: 90_000 });

    if (capturedApiError) {
      throw new Error(`API returned error for ${formId}: ${capturedApiError}`);
    }

    // 8. Wait for PDF iframe to appear (usePdfPreview regenerates a preview URL)
    await page.waitForSelector('iframe[title="PDF Preview"]', { timeout: 30_000 });

    // 9. Take review page screenshot
    await page.waitForTimeout(1_500); // Let PDF iframe render
    const reviewScreenshot = await page.screenshot({ fullPage: true });

    // 10. Field audit — if we captured pdfBase64, audit it; otherwise skip audit
    let auditRows = [];
    if (capturedPdfBase64) {
      auditRows = await runFieldAudit(formId, capturedPdfBase64);
    } else {
      console.warn(`[${formId}] pdfBase64 not captured from API response — skipping field audit`);
    }

    // 11. Generate HTML report
    const reportPath = generateReport({
      formId,
      fixture,
      dictationScreenshot,
      reviewScreenshot,
      auditRows,
      outputDir: OUTPUT_DIR,
    });

    console.log(`[${formId}] Report saved to: ${reportPath}`);

    // Assertions
    expect(capturedPdfBase64, `${formId}: pdfBase64 should be present in API response`).toBeTruthy();
    const filledCount = auditRows.filter((r) => r.status === 'filled').length;
    const totalMapped = auditRows.filter((r) => r.status !== 'no_pdf_field').length;
    console.log(`[${formId}] Fill rate: ${filledCount}/${totalMapped} fields`);

    // At minimum expect some fields to be filled
    expect(filledCount, `${formId}: expected at least some fields to be filled`).toBeGreaterThan(0);
  });
}
