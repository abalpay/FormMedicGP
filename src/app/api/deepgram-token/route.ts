import { NextResponse } from 'next/server';
import { generateDeepgramToken } from '@/lib/deepgram';

export async function POST() {
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
}
