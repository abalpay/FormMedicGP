import { CalendarDate, parseDate } from "@internationalized/date"

export type DatePickerMode = "general" | "dob"

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const GENERAL_MIN_ISO = "1920-01-01"
const GENERAL_MAX_ISO = "2100-12-31"
const DOB_RANGE_YEARS = 120

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function toValidIsoOrDefault(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  return parseIsoDateStrict(value) ? value : fallback
}

export interface ResolvedDateBounds {
  minValue: string
  maxValue: string
  minDate: Date
  maxDate: Date
  minCalendarDate: CalendarDate
  maxCalendarDate: CalendarDate
  minYear: number
  maxYear: number
}

export function parseIsoDateStrict(value: string): Date | undefined {
  const match = value.match(ISO_DATE_RE)
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return undefined
  }

  const candidate = new Date(year, month - 1, day)
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return undefined
  }

  return candidate
}

export function formatIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isoToCalendarDate(value: string): CalendarDate | undefined {
  if (!parseIsoDateStrict(value)) return undefined
  return parseDate(value)
}

export function calendarDateToIso(value: CalendarDate): string {
  return value.toString()
}

export function clampDateToBounds(date: Date, minDate: Date, maxDate?: Date): Date {
  const normalizedDate = toDateOnly(date)
  const normalizedMin = toDateOnly(minDate)
  const normalizedMax = maxDate ? toDateOnly(maxDate) : undefined

  if (normalizedDate < normalizedMin) return normalizedMin
  if (normalizedMax && normalizedDate > normalizedMax) return normalizedMax
  return normalizedDate
}

export function resolveBounds(
  mode: DatePickerMode,
  minValue?: string,
  maxValue?: string,
  now: Date = new Date()
): ResolvedDateBounds {
  const todayIso = formatIsoDate(now)
  const defaultMinValue =
    mode === "dob"
      ? `${String(now.getFullYear() - DOB_RANGE_YEARS).padStart(4, "0")}-01-01`
      : GENERAL_MIN_ISO
  const defaultMaxValue = mode === "dob" ? todayIso : GENERAL_MAX_ISO

  let resolvedMinValue = toValidIsoOrDefault(minValue, defaultMinValue)
  const resolvedMaxValue = toValidIsoOrDefault(maxValue, defaultMaxValue)

  if (resolvedMinValue > resolvedMaxValue) {
    resolvedMinValue = resolvedMaxValue
  }

  const minDate = parseIsoDateStrict(resolvedMinValue) ?? parseIsoDateStrict(defaultMinValue)!
  const maxDate = parseIsoDateStrict(resolvedMaxValue) ?? parseIsoDateStrict(defaultMaxValue)!
  const minCalendarDate = parseDate(resolvedMinValue)
  const maxCalendarDate = parseDate(resolvedMaxValue)

  return {
    minValue: resolvedMinValue,
    maxValue: resolvedMaxValue,
    minDate,
    maxDate,
    minCalendarDate,
    maxCalendarDate,
    minYear: minCalendarDate.year,
    maxYear: maxCalendarDate.year,
  }
}

export function getDefaultFocusedIso(
  selectedValue: string | null | undefined,
  minValue: string,
  maxValue: string,
  now: Date = new Date()
): string {
  const normalizedSelected = selectedValue && parseIsoDateStrict(selectedValue) ? selectedValue : null

  if (normalizedSelected) {
    if (normalizedSelected < minValue) return minValue
    if (normalizedSelected > maxValue) return maxValue
    return normalizedSelected
  }

  const todayIso = formatIsoDate(now)
  if (todayIso < minValue) return minValue
  if (todayIso > maxValue) return maxValue
  return todayIso
}

export function startOfMonthDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function shiftMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function isMonthBefore(a: Date, b: Date): boolean {
  return (
    a.getFullYear() < b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() < b.getMonth())
  )
}

export function isMonthAfter(a: Date, b: Date): boolean {
  return (
    a.getFullYear() > b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() > b.getMonth())
  )
}

export function getYearPageStart(selectedYear: number, pageSize = 12): number {
  if (pageSize === 12) {
    return Math.floor(selectedYear / 10) * 10
  }

  const offset = ((selectedYear % pageSize) + pageSize) % pageSize
  return selectedYear - offset
}

export function shiftYearPage(pageStart: number, direction: -1 | 1, pageSize = 12): number {
  return pageStart + direction * pageSize
}

export function buildYearPage(
  pageStart: number,
  pageSize = 12,
  minYear: number,
  maxYear: number
): Array<{ year: number; disabled: boolean }> {
  return Array.from({ length: pageSize }, (_, index) => {
    const year = pageStart + index
    return {
      year,
      disabled: year < minYear || year > maxYear,
    }
  })
}
