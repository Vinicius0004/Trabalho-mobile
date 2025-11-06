import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, Chip, Dialog, PaperProvider } from 'react-native-paper';
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
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

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

  // estados para confirmação de exclusão
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const [deleteCandidateTitle, setDeleteCandidateTitle] = useState('');

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
        await updateReminder(reminderData);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Lembrete Atualizado',
          textBody: 'O lembrete foi atualizado com sucesso!',
        });
      } else {
        await addReminder(reminderData);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Lembrete Criado',
          textBody: 'Novo lembrete adicionado com sucesso!',
        });
      }

      setModalVisible(false);
      reset();
      setEditingReminder(null);
      setIsActive(true);
      setDate(new Date());
    } catch (error) {
      console.error('Erro onSubmit:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: 'Erro ao salvar lembrete. Tente novamente.',
      });
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

  const promptDelete = (reminderId) => {
    const reminder = reminders.find(r => r.id === reminderId);
    setDeleteCandidateId(reminderId);
    setDeleteCandidateTitle(reminder ? reminder.title : 'este lembrete');
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!deleteCandidateId) return;

    try {
      await deleteReminder(deleteCandidateId);
      setConfirmVisible(false);
      setDeleteCandidateId(null);
      setDeleteCandidateTitle('');
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Lembrete Excluído',
        textBody: 'O lembrete foi excluído com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao excluir lembrete:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: 'Erro ao excluir lembrete. Tente novamente.',
      });
    }
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

  const activeReminders = reminders.filter(r => r.isActive);
  const inactiveReminders = reminders.filter(r => !r.isActive);

  return (
    <View style={styles.container}>
      <Label />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
      >
        <Text style={styles.title}>Lembretes</Text>

        {[...activeReminders, ...inactiveReminders].map((reminder) => (
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
                onPress={() => promptDelete(reminder.id)} 
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
        {/* Modal de confirmação de exclusão */}
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Excluir Lembrete</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Tem certeza que deseja excluir "{deleteCandidateTitle}"?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancelar</Button>
            <Button onPress={confirmDelete}>Excluir</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal de criação/edição */}
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
                  if (params.date) setDate(new Date(params.date));
                }}
                locale="pt-br"
                headerButtonColor={colors.primary}
                selectedItemColor={colors.primary}
                height={320}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Ativo:</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>

            <View style={styles.modalButtons}>
              <Button 
                mode="contained" 
                onPress={() => setModalVisible(false)} 
                style={styles.Button}
                icon="close"
                labelStyle={styles.buttonLabel}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmit(onSubmit)} 
                style={styles.Button}
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
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.md },
  title: { ...typography.h1, marginBottom: spacing.md },
  reminderCard: { marginBottom: spacing.md },
  inactiveCard: { opacity: 0.6 },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderTitle: { ...typography.h3 },
  inactiveText: { color: colors.textDisabled },
  reminderDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  frequencyChip: { paddingHorizontal: spacing.sm },
  chipText: { color: colors.white },
  reminderTime: { ...typography.body },
  reminderType: { marginTop: spacing.xs },
  cardActions: { justifyContent: 'flex-end' },
  editButton: { marginRight: spacing.sm },
  deleteButton: { backgroundColor: colors.danger },
  fab: { position: 'absolute', margin: spacing.md, right: 0, bottom: 0 },
  modal: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: borderRadius.md, padding: spacing.md, maxHeight: '90%' },
  modalTitle: { ...typography.h2, marginBottom: spacing.md },
  input: { marginBottom: spacing.sm },
  maskedInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, marginBottom: spacing.sm },
  label: { ...typography.body, marginBottom: spacing.xs },
  picker: { marginBottom: spacing.sm, backgroundColor: colors.surface },
  dateContainer: { marginVertical: spacing.sm },
  selectedDate: { marginBottom: spacing.sm, ...typography.body },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  submitButton: { marginTop: spacing.md },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.xl },
  Button: { flex: 1, marginHorizontal: spacing.sm },
  errorText: { color: '#f44336', marginBottom: spacing.md },
});
