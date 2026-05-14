import type { SentenceItem, VocabularyItem } from './types';
import type { StorageAdapter } from './storage';

export const listVocabulary = (
  adapter: StorageAdapter
): Promise<VocabularyItem[]> => adapter.listVocabulary();

export const listSentences = (
  adapter: StorageAdapter
): Promise<SentenceItem[]> => adapter.listSentences();

export const previousVocabularyWords = (
  adapter: StorageAdapter,
  limit = 200
): Promise<string[]> => adapter.recentVocabularyWords(limit);
