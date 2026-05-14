import type { LanguageCode, LanguageOption } from './types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', ttsLocale: 'en-US' },
  { code: 'fr', label: 'French', ttsLocale: 'fr-FR' },
  { code: 'es', label: 'Spanish', ttsLocale: 'es-ES' },
  { code: 'it', label: 'Italian', ttsLocale: 'it-IT' },
  { code: 'de', label: 'German', ttsLocale: 'de-DE' },
  { code: 'zh', label: 'Mandarin', ttsLocale: 'zh-CN' },
  { code: 'ja', label: 'Japanese', ttsLocale: 'ja-JP' },
  { code: 'pt', label: 'Portuguese', ttsLocale: 'pt-PT' },
];

export const languageLabel = (code: LanguageCode): string =>
  LANGUAGES.find((l) => l.code === code)?.label ?? code;

export const ttsLocaleFor = (code: LanguageCode): string =>
  LANGUAGES.find((l) => l.code === code)?.ttsLocale ?? 'en-US';
