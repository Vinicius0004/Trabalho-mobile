import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, RadioButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MaskedTextInput } from 'react-native-mask-text';
import { ContactContext } from '../contexts/ContactContext';

const schema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: yup.string().required('Telefone é obrigatório').min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  address: yup.string().required('Endereço é obrigatório'),
  category: yup.string().required('Categoria é obrigatória'),
});

export default function ContactsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { contacts, addContact, updateContact, deleteContact, loadContacts } = useContext(ContactContext);

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      category: 'pessoal',
    }
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const onSubmit = async (data) => {
    try {
      const contactData = {
        ...data,
        isFavorite,
        id: editingContact ? editingContact.id : Date.now().toString(),
      };

      if (editingContact) {
        updateContact(contactData);
      } else {
        addContact(contactData);
      }

      setModalVisible(false);
      reset();
      setEditingContact(null);
      setIsFavorite(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar contato');
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setValue('name', contact.name);
    setValue('phone', contact.phone);
    setValue('email', contact.email);
    setValue('address', contact.address);
    setValue('category', contact.category);
    setIsFavorite(contact.isFavorite || false);
    setModalVisible(true);
  };

  const handleDelete = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    const contactName = contact ? contact.name : 'este contato';
    
    Alert.alert(
      '🗑️ Confirmar Exclusão',
      `Tem certeza que deseja excluir "${contactName}"?\n\nEsta ação não pode ser desfeita.`,
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
              deleteContact(contactId);
              Alert.alert('✅ Sucesso', 'Contato excluído com sucesso!');
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao excluir contato. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'trabalho': return '#2196F3';
      case 'pessoal': return '#4CAF50';
      case 'familia': return '#FF9800';
      case 'outros': return '#9C27B0';
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
        <Text style={styles.title}>Contatos</Text>

        {contacts.map((contact) => (
          <Card key={contact.id} style={styles.contactCard}>
            <Card.Content>
              <View style={styles.contactHeader}>
                <Title style={styles.contactTitle}>{contact.name}</Title>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(contact.category) }]}>
                  <Text style={styles.categoryText}>{contact.category?.toUpperCase()}</Text>
                </View>
              </View>
              <Paragraph>📞 {contact.phone}</Paragraph>
              <Paragraph>📧 {contact.email}</Paragraph>
              <Paragraph>📍 {contact.address}</Paragraph>
              {contact.isFavorite && (
                <Text style={styles.favoriteLabel}>⭐ Favorito</Text>
              )}
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleEdit(contact)}>Editar</Button>
              <Button onPress={() => handleDelete(contact.id)} textColor="#f44336">Excluir</Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Novo Contato"
        onPress={() => {
          reset();
          setEditingContact(null);
          setIsFavorite(false);
          setModalVisible(true);
        }}
      />

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingContact ? 'Editar Contato' : 'Novo Contato'}</Text>
            
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Nome completo"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.name}
                  style={styles.input}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <MaskedTextInput
                  mask="(99) 99999-9999"
                  placeholder="(00) 00000-0000"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={[styles.maskedInput, errors.phone && styles.inputError]}
                />
              )}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.email}
                  keyboardType="email-address"
                  style={styles.input}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Endereço"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.address}
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                />
              )}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

            <Text style={styles.label}>Categoria:</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={onChange} value={value}>
                  <View style={styles.radioContainer}>
                    <RadioButton.Item label="Pessoal" value="pessoal" />
                    <RadioButton.Item label="Trabalho" value="trabalho" />
                    <RadioButton.Item label="Família" value="familia" />
                    <RadioButton.Item label="Outros" value="outros" />
                  </View>
                </RadioButton.Group>
              )}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Contato Favorito:</Text>
              <Switch value={isFavorite} onValueChange={setIsFavorite} />
            </View>

            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.button}>
                Cancelar
              </Button>
              <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
                {editingContact ? 'Atualizar' : 'Salvar'}
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Espaço para o FAB
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  contactCard: {
    marginBottom: 15,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteLabel: {
    color: '#ff9800',
    fontWeight: 'bold',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff6b6b',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
  radioContainer: {
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

