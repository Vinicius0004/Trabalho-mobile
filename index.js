import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, View, Text } from 'react-native';
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

function DetailScreen({ route, navigation }) {
  const { itemId, otherParam } = route.params || {};
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Detail Screen</Text>
      <Text>itemId: {itemId}</Text>
      <Text>otherParam: {otherParam}</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f0f0f0',
    primary: '#6200ee',
  },
};

export default function Main() {
  return (
    <PaperProvider>
      <EventProvider>
        <ContactProvider>
          <TaskProvider>
            <ReminderProvider>
              <NoteProvider>
                <NavigationContainer theme={MyTheme}>
                  <Stack.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                      headerStyle: {
                        backgroundColor: '#2196F3',
                      },
                      headerTintColor: '#fff',
                      headerTitleStyle: {
                        fontWeight: 'bold',
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
                    <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tarefas' }} />
                    <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Lembretes' }} />
                    <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Notas' }} />
                    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
                    <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalhes' }} />
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

registerRootComponent(Main);
