import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ContactContext = createContext();

export function ContactProvider({ children }) {
  const [contacts, setContacts] = useState([]);

  const loadContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('contacts');
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  const saveContacts = async (newContacts) => {
    try {
      await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
    }
  };

  const addContact = async (contact) => {
    const newContacts = [...contacts, { ...contact, id: contact.id || Date.now().toString() }];
    setContacts(newContacts);
    await saveContacts(newContacts);
  };

  const updateContact = async (updatedContact) => {
    const newContacts = contacts.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    );
    setContacts(newContacts);
    await saveContacts(newContacts);
  };

  const deleteContact = async (contactId) => {
    const newContacts = contacts.filter(contact => contact.id !== contactId);
    setContacts(newContacts);
    await saveContacts(newContacts);
  };

  return (
    <ContactContext.Provider value={{ 
      contacts, 
      addContact, 
      updateContact, 
      deleteContact, 
      loadContacts 
    }}>
      {children}
    </ContactContext.Provider>
  );
}

