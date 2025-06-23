import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Collapse
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Info,
  ExpandMore,
  ExpandLess,
  Settings,
  Memory,
  Storage,
  RestartAlt,
  MoreVert
} from '@mui/icons-material';
import VeggieLoader from '../common/VeggieLoader';

const WebSocketWorkerManager = ({ workers = [], isLoading = false, onRefresh, onStartWorker, onStopWorker, onRestartWorker }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expanded, setExpanded] = useState({});
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [workerConfig, setWorkerConfig] = useState({});
  
  // Initialize expanded state for all workers
  useEffect(() => {
    const initialExpanded = {};
    workers.forEach(worker => {
      initialExpanded[worker.id] = false;
    });
    setExpanded(initialExpanded);
  }, [workers]);
  
  const handleToggleExpand = (workerId) => {
    setExpanded(prev => ({
      ...prev,
      [workerId]: !prev[workerId]
    }));
  };
  
  const handleOpenConfigDialog = (worker) => {
    setSelectedWorker(worker);
    setWorkerConfig({
      maxConnections: worker.maxConnections || 100,
      timeout: worker.timeout || 30000,
      retryAttempts: worker.retryAttempts || 3
    });
    setConfigDialogOpen(true);
  };
  
  const handleCloseConfigDialog = () => {
    setConfigDialogOpen(false);
    setSelectedWorker(null);
  };
  
  const handleSaveConfig = () => {
    // Here you would implement the API call to save the configuration
    console.log('Saving config for worker:', selectedWorker.id, workerConfig);
    handleCloseConfigDialog();
  };
  
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setWorkerConfig(prev => ({
      ...prev,
      [name]: name === 'maxConnections' || name === 'timeout' || name === 'retryAttempts' 
        ? parseInt(value, 10) 
        : value
    }));
  };
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'running':
        return theme.palette.success.main;
      case 'stopped':
        return theme.palette.error.main;
      case 'starting':
      case 'restarting':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'running':
        return <PlayArrow fontSize="small" />;
      case 'stopped':
        return <Stop fontSize="small" />;
      case 'starting':
      case 'restarting':
        return <RestartAlt fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };
  
  const getMemoryUsageColor = (percentage) => {
    if (percentage < 50) return theme.palette.success.main;
    if (percentage < 80) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };
  
  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <VeggieLoader size="medium" message="Loading WebSocket workers..." />
      </Box>
    );
  }
  
  if (!workers.length) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Memory sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" gutterBottom>No WebSocket Workers Found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          There are currently no WebSocket workers configured in the system.
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<PlayArrow />}
          onClick={() => {}}
        >
          Create New Worker
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          WebSocket Workers ({workers.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          size="small"
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        {workers.map((worker) => (
          <Grid item xs={12} key={worker.id}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: `${getStatusColor(worker.status)}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <Storage sx={{ color: getStatusColor(worker.status) }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {worker.name || `Worker ${worker.id}`}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          size="small"
                          label={worker.status}
                          icon={getStatusIcon(worker.status)}
                          sx={{
                            bgcolor: `${getStatusColor(worker.status)}15`,
                            color: getStatusColor(worker.status),
                            fontWeight: 'medium',
                            mr: 1
                          }}
                        />
                        {!isMobile && (
                          <Typography variant="body2" color="text.secondary">
                            Port: {worker.port || 'N/A'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {!isMobile && worker.status.toLowerCase() === 'running' && (
                      <Tooltip title="Active connections">
                        <Chip
                          size="small"
                          label={`${worker.activeConnections || 0} connections`}
                          sx={{ mr: 1 }}
                        />
                      </Tooltip>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => handleToggleExpand(worker.id)}
                      sx={{ mr: 1 }}
                    >
                      {expanded[worker.id] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    
                    {worker.status.toLowerCase() === 'running' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Stop />}
                        onClick={() => onStopWorker && onStopWorker(worker.id)}
                        sx={{ minWidth: 0, px: isMobile ? 1 : 2 }}
                      >
                        {isMobile ? '' : 'Stop'}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<PlayArrow />}
                        onClick={() => onStartWorker && onStartWorker(worker.id)}
                        sx={{ minWidth: 0, px: isMobile ? 1 : 2 }}
                      >
                        {isMobile ? '' : 'Start'}
                      </Button>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => handleOpenConfigDialog(worker)}
                      sx={{ ml: 1 }}
                    >
                      <Settings fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Collapse in={expanded[worker.id]}>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Uptime
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatUptime(worker.uptime)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Memory Usage
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexGrow: 1, mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={worker.memoryUsage || 0}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'background.paper',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getMemoryUsageColor(worker.memoryUsage || 0)
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {worker.memoryUsage || 0}%
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          CPU Usage
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexGrow: 1, mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={worker.cpuUsage || 0}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'background.paper',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: worker.cpuUsage > 80 
                                    ? theme.palette.error.main 
                                    : worker.cpuUsage > 50 
                                      ? theme.palette.warning.main 
                                      : theme.palette.success.main
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {worker.cpuUsage || 0}%
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Last Restart
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {worker.lastRestart 
                            ? new Date(worker.lastRestart).toLocaleString() 
                            : 'Never'}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {worker.error && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mt: 2,
                          borderRadius: 2
                        }}
                      >
                        {worker.error}
                      </Alert>
                    )}
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        startIcon={<RestartAlt />}
                        onClick={() => onRestartWorker && onRestartWorker(worker.id)}
                        sx={{ mr: 1 }}
                      >
                        Restart
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Settings />}
                        onClick={() => handleOpenConfigDialog(worker)}
                      >
                        Configure
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Worker Configuration Dialog */}
      <Dialog 
        open={configDialogOpen} 
        onClose={handleCloseConfigDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Configure WebSocket Worker
          {selectedWorker && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedWorker.name || `Worker ${selectedWorker.id}`}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Connections"
                name="maxConnections"
                type="number"
                value={workerConfig.maxConnections}
                onChange={handleConfigChange}
                InputProps={{ inputProps: { min: 1 } }}
                helperText="Maximum number of concurrent connections"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Timeout (ms)"
                name="timeout"
                type="number"
                value={workerConfig.timeout}
                onChange={handleConfigChange}
                InputProps={{ inputProps: { min: 1000 } }}
                helperText="Connection timeout in milliseconds"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Retry Attempts"
                name="retryAttempts"
                type="number"
                value={workerConfig.retryAttempts}
                onChange={handleConfigChange}
                InputProps={{ inputProps: { min: 0 } }}
                helperText="Number of retry attempts before failing"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfigDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveConfig}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebSocketWorkerManager;
