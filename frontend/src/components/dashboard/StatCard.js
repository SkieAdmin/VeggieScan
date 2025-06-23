import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, useTheme } from '@mui/material';

const StatCard = ({ title, value, icon, color, subtitle, trend }) => {
  const theme = useTheme();
  
  // Determine background color based on the color prop
  const getBgColor = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  // Determine text color for trend
  const getTrendColor = () => {
    if (!trend) return theme.palette.text.secondary;
    return trend.startsWith('+') ? theme.palette.success.main : theme.palette.error.main;
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: `radial-gradient(circle at top right, ${getBgColor()}22, transparent 70%)`,
          borderRadius: '0 0 0 100%',
        }}
      />
      
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Avatar
            sx={{
              bgcolor: `${getBgColor()}22`,
              color: getBgColor(),
              width: 40,
              height: 40,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
          {value}
        </Typography>
        
        {(subtitle || trend) && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            
            {trend && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: getTrendColor(),
                  fontWeight: 500,
                }}
              >
                {trend}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
