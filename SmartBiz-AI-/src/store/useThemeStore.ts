import { create } from 'zustand';
import { ColorScheme } from '../constants/colors';

interface ThemeState {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  colorScheme: 'dark',
  toggleTheme: () =>
    set((state) => ({
      colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
    })),
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
}));
