import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../styles/designSystem';

export default function LoadingSpinner({ 
  message = 'Carregando...', 
  size = 'large', 
  color = colors.primary,
  showMessage = true 
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={color} 
        style={styles.spinner}
      />
      {showMessage && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing['4xl'],
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
});
