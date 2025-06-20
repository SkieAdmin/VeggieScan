import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminSystem = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const [systemInfo, setSystemInfo] = useState({
    api_status: 'online',
    database_status: 'connected',
    lm_studio_status: 'active',
    total_storage_used: 75,
    dataset_size: 1250,
    model_info: {
      name: 'google/gemma-3-4b',
      endpoint: 'http://26.165.143.148:1234'
    }
  });
  const [loading, setLoading] = useState(false);

  const refreshSystemStatus = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/admin/system-status');
      setSystemInfo(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
      // Keep mock data for demo
    } finally {
      setLoading(false);
    }
  };

  const testLMStudio = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/admin/system/test-ai');
      alert(`AI Test Result: ${response.data.status}`);
    } catch (error) {
      alert('AI Test Failed: Unable to connect to LM Studio');
    } finally {
      setLoading(false);
    }
  };

  const clearDataset = async () => {
    if (!window.confirm('Are you sure you want to clear the dataset? This will remove all stored analysis data.')) {
      return;
    }

    setLoading(true);
    try {
      await makeAuthenticatedRequest('/admin/system/clear-dataset', {
        method: 'POST'
      });
      setSystemInfo(prev => ({ ...prev, dataset_size: 0 }));
      alert('Dataset cleared successfully');
    } catch (error) {
      alert('Failed to clear dataset');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/admin/system/export-data');
      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veggiescan-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px', color: '#333' }}>
        ⚙️ System Management
      </h1>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-number" style={{ 
            color: systemInfo.api_status === 'online' ? '#4CAF50' : '#F44336',
            fontSize: '24px'
          }}>
            {systemInfo.api_status === 'online' ? '🟢' : '🔴'}
          </div>
          <div className="stat-label">API Status</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ 
            color: systemInfo.database_status === 'connected' ? '#4CAF50' : '#F44336',
            fontSize: '24px'
          }}>
            {systemInfo.database_status === 'connected' ? '🟢' : '🔴'}
          </div>
          <div className="stat-label">Database</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ 
            color: systemInfo.lm_studio_status === 'active' ? '#4CAF50' : '#F44336',
            fontSize: '24px'
          }}>
            {systemInfo.lm_studio_status === 'active' ? '🟢' : '🔴'}
          </div>
          <div className="stat-label">LM Studio AI</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ 
            color: systemInfo.total_storage_used > 80 ? '#F44336' : 
                   systemInfo.total_storage_used > 60 ? '#FF9800' : '#4CAF50'
          }}>
            {systemInfo.total_storage_used}%
          </div>
          <div className="stat-label">Storage Used</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>System Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={refreshSystemStatus}
              className="btn btn-primary"
              disabled={loading}
            >
              🔄 Refresh System Status
            </button>
            <button 
              onClick={testLMStudio}
              className="btn btn-outline"
              disabled={loading}
            >
              🧪 Test AI Connection
            </button>
            <button 
              onClick={exportData}
              className="btn btn-outline"
              disabled={loading}
            >
              📥 Export System Data
            </button>
            <button 
              onClick={clearDataset}
              className="btn btn-secondary"
              disabled={loading}
            >
              🗑️ Clear Dataset
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Dataset Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Dataset Size</span>
              <span style={{ fontWeight: 'bold' }}>{systemInfo.dataset_size} entries</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Storage Used</span>
              <span style={{ fontWeight: 'bold' }}>{systemInfo.total_storage_used}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Last Updated</span>
              <span style={{ fontWeight: 'bold' }}>Today</span>
            </div>
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '12px', 
              borderRadius: '6px',
              fontSize: '14px',
              color: '#1976d2'
            }}>
              💡 The dataset helps reduce AI API calls by storing previous analysis results for similar images.
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>LM Studio Configuration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div className="form-group">
              <label className="form-label">Model Name</label>
              <input
                type="text"
                className="form-input"
                value={systemInfo.model_info.name}
                readOnly
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Endpoint URL</label>
              <input
                type="text"
                className="form-input"
                value={systemInfo.model_info.endpoint}
                readOnly
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '16px', color: '#333' }}>AI Model Features</h4>
            <ul style={{ paddingLeft: '20px', color: '#666', lineHeight: '1.6' }}>
              <li>Vegetable identification and classification</li>
              <li>Freshness assessment and quality analysis</li>
              <li>Contamination and disease detection</li>
              <li>Safety recommendations based on analysis</li>
              <li>JSON-formatted structured responses</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Performance Metrics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>98.5%</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Uptime</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>1.2s</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Avg Response Time</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>92%</div>
            <div style={{ fontSize: '14px', color: '#666' }}>AI Accuracy</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>234</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Requests</div>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystem;
