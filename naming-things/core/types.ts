export type LanguageCode =
  | 'fr'
  | 'es'
  | 'it'
  | 'de'
  | 'zh'
  | 'ja'
  | 'pt'
  | 'en';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  ttsLocale: string;
}

export interface UserPreferences {
  baseLanguage: LanguageCode;
  learningLanguage: LanguageCode;
  childAge: number;
  childName?: string;
  onboarded: boolean;
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  sourceSessionId: string;
  activityName: string;
  encounterCount: number;
  createdAt: number;
  lastReviewedAt?: number;
}

export interface SentenceItem {
  id: string;
  sentence: string;
  translation: string;
  context: string;
  sourceSessionId: string;
  activityName: string;
  encounterCount: number;
  createdAt: number;
}

export interface ActivityStep {
  instruction: string;
  languagePrompt: string;
  translation: string;
}

export interface GeneratedActivity {
  title: string;
  vocabulary: Array<{
    word: string;
    translation: string;
    phonetic: string;
  }>;
  sentences: Array<{
    sentence: string;
    translation: string;
    context: string;
  }>;
  steps: ActivityStep[];
  wonderQuestion: {
    question: string;
    translation: string;
  };
}

export interface Session {
  id: string;
  activityText: string;
  generated: GeneratedActivity;
  createdAt: number;
  durationSeconds?: number;
  rating?: 'up' | 'down';
}
