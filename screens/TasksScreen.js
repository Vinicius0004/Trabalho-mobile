import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, Checkbox } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
import { TaskContext } from '../contexts/TaskContext';

const schema = yup.object().shape({
  title: yup.string().required('Título é obrigatório').min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: yup.string().required('Descrição é obrigatória'),
  category: yup.string().required('Categoria é obrigatória'),
  priority: yup.string().required('Prioridade é obrigatória'),
  estimatedHours: yup.number().required('Horas estimadas são obrigatórias').min(0.5, 'Mínimo 0.5 horas'),
});

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { tasks, addTask, updateTask, deleteTask, loadTasks } = useContext(TaskContext);

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: 'pessoal',
      priority: 'media',
      estimatedHours: 1,
    }
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        dueDate: moment(dueDate).format('YYYY-MM-DD'),
        isCompleted,
        createdAt: editingTask ? editingTask.createdAt : moment().format('YYYY-MM-DD HH:mm'),
        id: editingTask ? editingTask.id : Date.now().toString(),
      };

      if (editingTask) {
        updateTask(taskData);
      } else {
        addTask(taskData);
      }

      setModalVisible(false);
      reset();
      setEditingTask(null);
      setIsCompleted(false);
      setDueDate(new Date());
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar tarefa');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setValue('title', task.title);
    setValue('description', task.description);
    setValue('category', task.category);
    setValue('priority', task.priority);
    setValue('estimatedHours', task.estimatedHours);
    setIsCompleted(task.isCompleted || false);
    setDueDate(new Date(task.dueDate));
    setModalVisible(true);
  };

  const handleDelete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const taskName = task ? task.title : 'esta tarefa';
    
    Alert.alert(
      '🗑️ Confirmar Exclusão',
      `Tem certeza que deseja excluir "${taskName}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { 
          text: '❌ Cancelar', 
          style: 'cancel' 
        },
        { 
          text: '🗑️ Excluir', 
          style: 'destructive', 
          onPress: () => {
            try {
              deleteTask(taskId);
              Alert.alert('✅ Sucesso', 'Tarefa excluída com sucesso!');
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao excluir tarefa. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const toggleTaskCompletion = (task) => {
    updateTask({ ...task, isCompleted: !task.isCompleted });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'trabalho': return '💼';
      case 'pessoal': return '👤';
      case 'estudos': return '📚';
      case 'casa': return '🏠';
      default: return '📋';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Tarefas</Text>

        {tasks.map((task) => (
          <Card key={task.id} style={[styles.taskCard, task.isCompleted && styles.completedCard]}>
            <Card.Content>
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  <Checkbox
                    status={task.isCompleted ? 'checked' : 'unchecked'}
                    onPress={() => toggleTaskCompletion(task)}
                  />
                  <Title style={[styles.taskTitle, task.isCompleted && styles.completedText]}>
                    {getCategoryIcon(task.category)} {task.title}
                  </Title>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.priorityText}>{task.priority?.toUpperCase()}</Text>
                </View>
              </View>
              <Paragraph style={task.isCompleted && styles.completedText}>
                {task.description}
              </Paragraph>
              <Paragraph style={styles.taskDetail}>
                📅 Prazo: {moment(task.dueDate).format('DD/MM/YYYY')}
              </Paragraph>
              <Paragraph style={styles.taskDetail}>
                ⏱️ Estimativa: {task.estimatedHours}h
              </Paragraph>
              <Paragraph style={styles.taskDetail}>
                📂 Categoria: {task.category}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleEdit(task)}>Editar</Button>
              <Button onPress={() => handleDelete(task.id)} textColor="#f44336">Excluir</Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Tarefa"
        onPress={() => {
          reset();
          setEditingTask(null);
          setIsCompleted(false);
          setDueDate(new Date());
          setModalVisible(true);
        }}
      />

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>
            
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Título da tarefa"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.title}
                  style={styles.input}
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Descrição"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.description}
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
              )}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

            <Text style={styles.label}>Categoria:</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Pessoal" value="pessoal" />
                  <Picker.Item label="Trabalho" value="trabalho" />
                  <Picker.Item label="Estudos" value="estudos" />
                  <Picker.Item label="Casa" value="casa" />
                </Picker>
              )}
            />

            <Text style={styles.label}>Prioridade:</Text>
            <Controller
              control={control}
              name="priority"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Baixa" value="baixa" />
                  <Picker.Item label="Média" value="media" />
                  <Picker.Item label="Alta" value="alta" />
                </Picker>
              )}
            />

            <Controller
              control={control}
              name="estimatedHours"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Horas estimadas"
                  value={value?.toString()}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  error={!!errors.estimatedHours}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />
            {errors.estimatedHours && <Text style={styles.errorText}>{errors.estimatedHours.message}</Text>}

            <View style={styles.dateContainer}>
              <Text style={styles.label}>Data de vencimento:</Text>
              <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
                {moment(dueDate).format('DD/MM/YYYY')}
              </Button>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                  
                  if (event.type === 'dismissed') {
                    setShowDatePicker(false);
                    return;
                  }
                  
                  if (selectedDate) {
                    setDueDate(selectedDate);
                    if (Platform.OS === 'ios') {
                      setShowDatePicker(false);
                    }
                  }
                }}
              />
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Tarefa Concluída:</Text>
              <Switch value={isCompleted} onValueChange={setIsCompleted} />
            </View>

            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.button}>
                Cancelar
              </Button>
              <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
                {editingTask ? 'Atualizar' : 'Salvar'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Espaço para o FAB
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskCard: {
    marginBottom: 15,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#e8f5e8',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskTitle: {
    flex: 1,
    marginLeft: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  taskDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  dateContainer: {
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

