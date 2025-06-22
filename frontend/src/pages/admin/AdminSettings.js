import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save,
  Refresh,
  Info,
  CheckCircle,
  Error,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const AdminSettings = () => {
  const theme = useTheme();
  
  const [settings, setSettings] = useState({
    llmApiUrl: '',
    llmApiKey: '',
    llmModel: '',
    maxUploadSize: 5,
    allowUserRegistration: true,
    emailNotificationsEnabled: true,
    adminEmail: '',
    systemName: 'VeggieScan',
    datasetFallbackEnabled: true,
    scanRetentionDays: 90
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingApi, setTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/settings');
      setSettings(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load system settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await axios.put('/admin/settings', settings);
      setSuccess('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestLlmApi = async () => {
    try {
      setTestingApi(true);
      setApiTestResult(null);
      
      const response = await axios.post('/admin/system/test-llm', {
        apiUrl: settings.llmApiUrl,
        apiKey: settings.llmApiKey,
        model: settings.llmModel
      });
      
      setApiTestResult({
        success: true,
        message: 'Connection successful',
        details: response.data
      });
    } catch (error) {
      console.error('Error testing LLM API:', error);
      setApiTestResult({
        success: false,
        message: 'Connection failed',
        details: error.response?.data?.error || error.message
      });
    } finally {
      setTestingApi(false);
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
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        System Settings
      </Typography>
      
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
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="System Name"
                      name="systemName"
                      value={settings.systemName}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Admin Email"
                      name="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Maximum Upload Size (MB)"
                      name="maxUploadSize"
                      type="number"
                      value={settings.maxUploadSize}
                      onChange={handleNumberChange}
                      disabled={saving}
                      InputProps={{
                        inputProps: { min: 1, max: 20 }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Scan Retention Period (Days)"
                      name="scanRetentionDays"
                      type="number"
                      value={settings.scanRetentionDays}
                      onChange={handleNumberChange}
                      disabled={saving}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                      helperText="Scans older than this will be automatically deleted"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.allowUserRegistration}
                          onChange={handleSwitchChange}
                          name="allowUserRegistration"
                          color="primary"
                          disabled={saving}
                        />
                      }
                      label="Allow User Registration"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotificationsEnabled}
                          onChange={handleSwitchChange}
                          name="emailNotificationsEnabled"
                          color="primary"
                          disabled={saving}
                        />
                      }
                      label="Enable Email Notifications"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* LM Studio API Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  LM Studio API Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="LM Studio API URL"
                      name="llmApiUrl"
                      value={settings.llmApiUrl}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="http://26.165.143.148:1234"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="API Key (if required)"
                      name="llmApiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.llmApiKey}
                      onChange={handleChange}
                      disabled={saving}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowApiKey(!showApiKey)}
                              edge="end"
                            >
                              {showApiKey ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Model Name"
                      name="llmModel"
                      value={settings.llmModel}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="llama3"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.datasetFallbackEnabled}
                          onChange={handleSwitchChange}
                          name="datasetFallbackEnabled"
                          color="primary"
                          disabled={saving}
                        />
                      }
                      label="Enable Dataset Fallback"
                    />
                    <Typography variant="caption" color="textSecondary" display="block">
                      When enabled, the system will use the dataset if the LLM API is unavailable
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={handleTestLlmApi}
                        disabled={saving || testingApi}
                        startIcon={testingApi ? <CircularProgress size={20} /> : <Refresh />}
                        sx={{ mr: 2 }}
                      >
                        {testingApi ? 'Testing...' : 'Test Connection'}
                      </Button>
                      
                      {apiTestResult && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {apiTestResult.success ? (
                            <CheckCircle color="success" sx={{ mr: 1 }} />
                          ) : (
                            <Error color="error" sx={{ mr: 1 }} />
                          )}
                          <Typography variant="body2">
                            {apiTestResult.message}
                          </Typography>
                          <Tooltip title={apiTestResult.details || ''}>
                            <IconButton size="small">
                              <Info fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminSettings;
