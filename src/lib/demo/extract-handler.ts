/**
 * Public /demo live extraction (access-code gated). Deps are injected so the
 * handler runs offline under `node --test`; the route supplies the real ones.
 */
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { deidentify } from '../deidentify.ts';
import { buildGuidedExtractionPayload } from '../guided-dictation.ts';
import { getClientIp, getRateLimitHeaders, type RateLimitResult } from '../rate-limit.ts';
import { DEMO_CASES, SCHEMAS } from './scenarios.ts';
import type { ExtractedFormData, FormSchema } from '@/types';

export type DemoExtractDeps = {
  accessCode: string | undefined;
  checkRateLimit: (input: { key: string; limit: number; windowMs: number }) => Promise<RateLimitResult>;
  extract: (
    deidentifiedText: string,
    schema: FormSchema
  ) => Promise<{ data: ExtractedFormData; missingFields: string[] }>;
  model: string;
  now: () => Date;
};

const HOUR = 60 * 60 * 1000;
const IP_LIMIT = { limit: 5, windowMs: HOUR };
const GLOBAL_LIMIT = { limit: 40, windowMs: 24 * HOUR };

const DEMO_FORM_TYPES = [...new Set(DEMO_CASES.map((c) => c.formType))] as [string, ...string[]];

const BodySchema = z
  .object({
    formType: z.enum(DEMO_FORM_TYPES),
    transcription: z.string().trim().min(20).max(4000),
    guidedAnswers: z
      .record(z.string(), z.string().max(500))
      .refine((answers) => Object.keys(answers).length <= 30)
      .optional(),
  })
  .strict(); // rejects patientDetails and anything else

export function isDemoLiveEnabled(accessCode: string | undefined) {
  return Boolean(accessCode);
}

function codeMatches(given: string | null, expected: string) {
  const a = Buffer.from(given ?? '');
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function tooMany(result: RateLimitResult, error: string) {
  return Response.json(
    { error },
    {
      status: 429,
      headers: { ...getRateLimitHeaders(result), 'Retry-After': String(result.retryAfterSeconds) },
    }
  );
}

export async function handleDemoExtract(request: Request, deps: DemoExtractDeps): Promise<Response> {
  if (!deps.accessCode) return new Response(null, { status: 404 });

  const unavailable = () =>
    Response.json({ error: 'Live mode is unavailable right now. Please try again.' }, { status: 503 });

  // Per-IP first, before the code check, so wrong codes are throttled too.
  let ipLimit: RateLimitResult;
  try {
    ipLimit = await deps.checkRateLimit({ key: `demo-extract:ip:${getClientIp(request)}`, ...IP_LIMIT });
  } catch (error) {
    console.error('[demo-extract] rate limit error', error);
    return unavailable();
  }
  if (!ipLimit.allowed) return tooMany(ipLimit, 'Too many live runs from this network. Please try again later.');

  if (!codeMatches(request.headers.get('x-demo-code'), deps.accessCode)) {
    return Response.json({ error: 'Invalid access code' }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 });
    body = parsed.data;
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Global cap only counts runs that will actually reach Claude.
  let globalLimit: RateLimitResult;
  try {
    globalLimit = await deps.checkRateLimit({ key: 'demo-extract:global', ...GLOBAL_LIMIT });
  } catch (error) {
    console.error('[demo-extract] rate limit error', error);
    return unavailable();
  }
  if (!globalLimit.allowed) return tooMany(globalLimit, 'Live mode has hit its daily limit. Please try again tomorrow.');

  const schema = SCHEMAS[body.formType];
  const { transcriptionForLlm } = buildGuidedExtractionPayload({
    transcription: body.transcription,
    schema,
    guidedAnswers: body.guidedAnswers,
  });
  // No context: the public demo never receives real identities.
  const { deidentifiedText } = deidentify(transcriptionForLlm);

  try {
    const { data, missingFields } = await deps.extract(deidentifiedText, schema);
    return Response.json(
      {
        llmData: data,
        missingFields,
        deidentifiedText,
        model: deps.model,
        generatedAt: deps.now().toISOString(),
      },
      { headers: getRateLimitHeaders(ipLimit) }
    );
  } catch (error) {
    console.error('[demo-extract] extraction failed', error);
    return Response.json({ error: 'Live extraction failed. Please try again.' }, { status: 502 });
  }
}
