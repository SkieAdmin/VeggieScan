import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useMediaQuery,
  IconButton,
  Collapse,
  CircularProgress
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
  Sync,
  Computer,
  DeviceHub,
  Devices,
  PhoneAndroid,
  ExpandMore,
  ExpandLess,
  Info
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { getWebSocketStatus } from '../../services/websocketService';
import VeggieLoader from '../../components/common/VeggieLoader';
import WebSocketWorkerManager from '../../components/admin/WebSocketWorkerManager';
import { useTheme } from '@mui/material/styles';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const SystemStatus = () => {
  // Initialize state with safe default values to prevent undefined errors
  const [systemStatus, setSystemStatus] = useState({
    resources: {
      cpu: { usage: 0, cores: 0 },
      memory: { used: 0, total: 0, usedPercent: 0 },
      disk: { used: 0, total: 0, usedPercent: 0 },
      uptime: '0 days, 0 hours'
    },
    database: { connected: false, version: '', size: 0 },
    apiResponseTimes: [],
    logs: [],
    scanStats: { total: 0, successful: 0, failed: 0 },
    userStats: { total: 0, active: 0, admin: 0 },
    llm: { online: false, model: 'Unknown', avgResponseTime: 0, lastChecked: null, error: null },
    storage: { totalFiles: 0, totalSize: 0, avgFileSize: 0 }
  });
  
  const [wsStatus, setWsStatus] = useState({ workers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    workers: true,
    apiResponse: true,
    systemLogs: true
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    fetchSystemStatus();
    fetchWebSocketStatus();
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
  
  const fetchWebSocketStatus = async () => {
    try {
      const data = await getWebSocketStatus();
      setWsStatus(data);
    } catch (error) {
      console.error('Error fetching WebSocket status:', error);
      // Don't set the main error state, just log it
    }
  };
  
  const handleStartWorker = async (workerId) => {
    try {
      setRefreshing(true);
      await axios.post(`/admin/websocket/workers/${workerId}/start`);
      await fetchWebSocketStatus();
    } catch (error) {
      console.error('Error starting WebSocket worker:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleStopWorker = async (workerId) => {
    try {
      setRefreshing(true);
      await axios.post(`/admin/websocket/workers/${workerId}/stop`);
      await fetchWebSocketStatus();
    } catch (error) {
      console.error('Error stopping WebSocket worker:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleRestartWorker = async (workerId) => {
    try {
      setRefreshing(true);
      await axios.post(`/admin/websocket/workers/${workerId}/restart`);
      await fetchWebSocketStatus();
    } catch (error) {
      console.error('Error restarting WebSocket worker:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchSystemStatus(),
        fetchWebSocketStatus()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getLogSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      case 'debug':
        return theme.palette.grey[500];
      default:
        return theme.palette.success.main;
    }
  };
  
  const getLogSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'error':
        return <Error fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'info':
        return <Info fontSize="small" />;
      case 'debug':
        return <Computer fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  // Prepare chart data for API response times
  const responseTimeData = {
    labels: Array.isArray(systemStatus?.apiResponseTimes) 
      ? systemStatus.apiResponseTimes.map(item => moment(item.timestamp).format('HH:mm')) 
      : [],
    datasets: [
      {
        label: 'API Response Time (ms)',
        data: Array.isArray(systemStatus?.apiResponseTimes) 
          ? systemStatus.apiResponseTimes.map(item => item.responseTime) 
          : [],
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
        <VeggieLoader message="Loading system status..." />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 4,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h4" component="h1">
          System Status
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={refreshing ? <VeggieLoader size="small" /> : <Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ px: 3 }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={isMobile ? 2 : 3}>
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
                    <Avatar sx={{ bgcolor: systemStatus?.llm?.online ? theme.palette.success.main : theme.palette.error.main }}>
                      {systemStatus?.llm?.online ? <CheckCircle /> : <Error />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Connection Status"
                    secondary={systemStatus?.llm?.online ? 'Online' : 'Offline'}
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
                    secondary={systemStatus?.llm?.model || 'Unknown'}
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
                    secondary={`${systemStatus?.llm?.avgResponseTime || 'N/A'} ms`}
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
                    secondary={systemStatus?.llm?.lastChecked ? moment(systemStatus?.llm?.lastChecked).format('MMMM D, YYYY [at] h:mm:ss A') : 'Never'}
                  />
                </ListItem>
              </List>
              
              {systemStatus?.llm?.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Error Message:</Typography>
                  <Typography variant="body2">{systemStatus?.llm?.error}</Typography>
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
                      value={systemStatus?.resources?.memory?.usedPercent || 0}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {systemStatus?.resources?.memory?.usedPercent || 0}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {formatBytes(systemStatus?.resources?.memory?.used || 0)} / {formatBytes(systemStatus?.resources?.memory?.total || 0)}
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
                      value={systemStatus?.resources?.disk?.usedPercent || 0}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {systemStatus?.resources?.disk?.usedPercent || 0}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {formatBytes(systemStatus?.resources?.disk?.used || 0)} / {formatBytes(systemStatus?.resources?.disk?.total || 0)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  System Uptime
                </Typography>
                <Typography variant="body2">
                  {systemStatus?.resources?.uptime || 'Unknown'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* WebSocket Workers */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DeviceHub sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">WebSocket Workers</Typography>
                </Box>
                <IconButton onClick={() => toggleSection('workers')}>
                  {expandedSections.workers ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.workers} timeout="auto">
                <Box sx={{ mt: 2 }}>
                  <WebSocketWorkerManager 
                    workers={wsStatus?.workers || []} 
                    isLoading={loading || refreshing} 
                    onRefresh={fetchWebSocketStatus}
                    onStartWorker={handleStartWorker}
                    onStopWorker={handleStopWorker}
                    onRestartWorker={handleRestartWorker}
                  />
                </Box>
              </Collapse>
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
                    <Avatar sx={{ bgcolor: systemStatus?.database?.connected ? theme.palette.success.main : theme.palette.error.main }}>
                      {systemStatus?.database?.connected ? <CheckCircle /> : <Error />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Connection Status"
                    secondary={systemStatus?.database?.connected ? 'Connected' : 'Disconnected'}
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
                    secondary={formatBytes(systemStatus?.database?.size || 0)}
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
        
        {/* WebSocket Workers */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DeviceHub sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">WebSocket Workers</Typography>
                </Box>
                <IconButton onClick={() => toggleSection('workers')}>
                  {expandedSections.workers ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.workers} timeout="auto">
                <Box sx={{ mt: 2 }}>
                  <WebSocketWorkerManager 
                    workers={wsStatus?.workers || []} 
                    isLoading={loading || refreshing} 
                    onRefresh={fetchWebSocketStatus}
                    onStartWorker={handleStartWorker}
                    onStopWorker={handleStopWorker}
                    onRestartWorker={handleRestartWorker}
                  />
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        
        {/* API Response Times Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Speed sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">
                    API Response Times
                  </Typography>
                </Box>
                <IconButton onClick={() => toggleSection('apiResponse')} size="small">
                  {expandedSections.apiResponse ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Collapse in={expandedSections.apiResponse}>
                <Box sx={{ height: isMobile ? 300 : 400, position: 'relative' }}>
                {Array.isArray(systemStatus?.apiResponseTimes) && systemStatus.apiResponseTimes.length > 0 ? (
                  <Line data={responseTimeData} options={chartOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary">
                      No API response time data available
                    </Typography>
                  </Box>
                )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        
        {/* System Logs */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Memory sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6">
                    Recent System Logs
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }}
                  >
                    View All Logs
                  </Button>
                  <IconButton onClick={() => toggleSection('systemLogs')} size="small">
                    {expandedSections.systemLogs ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Collapse in={expandedSections.systemLogs}>
                {Array.isArray(systemStatus?.logs) && systemStatus.logs.length > 0 ? (
                  <List dense={isMobile}>
                    {systemStatus.logs.map((log, index) => (
                      <ListItem key={index} divider={index < systemStatus.logs.length - 1}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getLogSeverityColor(log?.severity || 'info') }}>
                            {getLogSeverityIcon(log?.severity || 'info')}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={log?.message || 'No message'}
                          secondary={`${log?.source || 'Unknown'} • ${moment(log?.timestamp || new Date()).format('YYYY-MM-DD HH:mm:ss')}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No system logs available
                    </Typography>
                  </Box>
                )}
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemStatus;
