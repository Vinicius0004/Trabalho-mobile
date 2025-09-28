import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';

export default function Home({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://img.icons8.com/color/96/000000/calendar--v1.png' }}
        style={styles.image}
      />
      <Text style={styles.title}>Bem-vindo ao Agenda com Clima</Text>
      <Text style={styles.subtitle}>
        Gerencie seus eventos e veja a previsão do tempo de forma fácil.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AgendaClima')}
      >
        <Text style={styles.buttonText}>Ir para Agenda</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.infoButton]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Sobre o App</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sobre o Agenda com Clima</Text>
            <Text style={styles.modalText}>
              Este aplicativo permite que você gerencie seus eventos e confira a previsão do tempo para cada dia. Ideal para planejar sua rotina!
            </Text>
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },

  image: {
    width: 96,
    height: 96,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#457b9d',
    backgroundColor: '#e0e7ef',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#457b9d',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#e0e7ef',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },

  button: {
    backgroundColor: '#457b9d',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  infoButton: {
    backgroundColor: '#1d3557',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#457b9d',
    letterSpacing: 0.5,
  },

  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
});
