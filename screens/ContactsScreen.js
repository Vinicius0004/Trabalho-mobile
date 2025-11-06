import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, RadioButton, Dialog } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MaskedTextInput } from 'react-native-mask-text';
import { ContactContext } from '../contexts/ContactContext';
import ScrollLabel from '../components/ScrollLabel';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../styles/designSystem';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

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
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const [deleteCandidateName, setDeleteCandidateName] = useState('');
  const { contacts, addContact, updateContact, deleteContact } = useContext(ContactContext);

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

  const onSubmit = async (data) => {
    try {
      const contactData = {
        ...data,
        isFavorite,
        id: editingContact ? editingContact.id : Date.now().toString(),
      };

      if (editingContact) {
        await updateContact(contactData);
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Contato Atualizado', textBody: 'Contato atualizado com sucesso!' });
      } else {
        await addContact(contactData);
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Contato Criado', textBody: 'Novo contato adicionado com sucesso!' });
      }

      setModalVisible(false);
      reset();
      setEditingContact(null);
      setIsFavorite(false);
    } catch (error) {
      console.error('Erro onSubmit:', error);
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Erro', textBody: 'Erro ao salvar contato. Tente novamente.' });
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

  // abre o diálogo de confirmação
  const promptDelete = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setDeleteCandidateId(contactId);
    setDeleteCandidateName(contact ? contact.name : 'este contato');
    setConfirmVisible(true);
  };

  // executa a exclusão após confirmação
  const confirmDelete = async () => {
    if (!deleteCandidateId) return;

    try {
      await deleteContact(deleteCandidateId);
      setConfirmVisible(false);
      setDeleteCandidateId(null);
      setDeleteCandidateName('');
      Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Contato Excluído', textBody: 'O contato foi excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Erro', textBody: 'Erro ao excluir contato. Tente novamente.' });
    }
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
        contentContainerStyle={styles.scrollContent}
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
              <Button mode="contained" onPress={() => handleEdit(contact)} style={styles.editButton} icon="pencil">Editar</Button>
              <Button mode="contained" onPress={() => promptDelete(contact.id)} style={styles.deleteButton} icon="delete">Excluir</Button>
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
        {/* Dialog de confirmação de exclusão */}
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Excluir Contato</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Tem certeza que deseja excluir "{deleteCandidateName}"?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancelar</Button>
            <Button onPress={confirmDelete}>Excluir</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal de criação/edição */}
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
                  textColor="#000"
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
                  textColor="#000"
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
                  textColor="#000"
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
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollView: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  scrollContent: { paddingBottom: spacing['6xl'], flexGrow: 1 },
  title: { ...textStyles.h2, textAlign: 'center', marginBottom: spacing.xl, color: '#000', fontWeight: typography.fontWeight.bold },
  contactCard: { margin: spacing.md, borderRadius: borderRadius.xl, backgroundColor: '#FFF', elevation: 5 },
  cardContent: { paddingBottom: 0 },
  contactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  contactTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  contactTitle: { ...textStyles.h4, fontWeight: typography.fontWeight.bold },
  favoriteIcon: { marginLeft: spacing.sm, fontSize: 18 },
  categoryBadge: { borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  categoryText: { color: '#FFF', fontWeight: typography.fontWeight.bold },
  contactInfoContainer: { marginBottom: spacing.sm },
  contactInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  lastInfoRow: { marginBottom: 0 },
  contactInfoIcon: { marginRight: spacing.sm },
  contactInfo: { color: '#000' },
  cardActions: { justifyContent: 'space-between' },
  editButton: { flex: 1, backgroundColor: '#667eea', marginRight: spacing.sm },
  deleteButton: { flex: 1, backgroundColor: '#f44336', marginLeft: spacing.sm },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: '#667eea' },
  modal: { backgroundColor: '#FFF', padding: spacing.xl, borderRadius: borderRadius.xl, margin: spacing.md },
  modalTitle: { ...textStyles.h3, textAlign: 'center', marginBottom: spacing.xl, color: '#000' },
  input: { marginBottom: spacing.md, backgroundColor: '#F9F9F9' },
  maskedInput: { marginBottom: spacing.md, backgroundColor: '#F9F9F9', padding: spacing.md, borderRadius: borderRadius.md, color: '#000' },
  inputError: { borderColor: '#f44336', borderWidth: 1 },
  label: { ...textStyles.label, color: '#000', fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  radioContainer: { marginBottom: spacing.md },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.xl },
  button: { flex: 1, marginHorizontal: spacing.sm },
  errorText: { color: '#f44336', marginBottom: spacing.md },
});
