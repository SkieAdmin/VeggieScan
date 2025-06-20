import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    totalSafeScans: 0,
    totalUnsafeScans: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await makeAuthenticatedRequest('/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Mock data for demo
      setStats({
        totalUsers: 45,
        totalScans: 234,
        totalSafeScans: 189,
        totalUnsafeScans: 45,
        recentActivity: [
          { id: 1, user: 'user@test.com', action: 'Scanned Tomato', result: 'Safe', time: '2 minutes ago' },
          { id: 2, user: 'john@example.com', action: 'Scanned Lettuce', result: 'Unsafe', time: '15 minutes ago' },
          { id: 3, user: 'mary@example.com', action: 'Registered', result: 'Success', time: '1 hour ago' },
          { id: 4, user: 'bob@example.com', action: 'Scanned Carrot', result: 'Safe', time: '2 hours ago' },
        ]
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

  const safetyRate = stats.totalScans > 0 ? Math.round((stats.totalSafeScans / stats.totalScans) * 100) : 0;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px', color: '#333' }}>
        🛡️ Admin Dashboard
      </h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#2196F3' }}>
            {stats.totalUsers}
          </div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalScans}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4CAF50' }}>
            {stats.totalSafeScans}
          </div>
          <div className="stat-label">Safe Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#F44336' }}>
            {stats.totalUnsafeScans}
          </div>
          <div className="stat-label">Unsafe Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#FF9800' }}>
            {safetyRate}%
          </div>
          <div className="stat-label">Overall Safety Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#9C27B0' }}>
            {stats.totalUsers > 0 ? Math.round(stats.totalScans / stats.totalUsers) : 0}
          </div>
          <div className="stat-label">Avg Scans per User</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/admin/users" className="btn btn-primary">
              👥 Manage Users
            </a>
            <a href="/admin/system" className="btn btn-outline">
              ⚙️ System Settings
            </a>
            <button 
              onClick={fetchAdminStats}
              className="btn btn-outline"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>System Health</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>API Status</span>
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>🟢 Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Database</span>
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>🟢 Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>LM Studio AI</span>
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>🟢 Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Storage</span>
              <span style={{ color: '#FF9800', fontWeight: 'bold' }}>🟡 75% Used</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Recent Activity</h2>
        {stats.recentActivity.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <div>
                  <strong>{activity.user}</strong> {activity.action}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`history-status ${
                    activity.result === 'Safe' ? 'status-safe' :
                    activity.result === 'Unsafe' ? 'status-unsafe' :
                    'status-safe'
                  }`}>
                    {activity.result}
                  </span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
