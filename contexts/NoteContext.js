import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NoteContext = createContext();

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState([]);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
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
    const newNotes = notes.filter(note => note.id !== noteId);
    setNotes(newNotes);
    await saveNotes(newNotes);
  };

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

