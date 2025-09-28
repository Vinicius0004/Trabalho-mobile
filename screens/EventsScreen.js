// ...existing code...
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import axios from 'axios';
import { EventContext } from '../EventContext';
// ...existing code...

const schema = yup.object().shape({
  name: yup.string().required('Nome do evento é obrigatório').min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: yup.string().required('Descrição é obrigatória').min(5, 'Descrição deve ter pelo menos 5 caracteres'),
  location: yup.string().required('Local é obrigatório'),
  time: yup.string().required('Hora é obrigatória').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  priority: yup.string().required('Prioridade é obrigatória'),
});

export default function EventsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [date, setDate] = useState(new Date());
  const [weather, setWeather] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const { events, addEvent, updateEvent, deleteEvent, loadEvents } = useContext(EventContext);

  // Controle simplificado do TimePicker
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  
  // Estados para funcionalidades de hora
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  
  // Estados para exclusão em lote
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [timePresets, setTimePresets] = useState([
    { label: 'Manhã (09:00)', value: '09:00' },
    { label: 'Meio-dia (12:00)', value: '12:00' },
    { label: 'Tarde (15:00)', value: '15:00' },
    { label: 'Noite (18:00)', value: '18:00' },
    { label: 'Agora', value: moment().format('HH:mm') }
  ]);

  const { control, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      time: '',
      priority: 'media',
    }
  });

  // Carrega eventos ao montar
  useEffect(() => {
    loadEvents();
    getWeather(date);
  }, []);

  // Atualiza clima ao mudar data
  useEffect(() => {
    getWeather(date);
  }, [date]);

  // Filtra eventos do dia selecionado
  const filteredEvents = useMemo(() => {
    return events.filter(ev =>
      moment(ev.date, 'YYYY-MM-DD').isSame(moment(date), 'day')
    );
  }, [events, date]);

  const getWeather = async (selectedDate) => {
    try {
      const noonDate = moment(selectedDate).set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
      const isoDate = noonDate.format('YYYY-MM-DD');
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: -28.68,
          longitude: -49.37,
          hourly: 'temperature_2m,precipitation,precipitation_probability',
          start_date: isoDate,
          end_date: isoDate,
          timezone: 'America/Sao_Paulo',
        },
      });

      const hours = response.data.hourly?.time || [];
      let hourIndex = hours.findIndex(h => h.endsWith('T12:00'));
      if (hourIndex === -1) hourIndex = hours.findIndex(h => h.endsWith('T15:00'));
      if (hourIndex === -1) hourIndex = hours.findIndex(h => h.endsWith('T09:00'));
      if (hourIndex === -1) hourIndex = 0;

      const temperature = response.data.hourly?.temperature_2m?.[hourIndex];
      const precipitation = response.data.hourly?.precipitation?.[hourIndex];
      const precipitationProb = response.data.hourly?.precipitation_probability?.[hourIndex];

      let weatherText = temperature !== undefined ? `${temperature}°C` : 'Indisponível';
      if (precipitation !== undefined && precipitation > 0) {
        weatherText += ' | Chuva prevista';
      } else if (precipitationProb !== undefined && precipitationProb > 50) {
        weatherText += ' | Alta chance de chuva';
      } else {
        weatherText += ' | Sem chuva prevista';
      }
      setWeather(weatherText);
    } catch (error) {
      setWeather('Indisponível');
    }
  };

  const onSubmit = async (data) => {
    try {
      const eventData = {
        ...data,
        date: moment(date).format('YYYY-MM-DD'),
        weather,
        isImportant,
        reminderMinutes,
        id: editingEvent ? editingEvent.id : Date.now().toString(),
      };

      if (editingEvent) {
        updateEvent(eventData);
      } else {
        addEvent(eventData);
      }

      setModalVisible(false);
      reset();
      setEditingEvent(null);
      setIsImportant(false);
      setShowTimePicker(false);
      setShowReminderPicker(false);
      setReminderMinutes(15);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar evento');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setValue('name', event.name);
    setValue('description', event.description);
    setValue('location', event.location);
    setValue('time', event.time);
    setValue('priority', event.priority);
    setIsImportant(event.isImportant || false);
    setReminderMinutes(event.reminderMinutes || 15);
    setDate(moment(event.date, 'YYYY-MM-DD').toDate());
    setModalVisible(true);
  };

  const handleDelete = (eventId) => {
    const event = events.find(e => e.id === eventId);
    const eventName = event ? event.name : 'este evento';
    
    Alert.alert(
      '🗑️ Confirmar Exclusão',
      `Tem certeza que deseja excluir "${eventName}"?\n\nEsta ação não pode ser desfeita.`,
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
              deleteEvent(eventId);
              Alert.alert('✅ Sucesso', 'Evento excluído com sucesso!');
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao excluir evento. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  // Funções para exclusão em lote
  const toggleEventSelection = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const selectAllEvents = () => {
    setSelectedEvents(filteredEvents.map(event => event.id));
  };

  const clearSelection = () => {
    setSelectedEvents([]);
  };

  const handleBulkDelete = () => {
    if (selectedEvents.length === 0) return;
    
    const eventNames = selectedEvents.map(id => {
      const event = events.find(e => e.id === id);
      return event ? event.name : 'evento';
    }).join(', ');
    
    Alert.alert(
      '🗑️ Confirmar Exclusão em Lote',
      `Tem certeza que deseja excluir ${selectedEvents.length} evento(s)?\n\nEventos: ${eventNames}\n\nEsta ação não pode ser desfeita.`,
      [
        { 
          text: '❌ Cancelar', 
          style: 'cancel' 
        },
        { 
          text: '🗑️ Excluir Todos', 
          style: 'destructive', 
          onPress: () => {
            try {
              selectedEvents.forEach(eventId => deleteEvent(eventId));
              setSelectedEvents([]);
              setIsSelectionMode(false);
              Alert.alert('✅ Sucesso', `${selectedEvents.length} evento(s) excluído(s) com sucesso!`);
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao excluir eventos. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baixa': return '#4caf50';
      default: return '#757575';
    }
  };

  // Ajuste: passar data como string 'YYYY-MM-DD' para customDatesStyles
  const customDatesStyles = events.map((ev) => ({
    date: ev.date, // espera string no formato YYYY-MM-DD
    containerStyle: {},
    style: { backgroundColor: '#87cefa' },
    textStyle: { color: 'white' },
  }));

  // Handler para mudança de hora
  const handleTimeChange = (event, selectedTime) => {
    // Fecha o picker no Android
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    // Se o usuário cancelou
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    
    // Se uma hora foi selecionada
    if (selectedTime) {
      const timeString = moment(selectedTime).format('HH:mm');
      setValue('time', timeString);
      setSelectedTime(selectedTime);
      
      // Fecha o picker no iOS após seleção
      if (Platform.OS === 'ios') {
        setShowTimePicker(false);
      }
    }
  };

  const openTimePicker = () => {
    const currentTime = getValues('time');
    
    if (currentTime && currentTime !== '') {
      // Se já existe uma hora selecionada, usa ela
      const timeDate = moment(currentTime, 'HH:mm').toDate();
      if (timeDate.isValid()) {
        setSelectedTime(timeDate);
      } else {
        setSelectedTime(new Date());
      }
    } else {
      // Se não há hora selecionada, usa a hora atual
      setSelectedTime(new Date());
    }
    
    setShowTimePicker(true);
  };


  // Função para aplicar preset de horário
  const applyTimePreset = (presetValue) => {
    setValue('time', presetValue);
    const timeDate = moment(presetValue, 'HH:mm').toDate();
    setSelectedTime(timeDate);
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>📅 Eventos</Text>
            <Text style={styles.subtitle}>Gerencie seus compromissos</Text>
          </View>
          <View style={styles.headerActions}>
            {!isSelectionMode ? (
              <Button
                mode="outlined"
                onPress={() => setIsSelectionMode(true)}
                style={styles.selectionButton}
                icon="check-circle-outline"
              >
                Selecionar
              </Button>
            ) : (
              <View style={styles.selectionActions}>
                <Button
                  mode="outlined"
                  onPress={selectAllEvents}
                  style={styles.selectionButton}
                  icon="select-all"
                >
                  Todos
                </Button>
                <Button
                  mode="outlined"
                  onPress={clearSelection}
                  style={styles.selectionButton}
                  icon="clear"
                >
                  Limpar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleBulkDelete}
                  disabled={selectedEvents.length === 0}
                  style={[styles.selectionButton, styles.deleteButton]}
                  icon="delete"
                >
                  Excluir ({selectedEvents.length})
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setIsSelectionMode(false);
                    setSelectedEvents([]);
                  }}
                  style={styles.selectionButton}
                  icon="close"
                >
                  Cancelar
                </Button>
              </View>
            )}
          </View>
        </View>
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.calendarContainer}>
          <CalendarPicker
            onDateChange={(selectedDate) => setDate(selectedDate)}
            customDatesStyles={customDatesStyles}
            weekdays={['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']}
            months={['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']}
            locale="pt-br"
          />
        </View>

        <Text style={styles.weather}>Clima previsto: {weather}</Text>

        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
          <Card key={event.id} style={[
            styles.eventCard,
            isSelectionMode && selectedEvents.includes(event.id) && styles.selectedEventCard
          ]}>
            <Card.Content style={styles.eventContent}>
              <View style={styles.eventHeader}>
                {isSelectionMode && (
                  <Button
                    mode={selectedEvents.includes(event.id) ? "contained" : "outlined"}
                    onPress={() => toggleEventSelection(event.id)}
                    style={styles.checkboxButton}
                    icon={selectedEvents.includes(event.id) ? "check" : "check-box-outline-blank"}
                  />
                )}
                <Title style={styles.eventTitle}>{event.name}</Title>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(event.priority) }]}>
                  <Text style={styles.priorityText}>{event.priority?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventDate}>
                  📅 {moment(event.date, 'YYYY-MM-DD').format('DD/MM/YYYY')} - 🕐 {event.time}
                </Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
                <Text style={styles.eventWeather}>🌤️ {event.weather}</Text>
                {event.isImportant && <Text style={styles.importantLabel}>⭐ Evento Importante</Text>}
              </View>
            </Card.Content>
            {!isSelectionMode && (
              <Card.Actions style={styles.eventActions}>
                <Button 
                  mode="contained" 
                  onPress={() => handleEdit(event)}
                  style={styles.editButton}
                  icon="pencil"
                >
                  Editar
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => handleDelete(event.id)} 
                  textColor="#e53e3e"
                  style={styles.deleteButton}
                  icon="delete"
                >
                  Excluir
                </Button>
              </Card.Actions>
            )}
          </Card>
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateText}>Nenhum evento neste dia</Text>
            <Text style={styles.emptyStateSubtext}>Toque no + para adicionar um evento</Text>
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Novo Evento"
        onPress={() => {
          reset();
          setEditingEvent(null);
          setIsImportant(false);
          setModalVisible(true);
        }}
        visible={!isSelectionMode}
      />

      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => {
            setModalVisible(false);
            setShowTimePicker(false);
          }} 
          contentContainerStyle={styles.modal}
        >
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</Text>

            {/* Nome */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Nome do evento"
                  placeholder="Digite o nome do evento..."
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={[styles.input, value && styles.inputFilled]}
                  error={!!errors.name}
                  activeOutlineColor="#6200ea"
                  outlineColor="#ccc"
                  textColor="#000000"
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            {/* Descrição */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Descrição"
                  placeholder="Descreva o evento em detalhes..."
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={[styles.input, value && styles.inputFilled]}
                  error={!!errors.description}
                  activeOutlineColor="#6200ea"
                  outlineColor="#ccc"
                  textColor="#000000"
                />
              )}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

            {/* Local */}
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Local"
                  placeholder="Onde será o evento? (ex: Auditório Central)"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={[styles.input, value && styles.inputFilled]}
                  error={!!errors.location}
                  activeOutlineColor="#6200ea"
                  outlineColor="#ccc"
                  textColor="#000000"
                />
              )}
            />
            {errors.location && <Text style={styles.errorText}>{errors.location.message}</Text>}

            {/* Hora */}
            <Controller
              control={control}
              name="time"
              render={({ field: { value } }) => (
                <View style={styles.timeContainer}>
                  <Text style={styles.fieldLabel}>Hora do Evento</Text>
                  <Button 
                    mode="outlined" 
                    onPress={openTimePicker}
                    style={[styles.timeButton, value && styles.timeButtonFilled]}
                    icon="clock-outline"
                    labelStyle={value ? styles.timeButtonLabelFilled : styles.timeButtonLabel}
                  >
                    {value ? `🕐 ${value}` : 'Selecionar Hora'}
                  </Button>
                  {value && (
                    <Text style={styles.selectedTimeText}>
                      ✅ Hora selecionada: {value}
                    </Text>
                  )}
                  {errors.time && <Text style={styles.errorText}>{errors.time.message}</Text>}
                </View>
              )}
            />

            {/* Presets de Horário */}
            <View style={styles.timePresetsContainer}>
              <Text style={styles.timePresetsTitle}>⏰ Horários Rápidos</Text>
              <View style={styles.timePresetsGrid}>
                {timePresets.map((preset, index) => (
                  <Button
                    key={index}
                    mode="outlined"
                    onPress={() => applyTimePreset(preset.value)}
                    style={styles.timePresetButton}
                    compact
                  >
                    {preset.label}
                  </Button>
                ))}
              </View>
            </View>

            {/* Exibe DateTimePicker */}
            {showTimePicker && (
              <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerTitle}>Selecionar Hora</Text>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  style={styles.timePicker}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.timePickerButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => setShowTimePicker(false)}
                      style={styles.timePickerCancelButton}
                    >
                      Cancelar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => setShowTimePicker(false)}
                      style={styles.timePickerConfirmButton}
                    >
                      Confirmar
                    </Button>
                  </View>
                )}
              </View>
            )}


            {/* Lembrete */}
            <View style={styles.reminderContainer}>
              <Text style={styles.fieldLabel}>🔔 Lembrete</Text>
              <View style={styles.reminderRow}>
                <Text style={styles.reminderText}>
                  {reminderMinutes} minutos antes
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowReminderPicker(true)}
                  style={styles.reminderButton}
                  icon="bell-outline"
                >
                  Alterar
                </Button>
              </View>
            </View>

            {/* Prioridade */}
            <Controller
              control={control}
              name="priority"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Prioridade do Evento</Text>
                  <View style={[styles.pickerWrapper, value && styles.pickerWrapperFilled]}>
                    <Picker selectedValue={value} onValueChange={onChange}>
                      <Picker.Item label="🔵 Baixa" value="baixa" />
                      <Picker.Item label="🟡 Média" value="media" />
                      <Picker.Item label="🔴 Alta" value="alta" />
                    </Picker>
                  </View>
                  {value && (
                    <Text style={styles.selectedPriorityText}>
                      {value === 'baixa' && '🔵 Prioridade Baixa selecionada'}
                      {value === 'media' && '🟡 Prioridade Média selecionada'}
                      {value === 'alta' && '🔴 Prioridade Alta selecionada'}
                    </Text>
                  )}
                </View>
              )}
            />
            {errors.priority && <Text style={styles.errorText}>{errors.priority.message}</Text>}

            {/* Evento importante */}
            <View style={styles.switchContainer}>
              <Switch 
                value={isImportant} 
                onValueChange={setIsImportant}
                color="#6200ea"
              />
              <Text style={[styles.switchLabel, isImportant && styles.switchLabelActive]}>
                {isImportant ? '⭐ Evento Importante' : 'Evento Importante'}
              </Text>
            </View>
            {isImportant && (
              <Text style={styles.importantNoteText}>
                ⭐ Este evento será marcado como importante e destacado na lista
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <Button 
                mode="contained" 
                onPress={handleSubmit(onSubmit)}
                style={styles.saveButton}
                icon="check"
              >
                {editingEvent ? 'Atualizar Evento' : 'Adicionar Evento'}
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={() => {
                  setModalVisible(false);
                  setShowTimePicker(false);
                }}
                style={styles.cancelButton}
                icon="close"
              >
                Cancelar
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Modal de Seleção de Lembrete */}
      <Portal>
        <Modal 
          visible={showReminderPicker} 
          onDismiss={() => setShowReminderPicker(false)} 
          contentContainerStyle={styles.reminderModal}
        >
          <Text style={styles.reminderModalTitle}>🔔 Configurar Lembrete</Text>
          <Text style={styles.reminderModalSubtitle}>Quando deseja ser lembrado?</Text>
          
          <View style={styles.reminderOptions}>
            {[5, 15, 30, 60, 120, 240].map((minutes) => (
              <Button
                key={minutes}
                mode={reminderMinutes === minutes ? "contained" : "outlined"}
                onPress={() => {
                  setReminderMinutes(minutes);
                  setShowReminderPicker(false);
                }}
                style={[
                  styles.reminderOptionButton,
                  reminderMinutes === minutes && styles.reminderOptionButtonSelected
                ]}
              >
                {minutes < 60 ? `${minutes} min` : `${minutes / 60}h`}
              </Button>
            ))}
          </View>

          <View style={styles.reminderModalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowReminderPicker(false)}
              style={styles.reminderCancelButton}
            >
              Cancelar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa'
  },
  header: {
    backgroundColor: '#ff6b6b',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  scrollView: { 
    flex: 1, 
    padding: 20
  },
  scrollContent: {
    paddingBottom: 100, // Espaço para o FAB
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center',
    color: 'white'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
    opacity: 0.9
  },
  calendarContainer: { 
    marginBottom: 20, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  weather: { 
    fontSize: 16, 
    marginBottom: 20, 
    textAlign: 'center', 
    fontWeight: '600',
    color: '#2c3e50',
    backgroundColor: '#4ecdc4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    color: 'white'
  },
  eventCard: { 
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'white',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b'
  },
  eventContent: {
    padding: 0
  },
  eventHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 10
  },
  eventTitle: { 
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#1a202c',
    letterSpacing: 0.3
  },
  priorityBadge: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  priorityText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: 'bold',
    letterSpacing: 0.8
  },
  eventInfo: {
    paddingHorizontal: 25,
    paddingBottom: 20
  },
  eventDate: { 
    color: '#4a5568', 
    marginBottom: 15,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    textAlign: 'center'
  },
  eventDescription: {
    color: '#2d3748',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 22
  },
  eventLocation: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8
  },
  eventWeather: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12
  },
  importantLabel: { 
    color: '#f6ad55', 
    fontWeight: 'bold', 
    marginTop: 15,
    fontSize: 15,
    backgroundColor: 'rgba(246, 173, 85, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(246, 173, 85, 0.3)'
  },
  eventActions: {
    paddingHorizontal: 25,
    paddingBottom: 25,
    justifyContent: 'space-around',
    gap: 10
  },
  editButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  deleteButton: {
    flex: 1,
    borderColor: '#e53e3e',
    borderWidth: 2,
    borderRadius: 12
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4a5568',
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24
  },
  fab: { 
    position: 'absolute', 
    margin: 20, 
    right: 0, 
    bottom: 0,
    backgroundColor: '#ff6b6b',
    borderRadius: 30,
    elevation: 12,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modal: { 
    backgroundColor: 'white', 
    margin: 20, 
    borderRadius: 12, 
    maxHeight: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  modalContent: { 
    padding: 20
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#2c3e50'
  },
  input: { 
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    borderRadius: 8
  },
  inputFilled: {
    backgroundColor: '#e8f4fd',
    borderColor: '#3498db'
  },
  errorText: { 
    color: '#e53e3e', 
    marginBottom: 12,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500'
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2d3748',
    letterSpacing: 0.3
  },
  timeContainer: {
    marginBottom: 15
  },
  timeButton: {
    marginBottom: 8,
    borderColor: '#3498db',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa'
  },
  timeButtonFilled: {
    backgroundColor: '#e8f4fd',
    borderColor: '#3498db'
  },
  timeButtonLabel: {
    fontSize: 16,
    fontWeight: '600'
  },
  timeButtonLabelFilled: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '700'
  },
  selectedTimeText: {
    color: '#38a169',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(56, 161, 105, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10
  },
  timePicker: {
    marginVertical: 15,
    alignSelf: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 15,
    padding: 10
  },
  pickerContainer: {
    marginBottom: 15
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2d3748',
    letterSpacing: 0.3
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 15,
    backgroundColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  pickerWrapperFilled: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  selectedPriorityText: {
    color: '#38a169',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(56, 161, 105, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10
  },
  switchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)'
  },
  switchLabel: { 
    marginLeft: 15,
    fontSize: 18,
    color: '#2d3748',
    fontWeight: '600'
  },
  switchLabelActive: {
    color: '#667eea',
    fontWeight: '700'
  },
  importantNoteText: {
    color: '#f6ad55',
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(246, 173, 85, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    fontWeight: '500'
  },
  buttonContainer: {
    marginTop: 25,
    gap: 15
  },
  saveButton: {
    paddingVertical: 12,
    backgroundColor: '#27ae60',
    borderRadius: 8
  },
  cancelButton: {
    paddingVertical: 12,
    borderColor: '#e74c3c',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'white'
  },
  timePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    gap: 10
  },
  timePickerCancelButton: {
    flex: 1,
    borderColor: '#e74c3c'
  },
  timePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#3498db'
  },
  // Estilos para presets de horário
  timePresetsContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  timePresetsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center'
  },
  timePresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center'
  },
  timePresetButton: {
    margin: 2,
    borderColor: '#3498db',
    borderRadius: 20
  },
  // Estilos para lembretes
  reminderContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7'
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  reminderText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: '600'
  },
  reminderButton: {
    borderColor: '#f39c12',
    borderRadius: 20
  },
  // Estilos para modal de lembretes
  reminderModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  reminderModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8
  },
  reminderModalSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20
  },
  reminderOptionButton: {
    margin: 2,
    borderRadius: 20,
    borderColor: '#3498db'
  },
  reminderOptionButtonSelected: {
    backgroundColor: '#3498db'
  },
  reminderModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  reminderCancelButton: {
    borderColor: '#e74c3c',
    borderRadius: 20
  },
  // Estilos para header com ações
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  selectionButton: {
    marginHorizontal: 2,
    borderRadius: 20
  },
  deleteButton: {
    backgroundColor: '#e74c3c'
  },
  // Estilos para seleção de eventos
  selectedEventCard: {
    borderWidth: 2,
    borderColor: '#3498db',
    backgroundColor: '#e8f4fd'
  },
  checkboxButton: {
    marginRight: 8,
    borderRadius: 20,
    minWidth: 40
  }
});
// ...existing code...