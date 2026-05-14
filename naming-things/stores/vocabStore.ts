import { create } from 'zustand';
import type { SentenceItem, VocabularyItem } from '@/types';
import {
  counts as fetchCounts,
  listSentences,
  listVocabulary,
} from '@/services/storage';

interface VocabState {
  vocabulary: VocabularyItem[];
  sentences: SentenceItem[];
  totals: { words: number; sentences: number; sessions: number };
  loaded: boolean;
  refresh: () => Promise<void>;
}

export const useVocabStore = create<VocabState>((set) => ({
  vocabulary: [],
  sentences: [],
  totals: { words: 0, sentences: 0, sessions: 0 },
  loaded: false,
  refresh: async () => {
    const [vocabulary, sentences, totals] = await Promise.all([
      listVocabulary(),
      listSentences(),
      fetchCounts(),
    ]);
    set({ vocabulary, sentences, totals, loaded: true });
  },
}));
