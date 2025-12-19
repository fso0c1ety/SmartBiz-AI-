export const Colors = {
  light: {
    primary: '#7786b5',        // User requested blue
    secondary: '#5C9DFF',      // Blue (from icon)
    accent: '#5CFFF7',         // Light blue (from icon)
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
    gradient1: '#FF5CA7',      // Pink
    gradient2: '#5C9DFF',      // Blue
    gradient3: '#5CFFF7',      // Light blue
  },
  dark: {
    primary: '#7786b5',        // User requested blue
    secondary: '#5C9DFF',      // Blue (from icon)
    accent: '#5CFFF7',         // Light blue (from icon)
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
    gradient1: '#FF5CA7',      // Pink
    gradient2: '#5C9DFF',      // Blue
    gradient3: '#5CFFF7',      // Light blue
  },
};

export type ColorScheme = keyof typeof Colors;
