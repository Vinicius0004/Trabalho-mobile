import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, RadioButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MaskedTextInput } from 'react-native-mask-text';
import { ContactContext } from '../contexts/ContactContext';
import ScrollLabel from '../components/ScrollLabel';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../styles/designSystem';

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

  // Configurar scroll labels
  const sections = [
    { label: '👥 Contatos', position: 0 },
    { label: '⭐ Favoritos', position: 200 },
    { label: '📋 Todos', position: 400 },
  ];

  const { handleScroll, Label } = ScrollLabel({ sections });

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
      case 'trabalho': return colors.categoryWork;
      case 'pessoal': return colors.categoryPersonal;
      case 'familia': return colors.categoryHealth;
      case 'outros': return colors.categoryOther;
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
        <Text style={styles.title}>Contatos</Text>

        {contacts.map((contact) => (
          <Card key={contact.id} style={styles.contactCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.contactHeader}>
                <View style={styles.contactTitleContainer}>
                  <Title style={styles.contactTitle}>{contact.name}</Title>
                  {contact.isFavorite && <Text style={styles.favoriteIcon}>⭐</Text>}
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(contact.category) }]}>
                  <Text style={styles.categoryText}>{contact.category?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.contactInfoContainer}>
                <View style={styles.contactInfoRow}>
                  <Text style={styles.contactInfoIcon}>📞</Text>
                  <Paragraph style={styles.contactInfo}>{contact.phone}</Paragraph>
                </View>
                <View style={styles.contactInfoRow}>
                  <Text style={styles.contactInfoIcon}>📧</Text>
                  <Paragraph style={styles.contactInfo}>{contact.email}</Paragraph>
                </View>
                <View style={[styles.contactInfoRow, styles.lastInfoRow]}>
                  <Text style={styles.contactInfoIcon}>📍</Text>
                  <Paragraph style={styles.contactInfo}>{contact.address}</Paragraph>
                </View>
              </View>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="contained"
                onPress={() => handleEdit(contact)} 
                style={styles.editButton}
                icon="pencil"
                labelStyle={styles.buttonLabel}
                buttonColor="#5f27cd"
              >
                Editar
              </Button>
              <Button 
                mode="contained"
                onPress={() => handleDelete(contact.id)} 
                style={styles.deleteButton}
                icon="delete"
                labelStyle={styles.buttonLabel}
                buttonColor="#ff4757"
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
                  textColor="#000000"
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
                  placeholderTextColor="#999999"
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
                  textColor="#000000"
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
                  textColor="#000000"
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
  contactCard: {
    marginBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing.lg,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  contactTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  contactTitle: {
    flex: 1,
    ...textStyles.h4,
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
  favoriteIcon: {
    fontSize: 20,
    marginLeft: spacing.sm,
  },
  contactInfoContainer: {
    backgroundColor: '#f8f9fb',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lastInfoRow: {
    marginBottom: 0,
  },
  contactInfoIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    width: 24,
  },
  contactInfo: {
    color: '#2c3e50',
    fontSize: typography.fontSize.base,
    marginBottom: 0,
    lineHeight: 24,
    flex: 1,
    fontWeight: typography.fontWeight.medium,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
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
  radioContainer: {
    marginBottom: spacing.lg,
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
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
  button: {
    flex: 1,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
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
  buttonLabel: {
    fontWeight: '700',
    fontSize: 15,
  },
});

