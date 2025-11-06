import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, Checkbox } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
import { TaskContext } from '../contexts/TaskContext';
import ScrollLabel from '../components/ScrollLabel';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../styles/designSystem';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

dayjs.locale('pt-br');

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
  const [isCompleted, setIsCompleted] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const { tasks, addTask, updateTask, deleteTask } = useContext(TaskContext);

  const sections = [
    { label: '✅ Tarefas', position: 0 },
    { label: '📝 Pendentes', position: 200 },
    { label: '✔️ Concluídas', position: 400 },
  ];

  const { handleScroll, Label } = ScrollLabel({ sections });

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
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Atualizado', textBody: 'Tarefa atualizada com sucesso!' });
      } else {
        addTask(taskData);
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Salvo', textBody: 'Tarefa criada com sucesso!' });
      }

      setModalVisible(false);
      reset();
      setEditingTask(null);
      setIsCompleted(false);
      setDueDate(new Date());
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Erro', textBody: 'Erro ao salvar tarefa' });
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

  const handleDelete = (task) => {
    setTaskToDelete(task);
    setConfirmDeleteVisible(true);
  };

  const confirmDeleteTask = () => {
    try {
      deleteTask(taskToDelete.id);
      Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Excluído', textBody: 'Tarefa excluída com sucesso!' });
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Erro', textBody: 'Erro ao excluir tarefa. Tente novamente.' });
    } finally {
      setConfirmDeleteVisible(false);
      setTaskToDelete(null);
    }
  };

  const toggleTaskCompletion = (task) => {
    updateTask({ ...task, isCompleted: !task.isCompleted });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return colors.priorityHigh;
      case 'media': return colors.priorityMedium;
      case 'baixa': return colors.priorityLow;
      default: return colors.textLight;
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
      <Label />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        indicatorStyle="dark"
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        overScrollMode="always"
        scrollIndicatorInsets={{ right: 1 }}
        onScroll={handleScroll}
      >
        <Text style={styles.title}>Tarefas</Text>

        {tasks.map((task) => (
          <Card key={task.id} style={[styles.taskCard, task.isCompleted && styles.completedCard]}>
            <Card.Content style={styles.cardContent}>
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
              <Paragraph style={[styles.taskDescription, task.isCompleted && styles.completedText]}>
                {task.description}
              </Paragraph>
              <View style={styles.taskDetailsContainer}>
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskDetailIcon}>📅</Text>
                  <Paragraph style={styles.taskDetail}>
                    Prazo: {moment(task.dueDate).format('DD/MM/YYYY')}
                  </Paragraph>
                </View>
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskDetailIcon}>⏱️</Text>
                  <Paragraph style={styles.taskDetail}>
                    Estimativa: {task.estimatedHours}h
                  </Paragraph>
                </View>
                <View style={[styles.taskDetailRow, styles.lastDetailRow]}>
                  <Text style={styles.taskDetailIcon}>📂</Text>
                  <Paragraph style={styles.taskDetail}>
                    Categoria: {task.category}
                  </Paragraph>
                </View>
              </View>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained"
                onPress={() => handleEdit(task)} 
                style={styles.editButton}
                icon="pencil"
                labelStyle={styles.buttonLabel}
              >
                Editar
              </Button>
              <Button 
                mode="contained"
                onPress={() => handleDelete(task)} 
                style={styles.deleteButton}
                icon="delete"
                labelStyle={styles.buttonLabel}
              >
                Excluir
              </Button>
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
                  textColor="#000000"
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
                  textColor="#000000"
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
                  textColor="#000000"
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
              <Text style={styles.selectedDate}>{dayjs(dueDate).format('DD/MM/YYYY')}</Text>
              <DateTimePicker
                mode="single"
                date={dueDate}
                onChange={(params) => {
                  if (params.date) {
                    setDueDate(new Date(params.date));
                  }
                }}
                locale="pt-br"
                headerButtonColor={colors.primary}
                selectedItemColor={colors.primary}
                calendarTextStyle={{ 
                  color: '#000000',
                  fontSize: 16,
                  fontWeight: '600'
                }}
                headerTextStyle={{ 
                  color: colors.primary, 
                  fontWeight: 'bold',
                  fontSize: 18
                }}
                weekDaysTextStyle={{ 
                  color: '#000000', 
                  fontWeight: '700',
                  fontSize: 14
                }}
                monthContainerStyle={{ backgroundColor: colors.surface }}
                todayContainerStyle={{
                  borderWidth: 1,
                  borderColor: colors.primary
                }}
                todayTextStyle={{
                  color: colors.primary,
                  fontWeight: 'bold'
                }}
                height={320}
                displayFullDays={true}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Tarefa Concluída:</Text>
              <Switch value={isCompleted} onValueChange={setIsCompleted} />
            </View>

            <View style={styles.modalButtons}>
              <Button 
                mode="contained" 
                onPress={() => setModalVisible(false)} 
                style={styles.cancelButton}
                icon="close"
                labelStyle={styles.buttonLabel}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmit(onSubmit)} 
                style={styles.saveButton}
                icon="check"
                labelStyle={styles.buttonLabel}
              >
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing['6xl'],
    flexGrow: 1,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
  taskCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  cardContent: {
    padding: spacing.lg,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: colors.successLight + '20',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  taskTitle: {
    flex: 1,
    marginLeft: spacing.md,
    ...textStyles.h4,
    color: '#000000',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    minWidth: 70,
  },
  priorityText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  taskDescription: {
    ...textStyles.body,
    color: '#000000',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  taskDetailsContainer: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lastDetailRow: {
    marginBottom: 0,
  },
  taskDetailIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  taskDetail: {
    ...textStyles.caption,
    color: '#000000',
    marginBottom: 0,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.warning,
    borderRadius: borderRadius.full,
    ...shadows.xl,
  },
  modal: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    maxHeight: '92%',
    ...shadows.xl,
  },
  modalTitle: {
    ...textStyles.h3,
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  label: {
    ...textStyles.label,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
  picker: {
    borderWidth: 2,
    borderColor: colors.textLight,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceVariant,
    color: '#000000',
  },
  dateContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
  },
  selectedDate: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.bold,
    backgroundColor: colors.primaryLight + '30',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  cardActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    elevation: 4,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    elevation: 6,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#757575',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    elevation: 4,
    shadowColor: '#757575',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});

