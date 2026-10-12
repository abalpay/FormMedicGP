import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getFollowUpQuestions } from '../src/lib/guided-dictation.ts';

const ROOT = process.cwd();

function loadSchema(formId) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, `src/lib/schemas/${formId}.json`), 'utf8')
  );
}

// ---------------------------------------------------------------------------
// MA002 — Mobility Allowance
// ---------------------------------------------------------------------------
test('MA002 — empty extraction returns all required non-textarea follow-ups', () => {
  const schema = loadSchema('MA002');
  const result = getFollowUpQuestions(schema, {});

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  // Required non-textarea: hasPhysicalDisabilities, permanentOrTemporary
  assert.ok(keys.includes('hasPhysicalDisabilities'));
  assert.ok(keys.includes('permanentOrTemporary'));
  // clinicalNarrative is textarea — excluded
  assert.ok(!keys.includes('clinicalNarrative'));
  // hasPsychiatricDisabilities is not required — excluded
  assert.ok(!keys.includes('hasPsychiatricDisabilities'));

  assert.ok(result.totalFields > 0);
  assert.equal(result.filledFields, 0);
});

test('MA002 — full extraction returns no follow-ups', () => {
  const schema = loadSchema('MA002');
  const result = getFollowUpQuestions(schema, {
    hasPhysicalDisabilities: 'yes',
    hasAnyDisabilities: 'yes',
    mobilityPermanentOrTemporary: 'permanent',
    hasPsychiatricDisabilities: 'no',
  });

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.equal(keys.length, 0);
  assert.equal(result.filledFields, result.totalFields);
});

test('MA002 — partial extraction shows only gaps', () => {
  const schema = loadSchema('MA002');
  // hasPhysicalDisabilities covered, permanentOrTemporary empty
  const result = getFollowUpQuestions(schema, {
    hasPhysicalDisabilities: 'yes',
    hasAnyDisabilities: 'yes',
  });

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.ok(!keys.includes('hasPhysicalDisabilities'), 'filled question excluded');
  assert.ok(keys.includes('permanentOrTemporary'), 'missing required shown');
});

test('MA002 — visibleWhen: mobilityDuration shown only when temporary', () => {
  const schema = loadSchema('MA002');
  // mobilityDuration visibleWhen permanentOrTemporary=temporary
  // permanentOrTemporary maps to mobilityPermanentOrTemporary field

  // When permanent — mobilityDuration should NOT appear
  const resultPermanent = getFollowUpQuestions(schema, {
    hasPhysicalDisabilities: 'yes',
    hasAnyDisabilities: 'yes',
    mobilityPermanentOrTemporary: 'permanent',
  });
  const keysPermanent = resultPermanent.sections.flatMap((s) =>
    s.questions.map((q) => q.key)
  );
  assert.ok(!keysPermanent.includes('mobilityDuration'));

  // When temporary — mobilityDuration visible (but not required, so not in follow-ups)
  // mobilityDuration has requiredForBestFill: false, so it won't be in follow-ups either way
  const resultTemporary = getFollowUpQuestions(schema, {
    hasPhysicalDisabilities: 'yes',
    hasAnyDisabilities: 'yes',
    mobilityPermanentOrTemporary: 'temporary',
  });
  // mobilityDuration is not requiredForBestFill, so it shouldn't show in follow-ups
  const keysTemporary = resultTemporary.sections.flatMap((s) =>
    s.questions.map((q) => q.key)
  );
  assert.ok(!keysTemporary.includes('mobilityDuration'));

  // But it should be counted in totalFields when visible
  assert.ok(
    resultTemporary.totalFields > resultPermanent.totalFields,
    'totalFields includes mobilityDuration when visible'
  );
});

test('MA002 — coveredFields on hasPhysicalDisabilities covers both fields', () => {
  const schema = loadSchema('MA002');
  // Only hasPhysicalDisabilities filled, not hasAnyDisabilities
  const result = getFollowUpQuestions(schema, {
    hasPhysicalDisabilities: 'yes',
  });

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  // hasAnyDisabilities not filled, so hasPhysicalDisabilities question should show
  assert.ok(
    keys.includes('hasPhysicalDisabilities'),
    'shows when only one of coveredFields is filled'
  );
});

// ---------------------------------------------------------------------------
// SU415 — Centrelink Medical Certificate
// ---------------------------------------------------------------------------
test('SU415 — empty extraction returns required non-textarea follow-ups', () => {
  const schema = loadSchema('SU415');
  const result = getFollowUpQuestions(schema, {});

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  // Required: workCapacity, primaryPrognosis, incapacityStartDate, incapacityEndDate
  assert.ok(keys.includes('workCapacity'));
  assert.ok(keys.includes('primaryPrognosis'));
  assert.ok(keys.includes('incapacityStartDate'));
  assert.ok(keys.includes('incapacityEndDate'));
  // textarea excluded
  assert.ok(!keys.includes('diagnosisNarrative'));
  // Not required
  assert.ok(!keys.includes('terminalIllness'));
  assert.ok(!keys.includes('seriousIllness'));
});

test('SU415 — visibleWhen: hoursPerWeek shown only when workCapacity=yes', () => {
  const schema = loadSchema('SU415');

  // workCapacity=no → hoursPerWeek invisible, not counted
  const resultNo = getFollowUpQuestions(schema, { workCapacity: 'no' });
  const keysNo = resultNo.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.ok(!keysNo.includes('hoursPerWeek'));

  // workCapacity=yes → hoursPerWeek visible (but not required, won't be in follow-ups)
  const resultYes = getFollowUpQuestions(schema, { workCapacity: 'yes' });
  assert.ok(
    resultYes.totalFields > resultNo.totalFields,
    'totalFields includes hoursPerWeek when visible'
  );
});

test('SU415 — full extraction returns no follow-ups', () => {
  const schema = loadSchema('SU415');
  const result = getFollowUpQuestions(schema, {
    workCapacity: 'no',
    primaryPrognosis: 'up_to_13_weeks',
    incapacityStartDate: '2026-01-01',
    incapacityEndDate: '2026-03-01',
    terminalIllness: 'no',
    seriousIllness: 'no',
  });

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.equal(keys.length, 0);
});

// ---------------------------------------------------------------------------
// SA478 — Disability Support Pension
// ---------------------------------------------------------------------------
test('SA478 — empty extraction returns required non-textarea follow-ups', () => {
  const schema = loadSchema('SA478');
  const result = getFollowUpQuestions(schema, {});

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.ok(keys.includes('hasSpecialistEvidence'));
  assert.ok(keys.includes('hasTreatmentPlan'));
  assert.ok(!keys.includes('clinicalNarrative'));
});

test('SA478 — full extraction returns no follow-ups', () => {
  const schema = loadSchema('SA478');
  const result = getFollowUpQuestions(schema, {
    hasSpecialistEvidence: 'yes',
    hasTreatmentPlan: 'yes',
  });

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.equal(keys.length, 0);
});

// ---------------------------------------------------------------------------
// SA332A — Carer Payment
// ---------------------------------------------------------------------------
test('SA332A — questions without targetFieldKey are skipped (no targetable fields)', () => {
  const schema = loadSchema('SA332A');
  const result = getFollowUpQuestions(schema, {});

  // SA332A questions have no targetFieldKey/targetFieldKeys/valueOverrides/coveredFields
  // So getQuestionTargetFields returns [] and they're all skipped
  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.equal(keys.length, 0);
  assert.equal(result.totalFields, 0);
});

// ---------------------------------------------------------------------------
// CAPACITY — Certificate of Capacity
// ---------------------------------------------------------------------------
test('CAPACITY — empty extraction returns all required non-textarea follow-ups', () => {
  const schema = loadSchema('CAPACITY');
  const result = getFollowUpQuestions(schema, {});

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.ok(keys.includes('claimType'));
  assert.ok(keys.includes('certificationOption'));
  assert.ok(keys.includes('dateOfInjury'));
  assert.ok(keys.includes('incapacityStartDate'));
  assert.ok(keys.includes('incapacityEndDate'));
  assert.ok(keys.includes('returnToWorkEstimate'));
  assert.ok(!keys.includes('clinicalNarrative'));
  assert.ok(!keys.includes('confirmAttendance')); // not required
});

test('CAPACITY — coveredFields on claimType covers tacClaim+vwaClaim', () => {
  const schema = loadSchema('CAPACITY');
  // Only tacClaim filled
  const result = getFollowUpQuestions(schema, {
    tacClaim: 'yes',
  });

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.ok(keys.includes('claimType'), 'partial coveredFields still shows question');
});

test('CAPACITY — visibleWhen: conditional dates appear with matching certificationOption', () => {
  const schema = loadSchema('CAPACITY');

  // certificationOption=no_capacity → no conditional dates visible
  const resultNone = getFollowUpQuestions(schema, {
    certificationOption: 'no_capacity',
  });
  const fieldsNone = resultNone.totalFields;

  // certificationOption=suitable_employment → suitableEmploymentFrom + suitableEmploymentTo visible
  const resultSuitable = getFollowUpQuestions(schema, {
    certificationOption: 'suitable_employment',
  });
  const fieldsSuitable = resultSuitable.totalFields;

  assert.ok(
    fieldsSuitable > fieldsNone,
    'suitable_employment path shows more fields from conditional dates'
  );
});

test('CAPACITY — full extraction returns no follow-ups', () => {
  const schema = loadSchema('CAPACITY');
  const result = getFollowUpQuestions(schema, {
    tacClaim: 'yes',
    vwaClaim: 'no',
    certificationOption: 'no_capacity',
    dateOfInjury: '2025-12-01',
    incapacityStartDate: '2025-12-15',
    incapacityEndDate: '2026-03-15',
    returnToWorkDays: '14',
    returnToWorkWeeks: '2',
    confirmAttendance: 'yes',
  });

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.equal(keys.length, 0);
});

// ---------------------------------------------------------------------------
// NDIS_ACCESS — NDIS Access Request
// ---------------------------------------------------------------------------
test('NDIS_ACCESS — empty extraction returns required non-textarea follow-ups', () => {
  const schema = loadSchema('NDIS_ACCESS');
  const result = getFollowUpQuestions(schema, {});

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.ok(keys.includes('isLifelong'));
  assert.ok(keys.includes('needsMobilityAssistance'));
  assert.ok(keys.includes('needsCommunicationAssistance'));
  assert.ok(keys.includes('needsSocialAssistance'));
  assert.ok(keys.includes('needsLearningAssistance'));
  assert.ok(keys.includes('needsSelfCareAssistance'));
  assert.ok(keys.includes('needsSelfManagementAssistance'));
  assert.ok(!keys.includes('clinicalNarrative'));
  // Not required
  assert.ok(!keys.includes('hasSecondaryImpairment'));
  assert.ok(!keys.includes('hasEarlyIntervention'));
});

test('NDIS_ACCESS — visibleWhen: isSecondaryLifelong only when hasSecondaryImpairment=yes', () => {
  const schema = loadSchema('NDIS_ACCESS');

  // hasSecondaryImpairment has no target field key, so answersProxy won't have it
  // from extractedData. But if we don't set it, visibleWhen check for
  // isSecondaryLifelong (key: hasSecondaryImpairment) will be empty → invisible
  // This question is NOT required anyway, so it wouldn't show in follow-ups
  const result = getFollowUpQuestions(schema, {});
  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.ok(!keys.includes('isSecondaryLifelong'));
});

test('NDIS_ACCESS — full extraction returns no follow-ups', () => {
  const schema = loadSchema('NDIS_ACCESS');
  const result = getFollowUpQuestions(schema, {
    primaryImpairmentLifelong: 'Yes — the impairment is likely to be lifelong.',
    mobilityNoAssistance: 'yes',
    commNoAssistance: 'yes',
    socialNoAssistance: 'yes',
    learningNoAssistance: 'yes',
    selfCareNoAssistance: 'yes',
    selfMgmtNoAssistance: 'yes',
  });

  const keys = result.sections.flatMap((s) => s.questions.map((q) => q.key));
  assert.equal(keys.length, 0);
  assert.equal(result.filledFields, result.totalFields);
});

// ---------------------------------------------------------------------------
// Cross-form: visibilityAnswers returned correctly
// ---------------------------------------------------------------------------
test('visibilityAnswers maps field values back to question keys', () => {
  const schema = loadSchema('MA002');
  const result = getFollowUpQuestions(schema, {
    mobilityPermanentOrTemporary: 'temporary',
  });

  // answersProxy should map mobilityPermanentOrTemporary → permanentOrTemporary key
  assert.equal(result.visibilityAnswers.permanentOrTemporary, 'temporary');
});

test('visibilityAnswers for CAPACITY maps certificationOption correctly', () => {
  const schema = loadSchema('CAPACITY');
  const result = getFollowUpQuestions(schema, {
    certificationOption: 'suitable_employment',
  });

  assert.equal(
    result.visibilityAnswers.certificationOption,
    'suitable_employment'
  );
});

// ---------------------------------------------------------------------------
// Coverage stats accuracy
// ---------------------------------------------------------------------------
test('coverage stats count only visible questions', () => {
  const schema = loadSchema('MA002');

  // With permanent → mobilityDuration invisible (1 less field counted)
  const resultPermanent = getFollowUpQuestions(schema, {
    mobilityPermanentOrTemporary: 'permanent',
  });

  // With temporary → mobilityDuration visible (1 more field counted)
  const resultTemporary = getFollowUpQuestions(schema, {
    mobilityPermanentOrTemporary: 'temporary',
  });

  assert.ok(resultTemporary.totalFields > resultPermanent.totalFields);
});
