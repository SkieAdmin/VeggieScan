import React from 'react';
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
  Paragraph 
} from 'react-native-paper';
import { 
  MaterialIcons, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { API_URL } from '../utils/config';

const ScanResultScreen = ({ route, navigation }) => {
  const { scanResult } = route.params;
  const theme = useTheme();
  const scan = scanResult.scan;

  // Helper function to get color based on freshness level
  const getFreshnessColor = (freshnessLevel) => {
    switch (freshnessLevel) {
      case 'GOOD': return theme.colors.success;
      case 'ACCEPTABLE': return theme.colors.warning;
      case 'NOT_RECOMMENDED': return theme.colors.error;
      default: return theme.colors.text;
    }
  };

  // Helper function to get label based on freshness level
  const getFreshnessLabel = (freshnessLevel) => {
    switch (freshnessLevel) {
      case 'GOOD': return 'Fresh';
      case 'ACCEPTABLE': return 'Fair';
      case 'NOT_RECOMMENDED': return 'Poor';
      default: return 'Unknown';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Analysis Results</Title>
            <Divider style={styles.divider} />

            {/* Vegetable Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: `${API_URL}/uploads/${scan.imagePath}` }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            {/* Vegetable Name */}
            <View style={styles.section}>
              <Title>{scan.vegetableName}</Title>
            </View>

            {/* Status Chips */}
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
                    name={
                      scan.freshnessLevel === 'GOOD' ? "leaf" : 
                      scan.freshnessLevel === 'ACCEPTABLE' ? "alert" : 
                      "alert-circle"
                    } 
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

            {/* Freshness Score */}
            <Card style={styles.scoreCard}>
              <Card.Content>
                <Title style={styles.scoreTitle}>Freshness Score</Title>
                <Text style={[styles.scoreValue, { color: getFreshnessColor(scan.freshnessLevel) }]}>
                  {scan.freshnessScore}%
                </Text>
              </Card.Content>
            </Card>

            {/* Recommendation */}
            <Card style={styles.recommendationCard}>
              <Card.Content>
                <Title style={styles.recommendationTitle}>Recommendation</Title>
                <Paragraph style={styles.recommendation}>
                  {scan.recommendation}
                </Paragraph>
              </Card.Content>
            </Card>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Scan')}
                style={styles.button}
                icon="camera"
              >
                Scan Another
              </Button>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('ScanDetail', { scanId: scan.id })}
                style={styles.button}
                icon="information"
              >
                View Details
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 16,
    elevation: 0,
  },
  card: {
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
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
  section: {
    marginBottom: 16,
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'center',
  },
  chip: {
    margin: 4,
  },
  scoreCard: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  scoreTitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recommendationCard: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  recommendationTitle: {
    fontSize: 16,
  },
  recommendation: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ScanResultScreen;
