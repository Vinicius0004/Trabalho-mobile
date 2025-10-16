import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadTasks = async () => {
    try {
      console.log('🔄 Carregando tarefas do Storage...');
      const storedTasks = await storage.getItem('tasks');
      console.log('📦 Dados recuperados:', storedTasks);
      
      if (storedTasks && storedTasks !== 'null' && storedTasks !== '[]') {
        const parsedTasks = JSON.parse(storedTasks);
        console.log('✅ Tarefas carregadas:', parsedTasks.length, 'itens');
        setTasks(parsedTasks);
      } else {
        console.log('ℹ️ Nenhuma tarefa salva encontrada');
        setTasks([]);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('❌ Erro ao carregar tarefas:', error);
      setIsLoaded(true);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      console.log('💾 Salvando tarefas:', newTasks.length, 'itens');
      const success = await storage.setItem('tasks', JSON.stringify(newTasks));
      if (success) {
        console.log('✅ Tarefas salvas com sucesso!');
      } else {
        console.log('⚠️ Falha ao salvar tarefas');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar tarefas:', error);
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
    console.log('🗑️ Excluindo tarefa:', taskId);
    const newTasks = tasks.filter(task => task.id !== taskId);
    console.log('📝 Novas tarefas após exclusão:', newTasks.length, 'itens');
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  useEffect(() => {
    console.log('🚀 TaskContext montado - iniciando carregamento...');
    loadTasks();
  }, []);

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

