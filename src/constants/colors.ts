export const Colors = {
  light: {
    primary: '#FF6B5B',        // Warm coral/red from robot
    secondary: '#FFA14A',      // Orange from robot
    accent: '#FF8C42',         // Orange-red accent
    background: '#FFFFFF',
    surface: '#FFF9F5',        // Warm off-white
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#FFE5DC',         // Warm border
    error: '#EF4444',
    success: '#FF6B5B',        // Coral success
    warning: '#FFA14A',        // Orange warning
    shadow: 'rgba(255, 107, 91, 0.1)',
  },
  dark: {
    primary: '#FF6B5B',        // Warm coral/red
    secondary: '#FFA14A',      // Orange
    accent: '#FFB366',         // Lighter orange
    background: '#1A1A1A',
    surface: '#2D2520',        // Warm dark surface
    card: '#2D2520',
    text: '#FFFAF7',
    textSecondary: '#D4A574',
    textTertiary: '#A88860',
    border: '#4D3D2D',         // Warm border
    error: '#EF4444',
    success: '#FF6B5B',        // Coral success
    warning: '#FFA14A',        // Orange warning
    shadow: 'rgba(255, 107, 91, 0.3)',
  },
};

export type ColorScheme = keyof typeof Colors;
