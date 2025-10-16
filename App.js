import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { EventProvider } from './EventContext';
import { ContactProvider } from './contexts/ContactContext';
import { TaskProvider } from './contexts/TaskContext';
import { ReminderProvider } from './contexts/ReminderContext';
import { NoteProvider } from './contexts/NoteContext';
import { colors, shadows, typography, navigationStyles } from './styles/designSystem';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import ContactsScreen from './screens/ContactsScreen';
import TasksScreen from './screens/TasksScreen';
import RemindersScreen from './screens/RemindersScreen';
import NotesScreen from './screens/NotesScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <EventProvider>
        <ContactProvider>
          <TaskProvider>
            <ReminderProvider>
              <NoteProvider>
                <NavigationContainer>
                  <Stack.Navigator 
                    initialRouteName="Home"
                    screenOptions={{
                      headerStyle: {
                        ...navigationStyles.header,
                        backgroundColor: colors.primary,
                      },
                      headerTintColor: colors.textWhite,
                      headerTitleStyle: {
                        ...navigationStyles.headerTitle,
                        fontWeight: typography.fontWeight.bold,
                        fontSize: typography.fontSize.lg,
                      },
                      headerBackTitleVisible: false,
                      cardStyle: {
                        backgroundColor: colors.background,
                      },
                      cardShadowEnabled: true,
                      cardOverlayEnabled: true,
                    }}
                  >
                    <Stack.Screen 
                      name="Home" 
                      component={HomeScreen} 
                      options={{ 
                        title: 'Agenda Inteligente',
                        headerShown: false 
                      }}
                    />
                    <Stack.Screen 
                      name="Events" 
                      component={EventsScreen} 
                      options={{ title: 'Eventos' }}
                    />
                    <Stack.Screen 
                      name="Contacts" 
                      component={ContactsScreen} 
                      options={{ title: 'Contatos' }}
                    />
                    <Stack.Screen 
                      name="Tasks" 
                      component={TasksScreen} 
                      options={{ title: 'Tarefas' }}
                    />
                    <Stack.Screen 
                      name="Reminders" 
                      component={RemindersScreen} 
                      options={{ title: 'Lembretes' }}
                    />
                    <Stack.Screen 
                      name="Notes" 
                      component={NotesScreen} 
                      options={{ title: 'Notas' }}
                    />
                    <Stack.Screen 
                      name="Dashboard" 
                      component={DashboardScreen} 
                      options={{ title: 'Dashboard' }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </NoteProvider>
            </ReminderProvider>
          </TaskProvider>
        </ContactProvider>
      </EventProvider>
    </PaperProvider>
  );
}

