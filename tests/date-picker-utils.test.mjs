import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildYearPage,
  calendarDateToIso,
  clampDateToBounds,
  formatIsoDate,
  getDefaultFocusedIso,
  getYearPageStart,
  isoToCalendarDate,
  parseIsoDateStrict,
  resolveBounds,
  shiftYearPage,
} from '../src/lib/date-picker-utils.ts';

test('parseIsoDateStrict parses a valid ISO date', () => {
  const parsed = parseIsoDateStrict('2026-02-25');

  assert.ok(parsed instanceof Date);
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 1);
  assert.equal(parsed.getDate(), 25);
});

test('parseIsoDateStrict rejects impossible ISO dates', () => {
  const parsed = parseIsoDateStrict('2026-02-31');

  assert.equal(parsed, undefined);
});

test('parseIsoDateStrict rejects non-ISO date strings', () => {
  assert.equal(parseIsoDateStrict('25/02/2026'), undefined);
  assert.equal(parseIsoDateStrict('2026-2-5'), undefined);
});

test('formatIsoDate formats date as yyyy-MM-dd', () => {
  const value = formatIsoDate(new Date(2026, 1, 5));

  assert.equal(value, '2026-02-05');
});

test('clampDateToBounds enforces min and max date bounds', () => {
  const minDate = new Date(1920, 0, 1);
  const maxDate = new Date(2026, 1, 25);

  const tooEarly = clampDateToBounds(new Date(1900, 0, 1), minDate, maxDate);
  const tooLate = clampDateToBounds(new Date(2100, 0, 1), minDate, maxDate);

  assert.equal(formatIsoDate(tooEarly), '1920-01-01');
  assert.equal(formatIsoDate(tooLate), '2026-02-25');
});

test('isoToCalendarDate and calendarDateToIso round-trip a valid date', () => {
  const calendarDate = isoToCalendarDate('2026-02-25');

  assert.ok(calendarDate);
  assert.equal(calendarDateToIso(calendarDate), '2026-02-25');
});

test('isoToCalendarDate returns undefined for invalid iso values', () => {
  assert.equal(isoToCalendarDate('2026-02-31'), undefined);
  assert.equal(isoToCalendarDate('10/02/2026'), undefined);
});

test('resolveBounds returns dob defaults with max at today', () => {
  const today = new Date(2026, 1, 25);
  const bounds = resolveBounds('dob', undefined, undefined, today);

  assert.equal(bounds.minValue, '1906-01-01');
  assert.equal(bounds.maxValue, '2026-02-25');
});

test('resolveBounds applies explicit overrides when provided', () => {
  const bounds = resolveBounds(
    'general',
    '2001-04-03',
    '2005-08-15',
    new Date(2026, 1, 25)
  );

  assert.equal(bounds.minValue, '2001-04-03');
  assert.equal(bounds.maxValue, '2005-08-15');
});

test('resolveBounds normalizes invalid range order to safe single date', () => {
  const bounds = resolveBounds(
    'general',
    '2030-01-01',
    '2028-12-31',
    new Date(2026, 1, 25)
  );

  assert.equal(bounds.minValue, '2028-12-31');
  assert.equal(bounds.maxValue, '2028-12-31');
});

test('getYearPageStart and shiftYearPage navigate deterministic 12-year pages', () => {
  assert.equal(getYearPageStart(2026), 2020);
  assert.equal(shiftYearPage(2020, 1), 2032);
  assert.equal(shiftYearPage(2020, -1), 2008);
});

test('buildYearPage marks years outside range as disabled', () => {
  const years = buildYearPage(2020, 12, 2023, 2028);

  assert.equal(years.length, 12);
  assert.deepEqual(years.slice(0, 4), [
    { year: 2020, disabled: true },
    { year: 2021, disabled: true },
    { year: 2022, disabled: true },
    { year: 2023, disabled: false },
  ]);
  assert.deepEqual(years.slice(-3), [
    { year: 2029, disabled: true },
    { year: 2030, disabled: true },
    { year: 2031, disabled: true },
  ]);
});

test('getDefaultFocusedIso uses today when no value is provided', () => {
  const focused = getDefaultFocusedIso(null, '1920-01-01', '2100-12-31', new Date(2026, 1, 25));

  assert.equal(focused, '2026-02-25');
});

test('getDefaultFocusedIso clamps today to max bound when today is out of range', () => {
  const focused = getDefaultFocusedIso(
    null,
    '1920-01-01',
    '2024-12-31',
    new Date(2026, 1, 25)
  );

  assert.equal(focused, '2024-12-31');
});

test('getDefaultFocusedIso clamps today to min bound when today is out of range', () => {
  const focused = getDefaultFocusedIso(
    null,
    '2028-01-01',
    '2100-12-31',
    new Date(2026, 1, 25)
  );

  assert.equal(focused, '2028-01-01');
});
