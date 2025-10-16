import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MaskedTextInput } from 'react-native-mask-text';
import moment from 'moment';
import { ReminderContext } from '../contexts/ReminderContext';
import ScrollLabel from '../components/ScrollLabel';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../styles/designSystem';

// Configurar dayjs para usar português brasileiro
dayjs.locale('pt-br');

const schema = yup.object().shape({
  title: yup.string().required('Título é obrigatório').min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: yup.string().required('Descrição é obrigatória'),
  type: yup.string().required('Tipo é obrigatório'),
  frequency: yup.string().required('Frequência é obrigatória'),
  time: yup.string().required('Hora é obrigatória').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
});

export default function RemindersScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [date, setDate] = useState(new Date());
  const [isActive, setIsActive] = useState(true);
  const { reminders, addReminder, updateReminder, deleteReminder, loadReminders } = useContext(ReminderContext);

  // Configurar scroll labels
  const sections = [
    { label: '⏰ Lembretes', position: 0 },
    { label: '🔔 Ativos', position: 200 },
    { label: '📅 Agendados', position: 400 },
  ];

  const { handleScroll, Label } = ScrollLabel({ sections });

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      type: 'medicamento',
      frequency: 'diario',
      time: '',
    }
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const onSubmit = async (data) => {
    try {
      const reminderData = {
        ...data,
        date: moment(date).format('YYYY-MM-DD'),
        isActive,
        createdAt: editingReminder ? editingReminder.createdAt : moment().format('YYYY-MM-DD HH:mm'),
        id: editingReminder ? editingReminder.id : Date.now().toString(),
      };

      if (editingReminder) {
        updateReminder(reminderData);
      } else {
        addReminder(reminderData);
      }

      setModalVisible(false);
      reset();
      setEditingReminder(null);
      setIsActive(true);
      setDate(new Date());
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar lembrete');
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setValue('title', reminder.title);
    setValue('description', reminder.description);
    setValue('type', reminder.type);
    setValue('frequency', reminder.frequency);
    setValue('time', reminder.time);
    setIsActive(reminder.isActive !== false);
    setDate(new Date(reminder.date));
    setModalVisible(true);
  };

  const handleDelete = (reminderId) => {
    const reminder = reminders.find(r => r.id === reminderId);
    const reminderName = reminder ? reminder.title : 'este lembrete';
    
    Alert.alert(
      '🗑️ Confirmar Exclusão',
      `Tem certeza que deseja excluir "${reminderName}"?\n\nEsta ação não pode ser desfeita.`,
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
              deleteReminder(reminderId);
              Alert.alert('✅ Sucesso', 'Lembrete excluído com sucesso!');
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao excluir lembrete. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const toggleReminderStatus = (reminder) => {
    updateReminder({ ...reminder, isActive: !reminder.isActive });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'medicamento': return '💊';
      case 'compromisso': return '📅';
      case 'exercicio': return '🏃';
      case 'alimentacao': return '🍽️';
      case 'outros': return '⏰';
      default: return '⏰';
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'diario': return colors.success;
      case 'semanal': return colors.info;
      case 'mensal': return colors.warning;
      case 'unico': return colors.categoryOther;
      default: return colors.textLight;
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
        <Text style={styles.title}>Lembretes</Text>

        {reminders.map((reminder) => (
          <Card key={reminder.id} style={[styles.reminderCard, !reminder.isActive && styles.inactiveCard]}>
            <Card.Content>
              <View style={styles.reminderHeader}>
                <Title style={[styles.reminderTitle, !reminder.isActive && styles.inactiveText]}>
                  {getTypeIcon(reminder.type)} {reminder.title}
                </Title>
                <Switch
                  value={reminder.isActive !== false}
                  onValueChange={() => toggleReminderStatus(reminder)}
                />
              </View>
              <Paragraph style={!reminder.isActive && styles.inactiveText}>
                {reminder.description}
              </Paragraph>
              <View style={styles.reminderDetails}>
                <Chip 
                  style={[styles.frequencyChip, { backgroundColor: getFrequencyColor(reminder.frequency) }]}
                  textStyle={styles.chipText}
                >
                  {reminder.frequency?.toUpperCase()}
                </Chip>
                <Text style={styles.reminderTime}>
                  📅 {moment(reminder.date).format('DD/MM/YYYY')} às {reminder.time}
                </Text>
              </View>
              <Text style={styles.reminderType}>
                Tipo: {reminder.type}
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained"
                onPress={() => handleEdit(reminder)} 
                style={styles.editButton}
                icon="pencil"
                labelStyle={styles.buttonLabel}
              >
                Editar
              </Button>
              <Button 
                mode="contained"
                onPress={() => handleDelete(reminder.id)} 
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
        label="Novo Lembrete"
        onPress={() => {
          reset();
          setEditingReminder(null);
          setIsActive(true);
          setDate(new Date());
          setModalVisible(true);
        }}
      />

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}</Text>
            
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Título do lembrete"
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

            <Text style={styles.label}>Tipo:</Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Medicamento" value="medicamento" />
                  <Picker.Item label="Compromisso" value="compromisso" />
                  <Picker.Item label="Exercício" value="exercicio" />
                  <Picker.Item label="Alimentação" value="alimentacao" />
                  <Picker.Item label="Outros" value="outros" />
                </Picker>
              )}
            />

            <Text style={styles.label}>Frequência:</Text>
            <Controller
              control={control}
              name="frequency"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Único" value="unico" />
                  <Picker.Item label="Diário" value="diario" />
                  <Picker.Item label="Semanal" value="semanal" />
                  <Picker.Item label="Mensal" value="mensal" />
                </Picker>
              )}
            />

            <Controller
              control={control}
              name="time"
              render={({ field: { onChange, onBlur, value } }) => (
                <MaskedTextInput
                  mask="99:99"
                  placeholder="HH:MM"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={[styles.maskedInput, errors.time && styles.inputError]}
                />
              )}
            />
            {errors.time && <Text style={styles.errorText}>{errors.time.message}</Text>}

            <View style={styles.dateContainer}>
              <Text style={styles.label}>Data:</Text>
              <Text style={styles.selectedDate}>{dayjs(date).format('DD/MM/YYYY')}</Text>
              <DateTimePicker
                mode="single"
                date={date}
                onChange={(params) => {
                  if (params.date) {
                    setDate(new Date(params.date));
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
              <Text style={styles.label}>Lembrete Ativo:</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
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
                {editingReminder ? 'Atualizar' : 'Salvar'}
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
    backgroundColor: '#FFFFFF',
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
  reminderCard: {
    marginBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    padding: spacing.lg,
    elevation: 8,
  },
  inactiveCard: {
    opacity: 0.6,
    backgroundColor: colors.surfaceVariant,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reminderTitle: {
    flex: 1,
    ...textStyles.h4,
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
  inactiveText: {
    color: '#95a5a6',
  },
  reminderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  frequencyChip: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.lg,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  reminderTime: {
    ...textStyles.caption,
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
  reminderType: {
    ...textStyles.caption,
    color: '#2c3e50',
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: '#5f27cd',
    borderRadius: borderRadius.full,
    elevation: 16,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    maxHeight: '92%',
    elevation: 12,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.lg,
  },
  maskedInput: {
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.md,
    backgroundColor: '#F9F9F9',
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ff4757',
    backgroundColor: '#fff5f7',
  },
  errorText: {
    color: '#ff4757',
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
    borderColor: '#CCCCCC',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F9F9F9',
    color: '#000000',
  },
  dateContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  cardActions: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  editButton: {
    flex: 1,
    borderRadius: 16,
    elevation: 0,
    paddingVertical: 4,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 16,
    elevation: 0,
    paddingVertical: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00d2ff',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    elevation: 6,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#757575',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    elevation: 4,
  },
  buttonLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});

