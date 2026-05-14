import Constants from 'expo-constants';
import { resolveLocale, type LanguageCode, type Speed } from '@core/index';
import { cacheKey, cachedPathFor, getCached, storeCached } from './audioCache';

const ELEVENLABS_ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech';

interface VoiceConfig {
  voiceId: string;
  modelId: string;
}

const DEFAULT_VOICE: VoiceConfig = {
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  modelId: 'eleven_multilingual_v2',
};

const getElevenLabsKey = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
  const fromExtra = Constants.expoConfig?.extra?.elevenLabsApiKey as
    | string
    | undefined;
  return fromEnv || fromExtra || '';
};

export const isCachingEnabled = (): boolean => !!getElevenLabsKey();

export interface TtsRequest {
  text: string;
  language: LanguageCode;
  speed: Speed;
}

export interface CachedAudio {
  uri: string;
}

export const cacheUri = (req: TtsRequest): string =>
  cachedPathFor(cacheKey(req.text, req.language, req.speed));

const speedToStability = (speed: Speed): number =>
  speed === 'slow' ? 0.85 : 0.5;

export const ensureCachedAudio = async (
  req: TtsRequest
): Promise<string | null> => {
  const apiKey = getElevenLabsKey();
  if (!apiKey) return null;

  const key = cacheKey(req.text, req.language, req.speed);
  const existing = await getCached(key);
  if (existing) return existing;

  const url = `${ELEVENLABS_ENDPOINT}/${DEFAULT_VOICE.voiceId}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'audio/mpeg',
        'xi-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text: req.text,
        model_id: DEFAULT_VOICE.modelId,
        language_code: req.language,
        voice_settings: {
          stability: speedToStability(req.speed),
          similarity_boost: 0.75,
          style: 0,
        },
      }),
    });
  } catch (err) {
    console.warn('ElevenLabs network error', err);
    return null;
  }

  if (!response.ok) {
    console.warn(`ElevenLabs error ${response.status}`);
    return null;
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return storeCached(key, bytes);
};

export interface BatchProgress {
  done: number;
  total: number;
}

export const precacheTexts = async (
  items: Array<TtsRequest>,
  onProgress?: (p: BatchProgress) => void
): Promise<Map<string, string>> => {
  const result = new Map<string, string>();
  const total = items.length;
  let done = 0;
  for (const item of items) {
    const key = cacheKey(item.text, item.language, item.speed);
    const path = await ensureCachedAudio(item);
    if (path) result.set(key, path);
    done += 1;
    onProgress?.({ done, total });
  }
  return result;
};

export const ttsLocale = (code: LanguageCode): string => resolveLocale(code);
