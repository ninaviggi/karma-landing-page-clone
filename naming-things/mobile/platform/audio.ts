import * as Speech from 'expo-speech';
import { rateFor, resolveLocale, type LanguageCode, type Speed } from '@core/index';

export const speak = (
  text: string,
  language: LanguageCode,
  speed: Speed = 'normal'
): void => {
  Speech.stop();
  Speech.speak(text, {
    language: resolveLocale(language),
    rate: rateFor(speed),
    pitch: 1.0,
  });
};

export const stopSpeaking = (): void => {
  Speech.stop();
};
