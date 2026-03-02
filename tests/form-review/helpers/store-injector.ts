import type { Page } from '@playwright/test';
import type { FormFixture } from '../fixtures/types';

/**
 * Injects fixture state directly into the Zustand form-flow store exposed on
 * window.__formFlowStore. Must be called after the page has loaded the app
 * bundle (i.e. after navigating to any dashboard page).
 */
export async function injectFixture(page: Page, fixture: FormFixture): Promise<void> {
  // Wait for client-side hydration to expose the store
  await page.waitForFunction(() => !!(window as any).__formFlowStore, { timeout: 15_000 });

  await page.evaluate((f) => {
    const store = (window as any).__formFlowStore;
    if (!store) throw new Error('window.__formFlowStore is not defined — is NODE_ENV !== production?');

    store.getState().setFormType(f.formType, f.formLabel);
    store.getState().setPatientDetails(f.patientDetails);
    store.getState().setGuidedAnswers(f.guidedAnswers);
    store.getState().setTranscription(f.clinicalNarrative ?? '');
    store.getState().setStep('dictate');
  }, fixture);
}
