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
      console.log('💾 Salvando notas:', Array.isArray(newNotes) ? newNotes.length : '??', 'itens');
      const success = await storage.setItem('notes', JSON.stringify(newNotes));
      if (success) {
        console.log('✅ Notas salvas com sucesso!');
      } else {
        console.log('⚠️ Falha ao salvar notas (storage retornou falsy)');
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
      note.id && updatedNote.id && note.id.toString() === updatedNote.id.toString()
        ? updatedNote
        : note
    );
    setNotes(newNotes);
    await saveNotes(newNotes);
  };

  const deleteNote = async (noteId) => {
    try {
      console.log('🗑️ deleteNote chamado com id:', noteId);
      const normalizedId = noteId != null ? noteId.toString() : null;

      const newNotes = notes.filter(note => {
        const nid = note && note.id != null ? note.id.toString() : '';
        return nid !== normalizedId;
      });

      console.log('📝 Novas notas após filtro:', newNotes.length, 'itens - ids:', newNotes.map(n => n.id));
      setNotes(newNotes);

      // Aguarda salvar e confere retorno
      await saveNotes(newNotes);
      console.log('✅ deleteNote: notas salvas após exclusão.');
    } catch (error) {
      console.error('❌ Erro em deleteNote:', error);
      throw error;
    }
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
      loadNotes,
    }}>
      {children}
    </NoteContext.Provider>
  );
}
