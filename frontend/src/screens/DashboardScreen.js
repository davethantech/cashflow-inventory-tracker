import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Headline,
  Caption,
  ActivityIndicator,
  FAB
} from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';
import { NetworkContext } from '../contexts/NetworkContext';
import { SyncContext } from '../contexts/SyncContext';
import { translations } from '../utils/translations';
import api from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user, language } = useContext(AuthContext);
  const { isConnected } = useContext(NetworkContext);
  const { pendingSyncCount, syncData } = useContext(SyncContext);
  const t = translations[language];

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/sales/daily-summary');
      const today = new Date().toISOString().split('T')[0];
      
      setDashboardData({
        ...response.data,
        date: today
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      Alert.alert(t.error, t.failedToLoadData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, subtitle, icon, color = '#2196F3' }) => (
    <Card style={styles.statCard}>
      <Card.Content>
        <View style={styles.statHeader}>
          <Text style={[styles.statIcon, { color }]}>{icon}</Text>
          <Caption>{title}</Caption>
        </View>
        <Headline style={styles.statValue}>{value}</Headline>
        {subtitle && <Caption>{subtitle}</Caption>}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Headline style={styles.greeting}>
              {t.greeting}, {user?.business_name || user?.phone_number}!
            </Headline>
            <Caption style={styles.networkStatus}>
              {isConnected ? t.online : t.offline}
              {pendingSyncCount > 0 && ` • ${pendingSyncCount} ${t.pendingSync}`}
            </Caption>
          </View>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Profile')}
            icon="account-cog"
          >
            {t.settings}
          </Button>
        </View>

        {/* Sync Alert */}
        {pendingSyncCount > 0 && (
          <Card style={styles.syncAlert}>
            <Card.Content>
              <Text>
                {pendingSyncCount} {t.itemsPendingSync}
              </Text>
              <Button
                mode="contained"
                onPress={syncData}
                style={styles.syncButton}
                disabled={!isConnected}
              >
                {t.syncNow}
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.todaysSummary}</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title={t.totalSales}
              value={`₦${dashboardData?.summary?.total_sales?.toLocaleString() || '0'}`}
              icon="💰"
            />
            <StatCard
              title={t.transactions}
              value={dashboardData?.summary?.total_transactions?.toString() || '0'}
              icon="📊"
            />
            <StatCard
              title={t.cashCollected}
              value={`₦${dashboardData?.summary?.total_cash_collected?.toLocaleString() || '0'}`}
              icon="💵"
            />
            <StatCard
              title={t.balance}
              value={`₦${dashboardData?.summary?.total_balance?.toLocaleString() || '0'}`}
              icon="⚖️"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.quickActions}</Text>
          <View style={styles.actionsGrid}>
            <Card
              style={styles.actionCard}
              onPress={() => navigation.navigate('Sales')}
            >
              <Card.Content style={styles.actionContent}>
                <Text style={styles.actionIcon}>🛒</Text>
                <Text style={styles.actionText}>{t.recordSale}</Text>
              </Card.Content>
            </Card>
            
            <Card
              style={styles.actionCard}
              onPress={() => navigation.navigate('Inventory')}
            >
              <Card.Content style={styles.actionContent}>
                <Text style={styles.actionIcon}>📦</Text>
                <Text style={styles.actionText}>{t.manageInventory}</Text>
              </Card.Content>
            </Card>
            
            <Card
              style={styles.actionCard}
              onPress={() => navigation.navigate('Reports')}
            >
              <Card.Content style={styles.actionContent}>
                <Text style={styles.actionIcon}>📈</Text>
                <Text style={styles.actionText}>{t.viewReports}</Text>
              </Card.Content>
            </Card>
            
            <Card
              style={styles.actionCard}
              onPress={() => Alert.alert(t.comingSoon)}
            >
              <Card.Content style={styles.actionContent}>
                <Text style={styles.actionIcon}>💸</Text>
                <Text style={styles.actionText}>{t.recordExpense}</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.recentActivity}</Text>
          <Card>
            <Card.Content>
              <Text>{t.comingSoon}</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* FAB for quick sale */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Sales')}
        label={t.recordSale}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  networkStatus: {
    marginTop: 4,
  },
  syncAlert: {
    margin: 16,
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
  },
  syncButton: {
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
  },
  actionContent: {
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    textAlign: 'center',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
