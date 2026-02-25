import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateReviewDownloadState,
  hasUnappliedEdits,
} from '../src/lib/review-download-gating.ts';

test('hasUnappliedEdits detects user edits relative to last generated payload', () => {
  const initial = {
    firstName: 'John',
    familyName: 'Smith',
    treatment: 'Physio weekly',
  };

  const edited = {
    ...initial,
    treatment: 'Physio twice weekly',
  };

  assert.equal(hasUnappliedEdits(initial, initial), false);
  assert.equal(hasUnappliedEdits(initial, edited), true);
});

test('download is blocked when there are validation errors', () => {
  const state = evaluateReviewDownloadState({
    hasPdfBlob: true,
    validationErrors: { firstName: 'Required' },
    hasUnappliedEdits: false,
  });

  assert.equal(state.canDownload, false);
  assert.equal(state.reason, 'validation_errors');
});

test('download is blocked when there are unapplied edits', () => {
  const state = evaluateReviewDownloadState({
    hasPdfBlob: true,
    validationErrors: {},
    hasUnappliedEdits: true,
  });

  assert.equal(state.canDownload, false);
  assert.equal(state.reason, 'unapplied_edits');
});

test('download is allowed only when pdf exists, no errors, and no unapplied edits', () => {
  const state = evaluateReviewDownloadState({
    hasPdfBlob: true,
    validationErrors: {},
    hasUnappliedEdits: false,
  });

  assert.equal(state.canDownload, true);
  assert.equal(state.reason, null);
});
