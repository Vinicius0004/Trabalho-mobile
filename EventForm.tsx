import React, { useState } from 'react';
import { View, TextInput, Button, Text, Switch, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const EventForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [isOnline, setIsOnline] = useState(false);
    const [capacity, setCapacity] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name) newErrors.name = 'Nome obrigatório';
        if (!description) newErrors.description = 'Descrição obrigatória';
        if (!location && !isOnline) newErrors.location = 'Local obrigatório para eventos presenciais';
        if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) newErrors.capacity = 'Capacidade deve ser um número positivo';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        const event = {
            name,
            description,
            location: isOnline ? 'Online' : location,
            date: date.toISOString(),
            isOnline,
            capacity: Number(capacity),
        };
        Alert.alert('Evento salvo!', JSON.stringify(event, null, 2));
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Nome do evento"
                value={name}
                onChangeText={setName}
            />
            {errors.name && <Text style={styles.error}>{errors.name}</Text>}
            <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            {errors.description && <Text style={styles.error}>{errors.description}</Text>}
            <View style={styles.switchContainer}>
                <Text>Evento Online?</Text>
                <Switch value={isOnline} onValueChange={setIsOnline} />
            </View>
            {!isOnline && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Local"
                        value={location}
                        onChangeText={setLocation}
                    />
                    {errors.location && <Text style={styles.error}>{errors.location}</Text>}
                </>
            )}
            <TextInput
                style={styles.input}
                placeholder="Capacidade"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
            />
            {errors.capacity && <Text style={styles.error}>{errors.capacity}</Text>}
            <View style={styles.datePickerContainer}>
                <Text style={styles.dateLabel}>Data e Hora do Evento:</Text>
                <Text style={styles.dateText}>{dayjs(date).format('DD/MM/YYYY HH:mm')}</Text>
                <DateTimePicker
                    mode="single"
                    date={date}
                    onChange={(params) => {
                        if (params.date) {
                            setDate(new Date(params.date));
                        }
                    }}
                    timePicker={true}
                    locale="pt-br"
                    headerButtonColor="#667eea"
                    selectedItemColor="#667eea"
                    calendarTextStyle={{ 
                        color: '#000000',
                        fontSize: 16,
                        fontWeight: '600'
                    }}
                    headerTextStyle={{ 
                        color: '#667eea', 
                        fontWeight: 'bold',
                        fontSize: 18
                    }}
                    weekDaysTextStyle={{ 
                        color: '#000000', 
                        fontWeight: '700',
                        fontSize: 14
                    }}
                    monthContainerStyle={{ backgroundColor: '#ffffff' }}
                    todayContainerStyle={{
                        borderWidth: 1,
                        borderColor: '#667eea'
                    }}
                    todayTextStyle={{
                        color: '#667eea',
                        fontWeight: 'bold'
                    }}
                    height={350}
                    displayFullDays={true}
                />
            </View>
            <Button title="Salvar Evento" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        padding: 16, 
        backgroundColor: '#f5f5f5',
        flex: 1
    },
    input: { 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 8, 
        marginBottom: 8, 
        padding: 12,
        backgroundColor: '#000000 0.5',
        fontSize: 16,
        color: '#000000'
    },
    error: { 
        color: '#f44336', 
        marginBottom: 8,
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600'
    },
    switchContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 16, 
        gap: 12,
        paddingVertical: 8
    },
    datePickerContainer: { 
        marginBottom: 20,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 8
    },
    dateText: {
        marginTop: 4,
        marginBottom: 12,
        fontSize: 16,
        color: '#667eea',
        textAlign: 'center',
        fontWeight: '700',
        backgroundColor: '#e8f4fd',
        padding: 10,
        borderRadius: 8
    }
});

export default EventForm;