import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('events');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const saveEvents = async (newEvents) => {
    try {
      await AsyncStorage.setItem('events', JSON.stringify(newEvents));
    } catch (error) {
      console.error('Erro ao salvar eventos:', error);
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
    const newEvents = events.filter(event => event.id !== eventId);
    setEvents(newEvents);
    await saveEvents(newEvents);
  };

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

