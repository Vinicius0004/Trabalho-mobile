import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const ReminderContext = createContext();

export function ReminderProvider({ children }) {
  const [reminders, setReminders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadReminders = async () => {
    try {
      console.log('🔄 Carregando lembretes do Storage...');
      const storedReminders = await storage.getItem('reminders');
      console.log('📦 Dados recuperados:', storedReminders);
      
      if (storedReminders && storedReminders !== 'null' && storedReminders !== '[]') {
        const parsedReminders = JSON.parse(storedReminders);
        console.log('✅ Lembretes carregados:', parsedReminders.length, 'itens');
        setReminders(parsedReminders);
      } else {
        console.log('ℹ️ Nenhum lembrete salvo encontrado');
        setReminders([]);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('❌ Erro ao carregar lembretes:', error);
      setIsLoaded(true);
    }
  };

  const saveReminders = async (newReminders) => {
    try {
      console.log('💾 Salvando lembretes:', newReminders.length, 'itens');
      const success = await storage.setItem('reminders', JSON.stringify(newReminders));
      if (success) {
        console.log('✅ Lembretes salvos com sucesso!');
      } else {
        console.log('⚠️ Falha ao salvar lembretes');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar lembretes:', error);
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
    console.log('🗑️ Excluindo lembrete:', reminderId);
    const newReminders = reminders.filter(reminder => reminder.id !== reminderId);
    console.log('📝 Novos lembretes após exclusão:', newReminders.length, 'itens');
    setReminders(newReminders);
    await saveReminders(newReminders);
  };

  useEffect(() => {
    console.log('🚀 ReminderContext montado - iniciando carregamento...');
    loadReminders();
  }, []);

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

