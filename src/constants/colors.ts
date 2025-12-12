export const Colors = {
  light: {
    primary: '#F6B1C0',        // Pastel pink (from logo)
    secondary: '#8AA6F7',      // Pastel blue (from logo)
    accent: '#AEE2FF',         // Light blue accent (from logo)
    background: '#F8FAFF',     // Very light blue
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
    gradient1: '#F6B1C0',      // Pink
    gradient2: '#8AA6F7',      // Blue
    gradient3: '#AEE2FF',      // Light blue
  },
  dark: {
    primary: '#F6B1C0',        // Pastel pink
    secondary: '#8AA6F7',      // Pastel blue
    accent: '#AEE2FF',         // Light blue accent
    background: '#181C2A',     // Deep blue background
    surface: '#232A3B',        // Slightly lighter blue
    card: '#232A3B',
    text: '#F8FAFF',           // Almost white
    textSecondary: '#94A3B8',  // Slate gray
    textTertiary: '#64748B',   // Darker slate
    border: '#2D3652',         // Muted blue border
    error: '#EF4444',
    success: '#10B981',        // Modern green
    warning: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.5)',
    gradient1: '#F6B1C0',      // Pink
    gradient2: '#8AA6F7',      // Blue
    gradient3: '#AEE2FF',      // Light blue
  },
};

export type ColorScheme = keyof typeof Colors;
