import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const NoteContext = createContext();

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadNotes = async () => {
    try {
      console.log('🔄 Carregando notas do Storage...');
      const storedNotes = await storage.getItem('notes');
      console.log('📦 Dados recuperados:', storedNotes);
      
      if (storedNotes && storedNotes !== 'null' && storedNotes !== '[]') {
        const parsedNotes = JSON.parse(storedNotes);
        console.log('✅ Notas carregadas:', parsedNotes.length, 'itens');
        setNotes(parsedNotes);
      } else {
        console.log('ℹ️ Nenhuma nota salva encontrada');
        setNotes([]);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('❌ Erro ao carregar notas:', error);
      setIsLoaded(true);
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      console.log('💾 Salvando notas:', newNotes.length, 'itens');
      const success = await storage.setItem('notes', JSON.stringify(newNotes));
      if (success) {
        console.log('✅ Notas salvas com sucesso!');
      } else {
        console.log('⚠️ Falha ao salvar notas');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar notas:', error);
    }
  };

  const addNote = async (note) => {
    const newNotes = [...notes, { ...note, id: note.id || Date.now().toString() }];
    setNotes(newNotes);
    await saveNotes(newNotes);
  };

  const updateNote = async (updatedNote) => {
    const newNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(newNotes);
    await saveNotes(newNotes);
  };

  const deleteNote = async (noteId) => {
    console.log('🗑️ Excluindo nota:', noteId);
    const newNotes = notes.filter(note => note.id !== noteId);
    console.log('📝 Novas notas após exclusão:', newNotes.length, 'itens');
    setNotes(newNotes);
    await saveNotes(newNotes);
  };

  useEffect(() => {
    console.log('🚀 NoteContext montado - iniciando carregamento...');
    loadNotes();
  }, []);

  return (
    <NoteContext.Provider value={{ 
      notes, 
      addNote, 
      updateNote, 
      deleteNote, 
      loadNotes 
    }}>
      {children}
    </NoteContext.Provider>
  );
}

