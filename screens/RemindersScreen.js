import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MaskedTextInput } from 'react-native-mask-text';
import moment from 'moment';
import { ReminderContext } from '../contexts/ReminderContext';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const { reminders, addReminder, updateReminder, deleteReminder, loadReminders } = useContext(ReminderContext);

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
      case 'diario': return '#4caf50';
      case 'semanal': return '#2196f3';
      case 'mensal': return '#ff9800';
      case 'unico': return '#9c27b0';
      default: return '#757575';
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
            <Card.Actions>
              <Button onPress={() => handleEdit(reminder)}>Editar</Button>
              <Button onPress={() => handleDelete(reminder.id)} textColor="#f44336">Excluir</Button>
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
              <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
                {moment(date).format('DD/MM/YYYY')}
              </Button>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
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
                    setDate(selectedDate);
                    if (Platform.OS === 'ios') {
                      setShowDatePicker(false);
                    }
                  }
                }}
              />
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Lembrete Ativo:</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>

            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.button}>
                Cancelar
              </Button>
              <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
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
  reminderCard: {
    marginBottom: 15,
  },
  inactiveCard: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    flex: 1,
  },
  inactiveText: {
    color: '#999',
  },
  reminderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  frequencyChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reminderTime: {
    fontSize: 12,
    color: '#666',
  },
  reminderType: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
  maskedInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#f44336',
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

