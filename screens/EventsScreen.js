
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
import axios from 'axios';
import { MaskedTextInput } from 'react-native-mask-text';
import { EventContext } from '../EventContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';

dayjs.locale('pt-br');

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
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [weather, setWeather] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const { events, addEvent, updateEvent, deleteEvent, loadEvents } = useContext(EventContext);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
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
  useEffect(() => {
    getWeather(date);
  }, [date]);
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
      setShowReminderPicker(false);
      setReminderMinutes(15);
      setSelectedDateTime(new Date());
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
    const eventDate = moment(event.date, 'YYYY-MM-DD');
    const eventTime = moment(event.time, 'HH:mm');
    const combinedDateTime = eventDate.set({
      hour: eventTime.hours(),
      minute: eventTime.minutes()
    }).toDate();
    
    setSelectedDateTime(combinedDateTime);
    setDate(eventDate.toDate());
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
  const applyTimePreset = (presetValue) => {
    setValue('time', presetValue);
    const [hours, minutes] = presetValue.split(':');
    const newDateTime = dayjs(selectedDateTime)
      .hour(parseInt(hours))
      .minute(parseInt(minutes))
      .toDate();
    setSelectedDateTime(newDateTime);
  };
  useEffect(() => {
    if (modalVisible) {
      const timeString = dayjs(selectedDateTime).format('HH:mm');
      setValue('time', timeString);
    }
  }, [selectedDateTime, modalVisible]);
  const handleManualTimeChange = (timeText) => {
    setValue('time', timeText);
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(timeText)) {
      const [hours, minutes] = timeText.split(':');
      const newDateTime = dayjs(selectedDateTime)
        .hour(parseInt(hours))
        .minute(parseInt(minutes))
        .toDate();
      setSelectedDateTime(newDateTime);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>📅 Eventos</Text>
              <Text style={styles.subtitle}>Organize seus compromissos importantes</Text>
            </View>
            <View style={styles.headerActions}>
              {!isSelectionMode ? (
                <Button
                  mode="contained"
                  onPress={() => setIsSelectionMode(true)}
                  style={styles.selectionButtonPrimary}
                  icon="check-circle-outline"
                  labelStyle={styles.buttonLabelWhite}
                  buttonColor="rgba(255, 255, 255, 0.2)"
                >
                  Selecionar
                </Button>
              ) : (
                <View style={styles.selectionActions}>
                  <Button
                    mode="contained"
                    onPress={selectAllEvents}
                    style={styles.selectionButtonSmall}
                    icon="select-all"
                    compact
                    buttonColor="rgba(255, 255, 255, 0.3)"
                  >
                    Todos
                  </Button>
                  <Button
                    mode="contained"
                    onPress={clearSelection}
                    style={styles.selectionButtonSmall}
                    icon="close-circle"
                    compact
                    buttonColor="rgba(255, 255, 255, 0.3)"
                  >
                    Limpar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleBulkDelete}
                    disabled={selectedEvents.length === 0}
                    style={[styles.selectionButtonSmall, styles.deleteButtonHeader]}
                    icon="delete-sweep"
                    compact
                    buttonColor="#ff4757"
                  >
                    Excluir ({selectedEvents.length})
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setIsSelectionMode(false);
                      setSelectedEvents([]);
                    }}
                    style={styles.selectionButtonSmall}
                    icon="arrow-left"
                    compact
                    buttonColor="rgba(255, 255, 255, 0.3)"
                  >
                    Voltar
                  </Button>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        indicatorStyle="dark"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>📅 Calendário</Text>
            <View style={styles.selectedDateBadge}>
              <Text style={styles.selectedDateBadgeText}>
                {dayjs(date).format('DD/MM/YYYY')}
              </Text>
            </View>
          </View>
          
          <View style={styles.calendarContainer}>
            <DateTimePicker
              mode="single"
              date={date}
              onChange={(params) => {
                if (params.date) {
                  setDate(new Date(params.date));
                }
              }}
              locale="pt-br"
              headerButtonColor="#5f27cd"
              selectedItemColor="#5f27cd"
              calendarTextStyle={{ 
                color: '#2c3e50',
                fontSize: 16,
                fontWeight: '600'
              }}
              headerTextStyle={{ 
                color: '#5f27cd', 
                fontWeight: 'bold',
                fontSize: 20
              }}
              weekDaysTextStyle={{ 
                color: '#5f27cd', 
                fontWeight: '700',
                fontSize: 14
              }}
              monthContainerStyle={{ backgroundColor: '#ffffff' }}
              todayContainerStyle={{
                borderWidth: 2,
                borderColor: '#00d2ff',
                backgroundColor: 'rgba(0, 210, 255, 0.1)'
              }}
              todayTextStyle={{
                color: '#00d2ff',
                fontWeight: 'bold'
              }}
              height={340}
              displayFullDays={true}
            />
          </View>

          <View style={styles.weatherCard}>
            <View style={styles.weatherIconContainer}>
              <Text style={styles.weatherIcon}>🌤️</Text>
            </View>
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherLabel}>Previsão do Tempo</Text>
              <Text style={styles.weatherText}>{weather}</Text>
            </View>
          </View>
        </View>
        {filteredEvents.length > 0 ? (
          <View style={styles.eventsSection}>
            <View style={styles.eventsSectionHeader}>
              <Text style={styles.eventsSectionTitle}>
                {filteredEvents.length} {filteredEvents.length === 1 ? 'Evento' : 'Eventos'}
              </Text>
              <Text style={styles.eventsSectionSubtitle}>
                {dayjs(date).format('dddd, DD [de] MMMM')}
              </Text>
            </View>
            
            {filteredEvents.map((event) => (
              <Card key={event.id} style={[
                styles.eventCard,
                isSelectionMode && selectedEvents.includes(event.id) && styles.selectedEventCard
              ]}>
                <View style={[styles.eventCardAccent, { backgroundColor: getPriorityColor(event.priority) }]} />
                
                <Card.Content style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventHeaderLeft}>
                      {isSelectionMode && (
                        <Button
                          mode={selectedEvents.includes(event.id) ? "contained" : "outlined"}
                          onPress={() => toggleEventSelection(event.id)}
                          style={styles.checkboxButton}
                          icon={selectedEvents.includes(event.id) ? "check-circle" : "checkbox-blank-circle-outline"}
                          compact
                          buttonColor={selectedEvents.includes(event.id) ? "#5f27cd" : "transparent"}
                        />
                      )}
                      <View style={styles.eventTitleContainer}>
                        <Title style={styles.eventTitle}>{event.name}</Title>
                        {event.isImportant && <Text style={styles.importantStar}>⭐</Text>}
                      </View>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(event.priority) }]}>
                      <Text style={styles.priorityText}>{event.priority?.toUpperCase()}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.eventInfo}>
                    <View style={styles.eventDateTimeRow}>
                      <View style={styles.eventDateTimeItem}>
                        <Text style={styles.eventDateTimeIcon}>📅</Text>
                        <Text style={styles.eventDateTimeText}>
                          {moment(event.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                        </Text>
                      </View>
                      <View style={styles.eventDateTimeItem}>
                        <Text style={styles.eventDateTimeIcon}>🕐</Text>
                        <Text style={styles.eventDateTimeText}>{event.time}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.eventDescription}>{event.description}</Text>
                    
                    <View style={styles.eventDetailsRow}>
                      <View style={styles.eventDetailItem}>
                        <Text style={styles.eventDetailIcon}>📍</Text>
                        <Text style={styles.eventDetailText}>{event.location}</Text>
                      </View>
                      <View style={styles.eventDetailItem}>
                        <Text style={styles.eventDetailIcon}>🌤️</Text>
                        <Text style={styles.eventDetailText}>{event.weather}</Text>
                      </View>
                    </View>
                  </View>
                </Card.Content>
                
                {!isSelectionMode && (
                  <Card.Actions style={styles.eventActions}>
                    <Button 
                      mode="contained" 
                      onPress={() => handleEdit(event)}
                      style={styles.editButton}
                      icon="pencil"
                      labelStyle={styles.eventButtonLabel}
                      buttonColor="#5f27cd"
                    >
                      Editar
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => handleDelete(event.id)} 
                      style={styles.deleteEventButton}
                      icon="delete"
                      labelStyle={styles.eventButtonLabel}
                      buttonColor="#ff4757"
                    >
                      Excluir
                    </Button>
                  </Card.Actions>
                )}
              </Card>
            ))}
          </View>
        ) : (
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
          setSelectedDateTime(new Date());
          setModalVisible(true);
        }}
        visible={!isSelectionMode}
        color="#ffffff"
        customSize={60}
      />

      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => {
            setModalVisible(false);
          }} 
          contentContainerStyle={styles.modal}
        >
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</Text>
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
            <View style={styles.dateTimeContainer}>
              <Text style={styles.fieldLabel}>📅 Data e Hora do Evento</Text>
              <Text style={styles.selectedDateTimeText}>
                {dayjs(selectedDateTime).format('DD/MM/YYYY')} às {dayjs(selectedDateTime).format('HH:mm')}
              </Text>
              
              <DateTimePicker
                mode="single"
                date={selectedDateTime}
                timePicker={true}
                onChange={(params) => {
                  if (params.date) {
                    setSelectedDateTime(new Date(params.date));
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
              <View style={styles.manualTimeInputContainer}>
                <Text style={styles.manualTimeLabel}> Digite a hora manualmente:</Text>
                <Controller
                  control={control}
                  name="time"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <MaskedTextInput
                        type="custom"
                        options={{
                          mask: '99:99'
                        }}
                        value={value}
                        onChangeText={(text, rawText) => {
                          handleManualTimeChange(text);
                        }}
                        placeholder="HH:MM"
                        keyboardType="numeric"
                        style={[
                          styles.manualTimeInputNative,
                          errors.time && styles.manualTimeInputError
                        ]}
                        placeholderTextColor="#a0a0a0"
                      />
                    </View>
                  )}
                />
                {errors.time && <Text style={styles.errorText}>{errors.time.message}</Text>}
                <Text style={styles.manualTimeHint}>
                  💡 Digite a hora no formato 24h (ex: 09:00, 14:30, 18:45)
                </Text>
              </View>
            </View>
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
                Este evento será marcado como importante
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f3f7',
  },
  header: {
    backgroundColor: '#5f27cd',
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 15
  },
  headerTitleContainer: {
    alignItems: 'center'
  },
  title: { 
    fontSize: 36, 
    fontWeight: '900', 
    marginBottom: 6,
    textAlign: 'center',
    color: 'white',
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
    opacity: 0.95,
    fontWeight: '500'
  },
  scrollView: { 
    flex: 1,
    padding: 16
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1 
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f3f7'
  },
  calendarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2c3e50'
  },
  selectedDateBadge: {
    backgroundColor: '#5f27cd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  selectedDateBadgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14
  },
  calendarContainer: { 
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden'
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#f0f3f7',
    padding: 16,
    borderRadius: 16,
    marginTop: 15
  },
  weatherIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  weatherIcon: {
    fontSize: 28
  },
  weatherInfo: {
    flex: 1
  },
  weatherLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  weatherText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '700'
  },
  eventsSection: {
    marginTop: 10
  },
  eventsSectionHeader: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  eventsSectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 4
  },
  eventsSectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  eventCard: { 
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: 'white',
    overflow: 'hidden'
  },
  eventCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6
  },
  selectedEventCard: {
    borderWidth: 3,
    borderColor: '#5f27cd',
    backgroundColor: '#f8f6ff'
  },
  eventContent: {
    padding: 20
  },
  eventHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16
  },
  eventHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  eventTitle: { 
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: 0.3
  },
  importantStar: {
    fontSize: 18,
    marginLeft: 8
  },
  priorityBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center'
  },
  priorityText: { 
    color: 'white', 
    fontSize: 11, 
    fontWeight: '900',
    letterSpacing: 1
  },
  eventInfo: {
    gap: 12
  },
  eventDateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  eventDateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3f7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1
  },
  eventDateTimeIcon: {
    fontSize: 18,
    marginRight: 8
  },
  eventDateTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50'
  },
  eventDescription: {
    color: '#5a6c7d',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginVertical: 4
  },
  eventDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  eventDetailIcon: {
    fontSize: 16,
    marginRight: 6
  },
  eventDetailText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
    flex: 1
  },
  eventActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 0,
    gap: 10
  },
  editButton: {
    flex: 1,
    borderRadius: 16,
    elevation: 0
  },
  deleteEventButton: {
    flex: 1,
    borderRadius: 16,
    elevation: 0
  },
  eventButtonLabel: {
    fontWeight: '700',
    fontSize: 15
  },
  checkboxButton: {
    marginRight: 12,
    minWidth: 40
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 20
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center'
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500'
  },
  fab: { 
    position: 'absolute', 
    margin: 20, 
    right: 0, 
    bottom: 0,
    backgroundColor: '#5f27cd',
    borderRadius: 30,
    elevation: 16,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16
  },
  headerActions: {
    alignItems: 'center'
  },
  selectionButtonPrimary: {
    borderRadius: 12,
    paddingHorizontal: 8
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  selectionButtonSmall: {
    borderRadius: 12,
    minWidth: 80
  },
  deleteButtonHeader: {
    elevation: 4
  },
  buttonLabelWhite: {
    color: 'white',
    fontWeight: '700'
  },
  modal: { 
    backgroundColor: 'white', 
    margin: 16, 
    borderRadius: 24, 
    maxHeight: '92%',
    elevation: 12,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20
  },
  modalContent: { 
    padding: 24
  },
  modalTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    marginBottom: 24, 
    textAlign: 'center',
    color: '#5f27cd',
    letterSpacing: 0.5
  },
  input: { 
    marginBottom: 12,
    backgroundColor: '#f8f9fb',
    borderRadius: 12,
    fontSize: 16
  },
  inputFilled: {
    backgroundColor: '#f0f3f7',
    borderWidth: 2,
    borderColor: '#5f27cd'
  },
  errorText: { 
    color: '#ff4757', 
    marginBottom: 12,
    fontSize: 13,
    marginLeft: 12,
    fontWeight: '600'
  },
  fieldLabel: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
    color: '#2c3e50',
    letterSpacing: 0.3
  },
  dateTimeContainer: {
    marginBottom: 24,
    backgroundColor: '#f8f9fb',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e8ecf1'
  },
  selectedDateTimeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5f27cd',
    textAlign: 'center',
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(95, 39, 205, 0.1)',
    borderRadius: 16,
    letterSpacing: 0.5
  },
  manualTimeInputContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: '#e8ecf1',
    borderStyle: 'dashed'
  },
  manualTimeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center'
  },
  manualTimeInputNative: {
    backgroundColor: 'white',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#5f27cd',
    color: '#2c3e50',
    marginBottom: 12,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    letterSpacing: 2
  },
  manualTimeInputError: {
    borderColor: '#ff4757',
    backgroundColor: '#fff5f7'
  },
  manualTimeHint: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
    paddingHorizontal: 10,
    fontWeight: '500'
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
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(95, 39, 205, 0.08)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(95, 39, 205, 0.15)'
  },
  switchLabel: { 
    fontSize: 17,
    color: '#2c3e50',
    fontWeight: '700'
  },
  switchLabelActive: {
    color: '#5f27cd',
    fontWeight: '800'
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

  timePresetsContainer: {
    marginVertical: 20,
    padding: 18,
    backgroundColor: '#f8f9fb',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e8ecf1'
  },
  timePresetsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 14,
    textAlign: 'center'
  },
  timePresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center'
  },
  timePresetButton: {
    margin: 2,
    borderColor: '#5f27cd',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'white'
  },

  reminderContainer: {
    marginVertical: 18,
    padding: 18,
    backgroundColor: '#fff9e6',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffe4a3'
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  reminderText: {
    fontSize: 17,
    color: '#8b6914',
    fontWeight: '700'
  },
  reminderButton: {
    borderColor: '#ffa502',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'white'
  },
 
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
    borderColor: '#ff4757',
    borderWidth: 2,
    borderRadius: 16
  }
});
