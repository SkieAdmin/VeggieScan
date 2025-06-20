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
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { makeAuthenticatedRequest, API_ENDPOINTS } from '../config/api';

const AdminDashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await makeAuthenticatedRequest(
        API_ENDPOINTS.DASHBOARD,
        { method: 'GET' },
        token
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch system status
      const statusResponse = await makeAuthenticatedRequest(
        API_ENDPOINTS.ADMIN_SYSTEM,
        { method: 'GET' },
        token
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSystemStatus(statusData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  const getStatusColor = (status) => {
    return status === 'online' ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (status) => {
    return status === 'online' ? 'check-circle' : 'error';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
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
        <Title style={styles.title}>Admin Dashboard</Title>
        <Text style={styles.subtitle}>System overview and management</Text>
      </View>

      {/* System Status */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>System Status</Title>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Icon
                name={getStatusIcon(systemStatus?.api_status)}
                size={24}
                color={getStatusColor(systemStatus?.api_status)}
              />
              <Text style={styles.statusLabel}>API Server</Text>
              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(systemStatus?.api_status) + '20' }
                ]}
                textStyle={{ color: getStatusColor(systemStatus?.api_status) }}
              >
                {systemStatus?.api_status || 'Unknown'}
              </Chip>
            </View>

            <View style={styles.statusItem}>
              <Icon
                name={getStatusIcon(systemStatus?.lm_studio_status)}
                size={24}
                color={getStatusColor(systemStatus?.lm_studio_status)}
              />
              <Text style={styles.statusLabel}>LM Studio</Text>
              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(systemStatus?.lm_studio_status) + '20' }
                ]}
                textStyle={{ color: getStatusColor(systemStatus?.lm_studio_status) }}
              >
                {systemStatus?.lm_studio_status || 'Unknown'}
              </Chip>
            </View>

            <View style={styles.statusItem}>
              <Icon
                name={getStatusIcon(systemStatus?.database_status)}
                size={24}
                color={getStatusColor(systemStatus?.database_status)}
              />
              <Text style={styles.statusLabel}>Database</Text>
              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(systemStatus?.database_status) + '20' }
                ]}
                textStyle={{ color: getStatusColor(systemStatus?.database_status) }}
              >
                {systemStatus?.database_status || 'Unknown'}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, styles.goodCard]}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon name="check-circle" size={40} color="#4CAF50" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{stats?.total_good || 0}</Text>
              <Text style={styles.statLabel}>Good Scans</Text>
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
              <Text style={styles.statLabel}>Bad Scans</Text>
            </View>
          </Card.Content>
        </Card>

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
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          <View style={styles.actionsList}>
            <View style={styles.actionItem}>
              <Icon name="people" size={24} color="#2196F3" />
              <Text style={styles.actionText}>Manage Users</Text>
              <Text style={styles.actionDescription}>
                View and manage user accounts
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Icon name="computer" size={24} color="#FF9800" />
              <Text style={styles.actionText}>System Monitor</Text>
              <Text style={styles.actionDescription}>
                Monitor system performance
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Icon name="dataset" size={24} color="#9C27B0" />
              <Text style={styles.actionText}>Dataset Management</Text>
              <Text style={styles.actionDescription}>
                Manage vegetable dataset
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Performance Metrics */}
      <Card style={styles.metricsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Performance Metrics</Title>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Success Rate</Text>
              <Text style={styles.metricValue}>
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
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Scans</Text>
              <Text style={styles.metricValue}>
                {(stats?.total_good || 0) + (stats?.total_bad || 0)}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Avg. per User</Text>
              <Text style={styles.metricValue}>
                {stats?.total_users
                  ? Math.round(
                      ((stats?.total_good || 0) + (stats?.total_bad || 0)) /
                        stats.total_users
                    )
                  : 0}
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
    color: '#FF5722',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusCard: {
    margin: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    color: '#333',
  },
  statusChip: {
    marginLeft: 8,
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
  actionsCard: {
    margin: 16,
    elevation: 4,
  },
  actionsList: {
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    color: '#333',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    flex: 2,
  },
  metricsCard: {
    margin: 16,
    elevation: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5722',
  },
});

export default AdminDashboardScreen;
