import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error, 
  AccessTime, 
  Info, 
  Delete, 
  Share, 
  Download,
  Eco,
  Cancel
} from '@mui/icons-material';
import moment from 'moment';
import { Link } from 'react-router-dom';

const ScanResultCard = ({ scan, onDelete, onShare, onDownload }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Helper function to determine freshness color based on level
  const getFreshnessColor = (freshnessLevel) => {
    switch (freshnessLevel) {
      case 'GOOD':
        return theme.palette.success.main;
      case 'ACCEPTABLE':
        return theme.palette.warning.main;
      case 'NOT_RECOMMENDED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey.main;
    }
  };
  
  // Helper function to determine freshness icon based on level
  const getFreshnessIcon = (freshnessLevel) => {
    switch (freshnessLevel) {
      case 'GOOD':
        return <Eco fontSize="small" />;
      case 'ACCEPTABLE':
        return <Warning fontSize="small" />;
      case 'NOT_RECOMMENDED':
        return <Cancel fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  // Helper function to get freshness label
  const getFreshnessLabel = (freshnessLevel, freshnessScore) => {
    const score = freshnessScore || 0;
    switch (freshnessLevel) {
      case 'GOOD':
        return `Fresh (${score}%)`;
      case 'ACCEPTABLE':
        return `Fair (${score}%)`;
      case 'NOT_RECOMMENDED':
        return `Poor (${score}%)`;
      default:
        return 'Unknown';
    }
  };

  // Helper function to get safety status
  const getSafetyStatus = (isSafe) => {
    return {
      label: isSafe ? 'Safe to Eat' : 'Not Safe',
      color: isSafe ? theme.palette.success.main : theme.palette.error.main,
      icon: isSafe ? <CheckCircle fontSize="small" /> : <Error fontSize="small" />
    };
  };
  
  // Helper function to format date
  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY • h:mm A');
  };
  
  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const safetyStatus = getSafetyStatus(scan.isSafe);
  
  return (
    <Card 
      sx={{ 
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: isMobile ? '100%' : 140,
          height: isMobile ? 140 : '100%',
          objectFit: 'cover',
        }}
        image={scan.imageUrl || '/placeholder-vegetable.jpg'}
        alt={scan.vegetableName || 'Vegetable scan'}
      />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography component="div" variant="h6" fontWeight="medium">
              {scan.vegetableName || 'Unknown Vegetable'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {/* Freshness Level Chip */}
              <Chip
                icon={getFreshnessIcon(scan.freshnessLevel)}
                label={getFreshnessLabel(scan.freshnessLevel, scan.freshnessScore)}
                size="small"
                sx={{
                  bgcolor: `${getFreshnessColor(scan.freshnessLevel)}22`,
                  color: getFreshnessColor(scan.freshnessLevel),
                  fontWeight: 'medium',
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
              
              {/* Safety Status Chip */}
              <Chip
                icon={safetyStatus.icon}
                label={safetyStatus.label}
                size="small"
                sx={{
                  bgcolor: `${safetyStatus.color}22`,
                  color: safetyStatus.color,
                  fontWeight: 'medium',
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {truncateText(scan.recommendation || 'No recommendation available', 100)}
          </Typography>

          {scan.diseaseName && (
            <Typography variant="body2" color="error" sx={{ mb: 1, fontWeight: 'medium' }}>
              Disease: {scan.diseaseName}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(scan.createdAt)}
            </Typography>
          </Box>
        </CardContent>
        
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1, mt: 'auto' }}>
          <Tooltip title="View details">
            <IconButton 
              component={Link} 
              to={`/history/${scan.id}`} 
              size="small" 
              color="primary"
              sx={{ mr: 1 }}
            >
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {onShare && (
            <Tooltip title="Share results">
              <IconButton 
                onClick={() => onShare(scan)} 
                size="small" 
                sx={{ mr: 1 }}
              >
                <Share fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onDownload && (
            <Tooltip title="Download report">
              <IconButton 
                onClick={() => onDownload(scan)} 
                size="small" 
                sx={{ mr: 1 }}
              >
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onDelete && (
            <Tooltip title="Delete scan">
              <IconButton 
                onClick={() => onDelete(scan)} 
                size="small" 
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default ScanResultCard;
