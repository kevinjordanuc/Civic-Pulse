"use client";

import { useEffect } from 'react';

import { usePreferencesStore } from '@/store/preferences';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, fontScale } = usePreferencesStore(state => ({
    theme: state.theme,
    fontScale: state.fontScale,
  }));

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.setProperty('--font-scale', fontScale.toString());
  }, [theme, fontScale]);

  return children;
}
