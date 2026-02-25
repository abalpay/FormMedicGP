import { NextResponse } from 'next/server';
import { getFormSchema } from '@/lib/schemas';
import { validateEditedData } from '@/lib/form-validation';
import { fillPdf } from '@/lib/pdf-filler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formType, editedData } = body as {
      formType?: string;
      editedData?: Record<string, unknown>;
    };

    if (!formType) {
      return NextResponse.json({ error: 'Form type is required' }, { status: 400 });
    }

    if (!editedData || typeof editedData !== 'object') {
      return NextResponse.json(
        { error: 'editedData must be an object' },
        { status: 400 }
      );
    }

    const schema = getFormSchema(formType);
    if (!schema) {
      return NextResponse.json(
        { error: `Unknown form type: ${formType}` },
        { status: 400 }
      );
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

    return NextResponse.json({ validatedData, pdfBase64 });
  } catch (err) {
    console.error('[process-form/regenerate] unexpected error', err);
    const message =
      err instanceof Error ? err.message : 'Unknown error during regeneration';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
