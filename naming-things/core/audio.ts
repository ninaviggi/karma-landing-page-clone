import type { LanguageCode } from './types';
import { ttsLocaleFor } from './languages';

export type Speed = 'normal' | 'slow';

export const SPEED_RATES: Record<Speed, number> = {
  normal: 1.0,
  slow: 0.7,
};

export interface SpeakRequest {
  text: string;
  language: LanguageCode;
  speed?: Speed;
}

export const resolveLocale = (code: LanguageCode): string => ttsLocaleFor(code);

export const rateFor = (speed: Speed = 'normal'): number => SPEED_RATES[speed];
