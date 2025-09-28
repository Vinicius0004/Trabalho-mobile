import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ReminderContext = createContext();

export function ReminderProvider({ children }) {
  const [reminders, setReminders] = useState([]);

  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem('reminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
    }
  };

  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(newReminders));
    } catch (error) {
      console.error('Erro ao salvar lembretes:', error);
    }
  };

  const addReminder = async (reminder) => {
    const newReminders = [...reminders, { ...reminder, id: reminder.id || Date.now().toString() }];
    setReminders(newReminders);
    await saveReminders(newReminders);
  };

  const updateReminder = async (updatedReminder) => {
    const newReminders = reminders.map(reminder => 
      reminder.id === updatedReminder.id ? updatedReminder : reminder
    );
    setReminders(newReminders);
    await saveReminders(newReminders);
  };

  const deleteReminder = async (reminderId) => {
    const newReminders = reminders.filter(reminder => reminder.id !== reminderId);
    setReminders(newReminders);
    await saveReminders(newReminders);
  };

  return (
    <ReminderContext.Provider value={{ 
      reminders, 
      addReminder, 
      updateReminder, 
      deleteReminder, 
      loadReminders 
    }}>
      {children}
    </ReminderContext.Provider>
  );
}

