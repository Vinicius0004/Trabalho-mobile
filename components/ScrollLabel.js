import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows, animations, colorUtils } from '../styles/designSystem';

const { width } = Dimensions.get('window');

export default function ScrollLabel({ sections, scrollY }) {
  const [currentSection, setCurrentSection] = useState(sections[0]?.label || '');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = useCallback((event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    
    // Determinar seção atual baseada na posição do scroll
    let newSection = sections[0]?.label || '';
    
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollPosition >= sections[i].position) {
        newSection = sections[i].label;
        break;
      }
    }
    
    if (newSection !== currentSection) {
      setCurrentSection(newSection);
      
      // Animação melhorada com easing
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animations.duration.fast,
          easing: animations.easing.decelerate,
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Mostrar por mais tempo
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animations.duration.normal,
          easing: animations.easing.accelerate,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Callback opcional
    if (scrollY) {
      scrollY(scrollPosition);
    }
  }, [currentSection, fadeAnim, sections, scrollY]);

  return {
    handleScroll,
    Label: () => (
      <Animated.View 
        style={[
          styles.labelContainer, 
          { 
            opacity: fadeAnim,
            transform: [{
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }]
          }
        ]}
      >
        <View style={styles.labelContent}>
          <Text style={styles.labelText}>{currentSection}</Text>
        </View>
      </Animated.View>
    ),
  };
}

const styles = StyleSheet.create({
  labelContainer: {
    position: 'absolute',
    top: 120,
    right: spacing.lg,
    zIndex: 1000,
    elevation: 12,
  },
  labelContent: {
    backgroundColor: colorUtils.withOpacity(colors.primary, 0.95),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius['3xl'],
    ...shadows['2xl'],
    borderWidth: 1,
    borderColor: colorUtils.withOpacity(colors.textWhite, 0.2),
    minWidth: width * 0.3,
    alignItems: 'center',
  },
  labelText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    textAlign: 'center',
    textShadowColor: colorUtils.withOpacity(colors.primaryDark, 0.5),
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

