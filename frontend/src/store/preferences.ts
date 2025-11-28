import { create } from 'zustand';

export type ThemeOption = 'light' | 'dark' | 'high-contrast';
export type ExperienceMode = 'basic' | 'advanced';

type AccessibilityPrefs = {
  ttsEnabled: boolean;
  simplifiedLanguage: boolean;
};

type PreferencesState = {
  theme: ThemeOption;
  mode: ExperienceMode;
  fontScale: number;
  language: string;
  menuPinned: boolean;
  accessibility: AccessibilityPrefs;
};

type PreferencesActions = {
  setTheme: (theme: ThemeOption) => void;
  cycleTheme: () => void;
  setMode: (mode: ExperienceMode) => void;
  toggleMode: () => void;
  updateFontScale: (scale: number) => void;
  setLanguage: (language: string) => void;
  toggleMenuPinned: () => void;
  updateAccessibility: (updates: Partial<AccessibilityPrefs>) => void;
};

const themeOrder: ThemeOption[] = ['light', 'dark', 'high-contrast'];

export const usePreferencesStore = create<PreferencesState & PreferencesActions>(set => ({
  theme: 'light',
  mode: 'basic',
  fontScale: 1,
  language: 'es-MX',
  menuPinned: true,
  accessibility: {
    ttsEnabled: true,
    simplifiedLanguage: false,
  },
  setTheme: theme => set({ theme }),
  cycleTheme: () =>
    set(state => {
      const idx = themeOrder.indexOf(state.theme);
      const nextTheme = themeOrder[(idx + 1) % themeOrder.length];
      return { theme: nextTheme };
    }),
  setMode: mode => set({ mode }),
  toggleMode: () => set(state => ({ mode: state.mode === 'basic' ? 'advanced' : 'basic' })),
  updateFontScale: scale => set({ fontScale: Math.min(1.6, Math.max(0.85, scale)) }),
  setLanguage: language => set({ language }),
  toggleMenuPinned: () => set(state => ({ menuPinned: !state.menuPinned })),
  updateAccessibility: updates =>
    set(state => ({ accessibility: { ...state.accessibility, ...updates } })),
}));
