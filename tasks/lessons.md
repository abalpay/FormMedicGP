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
