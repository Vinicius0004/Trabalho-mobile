import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

export default function HomeScreen({ navigation }) {
  const menuItems = [
    { title: 'Eventos', icon: '📅', screen: 'Events', color: '#5f27cd', gradient: ['#667eea', '#764ba2'] },
    { title: 'Contatos', icon: '👥', screen: 'Contacts', color: '#00d2ff', gradient: ['#00d2ff', '#3a7bd5'] },
    { title: 'Tarefas', icon: '✅', screen: 'Tasks', color: '#ffa502', gradient: ['#ffa502', '#ff6348'] },
    { title: 'Lembretes', icon: '⏰', screen: 'Reminders', color: '#5f27cd', gradient: ['#667eea', '#764ba2'] },
    { title: 'Notas', icon: '📝', screen: 'Notes', color: '#00d2ff', gradient: ['#00d2ff', '#3a7bd5'] },
    { title: 'Dashboard', icon: '📊', screen: 'Dashboard', color: '#ffa502', gradient: ['#ffa502', '#ff6348'] },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda Inteligente</Text>
      <Text style={styles.subtitle}>Organize sua vida de forma inteligente</Text>
      
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.iconText}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5f27cd',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 50,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    height: 150,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 0.8,
  },
  iconText: {
    fontSize: 56,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
});

