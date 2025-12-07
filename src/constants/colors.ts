export const Colors = {
  light: {
    primary: '#10A37F',        // ChatGPT green
    secondary: '#8E8EA0',      // Subtle gray
    accent: '#10A37F',         // Green accent
    background: '#FFFFFF',
    surface: '#F7F7F8',
    card: '#FFFFFF',
    text: '#202123',
    textSecondary: '#6E6E80',
    textTertiary: '#ACACBE',
    border: '#E5E5E5',
    error: '#EF4444',
    success: '#10A37F',
    warning: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.03)',
  },
  dark: {
    primary: '#10A37F',        // ChatGPT green
    secondary: '#8E8EA0',      // Subtle gray
    accent: '#19C37D',         // Lighter green
    background: '#212121',
    surface: '#2A2A2A',
    card: '#2A2A2A',
    text: '#ECECF1',
    textSecondary: '#C5C5D2',
    textTertiary: '#8E8EA0',
    border: '#3E3E3E',
    error: '#EF4444',
    success: '#10A37F',
    warning: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export type ColorScheme = keyof typeof Colors;
