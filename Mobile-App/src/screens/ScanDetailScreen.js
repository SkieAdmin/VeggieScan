import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { 
  Surface, 
  Text, 
  Chip, 
  Divider, 
  Button, 
  useTheme, 
  Card, 
  Title, 
  Paragraph,
  ActivityIndicator,
  IconButton,
  Dialog,
  Portal
} from 'react-native-paper';
import { 
  MaterialIcons, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import axios from 'axios';
import { API_URL, FRESHNESS_LEVELS } from '../utils/config';
import { format } from 'date-fns';

const ScanDetailScreen = ({ route, navigation }) => {
  const { scanId } = route.params;
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchScanDetails();
  }, [scanId]);

  const fetchScanDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/scans/${scanId}`);
      setScan(response.data);
    } catch (error) {
      console.error('Error fetching scan details:', error);
      setError('Failed to load scan details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/scans/${scanId}`);
      setDeleteDialogVisible(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting scan:', error);
      setError('Failed to delete scan. Please try again.');
      setDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Helper function to get color based on freshness level
  const getFreshnessColor = (freshnessLevel) => {
    return FRESHNESS_LEVELS[freshnessLevel]?.color || theme.colors.text;
  };

  // Helper function to get label based on freshness level
  const getFreshnessLabel = (freshnessLevel) => {
    return FRESHNESS_LEVELS[freshnessLevel]?.label || 'Unknown';
  };

  // Helper function to get icon based on freshness level
  const getFreshnessIcon = (freshnessLevel) => {
    return FRESHNESS_LEVELS[freshnessLevel]?.icon || 'help-circle';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading scan details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={fetchScanDetails}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Surface style={styles.surface}>
          {/* Header with delete button */}
          <View style={styles.header}>
            <Title style={styles.title}>Scan Details</Title>
            <IconButton
              icon="delete"
              size={24}
              onPress={() => setDeleteDialogVisible(true)}
              color={theme.colors.error}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Vegetable Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `${API_URL}/uploads/${scan.imagePath}` }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          
          {/* Basic Info Card */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title style={styles.vegetableName}>{scan.vegetableName}</Title>
              
              <View style={styles.chipsContainer}>
                {/* Safety Status */}
                <Chip 
                  icon={props => 
                    <MaterialIcons 
                      name={scan.isSafe ? "check-circle" : "cancel"} 
                      size={20} 
                      color={scan.isSafe ? theme.colors.success : theme.colors.error} 
                    />
                  }
                  style={[styles.chip, { backgroundColor: scan.isSafe ? 
                    `${theme.colors.success}20` : `${theme.colors.error}20` }]}
                >
                  {scan.isSafe ? 'Safe to Eat' : 'Unsafe to Eat'}
                </Chip>
                
                {/* Freshness Level */}
                <Chip 
                  icon={props => 
                    <MaterialCommunityIcons 
                      name={getFreshnessIcon(scan.freshnessLevel)} 
                      size={20} 
                      color={getFreshnessColor(scan.freshnessLevel)} 
                    />
                  }
                  style={[styles.chip, { backgroundColor: `${getFreshnessColor(scan.freshnessLevel)}20` }]}
                >
                  {getFreshnessLabel(scan.freshnessLevel)}
                </Chip>
                
                {/* Disease Status */}
                {scan.diseaseName && (
                  <Chip 
                    icon={props => 
                      <MaterialIcons 
                        name="bug-report" 
                        size={20} 
                        color={theme.colors.warning} 
                      />
                    }
                    style={[styles.chip, { backgroundColor: `${theme.colors.warning}20` }]}
                  >
                    {scan.diseaseName}
                  </Chip>
                )}
              </View>
            </Card.Content>
          </Card>
          
          {/* Freshness Score Card */}
          <Card style={styles.detailCard}>
            <Card.Content>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Freshness Score:</Text>
                <Text 
                  style={[
                    styles.detailValue, 
                    { color: getFreshnessColor(scan.freshnessLevel) }
                  ]}
                >
                  {scan.freshnessScore}%
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Freshness Level:</Text>
                <Chip 
                  style={[
                    styles.miniChip, 
                    { backgroundColor: `${getFreshnessColor(scan.freshnessLevel)}20` }
                  ]}
                >
                  {getFreshnessLabel(scan.freshnessLevel)}
                </Chip>
              </View>
              
              <Text style={styles.detailDescription}>
                {FRESHNESS_LEVELS[scan.freshnessLevel]?.description || 'No description available.'}
              </Text>
            </Card.Content>
          </Card>
          
          {/* Recommendation Card */}
          <Card style={styles.detailCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Recommendation</Title>
              <Paragraph style={styles.recommendation}>
                {scan.recommendation}
              </Paragraph>
            </Card.Content>
          </Card>
          
          {/* Metadata Card */}
          <Card style={styles.detailCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Scan Information</Title>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Scan ID:</Text>
                <Text style={styles.detailValue}>{scan.id}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>{formatDate(scan.createdAt)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Updated:</Text>
                <Text style={styles.detailValue}>{formatDate(scan.updatedAt)}</Text>
              </View>
            </Card.Content>
          </Card>
        </Surface>
      </ScrollView>
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Scan</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this scan? This action cannot be undone.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={handleDelete} 
              color={theme.colors.error}
              loading={deleting}
              disabled={deleting}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
  divider: {
    marginVertical: 12,
  },
  imageContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  vegetableName: {
    fontSize: 22,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
  detailCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    opacity: 0.8,
  },
  recommendation: {
    fontSize: 16,
    lineHeight: 24,
  },
  miniChip: {
    height: 28,
  },
});

export default ScanDetailScreen;
