# Lessons

## Deidentification: Don't strip data the LLM needs
- Dates in clinical dictation (onset dates, incapacity periods) are NOT PII — they're extraction targets
- Only strip genuinely identifying info: names, Medicare numbers, CRNs, phone numbers
- Patient DOB is handled separately via `patientDetails`, not extracted from transcription
- **Rule:** Before adding a PII pattern, ask "does the LLM need this to fill form fields?"

## Unused imports
- Always clean up imports when removing features or refactoring — lint warnings accumulate silently
