import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const ContactContext = createContext();

export function ContactProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadContacts = async () => {
    try {
      console.log('🔄 Carregando contatos do Storage...');
      const storedContacts = await storage.getItem('contacts');
      console.log('📦 Dados recuperados:', storedContacts);
      
      if (storedContacts && storedContacts !== 'null' && storedContacts !== '[]') {
        const parsedContacts = JSON.parse(storedContacts);
        console.log('✅ Contatos carregados:', parsedContacts.length, 'itens');
        setContacts(parsedContacts);
      } else {
        console.log('ℹ️ Nenhum contato salvo encontrado');
        setContacts([]);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('❌ Erro ao carregar contatos:', error);
      setIsLoaded(true);
    }
  };

  const saveContacts = async (newContacts) => {
    try {
      console.log('💾 Salvando contatos:', newContacts.length, 'itens');
      const success = await storage.setItem('contacts', JSON.stringify(newContacts));
      if (success) {
        console.log('✅ Contatos salvos com sucesso!');
      } else {
        console.log('⚠️ Falha ao salvar contatos');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar contatos:', error);
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
    console.log('🗑️ Excluindo contato:', contactId);
    const newContacts = contacts.filter(contact => contact.id !== contactId);
    console.log('📝 Novos contatos após exclusão:', newContacts.length, 'itens');
    setContacts(newContacts);
    await saveContacts(newContacts);
  };

  useEffect(() => {
    console.log('🚀 ContactContext montado - iniciando carregamento...');
    loadContacts();
  }, []);

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

