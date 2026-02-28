import { NextResponse } from 'next/server';
import { getFormSchema } from '@/lib/schemas';
import { validateEditedData } from '@/lib/form-validation';
import { fillPdf } from '@/lib/pdf-filler';
import { apiError, apiSuccess, withAuth } from '@/lib/api-utils';

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const { formType, editedData } = body as {
      formType?: string;
      editedData?: Record<string, unknown>;
    };

    if (!formType) {
      return apiError('Form type is required', 400);
    }

    if (!editedData || typeof editedData !== 'object') {
      return apiError('editedData must be an object', 400);
    }

    const schema = getFormSchema(formType);
    if (!schema) {
      return apiError(`Unknown form type: ${formType}`, 400);
    }

    const { validatedData, errors } = validateEditedData(schema, editedData);

    if (Object.keys(errors).length > 0) {
      console.warn('[process-form/regenerate] validation failed', {
        formType,
        errorCount: Object.keys(errors).length,
      });

      return NextResponse.json({ errors }, { status: 400 });
    }

    const pdfBytes = await fillPdf(schema, validatedData);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    return apiSuccess({ validatedData, pdfBase64 });
  } catch (err) {
    console.error('[process-form/regenerate] unexpected error', err);
    const message =
      err instanceof Error ? err.message : 'Unknown error during regeneration';
    return apiError(message, 500);
  }
});
