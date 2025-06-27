import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, useTheme, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { API_URL } from '../utils/config';

const RecentScansCard = ({ scans, navigation }) => {
  const theme = useTheme();

  // Helper function to get color based on freshness level
  const getFreshnessColor = (freshnessLevel) => {
    switch (freshnessLevel) {
      case 'GOOD': return theme.colors.success;
      case 'ACCEPTABLE': return theme.colors.warning;
      case 'NOT_RECOMMENDED': return theme.colors.error;
      default: return theme.colors.text;
    }
  };

  // Helper function to get icon based on freshness level
  const getFreshnessIcon = (freshnessLevel) => {
    switch (freshnessLevel) {
      case 'GOOD': return 'leaf';
      case 'ACCEPTABLE': return 'alert';
      case 'NOT_RECOMMENDED': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderScanItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ScanDetail', { scanId: item.id })}
    >
      <Card style={styles.scanCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <Avatar.Image
              size={60}
              source={{ uri: `${API_URL}/uploads/${item.imagePath}` }}
              style={styles.image}
            />
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.vegetableName}>{item.vegetableName}</Text>
            
            <View style={styles.chipsContainer}>
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
              
              <Chip 
                mode="outlined"
                style={[
                  styles.miniChip, 
                  { borderColor: getFreshnessColor(item.freshnessLevel) }
                ]}
                textStyle={{ fontSize: 10 }}
              >
                <MaterialCommunityIcons 
                  name={getFreshnessIcon(item.freshnessLevel)} 
                  size={10} 
                  color={getFreshnessColor(item.freshnessLevel)} 
                />
                {' '}
                {item.freshnessScore}%
              </Chip>
            </View>
            
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="image-filter" 
            size={40} 
            color={theme.colors.disabled} 
          />
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubText}>
            Scan your first vegetable to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderScanItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  scanCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    backgroundColor: '#e0e0e0',
  },
  detailsContainer: {
    flex: 1,
  },
  vegetableName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  miniChip: {
    height: 24,
    marginRight: 4,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default RecentScansCard;
