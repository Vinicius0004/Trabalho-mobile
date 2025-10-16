import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, Chip, Searchbar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
import { NoteContext } from '../contexts/NoteContext';
import ScrollLabel from '../components/ScrollLabel';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../styles/designSystem';

const schema = yup.object().shape({
  title: yup.string().required('Título é obrigatório').min(3, 'Título deve ter pelo menos 3 caracteres'),
  content: yup.string().required('Conteúdo é obrigatório').min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  category: yup.string().required('Categoria é obrigatória'),
  tags: yup.string(),
  color: yup.string().required('Cor é obrigatória'),
});

export default function NotesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { notes, addNote, updateNote, deleteNote, loadNotes } = useContext(NoteContext);

  // Configurar scroll labels
  const sections = [
    { label: '📝 Notas', position: 0 },
    { label: '📌 Fixadas', position: 200 },
    { label: '📄 Todas', position: 400 },
  ];

  const { handleScroll, Label } = ScrollLabel({ sections });

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      category: 'pessoal',
      tags: '',
      color: 'azul',
    }
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const onSubmit = async (data) => {
    try {
      const noteData = {
        ...data,
        isPinned,
        createdAt: editingNote ? editingNote.createdAt : moment().format('YYYY-MM-DD HH:mm'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm'),
        id: editingNote ? editingNote.id : Date.now().toString(),
      };

      if (editingNote) {
        updateNote(noteData);
      } else {
        addNote(noteData);
      }

      setModalVisible(false);
      reset();
      setEditingNote(null);
      setIsPinned(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar nota');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setValue('title', note.title);
    setValue('content', note.content);
    setValue('category', note.category);
    setValue('tags', note.tags || '');
    setValue('color', note.color);
    setIsPinned(note.isPinned || false);
    setModalVisible(true);
  };

  const handleDelete = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    const noteTitle = note ? note.title : 'esta nota';
    
    Alert.alert(
      '🗑️ Confirmar Exclusão',
      `Tem certeza que deseja excluir "${noteTitle}"?\n\nEsta ação não pode ser desfeita.`,
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
              deleteNote(noteId);
              Alert.alert('✅ Sucesso', 'Nota excluída com sucesso!');
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao excluir nota. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const togglePinNote = (note) => {
    updateNote({ ...note, isPinned: !note.isPinned });
  };

  const getColorValue = (color) => {
    switch (color) {
      case 'azul': return colors.categoryWork;
      case 'verde': return colors.categoryPersonal;
      case 'amarelo': return colors.warning;
      case 'rosa': return colors.error;
      case 'roxo': return colors.categoryOther;
      default: return colors.textLight;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'trabalho': return '💼';
      case 'pessoal': return '👤';
      case 'estudos': return '📚';
      case 'ideias': return '💡';
      case 'outros': return '📝';
      default: return '📝';
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.tags && note.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const regularNotes = filteredNotes.filter(note => !note.isPinned);

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
        <Text style={styles.title}>Notas</Text>
        
        <Searchbar
          placeholder="Buscar notas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          textColor="#000000"
          style={styles.searchbar}
          inputStyle={styles.searchbarText}
        />

        {pinnedNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📌 Fixadas</Text>
            {pinnedNotes.map((note) => (
              <Card key={note.id} style={[styles.noteCard, { borderLeftColor: getColorValue(note.color), borderLeftWidth: 6 }]}>
                <Card.Content style={styles.cardContentContainer}>
                  <View style={styles.noteHeader}>
                    <Title style={styles.noteTitle}>
                      {getCategoryIcon(note.category)} {note.title}
                    </Title>
                    <Button 
                      mode="text"
                      onPress={() => togglePinNote(note)} 
                      compact
                      style={styles.pinButton}
                      labelStyle={styles.pinButtonLabel}
                    >
                      📌
                    </Button>
                  </View>
                  <Paragraph numberOfLines={3} style={styles.noteContent}>
                    {note.content}
                  </Paragraph>
                  {note.tags && (
                    <View style={styles.tagsContainer}>
                      {note.tags.split(',').map((tag, index) => (
                        <Chip key={index} style={styles.tag} compact>
                          {tag.trim()}
                        </Chip>
                      ))}
                    </View>
                  )}
                  <Text style={styles.noteDate}>
                    Atualizada: {moment(note.updatedAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                  <Button 
                    mode="contained"
                    onPress={() => handleEdit(note)} 
                    style={styles.editButton}
                    icon="pencil"
                    labelStyle={styles.buttonLabel}
                  >
                    Editar
                  </Button>
                  <Button 
                    mode="contained"
                    onPress={() => handleDelete(note.id)} 
                    style={styles.deleteButton}
                    icon="delete"
                    labelStyle={styles.buttonLabel}
                  >
                    Excluir
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </>
        )}

        {regularNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📝 Todas as Notas</Text>
            {regularNotes.map((note) => (
              <Card key={note.id} style={[styles.noteCard, { borderLeftColor: getColorValue(note.color), borderLeftWidth: 6 }]}>
                <Card.Content style={styles.cardContentContainer}>
                  <View style={styles.noteHeader}>
                    <Title style={styles.noteTitle}>
                      {getCategoryIcon(note.category)} {note.title}
                    </Title>
                    <Button 
                      mode="text"
                      onPress={() => togglePinNote(note)} 
                      compact
                      style={styles.pinButton}
                      labelStyle={styles.pinButtonLabel}
                    >
                      📌
                    </Button>
                  </View>
                  <Paragraph numberOfLines={3} style={styles.noteContent}>
                    {note.content}
                  </Paragraph>
                  {note.tags && (
                    <View style={styles.tagsContainer}>
                      {note.tags.split(',').map((tag, index) => (
                        <Chip key={index} style={styles.tag} compact>
                          {tag.trim()}
                        </Chip>
                      ))}
                    </View>
                  )}
                  <Text style={styles.noteDate}>
                    Atualizada: {moment(note.updatedAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                  <Button 
                    mode="contained"
                    onPress={() => handleEdit(note)} 
                    style={styles.editButton}
                    icon="pencil"
                    labelStyle={styles.buttonLabel}
                  >
                    Editar
                  </Button>
                  <Button 
                    mode="contained"
                    onPress={() => handleDelete(note.id)} 
                    style={styles.deleteButton}
                    icon="delete"
                    labelStyle={styles.buttonLabel}
                  >
                    Excluir
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Nota"
        onPress={() => {
          reset();
          setEditingNote(null);
          setIsPinned(false);
          setModalVisible(true);
        }}
      />

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingNote ? 'Editar Nota' : 'Nova Nota'}</Text>
            
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Título da nota"
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
              name="content"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Conteúdo"
                  value={value}
                  textColor="#000000"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.content}
                  multiline
                  numberOfLines={6}
                  style={styles.input}
                />
              )}
            />
            {errors.content && <Text style={styles.errorText}>{errors.content.message}</Text>}

            <Text style={styles.label}>Categoria:</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Pessoal" value="pessoal" />
                  <Picker.Item label="Trabalho" value="trabalho" />
                  <Picker.Item label="Estudos" value="estudos" />
                  <Picker.Item label="Ideias" value="ideias" />
                  <Picker.Item label="Outros" value="outros" />
                </Picker>
              )}
            />

            <Controller
              control={control}
              name="tags"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Tags (separadas por vírgula)"
                  value={value}
                  textColor="#000000"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="ex: importante, urgente, projeto"
                  style={styles.input}
                />
              )}
            />

            <Text style={styles.label}>Cor:</Text>
            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Azul" value="azul" />
                  <Picker.Item label="Verde" value="verde" />
                  <Picker.Item label="Amarelo" value="amarelo" />
                  <Picker.Item label="Rosa" value="rosa" />
                  <Picker.Item label="Roxo" value="roxo" />
                </Picker>
              )}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Fixar Nota:</Text>
              <Switch value={isPinned} onValueChange={setIsPinned} />
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
                {editingNote ? 'Atualizar' : 'Salvar'}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing['6xl'], // Espaço para o FAB
    flexGrow: 1,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
  },
  searchbar: {
    marginBottom: spacing.xl,
    marginHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  searchbarText: {
    color: '#000000',
  },
  sectionTitle: {
    ...textStyles.h4,
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteCard: {
    marginBottom: spacing.xl,
    marginHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    borderWidth: 0,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContentContainer: {
    padding: spacing.lg,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noteTitle: {
    flex: 1,
    ...textStyles.h4,
    color: '#000000',
    fontWeight: typography.fontWeight.bold,
    marginBottom: 0,
    marginRight: spacing.md,
  },
  pinButton: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: borderRadius.full,
    backgroundColor: '#F0F0F0',
    elevation: 3,
  },
  pinButtonLabel: {
    fontSize: 22,
    margin: 0,
  },
  noteContent: {
    marginBottom: spacing.md,
    ...textStyles.body,
    color: '#000000',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tag: {
    marginRight: 0,
    marginBottom: 0,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    elevation: 2,
  },
  tagText: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  noteDate: {
    ...textStyles.caption,
    color: '#000000',
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    borderRadius: borderRadius.full,
    ...shadows.xl,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    maxHeight: '92%',
    ...shadows.xl,
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
  errorText: {
    color: colors.error,
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
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: spacing.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    elevation: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    elevation: 6,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    elevation: 6,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#757575',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    elevation: 4,
    shadowColor: '#757575',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});

