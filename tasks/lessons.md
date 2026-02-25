# Lessons

## Deidentification: Don't strip data the LLM needs
- Dates in clinical dictation (onset dates, incapacity periods) are NOT PII — they're extraction targets
- Only strip genuinely identifying info: names, Medicare numbers, CRNs, phone numbers
- Patient DOB is handled separately via `patientDetails`, not extracted from transcription
- **Rule:** Before adding a PII pattern, ask "does the LLM need this to fill form fields?"

## Unused imports
- Always clean up imports when removing features or refactoring — lint warnings accumulate silently

## Government PDFs: Always fix with qpdf first
- Australian government PDFs often have invalid object references that crash pdf-lib
- Run `qpdf --qdf --object-streams=disable input.pdf output.pdf` to fix before using as template
- Use the fixed version as the template, not the original
- `qpdf --json` is the most reliable way to discover form fields — pdf-lib may show 0 fields on broken PDFs

## pdf-lib checkbox groups acting as radios
- Government PDFs often use checkbox widgets with shared names as radio-button-groups
- Each widget has different "on values" in its appearance dictionary (`/AP` → `/N` → keys besides `/Off`)
- To select an option: set `/AS` on the correct widget AND `/V` on the field's acroField dict
- Access field dict via `field.acroField.dict` (property), NOT `field.acroField.dict()` (not a method)

## Pinning a footer inside a flex-based dashboard layout
- `sticky bottom-0` fails when the element is the last child — nothing below to stick against
- `h-full` (height: 100%) on a child of a flex item often doesn't resolve reliably, even when the parent has a definite flex-computed height
- Negative vertical margins (`-m-4`) break height constraints — the element becomes taller than `h-full`, causing the parent to scroll the whole thing
- `calc(100vh - Xrem)` is fragile — requires knowing exact header height, padding values, and breakpoint-specific adjustments
- **Solution that works:** Add `relative` to the scroll container (`<main>`), then use `absolute inset-0` on the page div. This fills the parent's padding box exactly — no percentage chain, no calc, no guessing.
- Structure: `absolute inset-0 flex flex-col` → `shrink-0` header + `flex-1 min-h-0` content + `shrink-0` footer
- **Rule:** When you need a page to fill its parent container exactly inside a flex layout, reach for `relative` on parent + `absolute inset-0` on child — it's the most robust CSS pattern for this.
