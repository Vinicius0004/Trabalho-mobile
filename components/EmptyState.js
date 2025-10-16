import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';

export default function EmptyState({ 
  icon = '📝',
  title = 'Nenhum item encontrado',
  message = 'Adicione novos itens para começar',
  actionText,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {actionText && onAction && (
        <Text style={styles.actionText} onPress={onAction}>
          {actionText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  actionText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
