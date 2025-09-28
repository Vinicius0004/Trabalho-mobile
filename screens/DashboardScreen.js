import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import moment from 'moment';
import { EventContext } from '../EventContext';
import { ContactContext } from '../contexts/ContactContext';
import { TaskContext } from '../contexts/TaskContext';
import { ReminderContext } from '../contexts/ReminderContext';
import { NoteContext } from '../contexts/NoteContext';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#667eea',
  backgroundGradientTo: '#764ba2',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '8',
    strokeWidth: '3',
    stroke: '#ffffff',
  },
};

export default function DashboardScreen() {
  const { events, loadEvents } = useContext(EventContext);
  const { contacts, loadContacts } = useContext(ContactContext);
  const { tasks, loadTasks } = useContext(TaskContext);
  const { reminders, loadReminders } = useContext(ReminderContext);
  const { notes, loadNotes } = useContext(NoteContext);

  useEffect(() => {
    loadEvents();
    loadContacts();
    loadTasks();
    loadReminders();
    loadNotes();
  }, []);

  // Estatísticas gerais
  const totalItems = events.length + contacts.length + tasks.length + reminders.length + notes.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const activeReminders = reminders.filter(reminder => reminder.isActive !== false).length;
  const pinnedNotes = notes.filter(note => note.isPinned).length;

  // Dados para gráfico de linha - Eventos por mês
  const eventsPerMonth = () => {
    const months = [];
    const counts = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, 'months');
      const monthEvents = events.filter(event => 
        moment(event.date).format('YYYY-MM') === month.format('YYYY-MM')
      ).length;
      
      months.push(month.format('MMM'));
      counts.push(monthEvents);
    }
    
    return {
      labels: months,
      datasets: [{
        data: counts,
        strokeWidth: 2,
      }]
    };
  };

  // Dados para gráfico de barras - Tarefas por categoria
  const tasksByCategory = () => {
    const categories = ['pessoal', 'trabalho', 'estudos', 'casa'];
    const counts = categories.map(category => 
      tasks.filter(task => task.category === category).length
    );
    
    return {
      labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      datasets: [{
        data: counts,
      }]
    };
  };

  // Dados para gráfico de pizza - Distribuição de prioridades
  const priorityDistribution = () => {
    const priorities = ['alta', 'media', 'baixa'];
    const colors = ['#f44336', '#ff9800', '#4caf50'];
    
    return priorities.map((priority, index) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      population: events.filter(event => event.priority === priority).length + 
                  tasks.filter(task => task.priority === priority).length,
      color: colors[index],
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    })).filter(item => item.population > 0);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Dashboard</Text>
        <Text style={styles.subtitle}>Visão geral da sua agenda</Text>
      </View>
      
      {/* Cards de estatísticas */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>{totalItems}</Title>
            <Paragraph style={styles.statLabel}>Total de Itens</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>{events.length}</Title>
            <Paragraph style={styles.statLabel}>Eventos</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>{completedTasks}/{tasks.length}</Title>
            <Paragraph style={styles.statLabel}>Tarefas Concluídas</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Title style={styles.statNumber}>{activeReminders}</Title>
            <Paragraph style={styles.statLabel}>Lembretes Ativos</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Gráfico de linha - Eventos por mês */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Eventos por Mês</Title>
          {events.length > 0 ? (
            <LineChart
              data={eventsPerMonth()}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>Nenhum evento cadastrado</Text>
          )}
        </Card.Content>
      </Card>

      {/* Gráfico de barras - Tarefas por categoria */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Tarefas por Categoria</Title>
          {tasks.length > 0 ? (
            <BarChart
              data={tasksByCategory()}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          ) : (
            <Text style={styles.noDataText}>Nenhuma tarefa cadastrada</Text>
          )}
        </Card.Content>
      </Card>

      {/* Gráfico de pizza - Distribuição de prioridades */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Distribuição de Prioridades</Title>
          {priorityDistribution().length > 0 ? (
            <PieChart
              data={priorityDistribution()}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>Nenhum item com prioridade cadastrado</Text>
          )}
        </Card.Content>
      </Card>

      {/* Resumo rápido */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Resumo Rápido</Title>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>📞</Text>
            <Text style={styles.summaryText}>{contacts.length} contatos salvos</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>📝</Text>
            <Text style={styles.summaryText}>{notes.length} notas ({pinnedNotes} fixadas)</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>⏰</Text>
            <Text style={styles.summaryText}>{activeReminders} lembretes ativos</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>✅</Text>
            <Text style={styles.summaryText}>
              {tasks.length > 0 ? `${Math.round((completedTasks / tasks.length) * 100)}%` : '0%'} das tarefas concluídas
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 20,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#667eea',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  chartCard: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    padding: 15,
  },
  chartTitle: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 10,
    width: 30,
  },
  summaryText: {
    fontSize: 16,
    flex: 1,
  },
});

