import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#4CAF50' }}>
          🥬 VeggieScan Login
        </h1>
        
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p>Don't have an account?</p>
          <a href="/register" className="btn btn-outline">
            Register Here
          </a>
        </div>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <h4 style={{ marginBottom: '10px', color: '#666' }}>Test Accounts:</h4>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Consumer:</strong> user@test.com / password123
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Admin:</strong> admin@test.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
