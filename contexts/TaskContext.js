import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error);
    }
  };

  const addTask = async (task) => {
    const newTasks = [...tasks, { ...task, id: task.id || Date.now().toString() }];
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  const updateTask = async (updatedTask) => {
    const newTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  const deleteTask = async (taskId) => {
    const newTasks = tasks.filter(task => task.id.toString() !== taskId.toString());
    setTasks(newTasks); // Atualiza UI imediatamente
    await saveTasks(newTasks); // Salva no AsyncStorage
  };


  return (
    <TaskContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask, 
      deleteTask, 
      loadTasks 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

