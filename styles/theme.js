// styles/theme.js
export const colors = {
  // --- NEW BRANDING COLORS ---
  primary: '#637806',        // Olive Green
  primaryDark: '#2c3a06',    // Dark Green
  primarySoft: '#EEF2E1',    // Very light olive (for backgrounds)
  
  accent: '#FBBF24',         // Keep the gold/yellow for contrast
  accentDark: '#F59E0B',
  accentSoft: '#FEF3C7',
  
  background: '#FAFBF7',     // Off-white with a hint of green
  surface: '#FFFFFF',
  surfaceMuted: '#F4F5F0',
  
  textPrimary: '#1A2210',    // Very dark green/black
  textSecondary: '#586143',  // Muted olive
  textMuted: '#8A9474',
  textLight: '#FFFFFF',
  textOnAccent: '#78350F',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  border: '#E2E8D8',
  borderLight: '#F0F4E8',
};

export const typography = {
  // Swapped from Poppins to Fredoka for the new branding
  fontRegular: 'Fredoka_400Regular',
  fontSemiBold: 'Fredoka_600SemiBold',
  fontBold: 'Fredoka_700Bold',
  
  heading1: 24, heading2: 20, heading3: 18,
  bodyLarge: 16, body: 15, bodySmall: 14,
  caption: 13, tiny: 11,
  displayMedium: 28,
  displayLarge: 32,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
export const shadows = {
  card: { shadowColor: '#1A2210', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardLarge: { shadowColor: '#1A2210', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
};