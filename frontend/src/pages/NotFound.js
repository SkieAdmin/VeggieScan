import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGoBack = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 5,
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          {currentUser ? 'Back to Dashboard' : 'Back to Login'}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
