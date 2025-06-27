import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { 
  Surface, 
  Text, 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  Avatar, 
  useTheme,
  ActivityIndicator,
  FAB
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../utils/config';
import FreshnessChart from '../components/FreshnessChart';
import RecentScansCard from '../components/RecentScansCard';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const theme = useTheme();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get statistics
      const statsResponse = await axios.get(`${API_URL}/stats`);
      setStats(statsResponse.data);
      
      // Get recent scans
      const scansResponse = await axios.get(`${API_URL}/scans/recent`);
      setRecentScans(scansResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Surface style={styles.headerSurface}>
          <View style={styles.headerContent}>
            <Avatar.Icon size={60} icon="account" style={styles.avatar} />
            <View style={styles.headerTextContainer}>
              <Title style={styles.welcomeText}>Welcome Back!</Title>
              <Paragraph style={styles.subText}>
                Your vegetable freshness assistant
              </Paragraph>
            </View>
          </View>
        </Surface>

        <View style={styles.statsContainer}>
          {/* Total Scans Card */}
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsCardContent}>
              <MaterialCommunityIcons 
                name="image-filter" 
                size={36} 
                color={theme.colors.primary} 
              />
              <Title style={styles.statsNumber}>
                {stats?.totalScans || 0}
              </Title>
              <Text style={styles.statsLabel}>Total Scans</Text>
            </Card.Content>
          </Card>

          {/* Safe Vegetables Card */}
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsCardContent}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={36} 
                color={theme.colors.success} 
              />
              <Title style={styles.statsNumber}>
                {stats?.safeCount || 0}
              </Title>
              <Text style={styles.statsLabel}>Safe Vegetables</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Freshness Chart */}
        {stats && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Freshness Analysis</Title>
              <FreshnessChart 
                goodCount={stats.freshnessGoodCount || 0}
                acceptableCount={stats.freshnessAcceptableCount || 0}
                notRecommendedCount={stats.freshnessNotRecommendedCount || 0}
              />
            </Card.Content>
          </Card>
        )}

        {/* Recent Scans */}
        <Card style={styles.recentScansCard}>
          <Card.Content>
            <Title style={styles.recentScansTitle}>Recent Scans</Title>
            <RecentScansCard 
              scans={recentScans} 
              navigation={navigation} 
            />
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('History')}
              style={styles.viewAllButton}
            >
              View All Scans
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button for Scan */}
      <FAB
        style={styles.fab}
        icon="camera"
        label="Scan"
        onPress={() => navigation.navigate('Scan')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  headerSurface: {
    padding: 16,
    elevation: 4,
    backgroundColor: '#4caf50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#ffffff',
  },
  headerTextContainer: {
    marginLeft: 16,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 24,
  },
  subText: {
    color: '#ffffff',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  statsCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  statsNumber: {
    fontSize: 24,
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  recentScansCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 10,
    marginBottom: 80, // Add space for FAB
  },
  recentScansTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  viewAllButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4caf50',
  },
});

export default HomeScreen;
