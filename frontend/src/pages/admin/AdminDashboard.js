import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button
} from '@mui/material';
import {
  Person,
  Image,
  CheckCircle,
  Cancel,
  Storage,
  Speed,
  ArrowForward
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import moment from 'moment';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/stats');
        setStats(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  // Prepare chart data for scan results
  const scanChartData = {
    labels: ['Safe to Eat', 'Unsafe to Eat'],
    datasets: [
      {
        data: stats ? [stats.safeScans, stats.unsafeScans] : [0, 0],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.error.main,
        ],
        borderColor: [
          theme.palette.success.dark,
          theme.palette.error.dark,
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for daily scans
  const dailyScansData = {
    labels: stats?.dailyScans.map(item => moment(item.date).format('MMM D')) || [],
    datasets: [
      {
        label: 'Daily Scans',
        data: stats?.dailyScans.map(item => item.count) || [],
        backgroundColor: theme.palette.primary.main,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: theme.typography.fontFamily,
            size: 12
          },
          color: theme.palette.text.primary
        }
      }
    }
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: '70%'
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
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
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h3" component="div">
                {stats?.totalUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Image sx={{ fontSize: 40, color: theme.palette.secondary.main, mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Total Scans
              </Typography>
              <Typography variant="h3" component="div">
                {stats?.totalScans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.success.light }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Safe Scans
              </Typography>
              <Typography variant="h3" component="div">
                {stats?.safeScans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.error.light }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Cancel sx={{ fontSize: 40, color: theme.palette.error.main, mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Unsafe Scans
              </Typography>
              <Typography variant="h3" component="div">
                {stats?.unsafeScans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  System Status
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/admin/system')}
                  size="small"
                >
                  Details
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: stats?.llmStatus ? theme.palette.success.main : theme.palette.error.main }}>
                      <Speed />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="LM Studio API"
                    secondary={stats?.llmStatus ? 'Online' : 'Offline'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Storage />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Database"
                    secondary={`${stats?.databaseSize || '0'} MB`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <Image />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Storage"
                    secondary={`${stats?.storageSize || '0'} MB`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Scan Results Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scan Results Overview
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                {stats && (stats.safeScans > 0 || stats.unsafeScans > 0) ? (
                  <Doughnut data={scanChartData} options={doughnutOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary">
                      No scan data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Users
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/admin/users')}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <List>
                  {stats.recentUsers.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          secondary={`${user.email} • Joined ${moment(user.createdAt).fromNow()}`}
                        />
                      </ListItem>
                      {index < stats.recentUsers.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No users found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Scans Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Scans (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                {stats?.dailyScans && stats.dailyScans.length > 0 ? (
                  <Bar data={dailyScansData} options={barOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary">
                      No scan data available for the last 7 days
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Common Vegetables */}
        {stats?.commonVegetables && stats.commonVegetables.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most Common Vegetables
                </Typography>
                <Grid container spacing={2}>
                  {stats.commonVegetables.map((veg, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: theme.palette.background.default
                        }}
                      >
                        <Typography variant="h5" component="div">
                          {veg.count}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {veg.name}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
