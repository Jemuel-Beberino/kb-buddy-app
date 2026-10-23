// styles/theme.js
// KB Buddy Design System — inspired by Base44

export const colors = {
  // === PRIMARY TEAL (Base44-style) ===
  primary: '#0D9488',        // Main teal
  primaryDark: '#0F766E',    // Pressed state
  primaryLight: '#5EEAD4',   // Light accent
  primarySoft: '#CCFBF1',    // Very light teal for backgrounds

  // === ACCENT YELLOW ===
  accent: '#FBBF24',         // Bright yellow (buttons)
  accentDark: '#F59E0B',     // Pressed state
  accentSoft: '#FEF3C7',     // Light yellow for backgrounds

  // === BACKGROUNDS ===
  background: '#F0FDFA',     // Mint background
  surface: '#FFFFFF',        // Card white
  surfaceMuted: '#F8FAFC',   // Slightly off-white

  // === TEXT ===
  textPrimary: '#0F172A',    // Nearly black
  textSecondary: '#64748B',  // Gray
  textMuted: '#94A3B8',      // Lighter gray
  textLight: '#FFFFFF',
  textOnAccent: '#78350F',   // Dark brown text on yellow

  // === STATUS ===
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // === CATEGORY COLORS (for badges) ===
  categoryValues: '#0D9488',    // Teal
  categorySports: '#3B82F6',    // Blue
  categoryFantasy: '#8B5CF6',   // Purple
  categoryFable: '#EC4899',     // Pink
  categoryScience: '#F59E0B',   // Amber

  // === BORDERS ===
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
};

export const typography = {
  // Font families
  fontRegular: 'Poppins_400Regular',
  fontMedium: 'Poppins_500Medium',
  fontSemiBold: 'Poppins_600SemiBold',
  fontBold: 'Poppins_700Bold',

  // Sizes
  displayLarge: 32,
  displayMedium: 28,
  heading1: 24,
  heading2: 20,
  heading3: 18,
  bodyLarge: 16,
  body: 15,
  bodySmall: 14,
  caption: 13,
  tiny: 11,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLarge: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};