import React, { useState, useEffect } from 'react';
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
  DialogTitle
} from '@mui/material';
import {
  Search,
  Clear,
  Add,
  Edit,
  Delete,
  Person,
  AdminPanelSettings,
  Warning
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users', {
        params: {
          page: page + 1, // API uses 1-based indexing
          limit: rowsPerPage,
          search: searchTerm
        }
      });
      
      setUsers(response.data.users);
      setTotalUsers(response.data.pagination.total);
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
    setTimeout(() => {
      fetchUsers();
    }, 0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleting(true);
      await axios.delete(`/admin/users/${userToDelete.id}`);
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(`Failed to delete user: ${error.response?.data?.error || 'Unknown error'}`);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/users/new')}
        >
          Add User
        </Button>
      </Box>
      
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
              placeholder="Search users by name or email..."
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
        </CardContent>
      </Card>
      
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : users.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Scans</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          icon={user.role === 'ADMIN' ? <AdminPanelSettings /> : <Person />}
                          label={user.role === 'ADMIN' ? 'Admin' : 'Consumer'}
                          color={user.role === 'ADMIN' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{moment(user.createdAt).format('MMM D, YYYY')}</TableCell>
                      <TableCell>
                        {user.lastLogin ? moment(user.lastLogin).format('MMM D, YYYY') : 'Never'}
                      </TableCell>
                      <TableCell>{user.scanCount || 0}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          title="Edit User"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(user)}
                          title="Delete User"
                          disabled={user.role === 'ADMIN'}
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
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalUsers}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning color="error" sx={{ mr: 1 }} />
            Delete User
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? This action cannot be undone and all their data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setUserToDelete(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
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

export default UserManagement;
