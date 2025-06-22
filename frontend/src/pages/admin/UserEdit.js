import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Person,
  Email,
  VpnKey,
  AdminPanelSettings,
  Image,
  CalendarToday
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';

const UserEdit = () => {
  const { id } = useParams();
  const isNewUser = id === 'new';
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONSUMER',
    isActive: true
  });
  
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(!isNewUser);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isNewUser) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/admin/users/${id}`);
      
      // Set user details
      setUser({
        name: response.data.name,
        email: response.data.email,
        password: '',
        role: response.data.role,
        isActive: response.data.isActive
      });
      
      // Set user stats
      setUserStats({
        createdAt: response.data.createdAt,
        lastLogin: response.data.lastLogin,
        totalScans: response.data.scanCount,
        safeScans: response.data.safeScans,
        unsafeScans: response.data.unsafeScans
      });
      
      setError('');
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details. The user may not exist or you do not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: checked
    }));
  };

  const validateForm = () => {
    if (!user.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!user.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (isNewUser && !user.password.trim()) {
      setError('Password is required for new users');
      return false;
    }
    
    if (user.password && user.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      if (isNewUser) {
        // Create new user
        await axios.post('/admin/users', user);
        setSuccess('User created successfully');
        
        // Navigate to user list after a short delay
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      } else {
        // Update existing user
        const dataToUpdate = {
          name: user.name,
          role: user.role,
          isActive: user.isActive
        };
        
        // Only include password if it's provided
        if (user.password) {
          dataToUpdate.password = user.password;
        }
        
        await axios.put(`/admin/users/${id}`, dataToUpdate);
        setSuccess('User updated successfully');
        
        // Refresh user details
        fetchUserDetails();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.error || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/users')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {isNewUser ? 'Add New User' : 'Edit User'}
          </Typography>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* User Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={user.name}
                      onChange={handleChange}
                      required
                      disabled={saving}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={user.email}
                      onChange={handleChange}
                      required
                      disabled={saving || !isNewUser}
                      helperText={!isNewUser && "Email cannot be changed"}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={isNewUser ? "Password" : "New Password (leave blank to keep current)"}
                      name="password"
                      type="password"
                      value={user.password}
                      onChange={handleChange}
                      required={isNewUser}
                      disabled={saving}
                      helperText={!isNewUser && "Leave blank to keep current password"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={saving}>
                      <InputLabel id="role-label">Role</InputLabel>
                      <Select
                        labelId="role-label"
                        name="role"
                        value={user.role}
                        onChange={handleChange}
                        label="Role"
                      >
                        <MenuItem value="CONSUMER">Consumer</MenuItem>
                        <MenuItem value="ADMIN">Administrator</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.isActive}
                          onChange={handleSwitchChange}
                          name="isActive"
                          color="primary"
                          disabled={saving}
                        />
                      }
                      label="Active Account"
                      sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save User'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* User Stats */}
        {!isNewUser && userStats && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Statistics
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Joined"
                      secondary={moment(userStats.createdAt).format('MMMM D, YYYY')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Login"
                      secondary={userStats.lastLogin ? moment(userStats.lastLogin).format('MMMM D, YYYY [at] h:mm A') : 'Never'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Image />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Scans"
                      secondary={userStats.totalScans || 0}
                    />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, bgcolor: 'success.light', textAlign: 'center' }}>
                      <Typography variant="h5" component="div">
                        {userStats.safeScans || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Safe Scans
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, bgcolor: 'error.light', textAlign: 'center' }}>
                      <Typography variant="h5" component="div">
                        {userStats.unsafeScans || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Unsafe Scans
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/admin/scans?userId=${id}`)}
                  >
                    View User's Scans
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UserEdit;
