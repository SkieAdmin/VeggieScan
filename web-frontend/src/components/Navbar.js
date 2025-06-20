import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          🥬 VeggieScan
        </div>
        <ul className="navbar-nav">
          {user?.is_admin ? (
            <>
              <li><a href="/admin/dashboard">Dashboard</a></li>
              <li><a href="/admin/users">Users</a></li>
              <li><a href="/admin/system">System</a></li>
            </>
          ) : (
            <>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/scan">Scan</a></li>
              <li><a href="/history">History</a></li>
            </>
          )}
          <li>
            <button 
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ 
                padding: '6px 12px', 
                fontSize: '14px',
                border: '2px solid white',
                color: 'white'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
