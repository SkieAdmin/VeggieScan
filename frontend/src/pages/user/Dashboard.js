import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Paper,
  useMediaQuery
} from '@mui/material';
import {
  CameraAlt,
  CheckCircle,
  Cancel,
  History as HistoryIcon,
  ArrowForward
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import moment from 'moment';
import FreshnessChart from '../../components/dashboard/FreshnessChart';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const Dashboard = () => {
  // Define all hooks at the top level
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/scans/stats/summary');
        setStats(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Define chart data and options
  const chartData = {
    labels: ['Safe to Eat', 'Unsafe to Eat'],
    datasets: [
      {
        data: stats ? [stats.goodScans, stats.badScans] : [0, 0],
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
    },
    cutout: '70%'
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          size={isMobile ? "small" : "medium"}
          startIcon={<CameraAlt />}
          onClick={() => navigate('/scan')}
          fullWidth={isMobile}
        >
          Scan Vegetable
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Stats Cards */}
        <Grid item xs={6} md={4}>
          <Card className="dashboard-stat-card">
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Total Scans
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} component="div" className="dashboard-stat-value">
                {stats?.totalScans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card className="dashboard-stat-card" sx={{ bgcolor: theme.palette.success.light }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Safe Vegetables
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} component="div" className="dashboard-stat-value">
                {stats?.goodScans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card className="dashboard-stat-card" sx={{ bgcolor: theme.palette.error.light }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" gutterBottom variant={isMobile ? "body2" : "body1"}>
                Unsafe Vegetables
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} component="div" className="dashboard-stat-value">
                {stats?.badScans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart and Recent Scans */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%', minHeight: isMobile ? '250px' : '300px' }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography variant="h6" gutterBottom>
                Scan Results Overview
              </Typography>
              <Box sx={{ height: isMobile ? 200 : 250, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                {stats && (stats.goodScans > 0 || stats.badScans > 0) ? (
                  <Doughnut data={chartData} options={{
                    ...chartOptions,
                    maintainAspectRatio: false,
                    responsive: true
                  }} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary">
                      No scan data available yet. Start by scanning a vegetable.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                mb: 2,
                gap: 1
              }}>
                <Typography variant="h6">
                  Recent Scans
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/history')}
                  size="small"
                  fullWidth={isMobile}
                >
                  View All
                </Button>
              </Box>
              <Divider />
              {stats?.recentScan ? (
                <List>
                  <ListItem
                    button
                    onClick={() => navigate(`/history/${stats.recentScan.id}`)}
                    className="history-item"
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: stats.recentScan.isSafe ? theme.palette.success.main : theme.palette.error.main }}>
                        {stats.recentScan.isSafe ? <CheckCircle /> : <Cancel />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={stats.recentScan.vegetableName}
                      secondary={`${stats.recentScan.isSafe ? 'Safe to eat' : 'Unsafe to eat'} • ${moment(stats.recentScan.createdAt).fromNow()}`}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </List>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" color="textSecondary">
                    No scan history yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CameraAlt />}
                    onClick={() => navigate('/scan')}
                    sx={{ mt: 2 }}
                  >
                    Scan Your First Vegetable
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FreshnessChart freshnessStats={stats?.freshness} />
        </Grid>

        {/* Common Vegetables */}
        {stats?.commonVegetables && stats.commonVegetables.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most Scanned Vegetables
                </Typography>
                <Grid container spacing={2}>
                  {stats.commonVegetables.map((veg, index) => (
                    <Grid item xs={4} sm={4} md={2} key={index}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: isMobile ? 1 : 2,
                          textAlign: 'center',
                          bgcolor: theme.palette.background.default
                        }}
                      >
                        <Typography variant={isMobile ? "h6" : "h5"} component="div">
                          {veg.count}
                        </Typography>
                        <Typography variant={isMobile ? "caption" : "body2"} color="textSecondary" noWrap>
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

export default Dashboard;
