import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useAuth } from './contexts/AuthContext';
// Import our custom theme
import theme from './theme';

// Layouts
import ResponsiveLayout from './components/layout/ResponsiveLayout';
import AuthLayout from './layouts/AuthLayout';

// Common Components
import VeggieLoader from './components/common/VeggieLoader';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';

// User Pages
import Dashboard from './pages/user/Dashboard';
import ScanUpload from './pages/user/ScanUpload';
import ScanHistory from './pages/user/ScanHistory';
import ScanDetail from './pages/user/ScanDetail';
import UserSettings from './pages/user/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserEdit from './pages/admin/UserEdit';
import ScanManagement from './pages/admin/ScanManagement';
import AdminScanDetail from './pages/admin/ScanDetail';
import SystemStatus from './pages/admin/SystemStatus';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const { currentUser, loading } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
          <VeggieLoader message="Loading VeggieScan..." size="large" />
        </Box>
      );
    }
    
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    
    if (adminOnly && currentUser.role !== 'ADMIN') {
      return <Navigate to="/dashboard" />;
    }
    
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/dashboard" />} />
        </Route>

        {/* User Routes */}
        <Route element={<ResponsiveLayout user={currentUser}><Outlet /></ResponsiveLayout>}>
          <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/scan" element={
            <ProtectedRoute>
              <ScanUpload />
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <ScanHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/history/:id" element={
            <ProtectedRoute>
              <ScanDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly={true}>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users/:id" element={
            <ProtectedRoute adminOnly={true}>
              <UserEdit />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/scans" element={
            <ProtectedRoute adminOnly={true}>
              <ScanManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/scans/:id" element={
            <ProtectedRoute adminOnly={true}>
              <AdminScanDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/system" element={
            <ProtectedRoute adminOnly={true}>
              <SystemStatus />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly={true}>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
