import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { keyframes } from '@mui/system';

// Custom keyframes for the vegetable bounce animation
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
`;

// Custom keyframes for the pulse animation
const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
`;

// Vegetable emoji array
const vegetables = ['🥦', '🥕', '🍅', '🥬', '🥒', '🌽', '🍆', '🫑'];

const VeggieLoader = ({ message = 'Loading...', size = 'medium' }) => {
  // Get a random vegetable emoji
  const randomVeggie = React.useMemo(() => {
    return vegetables[Math.floor(Math.random() * vegetables.length)];
  }, []);
  
  // Determine sizes based on the size prop
  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: '2rem',
          circleSize: 60,
          thickness: 4,
          textVariant: 'body2',
        };
      case 'large':
        return {
          fontSize: '4rem',
          circleSize: 120,
          thickness: 6,
          textVariant: 'h6',
        };
      case 'medium':
      default:
        return {
          fontSize: '3rem',
          circleSize: 90,
          thickness: 5,
          textVariant: 'body1',
        };
    }
  };
  
  const { fontSize, circleSize, thickness, textVariant } = getSize();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        width: '100%',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 2,
        }}
      >
        <CircularProgress
          size={circleSize}
          thickness={thickness}
          sx={{
            color: 'primary.main',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${bounce} 1.2s ease-in-out infinite`,
          }}
        >
          <Typography
            variant="h2"
            component="span"
            sx={{
              fontSize,
              userSelect: 'none',
            }}
          >
            {randomVeggie}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant={textVariant}
        color="text.secondary"
        sx={{ mt: 1, textAlign: 'center' }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default VeggieLoader;
