import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, safe, unsafe

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      // No mock data, show empty state
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'safe') return item.safe_to_eat;
    if (filter === 'unsafe') return !item.safe_to_eat;
    return true;
  });

  const safeCount = history.filter(item => item.safe_to_eat).length;
  const unsafeCount = history.filter(item => !item.safe_to_eat).length;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px', color: '#333' }}>
        📊 Scan History
      </h1>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-number">{history.length}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4CAF50' }}>
            {safeCount}
          </div>
          <div className="stat-label">Safe Vegetables</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#F44336' }}>
            {unsafeCount}
          </div>
          <div className="stat-label">Unsafe Vegetables</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#FF9800' }}>
            {history.length > 0 ? Math.round((safeCount / history.length) * 100) : 0}%
          </div>
          <div className="stat-label">Safety Rate</div>
        </div>
      </div>

      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#333' }}>Scan Results</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilter('safe')}
              className={`btn ${filter === 'safe' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Safe ({safeCount})
            </button>
            <button
              onClick={() => setFilter('unsafe')}
              className={`btn ${filter === 'unsafe' ? 'btn-secondary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Unsafe ({unsafeCount})
            </button>
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredHistory.map((item) => (
              <div key={item.id} className={`history-item ${item.safe_to_eat ? 'safe' : 'unsafe'}`}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <div className="history-date">
                      {new Date(item.analysis_date).toLocaleDateString()} at {new Date(item.analysis_date).toLocaleTimeString()}
                    </div>
                    <div className="history-vegetable">{item.vegetable_name}</div>
                    {item.disease_name && item.disease_name !== 'None detected' && (
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        Issue: {item.disease_name}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                      Confidence
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {item.confidence}%
                    </div>
                  </div>
                  
                  <div>
                    <span className={`history-status status-${item.safe_to_eat ? 'safe' : 'unsafe'}`}>
                      {item.safe_to_eat ? 'Safe' : 'Unsafe'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ marginBottom: '8px' }}>No scans found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't scanned any vegetables yet." 
                : `No ${filter} vegetables found in your history.`}
            </p>
            <a href="/scan" className="btn btn-primary" style={{ marginTop: '16px' }}>
              📷 Start Scanning
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
