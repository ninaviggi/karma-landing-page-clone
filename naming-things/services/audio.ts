import * as Speech from 'expo-speech';
import type { LanguageCode } from '@/types';
import { LANGUAGES } from '@/constants/suggestions';

const localeFor = (code: LanguageCode): string =>
  LANGUAGES.find((l) => l.code === code)?.ttsLocale ?? 'en-US';

export type Speed = 'normal' | 'slow';

const RATES: Record<Speed, number> = {
  normal: 1.0,
  slow: 0.7,
};

export const speak = (
  text: string,
  language: LanguageCode,
  speed: Speed = 'normal'
): void => {
  Speech.stop();
  Speech.speak(text, {
    language: localeFor(language),
    rate: RATES[speed],
    pitch: 1.0,
  });
};

export const stopSpeaking = (): void => {
  Speech.stop();
};
