import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { getFormSchema } from '@/lib/schemas';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ formType: string }> }
) {
  const { formType } = await params;
  const schema = getFormSchema(formType);
  if (!schema) {
    return NextResponse.json({ error: 'Unknown form type' }, { status: 404 });
  }

  const fullPath = join(process.cwd(), 'src', 'lib', 'schemas', schema.templatePath);

  try {
    const bytes = readFileSync(fullPath);
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
}
