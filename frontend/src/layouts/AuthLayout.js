import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Box, Paper, Typography } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const AuthLayout = () => {
  const { theme } = useTheme();

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}
          >
            VeggieScan
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 4,
              textAlign: 'center',
              color: theme.palette.text.secondary,
            }}
          >
            Visual Diagnosis of Vegetable Freshness and Contamination
          </Typography>
          
          <Outlet />
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthLayout;
