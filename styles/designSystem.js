
export const colors = {
  primary: '#667eea',
  primaryLight: '#8b9bff',
  primaryDark: '#4c63d2',
  primaryContainer: '#e8eaf6',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#1a1c2e',
  
  secondary: '#764ba2',
  secondaryLight: '#9c7bb8',
  secondaryDark: '#5a3a7a',
  secondaryContainer: '#f3e5f5',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#2d1b3d',
  
  background: '#f8f9fa',
  backgroundLight: '#ffffff',
  backgroundDark: '#2c3e50',
  
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',

  textPrimary: '#2c3e50',
  textSecondary: '#718096',
  textLight: '#a0aec0',
  textWhite: '#ffffff',
  
  success: '#4caf50',
  successLight: '#81c784',
  successContainer: '#e8f5e8',
  onSuccess: '#ffffff',
  onSuccessContainer: '#1b5e20',
  
  warning: '#ff9800',
  warningLight: '#ffb74d',
  warningContainer: '#fff3e0',
  onWarning: '#ffffff',
  onWarningContainer: '#e65100',
  
  error: '#f44336',
  errorLight: '#e57373',
  errorContainer: '#ffebee',
  onError: '#ffffff',
  onErrorContainer: '#b71c1c',
  
  info: '#2196f3',
  infoLight: '#64b5f6',
  infoContainer: '#e3f2fd',
  onInfo: '#ffffff',
  onInfoContainer: '#0d47a1',
  
  categoryPersonal: '#4caf50',
  categoryWork: '#2196f3',
  categoryStudy: '#ff9800',
  categoryHome: '#9c27b0',
  categoryHealth: '#e91e63',
  categoryOther: '#607d8b',
  
  neutral: '#757575',
  neutralLight: '#9e9e9e',
  neutralDark: '#424242',
  neutralContainer: '#f5f5f5',
  onNeutral: '#ffffff',
  onNeutralContainer: '#212121',
  
  priorityHigh: '#f44336',
  priorityMedium: '#ff9800',
  priorityLow: '#4caf50',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  glass: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(255, 255, 255, 0.2)',
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const shadows = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  xl: {
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
  },
  '2xl': {
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
  },
};

export const layout = {
  breakpoints: {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
  

  containerMaxWidth: '100%',
  containerPadding: 20,
  headerHeight: 60,
  tabBarHeight: 80,
};

export const components = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  
  button: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.textLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  
  modal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.lg,
    padding: spacing.lg,
    maxHeight: '90%',
    ...shadows.xl,
  },
};

export const gradients = {
  primary: ['#667eea', '#764ba2'],
  success: ['#4caf50', '#45a049'],
  warning: ['#ff9800', '#f57c00'],
  error: ['#f44336', '#d32f2f'],
  info: ['#2196f3', '#1976d2'],
};

export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
  
  transitions: {
    fast: {
      duration: 150,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    normal: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    slow: {
      duration: 500,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
  },
};

export const textStyles = {
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.normal,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.normal,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
};

export const colorUtils = {
  withOpacity: (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  darken: (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
  
  lighten: (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  components,
  gradients,
  animations,
  textStyles,
  colorUtils,
};
