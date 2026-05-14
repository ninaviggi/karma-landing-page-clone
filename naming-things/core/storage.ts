import type {
  SentenceItem,
  Session,
  UserPreferences,
  VocabularyItem,
} from './types';

export interface VocabUpsert {
  word: string;
  translation: string;
  phonetic: string;
  sourceSessionId: string;
  activityName: string;
}

export interface SentenceUpsert {
  sentence: string;
  translation: string;
  context: string;
  sourceSessionId: string;
  activityName: string;
}

export interface Counts {
  words: number;
  sentences: number;
  sessions: number;
}

export interface StorageAdapter {
  loadPreferences(): Promise<UserPreferences | null>;
  savePreferences(prefs: UserPreferences): Promise<void>;

  insertSession(session: Session): Promise<void>;
  getSession(id: string): Promise<Session | null>;
  listSessions(): Promise<Session[]>;

  upsertVocabulary(items: VocabUpsert[]): Promise<void>;
  upsertSentences(items: SentenceUpsert[]): Promise<void>;

  listVocabulary(): Promise<VocabularyItem[]>;
  listSentences(): Promise<SentenceItem[]>;

  recentVocabularyWords(limit: number): Promise<string[]>;
  counts(): Promise<Counts>;
}
