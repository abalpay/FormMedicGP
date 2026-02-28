import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-utils';
import { generateDeepgramToken } from '@/lib/deepgram';

export const POST = withAuth(async () => {
  try {
    const token = await generateDeepgramToken();
    return NextResponse.json({ token });
  } catch (err) {
    console.error('[deepgram-token] Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate Deepgram token' },
      { status: 500 }
    );
  }
});
