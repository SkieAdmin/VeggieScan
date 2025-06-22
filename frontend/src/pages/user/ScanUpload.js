import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Alert,
  Paper,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Cancel,
  WarningAmber,
  BugReport
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const ScanUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const theme = useTheme();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const selectedFile = acceptedFiles[0];
    
    // Check if file is an image
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
    setScanResult(null);
    
    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    
    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image to upload');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload image with progress tracking
      const response = await axios.post('/scans/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      // Set scan result
      setScanResult(response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.response?.data?.error || 'Failed to upload and analyze image');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setScanResult(null);
    setError('');
    setUploadProgress(0);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Scan Vegetable
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Vegetable Image
              </Typography>
              
              {!preview ? (
                <Box
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
                  sx={{
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag and drop an image here, or click to select a file'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Supported formats: JPEG, PNG, GIF (Max size: 10MB)
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={preview}
                      alt="Vegetable preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: theme.shape.borderRadius
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>
                    {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      disabled={uploading}
                    >
                      Change Image
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={handleUpload}
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={20} /> : null}
                    >
                      {uploading ? 'Analyzing...' : 'Analyze Vegetable'}
                    </Button>
                  </Box>
                </Box>
              )}
              
              {uploading && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Uploading and analyzing image... {uploadProgress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          {scanResult ? (
            <Card
              className={`scan-result-card ${
                scanResult.scan.isSafe ? 'scan-result-safe' : 'scan-result-unsafe'
              }`}
              sx={{
                borderLeft: `5px solid ${
                  scanResult.scan.isSafe
                    ? theme.palette.success.main
                    : theme.palette.error.main
                }`
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Analysis Results
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                      <Typography variant="h6" gutterBottom>
                        {scanResult.scan.vegetableName}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip
                          icon={scanResult.scan.isSafe ? <CheckCircle /> : <Cancel />}
                          label={scanResult.scan.isSafe ? 'Safe to Eat' : 'Unsafe to Eat'}
                          color={scanResult.scan.isSafe ? 'success' : 'error'}
                          sx={{ mr: 1 }}
                        />
                        
                        {scanResult.scan.diseaseName && (
                          <Chip
                            icon={<BugReport />}
                            label={scanResult.scan.diseaseName}
                            color="warning"
                          />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Recommendation:
                      </Typography>
                      <Typography variant="body1">
                        {scanResult.scan.recommendation}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                  >
                    Scan Another
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/history/${scanResult.scan.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningAmber sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Analysis Results Yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Upload a vegetable image to get freshness and contamination analysis
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScanUpload;
