import { handleDemoExtract, isDemoLiveEnabled } from '@/lib/demo/extract-handler';
import { EXTRACTION_MODEL, extractFormData } from '@/lib/llm';
import { checkDistributedRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

// Read DEMO_ACCESS_CODE at request time, not at build time.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ enabled: isDemoLiveEnabled(process.env.DEMO_ACCESS_CODE) });
}

export async function POST(request: Request) {
  return handleDemoExtract(request, {
    accessCode: process.env.DEMO_ACCESS_CODE,
    checkRateLimit: async (input) => checkDistributedRateLimit(await createClient(), input),
    extract: extractFormData,
    model: EXTRACTION_MODEL,
    now: () => new Date(),
  });
}
