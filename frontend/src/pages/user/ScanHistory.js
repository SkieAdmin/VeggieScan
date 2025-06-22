import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Pagination,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Search,
  Clear,
  History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchScans();
  }, [page]);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/scans', {
        params: {
          page,
          limit: 10,
          search: searchTerm
        }
      });
      
      setScans(response.data.scans);
      setTotalPages(response.data.pagination.totalPages);
      setError('');
    } catch (error) {
      console.error('Error fetching scan history:', error);
      setError('Failed to load scan history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchScans();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
    setTimeout(() => {
      fetchScans();
    }, 0);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Scan History
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              placeholder="Search by vegetable name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} edge="end">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </CardContent>
      </Card>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : scans.length > 0 ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <List>
                {scans.map((scan, index) => (
                  <React.Fragment key={scan.id}>
                    <ListItem
                      button
                      onClick={() => navigate(`/history/${scan.id}`)}
                      className="history-item"
                      sx={{ py: 2 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: scan.isSafe
                              ? theme.palette.success.main
                              : theme.palette.error.main
                          }}
                        >
                          {scan.isSafe ? <CheckCircle /> : <Cancel />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="span">
                              {scan.vegetableName}
                            </Typography>
                            {scan.diseaseName && (
                              <Chip
                                label={scan.diseaseName}
                                size="small"
                                color="warning"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color={scan.isSafe ? "success.main" : "error.main"}
                            >
                              {scan.isSafe ? 'Safe to eat' : 'Unsafe to eat'}
                            </Typography>
                            {' • '}
                            {moment(scan.createdAt).format('MMMM D, YYYY [at] h:mm A')}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < scans.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>
          
          {totalPages > 1 && (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Grid>
          )}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Scan History Found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {searchTerm
                ? `No results found for "${searchTerm}". Try a different search term.`
                : "You haven't scanned any vegetables yet."}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ScanHistory;
