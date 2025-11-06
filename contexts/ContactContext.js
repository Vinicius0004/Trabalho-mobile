import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const ContactContext = createContext();

export function ContactProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega contatos do storage
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

  // Salva contatos no storage
  const saveContacts = async (newContacts) => {
    try {
      if (!Array.isArray(newContacts)) return;
      console.log('💾 Salvando contatos:', newContacts.length, 'itens');
      const success = await storage.setItem('contacts', JSON.stringify(newContacts));
      if (success) console.log('✅ Contatos salvos com sucesso!');
      else console.log('⚠️ Falha ao salvar contatos');
    } catch (error) {
      console.error('❌ Erro ao salvar contatos:', error);
    }
  };

  // Adiciona novo contato
  const addContact = async (contact) => {
    const newContacts = [
      ...contacts,
      { ...contact, id: contact.id || Date.now().toString() }
    ];
    setContacts(newContacts);
    console.log('➕ Contato adicionado:', contact.name);
    await saveContacts(newContacts);
  };

  // Atualiza contato existente
  const updateContact = async (updatedContact) => {
    const newContacts = contacts.map(contact =>
      contact.id === updatedContact.id ? updatedContact : contact
    );
    setContacts(newContacts);
    console.log('✏️ Contato atualizado:', updatedContact.name);
    await saveContacts(newContacts);
  };

  // Remove contato
  const deleteContact = async (contactId) => {
    console.log('🗑️ Excluindo contato:', contactId);
    const newContacts = contacts.filter(contact => contact.id !== contactId);
    setContacts(newContacts);
    console.log('📝 Contatos restantes:', newContacts.length, 'itens');
    await saveContacts(newContacts);
  };

  // Alterna favorito
  const toggleFavorite = async (contactId) => {
    const newContacts = contacts.map(contact =>
      contact.id === contactId ? { ...contact, isFavorite: !contact.isFavorite } : contact
    );
    setContacts(newContacts);
    console.log('⭐ Toggle favorito para contato:', contactId);
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
      toggleFavorite,
      loadContacts,
      isLoaded
    }}>
      {children}
    </ContactContext.Provider>
  );
}
