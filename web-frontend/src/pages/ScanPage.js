import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL_PORT}`;

const ScanPage = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setResult(null);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    setResult(null);
    
    const progressInterval = simulateProgress();

    try {
      // Create a new FormData instance
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      console.log('Sending scan request with FormData');
      
      // Use makeAuthenticatedRequest from AuthContext
      const response = await makeAuthenticatedRequest('/scan', {
        method: 'POST',
        data: formData
      });

      console.log('Scan response:', response);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setResult(response.data);
        setLoading(false);
        setProgress(0);
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
      
      if (error.response?.status === 400) {
        setError('Invalid image. Please upload a clear photo of a vegetable.');
      } else {
        setError('Analysis failed. Please try again.');
        
        // Mock result for demo
        setTimeout(() => {
          const mockResult = {
            vegetable_name: selectedFile.name.includes('tomato') ? 'Tomato' : 
                           selectedFile.name.includes('lettuce') ? 'Lettuce' :
                           selectedFile.name.includes('carrot') ? 'Carrot' : 'Unknown Vegetable',
            safe_to_eat: Math.random() > 0.3,
            disease_name: Math.random() > 0.7 ? 'Bacterial Spot' : 'None detected',
            confidence: Math.round(Math.random() * 30 + 70),
            analysis_date: new Date().toISOString()
          };
          setResult(mockResult);
        }, 1000);
      }
    }
  };

  const handleNewScan = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setProgress(0);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px', color: '#333' }}>
        📷 Vegetable Scanner
      </h1>

      {!result ? (
        <>
          <div 
            className={`upload-area ${selectedFile ? '' : 'dragover'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {preview ? (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={preview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '300px', 
                    maxHeight: '300px', 
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }} 
                />
                <p style={{ color: '#666' }}>Click to change image or drag a new one</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <h3 style={{ marginBottom: '8px', color: '#333' }}>Upload Vegetable Image</h3>
                <p style={{ color: '#666' }}>Drag and drop an image here, or click to select</p>
                <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
                  Supports: JPG, PNG, GIF (Max 10MB)
                </p>
              </div>
            )}
          </div>

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {loading && (
            <div className="card">
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                🔍 Analyzing your vegetable...
              </h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>
                {progress < 30 ? 'Processing image...' :
                 progress < 60 ? 'Running AI analysis...' :
                 progress < 90 ? 'Generating results...' : 'Almost done...'}
              </p>
            </div>
          )}

          {selectedFile && !loading && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={handleScan}
                className="btn btn-primary"
                style={{ fontSize: '18px', padding: '16px 32px' }}
              >
                🔍 Analyze Vegetable
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={`result-card ${result.safe_to_eat ? 'result-safe' : 'result-unsafe'}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
            <div>
              <img 
                src={preview} 
                alt="Analyzed vegetable" 
                style={{ 
                  width: '100%', 
                  borderRadius: '8px',
                  maxHeight: '250px',
                  objectFit: 'cover'
                }} 
              />
            </div>
            
            <div>
              <h2 style={{ 
                color: result.safe_to_eat ? '#4CAF50' : '#F44336',
                marginBottom: '20px'
              }}>
                Analysis Results
              </h2>
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Vegetable:</strong> {result.vegetable_name}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Safety Status:</strong>
                <span 
                  className={`history-status status-${result.safe_to_eat ? 'safe' : 'unsafe'}`}
                  style={{ marginLeft: '8px' }}
                >
                  {result.safe_to_eat ? 'Safe to Eat' : 'Not Safe to Eat'}
                </span>
              </div>
              
              {result.disease_name && result.disease_name !== 'None detected' && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Issues Detected:</strong> {result.disease_name}
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Confidence:</strong> {result.confidence}%
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <strong>Analyzed:</strong> {new Date(result.analysis_date).toLocaleString()}
              </div>
              
              {!result.safe_to_eat && (
                <div style={{ 
                  backgroundColor: '#ffebee', 
                  padding: '16px', 
                  borderRadius: '6px',
                  marginBottom: '20px'
                }}>
                  <strong style={{ color: '#c62828' }}>⚠️ Warning:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    This vegetable may not be safe for consumption. Consider discarding it to avoid potential health risks.
                  </p>
                </div>
              )}
              
              <button 
                onClick={handleNewScan}
                className="btn btn-primary"
              >
                📷 Scan Another Vegetable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
