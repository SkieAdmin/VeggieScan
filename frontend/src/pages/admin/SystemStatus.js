import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Paper,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Storage,
  Speed,
  Memory,
  CloudQueue,
  Image,
  Person,
  Settings,
  Sync
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useTheme();

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/system/status');
      setSystemStatus(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching system status:', error);
      setError('Failed to load system status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchSystemStatus();
    } finally {
      setRefreshing(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  // Prepare chart data for API response times
  const responseTimeData = {
    labels: systemStatus?.apiResponseTimes.map(item => moment(item.timestamp).format('HH:mm')) || [],
    datasets: [
      {
        label: 'API Response Time (ms)',
        data: systemStatus?.apiResponseTimes.map(item => item.responseTime) || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'LM Studio API Response Times (Last 24 Hours)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Response Time (ms)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
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
        <Typography variant="h4" component="h1">
          System Status
        </Typography>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* LM Studio API Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudQueue sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  LM Studio API Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: systemStatus?.llm.online ? theme.palette.success.main : theme.palette.error.main }}>
                      {systemStatus?.llm.online ? <CheckCircle /> : <Error />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Connection Status"
                    secondary={systemStatus?.llm.online ? 'Online' : 'Offline'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Memory />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Active Model"
                    secondary={systemStatus?.llm.model || 'Unknown'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <Speed />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Average Response Time"
                    secondary={`${systemStatus?.llm.avgResponseTime || 'N/A'} ms`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      <Sync />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Last Checked"
                    secondary={systemStatus?.llm.lastChecked ? moment(systemStatus.llm.lastChecked).format('MMMM D, YYYY [at] h:mm:ss A') : 'Never'}
                  />
                </ListItem>
              </List>
              
              {systemStatus?.llm.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Error Message:</Typography>
                  <Typography variant="body2">{systemStatus.llm.error}</Typography>
                </Alert>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => window.open('http://26.165.143.148:1234', '_blank')}
                >
                  Open LM Studio Interface
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* System Resources */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  System Resources
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  CPU Usage
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={systemStatus?.resources.cpu || 0}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {systemStatus?.resources.cpu || 0}%
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Memory Usage
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={systemStatus?.resources.memory.usedPercent || 0}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {systemStatus?.resources.memory.usedPercent || 0}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {formatBytes(systemStatus?.resources.memory.used || 0)} / {formatBytes(systemStatus?.resources.memory.total || 0)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Disk Usage
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={systemStatus?.resources.disk.usedPercent || 0}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {systemStatus?.resources.disk.usedPercent || 0}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {formatBytes(systemStatus?.resources.disk.used || 0)} / {formatBytes(systemStatus?.resources.disk.total || 0)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  System Uptime
                </Typography>
                <Typography variant="body2">
                  {systemStatus?.resources.uptime || 'Unknown'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Database Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Database Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: systemStatus?.database.connected ? theme.palette.success.main : theme.palette.error.main }}>
                      {systemStatus?.database.connected ? <CheckCircle /> : <Error />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Connection Status"
                    secondary={systemStatus?.database.connected ? 'Connected' : 'Disconnected'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Storage />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Database Size"
                    secondary={formatBytes(systemStatus?.database.size || 0)}
                  />
                </ListItem>
              </List>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Table Records
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Person sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="h6">
                      {systemStatus?.database.tables.users || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Users
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Image sx={{ color: theme.palette.secondary.main }} />
                    <Typography variant="h6">
                      {systemStatus?.database.tables.scans || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Scans
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Settings sx={{ color: theme.palette.info.main }} />
                    <Typography variant="h6">
                      {systemStatus?.database.tables.settings || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Settings
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Storage sx={{ color: theme.palette.warning.main }} />
                    <Typography variant="h6">
                      {systemStatus?.database.tables.dataset || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Dataset
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Storage Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Image sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">
                  Storage Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Image />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Total Uploads"
                    secondary={`${systemStatus?.storage.totalFiles || 0} files`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <Storage />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Storage Used"
                    secondary={formatBytes(systemStatus?.storage.totalSize || 0)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      <Image />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Average File Size"
                    secondary={formatBytes(systemStatus?.storage.avgFileSize || 0)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* API Response Times Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ height: 400, position: 'relative' }}>
                {systemStatus?.apiResponseTimes && systemStatus.apiResponseTimes.length > 0 ? (
                  <Line data={responseTimeData} options={chartOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary">
                      No API response time data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* System Logs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Memory sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">
                    Recent System Logs
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                >
                  View All Logs
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {systemStatus?.logs && systemStatus.logs.length > 0 ? (
                <List>
                  {systemStatus.logs.map((log, index) => (
                    <ListItem key={index} divider={index < systemStatus.logs.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 
                          log.level === 'error' ? theme.palette.error.main :
                          log.level === 'warn' ? theme.palette.warning.main :
                          log.level === 'info' ? theme.palette.info.main :
                          theme.palette.success.main
                        }}>
                          {log.level === 'error' ? <Error /> :
                           log.level === 'warn' ? <Warning /> :
                           <CheckCircle />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              {log.message}
                            </Typography>
                            <Chip
                              label={log.level.toUpperCase()}
                              size="small"
                              color={
                                log.level === 'error' ? 'error' :
                                log.level === 'warn' ? 'warning' :
                                log.level === 'info' ? 'info' :
                                'success'
                              }
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={`${moment(log.timestamp).format('MMMM D, YYYY [at] h:mm:ss A')} • ${log.source}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No recent logs available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemStatus;
