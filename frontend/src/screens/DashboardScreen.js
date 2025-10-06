import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Headline, Caption, FAB } from 'react-native-paper';

const DashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Headline style={styles.greeting}>Welcome, Business Owner!</Headline>
            <Caption style={styles.subtitle}>Your business at a glance</Caption>
          </View>
          <Button mode="outlined" onPress={() => navigation.navigate('Profile')}>
            Settings
          </Button>
        </View>

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statIcon}>💰</Text>
                <Headline style={styles.statValue}>₦0</Headline>
                <Caption>Total Sales</Caption>
              </Card.Content>
            </Card>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statIcon}>📊</Text>
                <Headline style={styles.statValue}>0</Headline>
                <Caption>Transactions</Caption>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Sales')}>
              <Card.Content style={styles.actionContent}>
                <Text style={styles.actionIcon}>🛒</Text>
                <Text style={styles.actionText}>Record Sale</Text>
              </Card.Content>
            </Card>
            <Card style={styles.actionCard} onPress={() => navigation.navigate('Inventory')}>
              <Card.Content style={styles.actionContent}>
                <Text style={styles.actionIcon}>📦</Text>
                <Text style={styles.actionText}>Manage Inventory</Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* FAB for quick sale */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Sales')}
        label="Record Sale"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: 'white',
  },
  greeting: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', marginBottom: 12, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', marginBottom: 12 },
  actionContent: { alignItems: 'center', padding: 16 },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionText: { textAlign: 'center', fontSize: 12 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default DashboardScreen;
