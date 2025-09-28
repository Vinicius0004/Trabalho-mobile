import React, { useState } from 'react';
import { View, TextInput, Button, Text, Switch, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const EventForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
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
        // ...salvar o evento...
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
                <Button 
                    title="Selecionar Data e Hora" 
                    onPress={() => setShowDatePicker(true)}
                    color="#6200ea"
                />
                <Text style={styles.dateText}>{date.toLocaleString('pt-BR')}</Text>
            </View>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="datetime"
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
        marginLeft: 4
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
    dateText: {
        marginTop: 8,
        fontSize: 16,
        color: '#333',
        textAlign: 'center'
    }
});

export default EventForm;