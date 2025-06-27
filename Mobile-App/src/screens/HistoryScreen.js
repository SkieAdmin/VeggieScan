import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { 
  Surface, 
  Text, 
  Card, 
  Title, 
  Chip, 
  Avatar, 
  useTheme,
  ActivityIndicator,
  Searchbar,
  Button,
  IconButton,
  Menu,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL, FRESHNESS_LEVELS } from '../utils/config';
import { format } from 'date-fns';

const HistoryScreen = ({ navigation }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filterBy, setFilterBy] = useState('all'); // all, safe, unsafe, fresh, fair, poor
  const theme = useTheme();

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/scans`);
      setScans(response.data);
    } catch (error) {
      console.error('Error fetching scans:', error);
      setError('Failed to load scan history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchScans();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Filter scans based on search query and filter type
  const filteredScans = scans.filter(scan => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      scan.vegetableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.diseaseName && scan.diseaseName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    let matchesFilter = true;
    switch (filterBy) {
      case 'safe':
        matchesFilter = scan.isSafe === true;
        break;
      case 'unsafe':
        matchesFilter = scan.isSafe === false;
        break;
      case 'fresh':
        matchesFilter = scan.freshnessLevel === 'GOOD';
        break;
      case 'fair':
        matchesFilter = scan.freshnessLevel === 'ACCEPTABLE';
        break;
      case 'poor':
        matchesFilter = scan.freshnessLevel === 'NOT_RECOMMENDED';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const renderScanItem = ({ item }) => (
    <Card 
      style={styles.scanCard}
      onPress={() => navigation.navigate('ScanDetail', { scanId: item.id })}
    >
      <Card.Content style={styles.cardContent}>
        <Avatar.Image
          size={60}
          source={{ uri: `${API_URL}/uploads/${item.imagePath}` }}
          style={styles.scanImage}
        />
        
        <View style={styles.scanDetails}>
          <Title style={styles.vegetableName}>{item.vegetableName}</Title>
          
          <View style={styles.chipsContainer}>
            {/* Safety Status */}
            <Chip 
              mode="outlined"
              style={[
                styles.miniChip, 
                { borderColor: item.isSafe ? theme.colors.success : theme.colors.error }
              ]}
              textStyle={{ fontSize: 10 }}
            >
              {item.isSafe ? 'Safe' : 'Unsafe'}
            </Chip>
            
            {/* Freshness Level */}
            <Chip 
              mode="outlined"
              style={[
                styles.miniChip, 
                { borderColor: FRESHNESS_LEVELS[item.freshnessLevel]?.color || theme.colors.text }
              ]}
              textStyle={{ fontSize: 10 }}
            >
              <MaterialCommunityIcons 
                name={FRESHNESS_LEVELS[item.freshnessLevel]?.icon || 'help-circle'} 
                size={10} 
                color={FRESHNESS_LEVELS[item.freshnessLevel]?.color || theme.colors.text} 
              />
              {' '}
              {item.freshnessScore}%
            </Chip>
          </View>
          
          <Text style={styles.scanDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.headerSurface}>
        <Searchbar
          placeholder="Search vegetable or disease"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>
            {filterBy === 'all' ? 'All Scans' : 
             filterBy === 'safe' ? 'Safe Vegetables' :
             filterBy === 'unsafe' ? 'Unsafe Vegetables' :
             filterBy === 'fresh' ? 'Fresh Vegetables' :
             filterBy === 'fair' ? 'Fair Vegetables' :
             'Poor Vegetables'}
          </Text>
          
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <IconButton
                icon="filter-variant"
                size={24}
                onPress={() => setFilterMenuVisible(true)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                setFilterBy('all');
                setFilterMenuVisible(false);
              }} 
              title="All Scans" 
              leadingIcon="format-list-bulleted"
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setFilterBy('safe');
                setFilterMenuVisible(false);
              }} 
              title="Safe Vegetables" 
              leadingIcon="check-circle"
            />
            <Menu.Item 
              onPress={() => {
                setFilterBy('unsafe');
                setFilterMenuVisible(false);
              }} 
              title="Unsafe Vegetables" 
              leadingIcon="close-circle"
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setFilterBy('fresh');
                setFilterMenuVisible(false);
              }} 
              title="Fresh Vegetables" 
              leadingIcon="leaf"
            />
            <Menu.Item 
              onPress={() => {
                setFilterBy('fair');
                setFilterMenuVisible(false);
              }} 
              title="Fair Vegetables" 
              leadingIcon="alert"
            />
            <Menu.Item 
              onPress={() => {
                setFilterBy('poor');
                setFilterMenuVisible(false);
              }} 
              title="Poor Vegetables" 
              leadingIcon="alert-circle"
            />
          </Menu>
        </View>
      </Surface>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading scan history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchScans}>Retry</Button>
        </View>
      ) : filteredScans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="image-filter" size={48} color={theme.colors.disabled} />
          <Text style={styles.emptyText}>
            {searchQuery || filterBy !== 'all' ? 'No matching scans found' : 'No scans yet'}
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Scan')}
            style={styles.scanButton}
            icon="camera"
          >
            Scan a Vegetable
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredScans}
          renderItem={renderScanItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  headerSurface: {
    padding: 16,
    elevation: 4,
  },
  searchBar: {
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginVertical: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginVertical: 16,
    fontSize: 16,
  },
  scanButton: {
    marginTop: 16,
  },
  listContent: {
    padding: 16,
  },
  scanCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanImage: {
    marginRight: 16,
    backgroundColor: '#e0e0e0',
  },
  scanDetails: {
    flex: 1,
  },
  vegetableName: {
    fontSize: 18,
    marginBottom: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  miniChip: {
    marginRight: 8,
    height: 24,
  },
  scanDate: {
    fontSize: 12,
    opacity: 0.6,
  },
});

export default HistoryScreen;
