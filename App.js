import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { EventProvider } from './EventContext';
import { ContactProvider } from './contexts/ContactContext';
import { TaskProvider } from './contexts/TaskContext';
import { ReminderProvider } from './contexts/ReminderContext';
import { NoteProvider } from './contexts/NoteContext';

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
                        backgroundColor: '#667eea',
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                      },
                      headerTintColor: '#fff',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 20,
                        letterSpacing: 0.5,
                      },
                    }}
                  >
                    <Stack.Screen 
                      name="Home" 
                      component={HomeScreen} 
                      options={{ title: 'Agenda Inteligente' }}
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

