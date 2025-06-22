import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Delete,
  ArrowBack,
  Warning,
  BugReport,
  Info
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

const ScanDetail = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchScanDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchScanDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/scans/${id}`);
      const scanData = response.data;
      
      // Set the scan data directly - the API already returns the flattened structure
      setScan(scanData);
      setError('');
    } catch (error) {
      console.error('Error fetching scan details:', error);
      setError('Failed to load scan details. The scan may have been deleted or you do not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/scans/${id}`);
      setDeleteDialogOpen(false);
      navigate('/history', { state: { message: 'Scan deleted successfully' } });
    } catch (error) {
      console.error('Error deleting scan:', error);
      setError('Failed to delete scan. Please try again later.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/history')}
          sx={{ mb: 3 }}
        >
          Back to History
        </Button>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!scan) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/history')}
          sx={{ mb: 3 }}
        >
          Back to History
        </Button>
        <Alert severity="warning">
          Scan not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/history')}
        >
          Back to History
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Scan
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Scan Image */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scanned Image
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 2,
                  mb: 2,
                  position: 'relative'
                }}
              >
                <img
                  src={`/uploads/${scan.imagePath}`}
                  alt={scan.vegetableName || 'Scanned vegetable'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: theme.shape.borderRadius
                  }}
                />
                <Chip
                  icon={scan.isSafe ? <CheckCircle /> : <Cancel />}
                  label={scan.isSafe ? 'Safe to Eat' : 'Unsafe to Eat'}
                  color={scan.isSafe ? 'success' : 'error'}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" align="center">
                Scanned on {moment(scan.createdAt).format('MMMM D, YYYY [at] h:mm A')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Scan Results */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderLeft: `5px solid ${
                scan.isSafe
                  ? theme.palette.success.main
                  : theme.palette.error.main
              }`
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Analysis Results
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Vegetable Name
                    </Typography>
                    <Typography variant="h6">
                      {scan.vegetableName || 'Unknown Vegetable'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Safety Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {scan.isSafe ? (
                        <CheckCircle color="success" sx={{ mr: 1 }} />
                      ) : (
                        <Cancel color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="body1">
                        {scan.isSafe ? 'Safe to Eat' : 'Unsafe to Eat'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Disease Detection
                    </Typography>
                    {scan.diseaseName ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <BugReport color="warning" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {scan.diseaseName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        No disease detected
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Recommendation
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {scan.recommendation || 'No recommendation available'}
                    </Typography>
                  </Paper>
                </Grid>
                
                {scan.fromDataset === true && (
                  <Grid item xs={12}>
                    <Alert
                      severity="info"
                      icon={<Info />}
                      sx={{ mt: 1 }}
                    >
                      This analysis was generated from our dataset as the AI analysis service was unavailable at the time of scanning. Results may be less accurate.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning color="warning" sx={{ mr: 1 }} />
            Delete Scan
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this scan? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
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

export default ScanDetail;
