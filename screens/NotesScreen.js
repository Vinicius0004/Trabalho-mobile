import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, Portal, Modal, FAB, Chip, Searchbar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
import { NoteContext } from '../contexts/NoteContext';

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
      case 'azul': return '#2196F3';
      case 'verde': return '#4CAF50';
      case 'amarelo': return '#FFC107';
      case 'rosa': return '#E91E63';
      case 'roxo': return '#9C27B0';
      default: return '#757575';
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
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Notas</Text>
        
        <Searchbar
          placeholder="Buscar notas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {pinnedNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📌 Fixadas</Text>
            {pinnedNotes.map((note) => (
              <Card key={note.id} style={[styles.noteCard, { borderLeftColor: getColorValue(note.color), borderLeftWidth: 4 }]}>
                <Card.Content>
                  <View style={styles.noteHeader}>
                    <Title style={styles.noteTitle}>
                      {getCategoryIcon(note.category)} {note.title}
                    </Title>
                    <Button onPress={() => togglePinNote(note)} compact>
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
                <Card.Actions>
                  <Button onPress={() => handleEdit(note)}>Editar</Button>
                  <Button onPress={() => handleDelete(note.id)} textColor="#f44336">Excluir</Button>
                </Card.Actions>
              </Card>
            ))}
          </>
        )}

        {regularNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📝 Todas as Notas</Text>
            {regularNotes.map((note) => (
              <Card key={note.id} style={[styles.noteCard, { borderLeftColor: getColorValue(note.color), borderLeftWidth: 4 }]}>
                <Card.Content>
                  <View style={styles.noteHeader}>
                    <Title style={styles.noteTitle}>
                      {getCategoryIcon(note.category)} {note.title}
                    </Title>
                    <Button onPress={() => togglePinNote(note)} compact>
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
                <Card.Actions>
                  <Button onPress={() => handleEdit(note)}>Editar</Button>
                  <Button onPress={() => handleDelete(note.id)} textColor="#f44336">Excluir</Button>
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
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.button}>
                Cancelar
              </Button>
              <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
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
  searchbar: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  noteCard: {
    marginBottom: 15,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
  },
  noteContent: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    marginRight: 5,
    marginBottom: 5,
  },
  noteDate: {
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

