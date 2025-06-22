import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Search,
  Clear,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Warning,
  FilterList
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

const ScanManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialUserId = queryParams.get('userId');
  
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalScans, setTotalScans] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    userId: initialUserId || '',
    safetyStatus: '',
    fromDate: '',
    toDate: ''
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchScans();
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchScans = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        search: searchTerm
      };
      
      // Add filters if they exist
      if (filters.userId) params.userId = filters.userId;
      if (filters.safetyStatus) params.safetyStatus = filters.safetyStatus;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      
      const response = await axios.get('/admin/scans', { params });
      
      setScans(response.data.scans);
      setTotalScans(response.data.pagination.total);
      setError('');
    } catch (error) {
      console.error('Error fetching scans:', error);
      setError('Failed to load scans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get('/admin/users', {
        params: {
          limit: 100 // Get a reasonable number of users for the filter
        }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users for filter:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchScans();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
    setTimeout(() => {
      fetchScans();
    }, 0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (scan) => {
    setScanToDelete(scan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteScan = async () => {
    if (!scanToDelete) return;
    
    try {
      setDeleting(true);
      await axios.delete(`/admin/scans/${scanToDelete.id}`);
      
      setDeleteDialogOpen(false);
      setScanToDelete(null);
      
      // Refresh scan list
      fetchScans();
    } catch (error) {
      console.error('Error deleting scan:', error);
      setError(`Failed to delete scan: ${error.response?.data?.error || 'Unknown error'}`);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setPage(0);
    setFilterDialogOpen(false);
    fetchScans();
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      safetyStatus: '',
      fromDate: '',
      toDate: ''
    });
    setPage(0);
    setFilterDialogOpen(false);
    setTimeout(() => {
      fetchScans();
    }, 0);
  };

  const hasActiveFilters = () => {
    return filters.userId || filters.safetyStatus || filters.fromDate || filters.toDate;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Scan Management
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flexGrow: 1 }}>
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
              <Button
                type="submit"
                variant="contained"
                sx={{ ml: 1 }}
              >
                Search
              </Button>
            </Box>
            
            <Button
              startIcon={<FilterList />}
              onClick={() => setFilterDialogOpen(true)}
              variant={hasActiveFilters() ? "contained" : "outlined"}
              color={hasActiveFilters() ? "primary" : "inherit"}
              sx={{ ml: 2 }}
            >
              Filter
            </Button>
          </Box>
          
          {hasActiveFilters() && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filters.userId && (
                <Chip 
                  label={`User: ${users.find(u => u.id === filters.userId)?.name || filters.userId}`}
                  onDelete={() => setFilters(prev => ({ ...prev, userId: '' }))}
                  color="primary"
                  size="small"
                />
              )}
              {filters.safetyStatus && (
                <Chip 
                  label={`Status: ${filters.safetyStatus === 'safe' ? 'Safe' : 'Unsafe'}`}
                  onDelete={() => setFilters(prev => ({ ...prev, safetyStatus: '' }))}
                  color="primary"
                  size="small"
                />
              )}
              {filters.fromDate && (
                <Chip 
                  label={`From: ${filters.fromDate}`}
                  onDelete={() => setFilters(prev => ({ ...prev, fromDate: '' }))}
                  color="primary"
                  size="small"
                />
              )}
              {filters.toDate && (
                <Chip 
                  label={`To: ${filters.toDate}`}
                  onDelete={() => setFilters(prev => ({ ...prev, toDate: '' }))}
                  color="primary"
                  size="small"
                />
              )}
              <Chip 
                label="Clear All Filters"
                onDelete={clearFilters}
                color="secondary"
                size="small"
              />
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : scans.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Vegetable</TableCell>
                    <TableCell>Safety Status</TableCell>
                    <TableCell>Disease</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scans.map((scan) => (
                    <TableRow key={scan.id} hover>
                      <TableCell>{scan.vegetableName}</TableCell>
                      <TableCell>
                        <Chip
                          icon={scan.isSafe ? <CheckCircle /> : <Cancel />}
                          label={scan.isSafe ? 'Safe' : 'Unsafe'}
                          color={scan.isSafe ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {scan.diseaseName || 'None'}
                      </TableCell>
                      <TableCell>{scan.user.name}</TableCell>
                      <TableCell>{moment(scan.createdAt).format('MMM D, YYYY HH:mm')}</TableCell>
                      <TableCell>
                        {scan.fromDataset ? (
                          <Chip
                            label="Dataset"
                            color="warning"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="LLM"
                            color="info"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/admin/scans/${scan.id}`)}
                          title="View Scan"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(scan)}
                          title="Delete Scan"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalScans}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {searchTerm || hasActiveFilters() ? 'No scans found matching your search criteria' : 'No scans found in the system'}
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Scans</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={loadingUsers}>
                <InputLabel id="user-filter-label">User</InputLabel>
                <Select
                  labelId="user-filter-label"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  label="User"
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="safety-filter-label">Safety Status</InputLabel>
                <Select
                  labelId="safety-filter-label"
                  name="safetyStatus"
                  value={filters.safetyStatus}
                  onChange={handleFilterChange}
                  label="Safety Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="safe">Safe to Eat</MenuItem>
                  <MenuItem value="unsafe">Unsafe to Eat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Date"
                name="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="To Date"
                name="toDate"
                type="date"
                value={filters.toDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearFilters}>Clear All</Button>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button onClick={applyFilters} variant="contained">Apply Filters</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Scan Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning color="error" sx={{ mr: 1 }} />
            Delete Scan
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the scan of <strong>{scanToDelete?.vegetableName}</strong> by user <strong>{scanToDelete?.user?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setScanToDelete(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteScan}
            color="error"
            disabled={deleting}
            startIcon={deleting && <CircularProgress size={20} />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanManagement;
