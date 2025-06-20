import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { makeAuthenticatedRequest, API_ENDPOINTS } from '../config/api';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        API_ENDPOINTS.HISTORY,
        { method: 'GET' },
        token
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getSafetyColor = (safeToEat) => {
    return safeToEat ? '#4CAF50' : '#F44336';
  };

  const getSafetyIcon = (safeToEat) => {
    return safeToEat ? 'check-circle' : 'warning';
  };

  const renderHistoryItem = ({ item }) => (
    <Card style={styles.historyCard}>
      <Card.Content>
        <View style={styles.historyHeader}>
          <View style={styles.vegetableInfo}>
            <Text style={styles.vegetableName}>{item.vegetable_name}</Text>
            <Text style={styles.scanDate}>{formatDate(item.scan_date)}</Text>
          </View>
          <Icon
            name={getSafetyIcon(item.safe_to_eat)}
            size={24}
            color={getSafetyColor(item.safe_to_eat)}
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.historyDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: getSafetyColor(item.safe_to_eat) + '20' }
              ]}
              textStyle={{ color: getSafetyColor(item.safe_to_eat) }}
            >
              {item.safe_to_eat ? 'Safe' : 'Unsafe'}
            </Chip>
          </View>

          {item.disease_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Disease:</Text>
              <Text style={[styles.detailValue, styles.diseaseText]}>
                {item.disease_name}
              </Text>
            </View>
          )}

          <View style={styles.recommendationContainer}>
            <Text style={styles.detailLabel}>Recommendation:</Text>
            <Text style={styles.recommendationText}>
              {item.recommendation}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Scan History</Title>
        <Text style={styles.subtitle}>Your previous vegetable scans</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="history" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No scan history yet</Text>
          <Text style={styles.emptySubtext}>
            Start scanning vegetables to see your history here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyCard: {
    marginBottom: 16,
    elevation: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vegetableInfo: {
    flex: 1,
  },
  vegetableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scanDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    marginBottom: 12,
  },
  historyDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  statusChip: {
    marginLeft: 8,
  },
  diseaseText: {
    color: '#F44336',
    fontWeight: '500',
  },
  recommendationContainer: {
    marginTop: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
});

export default HistoryScreen;
