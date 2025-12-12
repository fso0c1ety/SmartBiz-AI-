export const Colors = {
  light: {
    primary: '#FF6B5B',        // Coral red
    secondary: '#FFA14A',      // Vibrant orange
    accent: '#FF8C42',         // Orange-red accent
    background: '#F8F9FC',     // Light grayish-blue
    surface: '#FFFFFF',        // Pure white cards
    card: '#FFFFFF',
    text: '#1A1F36',           // Deep blue-gray
    textSecondary: '#697386',  // Muted gray
    textTertiary: '#A0AEC0',   // Light gray
    border: '#E2E8F0',         // Soft border
    error: '#EF4444',
    success: '#10B981',        // Modern green
    warning: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.08)',
    gradient1: '#FF6B5B',
    gradient2: '#FFA14A',
  },
  dark: {
    primary: '#FF6B5B',        // Coral red
    secondary: '#FFA14A',      // Vibrant orange
    accent: '#FFB366',         // Lighter orange
    background: '#0F172A',     // Deep navy
    surface: '#1E293B',        // Dark slate
    card: '#1E293B',
    text: '#F1F5F9',           // Almost white
    textSecondary: '#94A3B8',  // Slate gray
    textTertiary: '#64748B',   // Darker slate
    border: '#334155',         // Dark border
    error: '#EF4444',
    success: '#10B981',        // Modern green
    warning: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.5)',
    gradient1: '#FF6B5B',
    gradient2: '#FFA14A',
  },
};

export type ColorScheme = keyof typeof Colors;
