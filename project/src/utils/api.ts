// project/src/utils/api.ts
import type { Voice, TTSRequest, TTSResponse } from '../types';

//const BASE_URL = import.meta.env.VITE_TTS_API_URL!;

export class TTSApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'TTSApiError';
  }
}

const BASE_URL = import.meta.env.VITE_TTS_API_URL! ?? 'https://56j25k9zmd.execute-api.eu-north-1.amazonaws.com';
const SYNTH_PATH = '/synthesize';
const VOICES_PATH = '/voices';

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;
  while (!done) {
    const { value, done: d } = await reader.read();
    if (value) chunks.push(value);
    done = d;
  }
  return chunks.reduce((acc, chunk) => {
    const buf = new Uint8Array(acc.length + chunk.length);
    buf.set(acc, 0);
    buf.set(chunk, acc.length);
    return buf;
  }, new Uint8Array());
}

export async function convertTextToSpeech(req: TTSRequest): Promise<TTSResponse> {
  const res = await fetch(`${BASE_URL}${SYNTH_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new TTSApiError(res.status, text || 'Text-to-speech failed');
  }

  // pull the raw ReadableStream from the response
  const reader = (res as any).body as ReadableStream<Uint8Array>;
  const buffer = await streamToBuffer(reader);

  // convert to Base64
  const base64 = btoa(
    Array.from(buffer).map((b) => String.fromCharCode(b)).join('')
  );

  // build a Blob URL
  const blob = new Blob([buffer], { type: res.headers.get('content-type')! });
  const audioUrl = URL.createObjectURL(blob);

  // capture headers
  const contentType = res.headers.get('content-type')!;
  const requestId =
    res.headers.get('x-amzn-requestid') ||
    res.headers.get('x-amz-request-id') ||
    '';

  return { audioUrl, contentType, requestId };
}

export async function getAvailableVoices(): Promise<Voice[]> {
  const res = await fetch(`${BASE_URL}${VOICES_PATH}`);
  if (!res.ok) {
    throw new Error(`Failed to load voices (${res.status})`);
  }
  return res.json();
}
