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
import ScrollLabel from '../components/ScrollLabel';
import { colors, typography, spacing, borderRadius, shadows, textStyles } from '../styles/designSystem';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#5f27cd',
  backgroundGradientTo: '#764ba2',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: borderRadius.lg,
  },
  propsForDots: {
    r: '8',
    strokeWidth: '3',
    stroke: '#FFFFFF',
  },
};

export default function DashboardScreen() {
  const { events, loadEvents } = useContext(EventContext);
  const { contacts, loadContacts } = useContext(ContactContext);
  const { tasks, loadTasks } = useContext(TaskContext);
  const { reminders, loadReminders } = useContext(ReminderContext);
  const { notes, loadNotes } = useContext(NoteContext);

  // Configurar scroll labels
  const sections = [
    { label: '📊 Visão Geral', position: 0 },
    { label: '📈 Eventos', position: 300 },
    { label: '📋 Tarefas', position: 550 },
    { label: '🎯 Prioridades', position: 800 },
    { label: '📄 Resumo', position: 1050 },
  ];

  const { handleScroll, Label } = ScrollLabel({ sections });

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
    const priorityColors = [colors.priorityHigh, colors.priorityMedium, colors.priorityLow];
    
    return priorities.map((priority, index) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      population: events.filter(event => event.priority === priority).length + 
                  tasks.filter(task => task.priority === priority).length,
      color: priorityColors[index],
      legendFontColor: colors.textSecondary,
      legendFontSize: typography.fontSize.sm,
    })).filter(item => item.population > 0);
  };

  return (
    <View style={styles.container}>
      <Label />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        indicatorStyle="dark"
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        overScrollMode="always"
        scrollIndicatorInsets={{ right: 1 }}
        onScroll={handleScroll}
      >
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
      
      {/* Conteúdo extra para testar scroll */}
      <View style={{ height: 200, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
          🧪 Teste de Scroll
        </Text>
        <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
          Se você consegue ver este texto, o scroll está funcionando!
        </Text>
      </View>
      
      <View style={{ height: 200, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
          📱 Scroll Funcionando
        </Text>
        <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
          Continue rolando para ver mais conteúdo!
        </Text>
      </View>
      
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#5f27cd',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    elevation: 12,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  title: {
    ...textStyles.h1,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    ...textStyles.h4,
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: typography.fontWeight.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '48%',
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    elevation: 8,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  statNumber: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    color: '#5f27cd',
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...textStyles.caption,
    textAlign: 'center',
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#2c3e50',
    fontSize: 11,
  },
  chartCard: {
    marginBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    elevation: 8,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  chartTitle: {
    ...textStyles.h3,
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: typography.fontWeight.bold,
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  noDataText: {
    ...textStyles.body,
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: spacing.xl,
  },
  summaryCard: {
    marginBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    elevation: 8,
    shadowColor: '#5f27cd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  summaryTitle: {
    ...textStyles.h4,
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: typography.fontWeight.bold,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#f8f9fb',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 40,
    textAlign: 'center',
  },
  summaryText: {
    ...textStyles.body,
    flex: 1,
    fontWeight: typography.fontWeight.medium,
    color: '#2c3e50',
  },
});

