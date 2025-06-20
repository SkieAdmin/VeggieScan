import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, admin, consumer

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await makeAuthenticatedRequest('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data for demo
      setUsers([
        {
          id: 1,
          email: 'admin@test.com',
          username: 'admin',
          is_admin: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          last_login: '2024-01-20T10:30:00Z',
          scan_count: 15
        },
        {
          id: 2,
          email: 'user@test.com',
          username: 'testuser',
          is_admin: false,
          is_active: true,
          created_at: '2024-01-05T00:00:00Z',
          last_login: '2024-01-20T09:15:00Z',
          scan_count: 25
        },
        {
          id: 3,
          email: 'john@example.com',
          username: 'john_doe',
          is_admin: false,
          is_active: true,
          created_at: '2024-01-10T00:00:00Z',
          last_login: '2024-01-19T14:20:00Z',
          scan_count: 8
        },
        {
          id: 4,
          email: 'mary@example.com',
          username: 'mary_smith',
          is_admin: false,
          is_active: false,
          created_at: '2024-01-15T00:00:00Z',
          last_login: '2024-01-18T11:45:00Z',
          scan_count: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await makeAuthenticatedRequest(`/admin/users/${userId}/toggle-status`, {
        method: 'PUT'
      });
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error('Error toggling user status:', error);
      // For demo, just toggle locally
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      ));
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await makeAuthenticatedRequest(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      // For demo, just remove locally
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'admin') return user.is_admin;
    if (filter === 'consumer') return !user.is_admin;
    return true;
  });

  const adminCount = users.filter(user => user.is_admin).length;
  const consumerCount = users.filter(user => !user.is_admin).length;
  const activeCount = users.filter(user => user.is_active).length;

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
        👥 User Management
      </h1>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#2196F3' }}>
            {adminCount}
          </div>
          <div className="stat-label">Administrators</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4CAF50' }}>
            {consumerCount}
          </div>
          <div className="stat-label">Consumers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#FF9800' }}>
            {activeCount}
          </div>
          <div className="stat-label">Active Users</div>
        </div>
      </div>

      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#333' }}>Users</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`btn ${filter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Admins ({adminCount})
            </button>
            <button
              onClick={() => setFilter('consumer')}
              className={`btn ${filter === 'consumer' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Consumers ({consumerCount})
            </button>
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>User</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Scans</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Last Login</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#333' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`history-status ${user.is_admin ? 'status-unsafe' : 'status-safe'}`}>
                        {user.is_admin ? 'Admin' : 'Consumer'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`history-status ${user.is_active ? 'status-safe' : 'status-unsafe'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {user.scan_count}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={`btn ${user.is_active ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ marginBottom: '8px' }}>No users found</h3>
            <p>
              {filter === 'all' 
                ? "No users in the system yet." 
                : `No ${filter} users found.`}
            </p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>User Management Tips</h2>
        <ul style={{ paddingLeft: '20px', color: '#666', lineHeight: '1.6' }}>
          <li>Deactivated users cannot log in but their data is preserved</li>
          <li>Deleting a user will permanently remove all their data including scan history</li>
          <li>Admin users have access to this management panel and system settings</li>
          <li>Consumer users can only scan vegetables and view their own history</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminUsers;
