"use client"

import * as React from "react"
import { format } from "date-fns"
import { getLocalTimeZone, today } from "@internationalized/date"
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog,
  DialogTrigger,
  Heading,
  Popover,
  type DateValue,
} from "react-aria-components"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  buildYearPage,
  calendarDateToIso,
  getDefaultFocusedIso,
  getYearPageStart,
  isoToCalendarDate,
  parseIsoDateStrict,
  resolveBounds,
  shiftYearPage,
  type DatePickerMode,
} from "@/lib/date-picker-utils"

interface DatePickerProps {
  id?: string
  value: string | null
  onChange: (value: string | null) => void
  mode?: DatePickerMode
  minValue?: string
  maxValue?: string
  isInvalid?: boolean
  isDisabled?: boolean
  placeholder?: string
}

const YEAR_PAGE_SIZE = 12
const MONTH_NAMES = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2000, index, 1))
)

function DatePicker({
  id,
  value,
  onChange,
  mode = "general",
  minValue,
  maxValue,
  isInvalid,
  isDisabled,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [view, setView] = React.useState<"days" | "years">("days")

  const bounds = React.useMemo(
    () => resolveBounds(mode, minValue, maxValue),
    [mode, minValue, maxValue]
  )

  const selectedCalendarDate = React.useMemo(() => {
    if (!value) return undefined
    const parsed = isoToCalendarDate(value)
    if (!parsed) return undefined
    if (parsed.compare(bounds.minCalendarDate) < 0) return bounds.minCalendarDate
    if (parsed.compare(bounds.maxCalendarDate) > 0) return bounds.maxCalendarDate
    return parsed
  }, [bounds.maxCalendarDate, bounds.minCalendarDate, value])

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    return parseIsoDateStrict(value)
  }, [value])

  const defaultFocusedCalendarDate = React.useMemo(() => {
    const defaultFocusedIso = getDefaultFocusedIso(value, bounds.minValue, bounds.maxValue)
    return isoToCalendarDate(defaultFocusedIso) ?? bounds.maxCalendarDate
  }, [bounds.maxCalendarDate, bounds.maxValue, bounds.minValue, value])

  const clampCalendarDate = React.useCallback(
    (input: DateValue) => {
      const parsed = isoToCalendarDate(input.toString())
      if (!parsed) return bounds.minCalendarDate
      if (parsed.compare(bounds.minCalendarDate) < 0) return bounds.minCalendarDate
      if (parsed.compare(bounds.maxCalendarDate) > 0) return bounds.maxCalendarDate
      return parsed
    },
    [bounds.maxCalendarDate, bounds.minCalendarDate]
  )

  const [focusedValue, setFocusedValue] = React.useState(() => {
    return defaultFocusedCalendarDate
  })

  const [yearPageStart, setYearPageStart] = React.useState(() => {
    const anchorYear = defaultFocusedCalendarDate.year
    return getYearPageStart(anchorYear, YEAR_PAGE_SIZE)
  })

  React.useEffect(() => {
    const clamped = clampCalendarDate(defaultFocusedCalendarDate)
    setFocusedValue(clamped)
    setYearPageStart(getYearPageStart(clamped.year, YEAR_PAGE_SIZE))
  }, [clampCalendarDate, defaultFocusedCalendarDate])

  React.useEffect(() => {
    if (!open) return
    const anchor = clampCalendarDate(defaultFocusedCalendarDate)
    setFocusedValue(anchor)
    setYearPageStart(getYearPageStart(anchor.year, YEAR_PAGE_SIZE))
    setView("days")
  }, [clampCalendarDate, defaultFocusedCalendarDate, open])

  const currentMonthStart = focusedValue.set({ day: 1 })
  const minMonthStart = bounds.minCalendarDate.set({ day: 1 })
  const maxMonthStart = bounds.maxCalendarDate.set({ day: 1 })

  const previousMonth = currentMonthStart.subtract({ months: 1 })
  const nextMonth = currentMonthStart.add({ months: 1 })
  const canGoPrev = previousMonth.compare(minMonthStart) >= 0
  const canGoNext = nextMonth.compare(maxMonthStart) <= 0

  const yearPage = React.useMemo(
    () => buildYearPage(yearPageStart, YEAR_PAGE_SIZE, bounds.minYear, bounds.maxYear),
    [bounds.maxYear, bounds.minYear, yearPageStart]
  )

  const canPageYearsBack = yearPageStart > bounds.minYear
  const canPageYearsForward = yearPageStart + YEAR_PAGE_SIZE - 1 < bounds.maxYear

  const todayDate = React.useMemo(() => today(getLocalTimeZone()), [])
  const canPickToday =
    todayDate.compare(bounds.minCalendarDate) >= 0 &&
    todayDate.compare(bounds.maxCalendarDate) <= 0

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <AriaButton
        id={id}
        isDisabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        className={cn(
          "inline-flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm font-normal shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          !selectedDate && "text-muted-foreground",
          isInvalid && "border-destructive"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selectedDate ? format(selectedDate, "d MMM yyyy") : placeholder}
          </span>
        </span>
      </AriaButton>

      <Popover
        placement="bottom start"
        offset={4}
        className="w-[20rem] overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95"
      >
        <Dialog className="outline-none">
          <Calendar
            aria-label="Choose date"
            value={selectedCalendarDate ?? null}
            minValue={bounds.minCalendarDate}
            maxValue={bounds.maxCalendarDate}
            focusedValue={focusedValue}
            onFocusChange={(next) => setFocusedValue(clampCalendarDate(next))}
            onChange={(next) => {
              onChange(calendarDateToIso(clampCalendarDate(next)))
              setOpen(false)
            }}
            className="w-full"
          >
            <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2 border-b border-border/70 px-3 py-2">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => setFocusedValue(clampCalendarDate(previousMonth))}
                className="inline-flex size-8 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-40"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>

              <div className="flex items-center justify-center gap-1 rounded-lg bg-muted/50 px-1.5 py-1">
                <label htmlFor={`${id ?? "date-picker"}-month`} className="sr-only">
                  Select month
                </label>
                <select
                  id={`${id ?? "date-picker"}-month`}
                  value={focusedValue.month}
                  onChange={(event) => {
                    const nextMonthValue = clampCalendarDate(
                      focusedValue.set({ month: Number(event.target.value), day: 1 })
                    )
                    setFocusedValue(nextMonthValue)
                  }}
                  className="h-7 rounded-md bg-transparent px-2 text-sm font-medium outline-none transition-colors hover:bg-background focus:bg-background focus:ring-2 focus:ring-ring/50"
                >
                  {MONTH_NAMES.map((monthName, index) => {
                    const candidate = focusedValue.set({ month: index + 1, day: 1 })
                    const disabled =
                      candidate.compare(minMonthStart) < 0 || candidate.compare(maxMonthStart) > 0
                    return (
                      <option key={monthName} value={index + 1} disabled={disabled}>
                        {monthName}
                      </option>
                    )
                  })}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setYearPageStart(getYearPageStart(focusedValue.year, YEAR_PAGE_SIZE))
                    setView((current) => (current === "days" ? "years" : "days"))
                  }}
                  className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-sm font-medium outline-none transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/50"
                  aria-label="Choose year"
                >
                  {focusedValue.year}
                  <ChevronRight
                    className={cn(
                      "size-3.5 rotate-90 transition-transform",
                      view === "years" && "-rotate-90"
                    )}
                  />
                </button>
              </div>

              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setFocusedValue(clampCalendarDate(nextMonth))}
                className="inline-flex size-8 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-40"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {view === "years" ? (
              <div className="space-y-2 px-3 pb-3 pt-2">
                <Heading className="sr-only">Year selection</Heading>
                <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
                  <button
                    type="button"
                    disabled={!canPageYearsBack}
                    onClick={() =>
                      setYearPageStart((current) => shiftYearPage(current, -1, YEAR_PAGE_SIZE))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-40"
                    aria-label="Previous year page"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <p className="text-center text-xs font-medium uppercase tracking-[0.04em] text-muted-foreground">
                    {yearPageStart} - {yearPageStart + YEAR_PAGE_SIZE - 1}
                  </p>

                  <button
                    type="button"
                    disabled={!canPageYearsForward}
                    onClick={() =>
                      setYearPageStart((current) => shiftYearPage(current, 1, YEAR_PAGE_SIZE))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-40"
                    aria-label="Next year page"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {yearPage.map(({ year, disabled }) => {
                    const isCurrentYear = year === focusedValue.year
                    return (
                      <button
                        key={year}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setFocusedValue(clampCalendarDate(focusedValue.set({ year, day: 1 })))
                          setView("days")
                        }}
                        className={cn(
                          "inline-flex h-9 items-center justify-center rounded-lg text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/70",
                          isCurrentYear
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "text-foreground hover:bg-secondary",
                          disabled && "opacity-35 line-through"
                        )}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="px-3 pb-2 pt-1">
                <CalendarGrid className="w-full border-collapse">
                  <CalendarGridHeader>
                    {(day) => (
                      <CalendarHeaderCell className="pb-2 text-center text-[0.72rem] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                        {day}
                      </CalendarHeaderCell>
                    )}
                  </CalendarGridHeader>
                  <CalendarGridBody>
                    {(date) => (
                      <CalendarCell
                        date={date}
                        className={({
                          isDisabled: disabled,
                          isOutsideMonth,
                        }) =>
                          cn(
                            "size-9 p-0 text-center align-middle text-sm font-medium text-foreground outline-none",
                            isOutsideMonth && "text-muted-foreground/45",
                            disabled && "cursor-not-allowed text-muted-foreground/35"
                          )
                        }
                      >
                        {({
                          formattedDate,
                          isDisabled: disabled,
                          isFocusVisible,
                          isOutsideMonth,
                          isSelected,
                          isToday,
                        }) => (
                          <span
                            className={cn(
                              "mx-auto flex size-9 items-center justify-center rounded-xl text-center leading-none tabular-nums transition-colors",
                              !disabled && !isSelected && "hover:bg-secondary",
                              isFocusVisible &&
                                "ring-2 ring-ring/70 ring-offset-2 ring-offset-popover",
                              isToday &&
                                !isSelected &&
                                "bg-accent/20 text-foreground ring-1 ring-inset ring-accent/65",
                              isSelected &&
                                "bg-primary text-primary-foreground shadow-[0_0_0_1px_oklch(0.95_0_0/0.65)_inset]",
                              isOutsideMonth && "text-muted-foreground/45",
                              disabled && "line-through opacity-60"
                            )}
                          >
                            {formattedDate}
                          </span>
                        )}
                      </CalendarCell>
                    )}
                  </CalendarGridBody>
                </CalendarGrid>
              </div>
            )}
          </Calendar>

          <div className="flex items-center justify-between border-t border-border/70 px-3 py-2">
            <AriaButton
              type="button"
              isDisabled={!canPickToday}
              onPress={() => {
                onChange(calendarDateToIso(todayDate))
                setOpen(false)
              }}
              className="inline-flex h-8 items-center rounded-md px-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40"
            >
              Today
            </AriaButton>
            <AriaButton
              type="button"
              isDisabled={!value}
              onPress={() => onChange(null)}
              className="inline-flex h-8 items-center rounded-md px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40"
            >
              Clear
            </AriaButton>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}

export { DatePicker }
