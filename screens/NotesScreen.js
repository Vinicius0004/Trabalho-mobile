import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Switch,
  Portal,
  Modal,
  FAB,
  Chip,
  Searchbar,
  Dialog,
  Portal as PaperPortal,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
import { NoteContext } from '../contexts/NoteContext';
import ScrollLabel from '../components/ScrollLabel';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../styles/designSystem';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

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

  // estado para confirmação de exclusão
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const [deleteCandidateTitle, setDeleteCandidateTitle] = useState('');

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
        await updateNote(noteData);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Nota Atualizada',
          textBody: 'A nota foi atualizada com sucesso!',
        });
      } else {
        await addNote(noteData);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Nota Criada',
          textBody: 'Nova nota adicionada com sucesso!',
        });
      }

      setModalVisible(false);
      reset();
      setEditingNote(null);
      setIsPinned(false);
    } catch (error) {
      console.error('Erro onSubmit:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: 'Erro ao salvar nota. Tente novamente.',
      });
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

  // abre o diálogo de confirmação (não executa exclusão ainda)
  const promptDelete = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    setDeleteCandidateId(noteId);
    setDeleteCandidateTitle(note ? note.title : 'esta nota');
    setConfirmVisible(true);
  };

  // executa a exclusão (após confirmação)
  const confirmDelete = async () => {
    if (!deleteCandidateId) return;

    try {
      await deleteNote(deleteCandidateId);
      setConfirmVisible(false);
      setDeleteCandidateId(null);
      setDeleteCandidateTitle('');
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Nota Excluída',
        textBody: 'A nota foi excluída com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: 'Erro ao excluir nota. Tente novamente.',
      });
    }
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
        contentContainerStyle={styles.scrollContent}
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
                <Card.Content>
                  <View style={styles.noteHeader}>
                    <Title style={styles.noteTitle}>
                      {getCategoryIcon(note.category)} {note.title}
                    </Title>
                    <Button mode="text" onPress={() => togglePinNote(note)} compact>📌</Button>
                  </View>
                  <Paragraph numberOfLines={3} style={styles.noteContent}>{note.content}</Paragraph>
                  {note.tags && (
                    <View style={styles.tagsContainer}>
                      {note.tags.split(',').map((tag, index) => (
                        <Chip key={index} style={styles.tag} compact>{tag.trim()}</Chip>
                      ))}
                    </View>
                  )}
                  <Text style={styles.noteDate}>
                    Atualizada: {moment(note.updatedAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                  <Button mode="contained" onPress={() => handleEdit(note)} style={styles.editButton} icon="pencil">Editar</Button>
                  <Button mode="contained" onPress={() => promptDelete(note.id)} style={styles.deleteButton} icon="delete">Excluir</Button>
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
                <Card.Content>
                  <View style={styles.noteHeader}>
                    <Title style={styles.noteTitle}>
                      {getCategoryIcon(note.category)} {note.title}
                    </Title>
                    <Button mode="text" onPress={() => togglePinNote(note)} compact>📌</Button>
                  </View>
                  <Paragraph numberOfLines={3} style={styles.noteContent}>{note.content}</Paragraph>
                  {note.tags && (
                    <View style={styles.tagsContainer}>
                      {note.tags.split(',').map((tag, index) => (
                        <Chip key={index} style={styles.tag} compact>{tag.trim()}</Chip>
                      ))}
                    </View>
                  )}
                  <Text style={styles.noteDate}>
                    Atualizada: {moment(note.updatedAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                  <Button mode="contained" onPress={() => handleEdit(note)} style={styles.editButton} icon="pencil">Editar</Button>
                  <Button mode="contained" onPress={() => promptDelete(note.id)} style={styles.deleteButton} icon="delete">Excluir</Button>
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

      <PaperPortal>
        {/* Dialog de confirmação de exclusão */}
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Excluir Nota</Dialog.Title>
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
            <Text style={styles.modalTitle}>{editingNote ? 'Editar Nota' : 'Nova Nota'}</Text>

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput label="Título da nota" value={value} textColor="#000" onBlur={onBlur} onChangeText={onChange} error={!!errors.title} style={styles.input} />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

            <Controller
              control={control}
              name="content"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput label="Conteúdo" value={value} textColor="#000" onBlur={onBlur} onChangeText={onChange} error={!!errors.content} multiline numberOfLines={6} style={styles.input} />
              )}
            />
            {errors.content && <Text style={styles.errorText}>{errors.content.message}</Text>}

            <Text style={styles.label}>Categoria:</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
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
                <TextInput label="Tags (separadas por vírgula)" value={value} textColor="#000" onBlur={onBlur} onChangeText={onChange} placeholder="ex: importante, urgente, projeto" style={styles.input} />
              )}
            />

            <Text style={styles.label}>Cor:</Text>
            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
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
              <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.cancelButton} icon="close">Cancelar</Button>
              <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.saveButton} icon="check">
                {editingNote ? 'Atualizar' : 'Salvar'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </PaperPortal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollView: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  scrollContent: { paddingBottom: spacing['6xl'], flexGrow: 1 },
  title: { ...textStyles.h2, textAlign: 'center', marginBottom: spacing.xl, color: '#000', fontWeight: typography.fontWeight.bold },
  searchbar: { marginBottom: spacing.xl, backgroundColor: '#FFF', borderRadius: borderRadius.xl },
  sectionTitle: { ...textStyles.h4, margin: spacing.md, padding: spacing.lg, borderRadius: borderRadius.xl, color: '#000', backgroundColor: '#FFF', fontWeight: typography.fontWeight.bold },
  noteCard: { margin: spacing.md, borderRadius: borderRadius.xl, backgroundColor: '#FFF', elevation: 5 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { ...textStyles.h4, fontWeight: typography.fontWeight.bold },
  noteContent: { marginVertical: spacing.sm, color: '#000' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { backgroundColor: colors.primary, marginRight: 5 },
  noteDate: { color: '#000', fontStyle: 'italic' },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: '#667eea' },
  modal: { backgroundColor: '#FFF', padding: spacing.xl, borderRadius: borderRadius.xl, margin: spacing.md },
  modalTitle: { ...textStyles.h3, textAlign: 'center', marginBottom: spacing.xl, color: '#000' },
  input: { marginBottom: spacing.md, backgroundColor: '#F9F9F9' },
  label: { ...textStyles.label, color: '#000', fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
  picker: { backgroundColor: '#F9F9F9', borderRadius: borderRadius.lg, marginBottom: spacing.lg },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.lg,
    marginTop: spacing.xl,
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
  editButton: { flex: 1, backgroundColor: '#667eea' },
  deleteButton: { flex: 1, backgroundColor: '#f44336' },
});
