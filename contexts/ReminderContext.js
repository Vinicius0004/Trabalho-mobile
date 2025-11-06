import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const ReminderContext = createContext();

export function ReminderProvider({ children }) {
  const [reminders, setReminders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadReminders = async () => {
    try {
      console.log('🔄 Carregando lembretes do Storage...');
      const storedReminders = await storage.getItem('reminders');
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
      if (success) console.log('✅ Lembretes salvos com sucesso!');
      else console.log('⚠️ Falha ao salvar lembretes');
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
    const newReminders = reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r);
    setReminders(newReminders);
    await saveReminders(newReminders);
  };

  const deleteReminder = async (reminderId) => {
    console.log('🗑️ Excluindo lembrete:', reminderId);
    const newReminders = reminders.filter(r => r.id !== reminderId);
    console.log('📝 Novos lembretes após exclusão:', newReminders.length, 'itens');
    setReminders(newReminders);
    await saveReminders(newReminders);
  };

  // Lembretes filtrados pela busca
  const filteredReminders = reminders.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lembretes ativos e inativos
  const activeReminders = filteredReminders.filter(r => r.isActive);
  const inactiveReminders = filteredReminders.filter(r => !r.isActive);

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
      loadReminders,
      searchQuery,
      setSearchQuery,
      filteredReminders,
      activeReminders,
      inactiveReminders,
      isLoaded
    }}>
      {children}
    </ReminderContext.Provider>
  );
}
