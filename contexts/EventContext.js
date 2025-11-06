import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadEvents = async () => {
    try {
      console.log('🔄 Carregando eventos do Storage...');
      const storedEvents = await storage.getItem('events');
      console.log('📦 Dados recuperados:', storedEvents);
      
      if (storedEvents && storedEvents !== 'null' && storedEvents !== '[]') {
        const parsedEvents = JSON.parse(storedEvents);
        console.log('✅ Eventos carregados:', parsedEvents.length, 'itens');
        setEvents(parsedEvents);
      } else {
        console.log('ℹ️ Nenhum evento salvo encontrado');
        setEvents([]);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
      setIsLoaded(true);
    }
  };

  const saveEvents = async (newEvents) => {
    try {
      console.log('💾 Salvando eventos:', newEvents.length, 'itens');
      const success = await storage.setItem('events', JSON.stringify(newEvents));
      if (success) {
        console.log('✅ Eventos salvos com sucesso!');
      } else {
        console.log('⚠️ Falha ao salvar eventos');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar eventos:', error);
    }
  };

  const addEvent = async (event) => {
    const newEvents = [...events, { ...event, id: event.id || Date.now().toString() }];
    setEvents(newEvents);
    await saveEvents(newEvents);
  };

  const updateEvent = async (updatedEvent) => {
    const newEvents = events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(newEvents);
    await saveEvents(newEvents);
  };

  const deleteEvent = async (eventId) => {
    console.log('🗑️ Excluindo evento:', eventId);
    const newEvents = events.filter(event => event.id !== eventId);
    console.log('📝 Novos eventos após exclusão:', newEvents.length, 'itens');
    setEvents(newEvents);
    await saveEvents(newEvents);
  };

  useEffect(() => {
    console.log('🚀 EventContext montado - iniciando carregamento...');
    loadEvents();
  }, []);

  return (
    <EventContext.Provider value={{ 
      events, 
      addEvent, 
      updateEvent, 
      deleteEvent, 
      loadEvents 
    }}>
      {children}
    </EventContext.Provider>
  );
}
