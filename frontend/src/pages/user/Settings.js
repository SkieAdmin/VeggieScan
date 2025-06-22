import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Save,
  Visibility,
  VisibilityOff,
  Warning
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { currentUser, updateProfile, changePassword } = useAuth();
  
  // Profile settings
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    scanResults: false,
    systemUpdates: false
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  
  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
    
    fetchNotificationSettings();
  }, [currentUser]);

  const fetchNotificationSettings = async () => {
    try {
      const response = await axios.get('/users/settings');
      setNotificationSettings({
        emailNotifications: response.data.emailNotifications || false,
        scanResults: response.data.scanResults || false,
        systemUpdates: response.data.systemUpdates || false
      });
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setNotificationError('Failed to load notification settings');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setProfileError('Name cannot be empty');
      return;
    }
    
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess(false);
      
      await updateProfile(name);
      
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess(false);
      
      await changePassword(currentPassword, newPassword);
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = (event) => {
    setNotificationSettings({
      ...notificationSettings,
      [event.target.name]: event.target.checked
    });
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setNotificationLoading(true);
      setNotificationError('');
      setNotificationSuccess(false);
      
      await axios.put('/users/settings', notificationSettings);
      
      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setNotificationError(error.response?.data?.error || 'Failed to update notification settings');
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Password is required to delete your account');
      return;
    }
    
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      await axios.delete('/users', {
        data: { password: deletePassword }
      });
      
      // Logout and redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {profileError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {profileError}
                </Alert>
              )}
              
              {profileSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Profile updated successfully!
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleProfileSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={profileLoading}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  value={email}
                  disabled={true}
                  helperText="Email cannot be changed"
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={profileLoading ? <CircularProgress size={20} /> : <Save />}
                  disabled={profileLoading}
                  sx={{ mt: 2 }}
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Password Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              
              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Password changed successfully!
                </Alert>
              )}
              
              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={passwordLoading ? <CircularProgress size={20} /> : <Save />}
                  disabled={passwordLoading}
                  sx={{ mt: 2 }}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {notificationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {notificationError}
                </Alert>
              )}
              
              {notificationSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Notification settings updated successfully!
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleNotificationSubmit}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      name="emailNotifications"
                      color="primary"
                      disabled={notificationLoading}
                    />
                  }
                  label="Email Notifications"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.scanResults}
                      onChange={handleNotificationChange}
                      name="scanResults"
                      color="primary"
                      disabled={notificationLoading || !notificationSettings.emailNotifications}
                    />
                  }
                  label="Scan Results"
                  sx={{ display: 'block', mb: 2, ml: 3 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.systemUpdates}
                      onChange={handleNotificationChange}
                      name="systemUpdates"
                      color="primary"
                      disabled={notificationLoading || !notificationSettings.emailNotifications}
                    />
                  }
                  label="System Updates"
                  sx={{ display: 'block', mb: 2, ml: 3 }}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={notificationLoading ? <CircularProgress size={20} /> : <Save />}
                  disabled={notificationLoading}
                  sx={{ mt: 2 }}
                >
                  {notificationLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Delete Account */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delete Account
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete My Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning color="error" sx={{ mr: 1 }} />
            Delete Account
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
          </DialogContentText>
          
          <DialogContentText paragraph>
            Please enter your password to confirm:
          </DialogContentText>
          
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            margin="dense"
            label="Password"
            type={showDeletePassword ? 'text' : 'password'}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            disabled={deleteLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    edge="end"
                  >
                    {showDeletePassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeletePassword('');
              setDeleteError('');
            }}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
