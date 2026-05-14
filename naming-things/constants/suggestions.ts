import type { LanguageOption } from '@/types';

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

export const DEFAULT_SUGGESTIONS: string[] = [
  'Build a pillow fort',
  'Go on a nature walk',
  'Set the table',
  'Bake banana bread',
  'Wash the car together',
  'Plant seeds in a pot',
  'Make a paper airplane',
  'Sort the laundry by color',
];
