import { chromium } from '@playwright/test';
import * as path from 'path';

export default async function globalSetup() {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!email || !password) {
    throw new Error(
      'E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.local to run form-review tests.'
    );
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}/login`);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('[data-testid="login-submit"]');

  // Wait for redirect to dashboard after login (up to 30s)
  try {
    await page.waitForURL('**/dashboard**', { timeout: 30_000 });
  } catch {
    // Capture current state for diagnosis
    const screenshotPath = path.join(process.cwd(), 'tests/form-review/output/login-debug.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const currentUrl = page.url();
    await browser.close();
    throw new Error(
      `Login failed — page did not navigate to dashboard within 30s.\n` +
      `Current URL: ${currentUrl}\n` +
      `Screenshot saved to: ${screenshotPath}`
    );
  }

  await context.storageState({ path: 'playwright/.auth/user.json' });
  await browser.close();
}
