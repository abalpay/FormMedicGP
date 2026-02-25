import 'server-only';

import { createClient } from '@deepgram/sdk';

export async function generateDeepgramToken(): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY is not configured');
  }

  const client = createClient(apiKey);
  const { result, error } = await client.auth.grantToken({ ttl_seconds: 600 });

  if (error || !result) {
    throw new Error(
      `Failed to generate Deepgram token: ${error?.message ?? 'No result'}`
    );
  }

  return result.access_token;
}
