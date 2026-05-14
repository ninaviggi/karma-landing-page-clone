import { create } from 'zustand';
import type { UserPreferences } from '@core/index';
import { sqliteAdapter as storage } from '@/platform/storage';

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
    const prefs = await storage.loadPreferences();
    set({ prefs, loaded: true });
  },
  setPreferences: async (prefs) => {
    await storage.savePreferences(prefs);
    set({ prefs });
  },
}));
