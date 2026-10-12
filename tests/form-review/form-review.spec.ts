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
    await page.waitForTimeout(500); // Allow React to re-render with injected state

    // 4. Take dictation screenshot
    const dictationScreenshot = await page.screenshot({ fullPage: true });

    // 5. Intercept API responses to capture pdfBase64
    let capturedPdfBase64: string | null = null;
    let capturedApiError: string | null = null;

    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('/api/process-form') &&
        !url.includes('/regenerate')
      ) {
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

    // 6. Click "Analyze" button (new flow)
    const analyzeButton = page.getByRole('button', { name: 'Analyze' });
    await expect(analyzeButton).toBeVisible({ timeout: 5_000 });
    await analyzeButton.click();

    // 7. Wait for navigation to follow-up page (LLM call may take up to 90s)
    await page.waitForURL('**/follow-up', { timeout: 90_000 });

    if (capturedApiError) {
      throw new Error(`API returned error for ${formId}: ${capturedApiError}`);
    }

    // 8. Verify follow-up page elements
    const coverageCard = page.locator('text=AI Extraction Results');
    await expect(coverageCard).toBeVisible({ timeout: 5_000 });

    // 9. Take follow-up page screenshot
    await page.waitForTimeout(500);
    const followUpScreenshot = await page.screenshot({ fullPage: true });

    // 10. Click "Finalize" or "Continue to Review" button
    const finalizeButton = page.getByRole('button', { name: /Finalize|Continue to Review/ });
    await expect(finalizeButton).toBeVisible({ timeout: 5_000 });
    await finalizeButton.click();

    // 11. Wait for navigation to review page
    await page.waitForURL('**/forms/review', { timeout: 30_000 });

    // 12. Wait for PDF iframe to appear
    await page.waitForSelector('iframe[title="PDF Preview"]', { timeout: 30_000 });

    // 13. Take review page screenshot
    await page.waitForTimeout(1_500); // Let PDF iframe render
    const reviewScreenshot = await page.screenshot({ fullPage: true });

    // 14. Field audit — if we captured pdfBase64, audit it
    let auditRows = [];
    if (capturedPdfBase64) {
      auditRows = await runFieldAudit(formId, capturedPdfBase64);
    } else {
      console.warn(`[${formId}] pdfBase64 not captured from API response — skipping field audit`);
    }

    // 15. Generate HTML report
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
