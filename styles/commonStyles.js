
import { colors, typography, spacing, borderRadius, shadows, animations, colorUtils } from './designSystem';

export const buttonStyles = {
  cardActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    ...shadows.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    transform: [{ scale: 1 }],
  },
  
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    ...shadows.lg,
    shadowColor: colors.error,
    shadowOpacity: 0.4,
    transform: [{ scale: 1 }],
  },

  saveButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    ...shadows.xl,
    shadowColor: colors.success,
    shadowOpacity: 0.5,
    transform: [{ scale: 1 }],
  },
  
  cancelButton: {
    flex: 1,
    backgroundColor: colors.neutral,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    ...shadows.lg,
    shadowColor: colors.neutral,
    shadowOpacity: 0.4,
    transform: [{ scale: 1 }],
  },

  buttonLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.textWhite,
    textTransform: 'uppercase',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
    marginTop: spacing.md,
  },
};

export const cardStyles = {
  card: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    borderWidth: 0,
    overflow: 'hidden',
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  
  cardTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    lineHeight: typography.lineHeight.tight,
  },
  
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  
  cardFooter: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colorUtils.withOpacity(colors.textLight, 0.2),
    backgroundColor: colorUtils.withOpacity(colors.surfaceVariant, 0.3),
  },
};

export const titleStyles = {
  screenTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: '#000000',
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    paddingLeft: spacing.md,
  },
  
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
};

export const inputStyles = {
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  
  maskedInput: {
    borderWidth: 2,
    borderColor: colorUtils.withOpacity(colors.textLight, 0.3),
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
    color: '#000000',
    ...shadows.sm,
    focusBorderColor: colors.primary,
  },
  
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  
  inputContainer: {
    marginBottom: spacing.md,
  },
  
  floatingLabel: {
    position: 'absolute',
    left: spacing.md,
    top: -spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    zIndex: 1,
  },
};

export const fabStyles = {
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    borderRadius: borderRadius.full,
    ...shadows.xl,
  },
};

export const layoutStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollView: {
    flex: 1,
    padding: spacing.lg,
  },
  
  scrollContent: {
    paddingBottom: spacing['6xl'],
    flexGrow: 1,
  },
};

export const badgeStyles = {
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  
  badgeText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
};

export const modalStyles = {
  modal: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    maxHeight: '90%',
    ...shadows.xl,
  },
};

export const chipStyles = {
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  
  chipPrimary: {
    backgroundColor: colors.primary,
  },
  
  chipSuccess: {
    backgroundColor: colors.success,
  },
  
  chipWarning: {
    backgroundColor: colors.warning,
  },
  
  chipError: {
    backgroundColor: colors.error,
  },
  
  chipNeutral: {
    backgroundColor: colors.neutral,
  },
  
  chipText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
};

export const stateStyles = {
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
};

export const navigationStyles = {
  header: {
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  headerTitle: {
    color: colors.textWhite,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  
  tabBar: {
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  tabLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
};

export default {
  buttonStyles,
  cardStyles,
  titleStyles,
  inputStyles,
  fabStyles,
  layoutStyles,
  badgeStyles,
  modalStyles,
  chipStyles,
  stateStyles,
  navigationStyles,
};

