import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Text,
  ActivityIndicator,
  Divider,
  Chip,
} from 'react-native-paper';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const ScanScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const { token } = useAuth();

  const selectImage = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
        setResult(null);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
        setResult(null);
      }
    });
  };

  const scanImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setScanning(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.9) {
          clearInterval(progressInterval);
          return 0.9;
        }
        return prev + 0.1;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || 'image.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(1);

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        Alert.alert('Scan Failed', errorData.detail || 'Unknown error');
      }
    } catch (error) {
      clearInterval(progressInterval);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setScanning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getSafetyColor = (safeToEat) => {
    return safeToEat ? '#4CAF50' : '#F44336';
  };

  const getSafetyIcon = (safeToEat) => {
    return safeToEat ? 'check-circle' : 'warning';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Vegetable Scanner</Title>
        <Text style={styles.subtitle}>Upload or capture a vegetable image</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.image} />
              <Button
                mode="outlined"
                onPress={selectImage}
                style={styles.changeImageButton}
              >
                Change Image
              </Button>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="add-a-photo" size={64} color="#ccc" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={selectedImage ? scanImage : selectImage}
            style={styles.actionButton}
            disabled={scanning}
          >
            {selectedImage ? 'Scan Vegetable' : 'Select Image'}
          </Button>

          {scanning && (
            <View style={styles.progressContainer}>
              <Progress.Bar
                progress={progress}
                width={null}
                height={8}
                color="#4CAF50"
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                Analyzing... {Math.round(progress * 100)}%
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {result && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <Title style={styles.resultTitle}>Scan Results</Title>
              <Icon
                name={getSafetyIcon(result.safe_to_eat)}
                size={32}
                color={getSafetyColor(result.safe_to_eat)}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Vegetable Name:</Text>
              <Text style={styles.resultValue}>{result.vegetable_name}</Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Safe to Eat:</Text>
              <Chip
                mode="flat"
                style={[
                  styles.safetyChip,
                  { backgroundColor: getSafetyColor(result.safe_to_eat) + '20' }
                ]}
                textStyle={{ color: getSafetyColor(result.safe_to_eat) }}
              >
                {result.safe_to_eat ? 'Yes' : 'No'}
              </Chip>
            </View>

            {result.disease_name && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Disease Name:</Text>
                <Text style={[styles.resultValue, styles.diseaseText]}>
                  {result.disease_name}
                </Text>
              </View>
            )}

            <View style={styles.recommendationContainer}>
              <Text style={styles.resultLabel}>Recommendation:</Text>
              <Text style={styles.recommendationText}>
                {result.recommendation}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  card: {
    margin: 16,
    elevation: 4,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeImageButton: {
    marginTop: 8,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  actionButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
  },
  resultCard: {
    margin: 16,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  safetyChip: {
    marginLeft: 8,
  },
  diseaseText: {
    color: '#F44336',
    fontWeight: '500',
  },
  recommendationContainer: {
    marginTop: 16,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ScanScreen;
