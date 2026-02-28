import { NextResponse } from 'next/server';
import { getFormCatalog } from '@/lib/forms/registry';

export async function GET() {
  const forms = getFormCatalog(false);
  return NextResponse.json({ forms }, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
