import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, makeAuthenticatedRequest } = useAuth();
  const [stats, setStats] = useState({
    totalScans: 0,
    safeVegetables: 0,
    unsafeVegetables: 0,
    recentScans: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await makeAuthenticatedRequest('/dashboard');
      const data = response.data;
      
      // Transform the data to match frontend expectations
      const transformedData = {
        totalScans: data.total_good + data.total_bad || 0,
        safeVegetables: data.total_good || 0,
        unsafeVegetables: data.total_bad || 0,
        recentScans: (data.recentScans || []).map(scan => ({
          id: scan.id,
          vegetable: scan.vegetable_name,
          status: scan.safe_to_eat ? 'safe' : 'unsafe',
          date: new Date(scan.scan_date).toLocaleDateString()
        }))
      };
      
      setStats(transformedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't use mock data, show empty state
      setStats({
        totalScans: 0,
        safeVegetables: 0,
        unsafeVegetables: 0,
        recentScans: []
      });
    } finally {
      setLoading(false);
    }
  };

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
        Welcome back, {user?.email}! 👋
      </h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalScans}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4CAF50' }}>
            {stats.safeVegetables}
          </div>
          <div className="stat-label">Safe Vegetables</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#F44336' }}>
            {stats.unsafeVegetables}
          </div>
          <div className="stat-label">Unsafe Vegetables</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#FF9800' }}>
            {stats.totalScans > 0 ? Math.round((stats.safeVegetables / stats.totalScans) * 100) : 0}%
          </div>
          <div className="stat-label">Safety Rate</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/scan" className="btn btn-primary">
              📷 Scan New Vegetable
            </a>
            <a href="/history" className="btn btn-outline">
              📊 View Scan History
            </a>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Recent Scans</h2>
          {stats.recentScans && stats.recentScans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentScans.map((scan) => (
                <div key={scan.id} className={`history-item ${scan.status}`}>
                  <div className="history-date">{scan.date}</div>
                  <div className="history-vegetable">{scan.vegetable}</div>
                  <span className={`history-status status-${scan.status}`}>
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No scans yet. Start by scanning your first vegetable!
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>About VeggieScan</h2>
        <p style={{ lineHeight: '1.6', color: '#666' }}>
          VeggieScan uses advanced AI technology to analyze vegetable images and determine their freshness and safety. 
          Simply upload a photo of your vegetable, and our AI will provide instant analysis including:
        </p>
        <ul style={{ marginTop: '16px', paddingLeft: '20px', color: '#666' }}>
          <li>Vegetable identification</li>
          <li>Freshness assessment</li>
          <li>Contamination detection</li>
          <li>Safety recommendations</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
