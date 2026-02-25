export interface DeepgramLiveSocketConfig {
  url: string;
  protocols: [string, string];
}

export function createDeepgramLiveSocketConfig(
  accessToken: string
): DeepgramLiveSocketConfig {
  const query = new URLSearchParams({
    model: 'nova-3-medical',
    language: 'en-AU',
    punctuate: 'true',
    smart_format: 'true',
  });

  return {
    url: `wss://api.deepgram.com/v1/listen?${query.toString()}`,
    // Access tokens must use Bearer auth in the websocket subprotocol.
    protocols: ['bearer', accessToken],
  };
}

export function getDeepgramStopMessages(): [string, string] {
  return [
    JSON.stringify({ type: 'Finalize' }),
    JSON.stringify({ type: 'CloseStream' }),
  ];
}
