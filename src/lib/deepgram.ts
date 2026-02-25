import 'server-only';

export async function generateDeepgramToken(): Promise<string> {
  // TODO: Call Deepgram API to generate a short-lived temporary API key
  // - The browser will use this key to connect directly to Deepgram's WebSocket
  // - Audio streams: browser → Deepgram (no proxy through our server)
  throw new Error('Not implemented');
}
