import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { makeAuthenticatedRequest, API_ENDPOINTS } from '../config/api';

const DashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        API_ENDPOINTS.DASHBOARD,
        { method: 'GET' },
        token
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.title}>Dashboard</Title>
        <Text style={styles.subtitle}>
          Welcome back, {user?.username || user?.email}!
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, styles.goodCard]}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon name="check-circle" size={40} color="#4CAF50" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{stats?.total_good || 0}</Text>
              <Text style={styles.statLabel}>Good Vegetables</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, styles.badCard]}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon name="warning" size={40} color="#F44336" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{stats?.total_bad || 0}</Text>
              <Text style={styles.statLabel}>Bad Vegetables</Text>
            </View>
          </Card.Content>
        </Card>

        {user?.is_admin && (
          <Card style={[styles.statCard, styles.usersCard]}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIcon}>
                <Icon name="people" size={40} color="#2196F3" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{stats?.total_users || 0}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Quick Summary</Title>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Scans:</Text>
              <Text style={styles.summaryValue}>
                {(stats?.total_good || 0) + (stats?.total_bad || 0)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Success Rate:</Text>
              <Text style={styles.summaryValue}>
                {stats?.total_good || stats?.total_bad
                  ? Math.round(
                      ((stats?.total_good || 0) /
                        ((stats?.total_good || 0) + (stats?.total_bad || 0))) *
                        100
                    )
                  : 0}
                %
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.tipsCard}>
        <Card.Content>
          <Title style={styles.tipsTitle}>Tips for Better Scanning</Title>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="lightbulb-outline" size={20} color="#FF9800" />
              <Text style={styles.tipText}>
                Ensure good lighting when taking photos
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="center-focus-strong" size={20} color="#FF9800" />
              <Text style={styles.tipText}>
                Focus on the vegetable, avoid cluttered backgrounds
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="photo-camera" size={20} color="#FF9800" />
              <Text style={styles.tipText}>
                Take clear, high-resolution images
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 16,
  },
  statCard: {
    marginBottom: 16,
    elevation: 4,
  },
  goodCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  badCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  usersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tipsCard: {
    margin: 16,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
});

export default DashboardScreen;
