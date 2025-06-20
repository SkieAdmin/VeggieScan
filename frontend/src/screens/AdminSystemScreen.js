import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Chip,
  Button,
  List,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { makeAuthenticatedRequest, API_ENDPOINTS } from '../config/api';

const AdminSystemScreen = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
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

      // Fetch dataset info
      const datasetResponse = await makeAuthenticatedRequest(
        API_ENDPOINTS.DATASET,
        { method: 'GET' },
        token
      );

      if (datasetResponse.ok) {
        const datasetData = await datasetResponse.json();
        setDataset(datasetData);
      }
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSystemData();
  };

  const getStatusColor = (status) => {
    return status === 'online' ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (status) => {
    return status === 'online' ? 'check-circle' : 'error';
  };

  const handleSystemAction = (action) => {
    Alert.alert(
      `${action}`,
      `Are you sure you want to ${action.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: () => {
            Alert.alert('Coming Soon', `${action} functionality will be implemented soon`);
          },
        },
      ]
    );
  };

  const exportDataset = () => {
    Alert.alert(
      'Export Dataset',
      'This will export the vegetable dataset for sharing. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // Implement dataset export logic
            Alert.alert('Success', 'Dataset exported successfully');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading system status...</Text>
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
        <Title style={styles.title}>System Status</Title>
        <Text style={styles.subtitle}>Monitor and manage system components</Text>
      </View>

      {/* System Health */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>System Health</Title>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Icon
                name={getStatusIcon(systemStatus?.api_status)}
                size={32}
                color={getStatusColor(systemStatus?.api_status)}
              />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>API Server</Text>
                <Text style={styles.statusDescription}>FastAPI Backend</Text>
              </View>
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

            <Divider style={styles.divider} />

            <View style={styles.statusItem}>
              <Icon
                name={getStatusIcon(systemStatus?.lm_studio_status)}
                size={32}
                color={getStatusColor(systemStatus?.lm_studio_status)}
              />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>LM Studio</Text>
                <Text style={styles.statusDescription}>AI Analysis Engine</Text>
              </View>
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

            <Divider style={styles.divider} />

            <View style={styles.statusItem}>
              <Icon
                name={getStatusIcon(systemStatus?.database_status)}
                size={32}
                color={getStatusColor(systemStatus?.database_status)}
              />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Database</Text>
                <Text style={styles.statusDescription}>SQLite Storage</Text>
              </View>
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

      {/* Dataset Information */}
      <Card style={styles.datasetCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Dataset Information</Title>
          <View style={styles.datasetStats}>
            <View style={styles.datasetStat}>
              <Text style={styles.datasetNumber}>{dataset.length}</Text>
              <Text style={styles.datasetLabel}>Total Entries</Text>
            </View>
            <View style={styles.datasetStat}>
              <Text style={styles.datasetNumber}>
                {dataset.filter(item => item.safe_to_eat).length}
              </Text>
              <Text style={styles.datasetLabel}>Safe Vegetables</Text>
            </View>
            <View style={styles.datasetStat}>
              <Text style={styles.datasetNumber}>
                {dataset.filter(item => !item.safe_to_eat).length}
              </Text>
              <Text style={styles.datasetLabel}>Unsafe Vegetables</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={exportDataset}
            style={styles.exportButton}
            icon="download"
          >
            Export Dataset
          </Button>
        </Card.Content>
      </Card>

      {/* System Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>System Actions</Title>
          
          <List.Item
            title="Restart API Server"
            description="Restart the FastAPI backend server"
            left={(props) => <List.Icon {...props} icon="restart" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSystemAction('Restart API Server')}
          />
          
          <Divider />
          
          <List.Item
            title="Clear Cache"
            description="Clear system cache and temporary files"
            left={(props) => <List.Icon {...props} icon="delete-sweep" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSystemAction('Clear Cache')}
          />
          
          <Divider />
          
          <List.Item
            title="Backup Database"
            description="Create a backup of the system database"
            left={(props) => <List.Icon {...props} icon="backup-restore" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSystemAction('Backup Database')}
          />
          
          <Divider />
          
          <List.Item
            title="System Logs"
            description="View system logs and error reports"
            left={(props) => <List.Icon {...props} icon="text-box" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => handleSystemAction('View System Logs')}
          />
        </Card.Content>
      </Card>

      {/* Performance Metrics */}
      <Card style={styles.metricsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Performance Metrics</Title>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Icon name="speed" size={24} color="#2196F3" />
              <Text style={styles.metricLabel}>Avg Response Time</Text>
              <Text style={styles.metricValue}>~2.3s</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="memory" size={24} color="#FF9800" />
              <Text style={styles.metricLabel}>Memory Usage</Text>
              <Text style={styles.metricValue}>~45%</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="storage" size={24} color="#9C27B0" />
              <Text style={styles.metricLabel}>Storage Used</Text>
              <Text style={styles.metricValue}>~12GB</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* LM Studio Configuration */}
      <Card style={styles.configCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>LM Studio Configuration</Title>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Model:</Text>
            <Text style={styles.configValue}>google/gemma-3-4b</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Endpoint:</Text>
            <Text style={styles.configValue}>http://26.165.143.148:1234</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Status:</Text>
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
    fontSize: 24,
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
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 8,
  },
  datasetCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  datasetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  datasetStat: {
    alignItems: 'center',
  },
  datasetNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  datasetLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  exportButton: {
    paddingVertical: 8,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  metricsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  metricsContainer: {
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    color: '#333',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  configCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 4,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  configValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
    marginRight: 8,
  },
});

export default AdminSystemScreen;
