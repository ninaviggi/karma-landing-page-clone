import { create } from 'zustand';
import type { Session } from '@/types';
import { generateActivity, AIError } from '@/services/ai';
import { previousVocabularyWords, saveSession } from '@/services/storage';
import { useUserStore } from './userStore';
import { useVocabStore } from './vocabStore';

type Status = 'idle' | 'generating' | 'error';

interface SessionState {
  status: Status;
  error: string | null;
  current: Session | null;
  generate: (activityText: string) => Promise<Session | null>;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'idle',
  error: null,
  current: null,
  generate: async (activityText) => {
    const prefs = useUserStore.getState().prefs;
    if (!prefs) {
      set({ status: 'error', error: 'User preferences not loaded' });
      return null;
    }
    set({ status: 'generating', error: null, current: null });
    try {
      const previousVocabulary = await previousVocabularyWords();
      const generated = await generateActivity({
        activityText,
        baseLanguage: prefs.baseLanguage,
        learningLanguage: prefs.learningLanguage,
        childAge: prefs.childAge,
        childName: prefs.childName,
        previousVocabulary,
      });
      const session = await saveSession(activityText, generated);
      await useVocabStore.getState().refresh();
      set({ status: 'idle', current: session });
      return session;
    } catch (err) {
      const message =
        err instanceof AIError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Unknown error generating activity';
      set({ status: 'error', error: message });
      return null;
    }
  },
  reset: () => set({ status: 'idle', error: null, current: null }),
}));
