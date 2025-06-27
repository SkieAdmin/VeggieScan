import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { ActivityIndicator, Button, Surface, IconButton } from 'react-native-paper';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import { API_URL } from '../utils/config';

const ScanScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const takePicture = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        // Resize and compress the image for faster upload
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setCapturedImage(manipResult);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setLoading(true);
    
    try {
      // Create form data for image upload
      const formData = new FormData();
      formData.append('image', {
        uri: capturedImage.uri,
        type: 'image/jpeg',
        name: 'vegetable.jpg',
      });

      // Send image to backend for analysis
      const response = await axios.post(`${API_URL}/scans/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Navigate to results screen with the analysis data
      navigation.navigate('ScanResult', { scanResult: response.data });
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Analysis Failed',
        'Failed to analyze the image. Please try again or check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onCameraReady={handleCameraReady}
          ratio="4:3"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={!cameraReady}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      ) : (
        <View style={styles.previewContainer}>
          <Surface style={styles.previewImageContainer}>
            <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
          </Surface>
          
          <View style={styles.previewControls}>
            {loading ? (
              <ActivityIndicator size="large" color="#4caf50" />
            ) : (
              <>
                <Button 
                  mode="outlined" 
                  onPress={retakePicture}
                  style={styles.button}
                  icon="camera-retake"
                >
                  Retake
                </Button>
                <Button 
                  mode="contained" 
                  onPress={analyzeImage}
                  style={styles.button}
                  icon="check-circle"
                >
                  Analyze
                </Button>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cameraControls: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  previewImageContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    marginHorizontal: 10,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
});

export default ScanScreen;
