import { create } from 'zustand';
import type { UserPreferences } from '@/types';
import { loadPreferences, savePreferences } from '@/services/storage';

interface UserState {
  prefs: UserPreferences | null;
  loaded: boolean;
  load: () => Promise<void>;
  setPreferences: (prefs: UserPreferences) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  prefs: null,
  loaded: false,
  load: async () => {
    const prefs = await loadPreferences();
    set({ prefs, loaded: true });
  },
  setPreferences: async (prefs) => {
    await savePreferences(prefs);
    set({ prefs });
  },
}));
